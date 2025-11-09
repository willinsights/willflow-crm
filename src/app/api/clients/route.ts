import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients - Listar clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros opcionais
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    // Buscar do banco com filtros
    const where: any = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ]
    } : undefined;

    const clients = await prisma.client.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      include: {
        projects: true
      }
    });

    // Calcular estatísticas de projeto para cada cliente
    const clientsWithStats = clients.map(client => {
      const totalRevenue = client.projects.reduce((sum, p) => sum + p.clientPrice, 0);
      const totalCosts = client.projects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);

      return {
        ...client,
        totalRevenue,
        totalCosts,
        totalMargin: totalRevenue - totalCosts,
        projectCount: client.projects.length,
        projects: undefined // Remover projetos completos da resposta
      };
    });

    return NextResponse.json({
      success: true,
      data: clientsWithStats,
      total: clientsWithStats.length
    });

  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar clientes' },
      { status: 500 }
    );
  }
}

// POST /api/clients - Criar cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validações básicas
    if (!body.name || !body.email) {
      return NextResponse.json(
        { success: false, error: 'Nome e email são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingClient = await prisma.client.findFirst({
      where: { email: body.email }
    });

    if (existingClient) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Criar novo cliente no banco
    const newClient = await prisma.client.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        company: body.company || ''
      }
    });

    return NextResponse.json({
      success: true,
      data: newClient,
      message: 'Cliente criado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar cliente' },
      { status: 500 }
    );
  }
}

// PUT /api/clients - Atualização em lote
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: 'Formato inválido para atualização em lote' },
        { status: 400 }
      );
    }

    const updatedClients = [];

    for (const update of body.updates) {
      // Verificar duplicação de emails
      if (update.data.email) {
        const existingClient = await prisma.client.findFirst({
          where: {
            email: update.data.email,
            id: { not: update.id }
          }
        });
        if (existingClient) {
          continue; // Pular esta atualização
        }
      }

      const updatedClient = await prisma.client.update({
        where: { id: update.id },
        data: update.data
      });

      if (updatedClient) {
        updatedClients.push(updatedClient);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedClients,
      message: `${updatedClients.length} clientes atualizados`
    });

  } catch (error) {
    console.error('Erro ao atualizar clientes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar clientes' },
      { status: 500 }
    );
  }
}

// DELETE /api/clients - Deletar múltiplos clientes
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
      where: { clientId: { in: ids } }
    });

    if (projectCount > 0) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar clientes com projetos associados' },
        { status: 400 }
      );
    }

    // Deletar clientes
    const result = await prisma.client.deleteMany({
      where: { id: { in: ids } }
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} clientes deletados`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Erro ao deletar clientes:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar clientes' },
      { status: 500 }
    );
  }
}
