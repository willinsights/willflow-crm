import { NextRequest, NextResponse } from 'next/server';
import { Project, StatusCaptacao, StatusEdicao } from '@/lib/types';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id] - Buscar projeto específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        category: true,
        responsavelCaptacao: true,
        responsavelEdicao: true,
        subtasks: true
      }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Erro ao buscar projeto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar projeto' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Atualizar projeto
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Processar datas se fornecidas como strings
    const updates: any = { ...body };
    if (body.clientDueDate) {
      updates.clientDueDate = new Date(body.clientDueDate);
    }
    if (body.clientReceivedDate) {
      updates.clientReceivedDate = new Date(body.clientReceivedDate);
    }
    if (body.freelancerDueDate) {
      updates.freelancerDueDate = new Date(body.freelancerDueDate);
    }
    if (body.freelancerPaidDate) {
      updates.freelancerPaidDate = new Date(body.freelancerPaidDate);
    }

    // Calcular margem se valores financeiros foram alterados
    if (body.clientPrice !== undefined || body.captationCost !== undefined || body.editionCost !== undefined) {
      // Buscar valores atuais do banco
      const currentProject = await prisma.project.findUnique({
        where: { id },
        select: { clientPrice: true, captationCost: true, editionCost: true }
      });

      if (currentProject) {
        const clientPrice = body.clientPrice !== undefined ? body.clientPrice : currentProject.clientPrice;
        const captationCost = body.captationCost !== undefined ? body.captationCost : currentProject.captationCost;
        const editionCost = body.editionCost !== undefined ? body.editionCost : currentProject.editionCost;
        updates.margin = clientPrice - captationCost - editionCost;
      }
    }

    // Atualizar no banco
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updates,
      include: {
        client: true,
        category: true,
        responsavelCaptacao: true,
        responsavelEdicao: true,
        subtasks: true
      }
    });

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Projeto atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar projeto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar projeto' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Deletar projeto
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    // Deletar projeto (subtasks serão deletadas em cascade)
    await prisma.project.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Projeto deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar projeto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar projeto' },
      { status: 500 }
    );
  }
}
