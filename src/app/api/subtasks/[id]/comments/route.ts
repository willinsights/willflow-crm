import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todos os comentários
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const comments = await prisma.subtaskComment.findMany({
      where: { subtaskId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(comments);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar comentários' },
      { status: 500 }
    );
  }
}

// POST - Adicionar comentário
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { content, createdBy, mentions } = body;

    const comment = await prisma.subtaskComment.create({
      data: {
        subtaskId: id,
        content,
        createdBy: createdBy || 'system', // TODO: pegar do auth
        mentions: mentions ? JSON.stringify(mentions) : null,
      },
    });

    // Registrar no log de atividades
    await prisma.subtaskActivity.create({
      data: {
        subtaskId: id,
        action: 'commented',
        newValue: content.substring(0, 100), // Primeiros 100 chars
        userId: createdBy || 'system',
      },
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json(
      { error: 'Erro ao criar comentário' },
      { status: 500 }
    );
  }
}
