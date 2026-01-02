import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/projects/[id]/budget - Lista items de orçamento
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const projectId = params.id;

    // Buscar items de orçamento (mock por enquanto)
    // Em produção, criar tabela BudgetItems no schema.prisma
    const budgetItems: any[] = [];

    return NextResponse.json({
      success: true,
      budgetItems
    });
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar orçamento' },
      { status: 500 }
    );
  }
}

// POST /api/projects/[id]/budget - Criar item de orçamento
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const projectId = params.id;
    const body = await request.json();

    // Validar dados
    if (!body.category || !body.description || body.quantity === undefined || body.unitPrice === undefined) {
      return NextResponse.json(
        { success: false, error: 'Categoria, descrição, quantidade e preço unitário são obrigatórios' },
        { status: 400 }
      );
    }

    // Calcular total
    const total = body.quantity * body.unitPrice;

    // Em produção, salvar no banco:
    // const budgetItem = await prisma.budgetItem.create({
    //   data: {
    //     projectId,
    //     category: body.category,
    //     description: body.description,
    //     quantity: body.quantity,
    //     unitPrice: body.unitPrice,
    //     total: total,
    //     phase: body.phase || 'captacao',
    //     isPaid: body.isPaid || false,
    //   }
    // });

    // Mock response por enquanto
    const budgetItem = {
      id: `budget-${Date.now()}`,
      projectId,
      category: body.category,
      description: body.description,
      quantity: body.quantity,
      unitPrice: body.unitPrice,
      total: total,
      phase: body.phase || 'captacao',
      isPaid: body.isPaid || false,
      createdAt: new Date().toISOString(),
    };

    console.log('✅ Item de orçamento criado:', budgetItem);

    return NextResponse.json({
      success: true,
      budgetItem,
      message: 'Item de orçamento adicionado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar item de orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar item de orçamento' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id]/budget?itemId=xxx - Atualizar item
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');
    const body = await request.json();

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'ID do item é obrigatório' },
        { status: 400 }
      );
    }

    // Calcular total se quantity ou unitPrice foram atualizados
    let total = body.total;
    if (body.quantity !== undefined && body.unitPrice !== undefined) {
      total = body.quantity * body.unitPrice;
    }

    // Em produção, atualizar no banco:
    // const budgetItem = await prisma.budgetItem.update({
    //   where: { id: itemId },
    //   data: { ...body, total }
    // });

    console.log('✅ Item de orçamento atualizado (mock):', itemId);

    return NextResponse.json({
      success: true,
      message: 'Item de orçamento atualizado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao atualizar item de orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar item de orçamento' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id]/budget?itemId=xxx - Deletar item
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'ID do item é obrigatório' },
        { status: 400 }
      );
    }

    // Em produção, deletar do banco:
    // await prisma.budgetItem.delete({ where: { id: itemId } });

    console.log('✅ Item de orçamento deletado (mock):', itemId);

    return NextResponse.json({
      success: true,
      message: 'Item de orçamento deletado com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao deletar item de orçamento:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar item de orçamento' },
      { status: 500 }
    );
  }
}
