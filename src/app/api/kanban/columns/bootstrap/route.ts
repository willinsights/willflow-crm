import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default columns for each phase based on requirements
// Note: Column titles are stored in user-friendly Portuguese format with proper accents
// The mapping to status keys happens in the frontend
const DEFAULT_COLUMNS = {
  CAPTACAO: [
    { title: 'A agendar', position: 0, isLocked: false, systemKey: null, statusKey: 'a-agendar' },
    { title: 'Agendado', position: 1, isLocked: false, systemKey: null, statusKey: 'agendado' },
    { title: 'Em execução', position: 2, isLocked: false, systemKey: null, statusKey: 'em-execucao' },
    { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED', statusKey: 'entregue' },
  ],
  EDICAO: [
    { title: 'A iniciar', position: 0, isLocked: false, systemKey: null, statusKey: 'a-iniciar' },
    { title: 'Em edição', position: 1, isLocked: false, systemKey: null, statusKey: 'em-edicao' },
    { title: 'Em revisão', position: 2, isLocked: false, systemKey: null, statusKey: 'em-revisao' },
    { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED', statusKey: 'entregue' },
  ],
};

/**
 * Bootstrap default Kanban columns for an organization
 * POST /api/kanban/columns/bootstrap
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId = 'default' } = body;

    console.log(`[Kanban Bootstrap] Starting bootstrap for organization: ${organizationId}`);

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (dbError) {
      console.error('[Kanban Bootstrap] Database connection error:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 503 }
      );
    }

    // Check if columns already exist for this organization
    const existingColumns = await prisma.kanbanColumn.findMany({
      where: { organizationId },
    });

    if (existingColumns.length > 0) {
      console.log(`[Kanban Bootstrap] Found ${existingColumns.length} existing columns`);
      return NextResponse.json({
        success: true,
        message: 'Columns already bootstrapped',
        data: existingColumns,
      });
    }

    console.log(`[Kanban Bootstrap] No existing columns found, creating defaults...`);

    // Create default columns for both phases
    const columns = [];

    for (const [phase, phaseColumns] of Object.entries(DEFAULT_COLUMNS)) {
      console.log(`[Kanban Bootstrap] Creating ${phaseColumns.length} columns for phase: ${phase}`);
      
      for (const col of phaseColumns) {
        try {
          const column = await prisma.kanbanColumn.create({
            data: {
              organizationId,
              phase,
              title: col.title,
              statusKey: col.statusKey,
              position: col.position,
              isLocked: col.isLocked,
              systemKey: col.systemKey,
              isActive: true,
            },
          });
          columns.push(column);
          console.log(`[Kanban Bootstrap] Created column: ${col.title} (${phase}) -> statusKey: ${col.statusKey}`);
        } catch (colError) {
          console.error(`[Kanban Bootstrap] Error creating column ${col.title}:`, colError);
          // Continue with other columns even if one fails
          if (colError instanceof Error) {
            console.error('[Kanban Bootstrap] Column error details:', colError.message);
          }
        }
      }
    }

    console.log(`[Kanban Bootstrap] Bootstrap complete. Created ${columns.length} columns`);

    return NextResponse.json({
      success: true,
      message: 'Default columns created successfully',
      data: columns,
      created: columns.length,
    });
  } catch (error) {
    console.error('[Kanban Bootstrap] Error bootstrapping kanban columns:', error);
    if (error instanceof Error) {
      console.error('[Kanban Bootstrap] Error name:', error.name);
      console.error('[Kanban Bootstrap] Error message:', error.message);
      console.error('[Kanban Bootstrap] Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to bootstrap columns',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
