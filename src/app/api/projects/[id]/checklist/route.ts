import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todos os itens da checklist do projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const items = await prisma.projectChecklist.findMany({
      where: { projectId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Erro ao buscar checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar checklist' },
      { status: 500 }
    );
  }
}

// POST - Adicionar item à checklist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, order } = body;

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Obter a próxima ordem se não fornecida
    let itemOrder = order;
    if (itemOrder === undefined) {
      const lastItem = await prisma.projectChecklist.findFirst({
        where: { projectId: id },
        orderBy: { order: 'desc' }
      });
      itemOrder = lastItem ? lastItem.order + 1 : 0;
    }

    const item = await prisma.projectChecklist.create({
      data: {
        projectId: id,
        title,
        order: itemOrder,
        completed: false,
      },
    });

    // Registrar atividade
    await prisma.projectActivity.create({
      data: {
        projectId: id,
        action: 'checklist_added',
        newValue: title,
        userId: body.userId || 'system',
        userName: body.userName || 'Sistema',
      },
    });

    return NextResponse.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Erro ao criar item da checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar item da checklist' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar item da checklist (toggle complete, reorder)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { itemId, completed, title, order, userId, userName } = body;

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId é obrigatório' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (completed !== undefined) {
      updateData.completed = completed;
      updateData.completedAt = completed ? new Date() : null;
      updateData.completedBy = completed ? (userName || userId || 'system') : null;
    }
    if (title !== undefined) updateData.title = title;
    if (order !== undefined) updateData.order = order;

    const item = await prisma.projectChecklist.update({
      where: { id: itemId },
      data: updateData,
    });

    // Registrar atividade
    if (completed !== undefined) {
      await prisma.projectActivity.create({
        data: {
          projectId,
          action: completed ? 'checklist_completed' : 'checklist_uncompleted',
          newValue: item.title,
          userId: userId || 'system',
          userName: userName || 'Sistema',
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Erro ao atualizar item da checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar item da checklist' },
      { status: 500 }
    );
  }
}

// DELETE - Remover item da checklist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'itemId é obrigatório' },
        { status: 400 }
      );
    }

    const item = await prisma.projectChecklist.delete({
      where: { id: itemId },
    });

    // Registrar atividade
    await prisma.projectActivity.create({
      data: {
        projectId,
        action: 'checklist_deleted',
        oldValue: item.title,
        userId: 'system',
        userName: 'Sistema',
      },
    });

    return NextResponse.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Erro ao deletar item da checklist:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar item da checklist' },
      { status: 500 }
    );
  }
}
