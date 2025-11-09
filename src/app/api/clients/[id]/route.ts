import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients/[id] - Buscar cliente específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        projects: {
          select: {
            id: true,
            title: true,
            videoType: true,
            phase: true,
            clientPrice: true,
            margin: true,
            createdAt: true,
            clientDueDate: true,
            captationCost: true,
            editionCost: true
          }
        }
      }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Calcular estatísticas
    const totalRevenue = client.projects.reduce((sum, p) => sum + p.clientPrice, 0);
    const totalCosts = client.projects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);

    const clientWithStats = {
      ...client,
      totalRevenue,
      totalCosts,
      totalMargin: totalRevenue - totalCosts,
      projectCount: client.projects.length
    };

    return NextResponse.json({
      success: true,
      data: clientWithStats
    });

  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar cliente' },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Atualizar cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verificar se email já está em uso por outro cliente
    if (body.email) {
      const existingClient = await prisma.client.findFirst({
        where: {
          email: body.email,
          NOT: { id }
        }
      });

      if (existingClient) {
        return NextResponse.json(
          { success: false, error: 'Email já está em uso por outro cliente' },
          { status: 400 }
        );
      }
    }

    // Atualizar no banco
    const updatedClient = await prisma.client.update({
      where: { id },
      data: body
    });

    return NextResponse.json({
      success: true,
      data: updatedClient,
      message: 'Cliente atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar cliente' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients/[id] - Deletar cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verificar se cliente existe
    const client = await prisma.client.findUnique({
      where: { id },
      include: { _count: { select: { projects: true } } }
    });

    if (!client) {
      return NextResponse.json(
        { success: false, error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se há projetos associados
    if (client._count.projects > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar cliente com projetos associados' },
        { status: 400 }
      );
    }

    // Deletar cliente
    await prisma.client.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      data: client,
      message: 'Cliente deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar cliente' },
      { status: 500 }
    );
  }
}
