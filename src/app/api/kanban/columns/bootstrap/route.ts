import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default columns for each phase based on requirements
const DEFAULT_COLUMNS = {
  CAPTACAO: [
    { title: 'A agendar', position: 0, isLocked: false, systemKey: null },
    { title: 'Agendado', position: 1, isLocked: false, systemKey: null },
    { title: 'Em execução', position: 2, isLocked: false, systemKey: null },
    { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
  ],
  EDICAO: [
    { title: 'A iniciar', position: 0, isLocked: false, systemKey: null },
    { title: 'Em edição', position: 1, isLocked: false, systemKey: null },
    { title: 'Em revisão', position: 2, isLocked: false, systemKey: null },
    { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
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

    // Check if columns already exist for this organization
    const existingColumns = await prisma.kanbanColumn.findMany({
      where: { organizationId },
    });

    if (existingColumns.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Columns already bootstrapped',
        data: existingColumns,
      });
    }

    // Create default columns for both phases
    const columns = [];

    for (const [phase, phaseColumns] of Object.entries(DEFAULT_COLUMNS)) {
      for (const col of phaseColumns) {
        const column = await prisma.kanbanColumn.create({
          data: {
            organizationId,
            phase,
            title: col.title,
            position: col.position,
            isLocked: col.isLocked,
            systemKey: col.systemKey,
            isActive: true,
          },
        });
        columns.push(column);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Default columns created successfully',
      data: columns,
    });
  } catch (error) {
    console.error('Error bootstrapping kanban columns:', error);
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
