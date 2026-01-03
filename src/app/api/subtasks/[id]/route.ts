import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar detalhes completos de uma subtask
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const subtask = await prisma.subtask.findUnique({
      where: { id },
      include: {
        checklistItems: {
          orderBy: { order: 'asc' },
        },
        comments: {
          orderBy: { createdAt: 'desc' },
        },
        attachments: {
          orderBy: { uploadedAt: 'desc' },
        },
        activityLog: {
          orderBy: { createdAt: 'desc' },
          take: 50, // Últimas 50 atividades
        },
        project: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!subtask) {
      return NextResponse.json(
        { error: 'Subtask não encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(subtask);
  } catch (error) {
    console.error('Erro ao buscar subtask:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar subtask' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar subtask
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      completed,
      priority,
      status,
      dueDate,
      assignedTo,
      estimatedHours,
      actualHours,
      tags,
      order,
    } = body;

    // Buscar valores antigos para o log
    const oldSubtask = await prisma.subtask.findUnique({
      where: { id },
    });

    if (!oldSubtask) {
      return NextResponse.json(
        { error: 'Subtask não encontrada' },
        { status: 404 }
      );
    }

    // Atualizar subtask
    const updatedSubtask = await prisma.subtask.update({
      where: { id },
      data: {
        title,
        description,
        completed,
        completedAt: completed && !oldSubtask.completed ? new Date() : oldSubtask.completedAt,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignedTo,
        estimatedHours,
        actualHours,
        tags: tags ? JSON.stringify(tags) : null,
        order,
      },
      include: {
        checklistItems: true,
        comments: true,
        attachments: true,
      },
    });

    // Registrar mudanças no log de atividades
    const changes: string[] = [];
    if (oldSubtask.title !== title) changes.push('title');
    if (oldSubtask.status !== status) changes.push('status');
    if (oldSubtask.priority !== priority) changes.push('priority');
    if (oldSubtask.completed !== completed) changes.push('completed');

    for (const field of changes) {
      await prisma.subtaskActivity.create({
        data: {
          subtaskId: id,
          action: 'updated',
          field,
          oldValue: String(oldSubtask[field as keyof typeof oldSubtask] || ''),
          newValue: String(body[field] || ''),
          userId: body.userId || 'system', // TODO: pegar do auth
        },
      });
    }

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error('Erro ao atualizar subtask:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar subtask' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar subtask
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.subtask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar subtask:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar subtask' },
      { status: 500 }
    );
  }
}
