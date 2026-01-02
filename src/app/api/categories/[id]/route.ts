import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories/[id] - Buscar categoria específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            clientId: true,
            phase: true,
            clientPrice: true,
            margin: true,
            createdAt: true,
            captationCost: true,
            editionCost: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const totalRevenue = category.projects.reduce((sum, p) => sum + p.clientPrice, 0);
    const totalCosts = category.projects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);

    const categoryWithStats = {
      ...category,
      projectCount: category.projects.length,
      totalRevenue,
      totalCosts,
      totalMargin: totalRevenue - totalCosts
    };

    return NextResponse.json({
      success: true,
      data: categoryWithStats
    });

  } catch (error) {
    console.error('Erro ao buscar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar categoria' },
      { status: 500 }
    );
  }
}

// PUT /api/categories/[id] - Atualizar categoria
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verificar se nome já está em uso por outra categoria
    if (body.name) {
      const existingCategory = await prisma.category.findFirst({
        where: {
          name: { equals: body.name, mode: 'insensitive' },
          NOT: { id }
        }
      });

      if (existingCategory) {
        return NextResponse.json(
          { success: false, error: 'Nome já está em uso por outra categoria' },
          { status: 400 }
        );
      }
    }

    // Atualizar no banco
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: body
    });

    return NextResponse.json({
      success: true,
      data: updatedCategory,
      message: 'Categoria atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar categoria' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Deletar categoria
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se categoria existe
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Categoria não encontrada' },
        { status: 404 }
      );
    }

    // Verificar se há projetos associados
    if (category._count.projects > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar categoria com projetos associados' },
        { status: 400 }
      );
    }

    // Deletar categoria
    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      data: category,
      message: 'Categoria deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar categoria' },
      { status: 500 }
    );
  }
}
