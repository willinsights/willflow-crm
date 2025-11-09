import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/categories - Listar categorias
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros opcionais
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Buscar do banco de dados
    let categories = await prisma.category.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      } : undefined,
      orderBy: { [sortBy]: sortOrder }
    });

    // Calcular estatísticas de uso para cada categoria
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const projectCount = await prisma.project.count({
          where: { categoryId: category.id }
        });

        const totalRevenue = await prisma.project.aggregate({
          where: { categoryId: category.id },
          _sum: { clientPrice: true }
        });

        return {
          ...category,
          projectCount,
          totalRevenue: totalRevenue._sum.clientPrice || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: categoriesWithStats,
      total: categoriesWithStats.length
    });

  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar categorias' },
      { status: 500 }
    );
  }
}

// POST /api/categories - Criar categoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validações básicas
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se nome já existe
    const existingCategory = await prisma.category.findFirst({
      where: { name: { equals: body.name, mode: 'insensitive' } }
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'Categoria com este nome já existe' },
        { status: 400 }
      );
    }

    // Criar nova categoria no banco
    const newCategory = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description || '',
        color: body.color || '#6366f1'
      }
    });

    return NextResponse.json({
      success: true,
      data: newCategory,
      message: 'Categoria criada com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar categoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar categoria' },
      { status: 500 }
    );
  }
}

// PUT /api/categories - Atualização em lote
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: 'Formato inválido para atualização em lote' },
        { status: 400 }
      );
    }

    const updatedCategories = [];

    for (const update of body.updates) {
      // Verificar duplicação de nomes
      if (update.data.name) {
        const existingCategory = await prisma.category.findFirst({
          where: {
            name: { equals: update.data.name, mode: 'insensitive' },
            id: { not: update.id }
          }
        });
        if (existingCategory) {
          continue; // Pular esta atualização
        }
      }

      const updatedCategory = await prisma.category.update({
        where: { id: update.id },
        data: update.data
      });

      if (updatedCategory) {
        updatedCategories.push(updatedCategory);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedCategories,
      message: `${updatedCategories.length} categorias atualizadas`
    });

  } catch (error) {
    console.error('Erro ao atualizar categorias:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar categorias' },
      { status: 500 }
    );
  }
}

// DELETE /api/categories - Deletar múltiplas categorias
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'IDs são obrigatórios' },
        { status: 400 }
      );
    }

    const ids = idsParam.split(',');

    // Verificar se há projetos associados
    const projectCount = await prisma.project.count({
      where: { categoryId: { in: ids } }
    });

    if (projectCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar categorias com projetos associados' },
        { status: 400 }
      );
    }

    // Deletar categorias
    const result = await prisma.category.deleteMany({
      where: { id: { in: ids } }
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} categorias deletadas`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Erro ao deletar categorias:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar categorias' },
      { status: 500 }
    );
  }
}
