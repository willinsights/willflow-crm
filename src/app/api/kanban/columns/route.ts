import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default status labels
const defaultStatusLabels: Record<string, string> = {
  // Captação
  'agendado': 'Agendado',
  'em-gravacao': 'Em Gravação',
  'upload-nas': 'Upload NAS',
  'concluido': 'Concluído',
  // Edição
  'receber-ficheiros': 'Receber Ficheiros',
  'decupagem': 'Decupagem',
  'em-edicao': 'Em Edição',
  'feedback': 'Feedback',
  'revisao-cliente': 'Revisão Cliente',
  'entregue': 'Entregue',
  'finalizado': 'Finalizado'
};

// GET - List all column configurations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');

    const where = phase ? { phase } : {};

    const columns = await prisma.kanbanColumn.findMany({
      where,
      orderBy: [{ phase: 'asc' }, { order: 'asc' }]
    });

    // Merge with defaults
    const mergedColumns = Object.entries(defaultStatusLabels).map(([key, defaultName]) => {
      const customColumn = columns.find(c => c.statusKey === key);
      return {
        statusKey: key,
        name: customColumn?.customName || defaultName,
        defaultName,
        color: customColumn?.color || null,
        order: customColumn?.order ?? 0,
        isActive: customColumn?.isActive ?? true,
        isCustom: !!customColumn?.customName
      };
    });

    return NextResponse.json({
      success: true,
      data: mergedColumns,
      customColumns: columns
    });
  } catch (error) {
    console.error('Error fetching kanban columns:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch columns' },
      { status: 500 }
    );
  }
}

// POST - Create or update column configuration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phase, statusKey, customName, color, order, isActive } = body;

    if (!phase || !statusKey) {
      return NextResponse.json(
        { success: false, error: 'Phase and statusKey are required' },
        { status: 400 }
      );
    }

    const column = await prisma.kanbanColumn.upsert({
      where: {
        phase_statusKey: { phase, statusKey }
      },
      update: {
        customName: customName || null,
        color: color || null,
        order: order ?? 0,
        isActive: isActive ?? true
      },
      create: {
        phase,
        statusKey,
        customName: customName || null,
        color: color || null,
        order: order ?? 0,
        isActive: isActive ?? true
      }
    });

    return NextResponse.json({
      success: true,
      data: column
    });
  } catch (error) {
    console.error('Error updating kanban column:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update column' },
      { status: 500 }
    );
  }
}

// DELETE - Reset column to default
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phase = searchParams.get('phase');
    const statusKey = searchParams.get('statusKey');

    if (!phase || !statusKey) {
      return NextResponse.json(
        { success: false, error: 'Phase and statusKey are required' },
        { status: 400 }
      );
    }

    await prisma.kanbanColumn.delete({
      where: {
        phase_statusKey: { phase, statusKey }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Column reset to default'
    });
  } catch (error) {
    console.error('Error resetting kanban column:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset column' },
      { status: 500 }
    );
  }
}
