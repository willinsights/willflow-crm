import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todos os itens da checklist
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const items = await prisma.subtaskChecklist.findMany({
      where: { subtaskId: id },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error('Erro ao buscar checklist:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar checklist' },
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

    const item = await prisma.subtaskChecklist.create({
      data: {
        subtaskId: id,
        title,
        order: order || 0,
        completed: false,
      },
    });

    // Registrar no log de atividades
    await prisma.subtaskActivity.create({
      data: {
        subtaskId: id,
        action: 'added_checklist_item',
        newValue: title,
        userId: body.userId || 'system',
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error('Erro ao criar item da checklist:', error);
    return NextResponse.json(
      { error: 'Erro ao criar item da checklist' },
      { status: 500 }
    );
  }
}
