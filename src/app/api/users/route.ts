import { NextRequest, NextResponse } from 'next/server';
import { User, UserRole } from '@/lib/types';
import { storage } from '@/lib/storage';

// GET /api/users - Listar utilizadores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros opcionais
    const role = searchParams.get('role') as UserRole | null;
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';

    let users = storage.getUsers();

    // Filtro por role
    if (role) {
      users = users.filter(user => user.role === role);
    }

    // Filtro de busca
    if (search) {
      const searchLower = search.toLowerCase();
      users = users.filter(user =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Ordenação
    users.sort((a, b) => {
      let aVal: any = a[sortBy as keyof User];
      let bVal: any = b[sortBy as keyof User];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });

    // Calcular estatísticas de projetos para cada utilizador
    const projects = storage.getProjects();
    const usersWithStats = users.map(user => {
      const captacaoProjects = projects.filter(p => p.responsavelCaptacaoId === user.id);
      const edicaoProjects = projects.filter(p => p.responsavelEdicaoId === user.id);
      const allUserProjects = [...captacaoProjects, ...edicaoProjects];

      // Remover duplicados (projetos onde é responsável por ambas as fases)
      const uniqueProjects = allUserProjects.filter((project, index, self) =>
        index === self.findIndex(p => p.id === project.id)
      );

      const totalSpent = captacaoProjects.reduce((sum, p) => sum + p.captationCost, 0) +
                       edicaoProjects.reduce((sum, p) => sum + p.editionCost, 0);

      return {
        ...user,
        projectCount: uniqueProjects.length,
        captacaoCount: captacaoProjects.length,
        edicaoCount: edicaoProjects.length,
        totalSpent,
        pendingPayment: allUserProjects
          .filter(p => p.freelancerPaymentStatus === 'a-pagar')
          .reduce((sum, p) => {
            let amount = 0;
            if (p.responsavelCaptacaoId === user.id) amount += p.captationCost;
            if (p.responsavelEdicaoId === user.id) amount += p.editionCost;
            return sum + amount;
          }, 0)
      };
    });

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      total: usersWithStats.length
    });

  } catch (error) {
    console.error('Erro ao buscar utilizadores:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar utilizadores' },
      { status: 500 }
    );
  }
}

// POST /api/users - Criar utilizador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validações básicas
    if (!body.name || !body.email || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Nome, email e role são obrigatórios' },
        { status: 400 }
      );
    }

    // Verificar se email já existe
    const existingUser = storage.getUsers().find(u => u.email === body.email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Definir permissões baseadas na role
    let canViewFinance = false;
    let canEditProjects = false;
    let canViewAllProjects = false;

    switch (body.role) {
      case 'admin':
        canViewFinance = true;
        canEditProjects = true;
        canViewAllProjects = true;
        break;
      case 'editor_edicao':
        canEditProjects = true;
        canViewAllProjects = true;
        break;
      case 'freelancer_captacao':
        // Permissões limitadas
        break;
    }

    // Criar novo utilizador
    const newUser: User = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: body.name,
      email: body.email,
      role: body.role,
      avatar: body.avatar || '',
      canViewFinance,
      canEditProjects,
      canViewAllProjects
    };

    // Adicionar ao storage
    storage.addUser(newUser);

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Utilizador criado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar utilizador' },
      { status: 500 }
    );
  }
}

// PUT /api/users - Atualização em lote
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: 'Formato inválido para atualização em lote' },
        { status: 400 }
      );
    }

    const updatedUsers: User[] = [];

    for (const update of body.updates) {
      // Verificar duplicação de emails
      if (update.data.email) {
        const existingUser = storage.getUsers().find(u =>
          u.email === update.data.email && u.id !== update.id
        );
        if (existingUser) {
          continue; // Pular esta atualização
        }
      }

      const updatedUser = storage.updateUser(update.id, update.data);

      if (updatedUser) {
        updatedUsers.push(updatedUser);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedUsers,
      message: `${updatedUsers.length} utilizadores atualizados`
    });

  } catch (error) {
    console.error('Erro ao atualizar utilizadores:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar utilizadores' },
      { status: 500 }
    );
  }
}

// DELETE /api/users - Deletar múltiplos utilizadores
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
    const projects = storage.getProjects();
    const hasProjects = projects.some(p =>
      ids.includes(p.responsavelCaptacaoId || '') ||
      ids.includes(p.responsavelEdicaoId || '')
    );

    if (hasProjects) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar utilizadores com projetos associados' },
        { status: 400 }
      );
    }

    let deletedCount = 0;
    for (const id of ids) {
      if (storage.deleteUser(id)) {
        deletedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `${deletedCount} utilizadores deletados`,
      deletedCount
    });

  } catch (error) {
    console.error('Erro ao deletar utilizadores:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar utilizadores' },
      { status: 500 }
    );
  }
}
