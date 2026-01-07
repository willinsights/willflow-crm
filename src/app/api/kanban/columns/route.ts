import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET - List columns for a phase and organization
 * Query params: phase (CAPTACAO | EDICAO), organizationId (default: 'default')
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    const organizationId = searchParams.get('organizationId') || 'default';

    if (!phase) {
      return NextResponse.json(
        { success: false, error: 'Phase parameter is required' },
        { status: 400 }
      );
    }

    // Validate phase parameter
    const validPhases = ['CAPTACAO', 'EDICAO', 'FINALIZADOS'];
    const phaseUpper = phase.toUpperCase();
    if (!validPhases.includes(phaseUpper)) {
      return NextResponse.json(
        { success: false, error: `Invalid phase. Must be one of: ${validPhases.join(', ')}` },
        { status: 400 }
      );
    }

    console.log(`[Kanban Columns] Fetching columns for phase: ${phaseUpper}, org: ${organizationId}`);

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('[Kanban Columns] Database connection error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 503 }
      );
    }

    const columns = await prisma.kanbanColumn.findMany({
      where: {
        organizationId,
        phase: phaseUpper,
        isActive: true,
      },
      orderBy: { position: 'asc' },
    });

    console.log(`[Kanban Columns] Found ${columns.length} columns for phase ${phaseUpper}`);

    return NextResponse.json({
      success: true,
      data: columns,
    });
  } catch (error) {
    console.error('[Kanban Columns] Error fetching kanban columns:', error);
    // Log detailed error information
    if (error instanceof Error) {
      console.error('[Kanban Columns] Error name:', error.name);
      console.error('[Kanban Columns] Error message:', error.message);
      console.error('[Kanban Columns] Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch columns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Create or update a column
 * Body: { organizationId, phase, title, position, color }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationId = 'default', 
      phase, 
      title, 
      position,
      color,
      columnId, // If updating existing column
    } = body;

    if (!phase || !title) {
      return NextResponse.json(
        { success: false, error: 'Phase and title are required' },
        { status: 400 }
      );
    }

    const phaseUpper = phase.toUpperCase();

    // Check if trying to create/modify a locked column
    if (title === 'Entregue' || body.systemKey === 'DELIVERED') {
      // Check if this is the locked DELIVERED column
      const existingDelivered = await prisma.kanbanColumn.findFirst({
        where: {
          organizationId,
          phase: phaseUpper,
          systemKey: 'DELIVERED',
        },
      });

      if (existingDelivered && (!columnId || existingDelivered.id !== columnId)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A coluna "Entregue" já existe e não pode ser modificada'
          },
          { status: 400 }
        );
      }

      // Don't allow renaming the DELIVERED column
      if (columnId && existingDelivered && existingDelivered.id === columnId && title !== 'Entregue') {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A coluna "Entregue" não pode ser renomeada'
          },
          { status: 400 }
        );
      }
    }

    // Get the DELIVERED column position to ensure nothing is placed after it
    const deliveredColumn = await prisma.kanbanColumn.findFirst({
      where: {
        organizationId,
        phase: phaseUpper,
        systemKey: 'DELIVERED',
      },
    });

    if (deliveredColumn && position !== undefined && position > deliveredColumn.position) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não é possível criar colunas após a coluna "Entregue"'
        },
        { status: 400 }
      );
    }

    let column;

    if (columnId) {
      // Update existing column
      const existingColumn = await prisma.kanbanColumn.findUnique({
        where: { id: columnId },
      });

      if (!existingColumn) {
        return NextResponse.json(
          { success: false, error: 'Column not found' },
          { status: 404 }
        );
      }

      // Don't allow modifying locked columns
      if (existingColumn.isLocked) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A coluna "Entregue" está bloqueada e não pode ser modificada'
          },
          { status: 400 }
        );
      }

      column = await prisma.kanbanColumn.update({
        where: { id: columnId },
        data: {
          title: title || existingColumn.title,
          position: position !== undefined ? position : existingColumn.position,
          color: color !== undefined ? color : existingColumn.color,
        },
      });
    } else {
      // Create new column
      // Calculate position if not provided
      const finalPosition = position !== undefined ? position : (deliveredColumn ? deliveredColumn.position : 99);

      column = await prisma.kanbanColumn.create({
        data: {
          organizationId,
          phase: phaseUpper,
          title,
          position: finalPosition,
          color,
          isLocked: false,
          systemKey: null,
          isActive: true,
        },
      });

      // If we inserted before DELIVERED, shift DELIVERED position
      if (deliveredColumn && finalPosition < deliveredColumn.position) {
        await prisma.kanbanColumn.update({
          where: { id: deliveredColumn.id },
          data: { position: deliveredColumn.position + 1 },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: column,
    });
  } catch (error) {
    console.error('Error creating/updating kanban column:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create/update column',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Reorder columns
 * Body: { organizationId, phase, columnIds: string[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId = 'default', phase, columnIds } = body;

    if (!phase || !columnIds || !Array.isArray(columnIds)) {
      return NextResponse.json(
        { success: false, error: 'Phase and columnIds array are required' },
        { status: 400 }
      );
    }

    const phaseUpper = phase.toUpperCase();

    // Get all columns for this phase
    const columns = await prisma.kanbanColumn.findMany({
      where: {
        organizationId,
        phase: phaseUpper,
      },
    });

    // Find the DELIVERED column
    const deliveredColumn = columns.find(c => c.systemKey === 'DELIVERED');

    // Ensure DELIVERED is last
    if (deliveredColumn) {
      const deliveredIndex = columnIds.indexOf(deliveredColumn.id);
      if (deliveredIndex !== -1 && deliveredIndex !== columnIds.length - 1) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'A coluna "Entregue" deve permanecer na última posição'
          },
          { status: 400 }
        );
      }
    }

    // Update positions
    const updatePromises = columnIds.map((id, index) =>
      prisma.kanbanColumn.update({
        where: { id },
        data: { position: index },
      })
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      message: 'Columns reordered successfully',
    });
  } catch (error) {
    console.error('Error reordering kanban columns:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to reorder columns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete a column (only non-locked columns)
 * Query params: columnId
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const columnId = searchParams.get('columnId');

    if (!columnId) {
      return NextResponse.json(
        { success: false, error: 'Column ID is required' },
        { status: 400 }
      );
    }

    const column = await prisma.kanbanColumn.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      return NextResponse.json(
        { success: false, error: 'Column not found' },
        { status: 404 }
      );
    }

    if (column.isLocked || column.systemKey === 'DELIVERED') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'A coluna "Entregue" não pode ser removida'
        },
        { status: 400 }
      );
    }

    await prisma.kanbanColumn.delete({
      where: { id: columnId },
    });

    return NextResponse.json({
      success: true,
      message: 'Column deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting kanban column:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete column',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
