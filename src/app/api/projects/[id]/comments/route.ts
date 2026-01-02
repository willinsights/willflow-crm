import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todos os comentários do projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const comments = await prisma.projectComment.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar comentários' },
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
    const { content, createdBy, createdByName, createdByAvatar, mentions } = body;

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

    const comment = await prisma.projectComment.create({
      data: {
        projectId: id,
        content,
        createdBy: createdBy || 'system',
        createdByName: createdByName || 'Sistema',
        createdByAvatar: createdByAvatar || null,
        mentions: mentions ? JSON.stringify(mentions) : null,
      },
    });

    // Registrar atividade
    await prisma.projectActivity.create({
      data: {
        projectId: id,
        action: 'comment_added',
        newValue: content.substring(0, 100), // Primeiros 100 chars
        userId: createdBy || 'system',
        userName: createdByName || 'Sistema',
      },
    });

    return NextResponse.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Erro ao criar comentário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar comentário' },
      { status: 500 }
    );
  }
}

// PUT - Editar comentário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const body = await request.json();
    const { commentId, content, userId, userName } = body;

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'commentId é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o comentário pertence ao usuário
    const existingComment = await prisma.projectComment.findUnique({
      where: { id: commentId }
    });

    if (!existingComment) {
      return NextResponse.json(
        { success: false, error: 'Comentário não encontrado' },
        { status: 404 }
      );
    }

    const comment = await prisma.projectComment.update({
      where: { id: commentId },
      data: {
        content,
        isEdited: true,
        updatedAt: new Date(),
      },
    });

    // Registrar atividade
    await prisma.projectActivity.create({
      data: {
        projectId,
        action: 'comment_edited',
        oldValue: existingComment.content.substring(0, 100),
        newValue: content.substring(0, 100),
        userId: userId || 'system',
        userName: userName || 'Sistema',
      },
    });

    return NextResponse.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar comentário' },
      { status: 500 }
    );
  }
}

// DELETE - Remover comentário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: projectId } = await params;
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');

    if (!commentId) {
      return NextResponse.json(
        { success: false, error: 'commentId é obrigatório' },
        { status: 400 }
      );
    }

    const comment = await prisma.projectComment.delete({
      where: { id: commentId },
    });

    // Registrar atividade
    await prisma.projectActivity.create({
      data: {
        projectId,
        action: 'comment_deleted',
        oldValue: comment.content.substring(0, 100),
        userId: comment.createdBy,
        userName: comment.createdByName || 'Sistema',
      },
    });

    return NextResponse.json({
      success: true,
      data: comment
    });
  } catch (error) {
    console.error('Erro ao deletar comentário:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar comentário' },
      { status: 500 }
    );
  }
}
