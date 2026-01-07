import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePassword, hashPassword, sendWelcomeEmail } from '@/lib/auth-utils';

// GET /api/users - Listar utilizadores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros opcionais
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        canViewFinance: true,
        canEditProjects: true,
        canViewAllProjects: true,
        isActive: true,
        lastLogin: true,
        mustChangePassword: true,
        collaboratorType: true,
        iban: true,
        bankName: true,
        nif: true,
        contributorType: true,
        // Não retornar password hash
      },
    });

    // Calcular estatísticas de projetos para cada utilizador
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const captacaoProjects = await prisma.project.findMany({
        where: { responsavelCaptacaoId: user.id },
      });

      const edicaoProjects = await prisma.project.findMany({
        where: { responsavelEdicaoId: user.id },
      });

      // Unique projects (user might be responsible for both phases)
      const allProjectIds = new Set([
        ...captacaoProjects.map(p => p.id),
        ...edicaoProjects.map(p => p.id),
      ]);

      const totalSpent = captacaoProjects.reduce((sum, p) => sum + p.captationCost, 0) +
                       edicaoProjects.reduce((sum, p) => sum + p.editionCost, 0);

      const allUserProjects = [...captacaoProjects, ...edicaoProjects];
      const pendingPayment = allUserProjects
        .filter(p => p.freelancerPaymentStatus === 'a-pagar')
        .reduce((sum, p) => {
          let amount = 0;
          if (p.responsavelCaptacaoId === user.id) amount += p.captationCost;
          if (p.responsavelEdicaoId === user.id) amount += p.editionCost;
          return sum + amount;
        }, 0);

      return {
        ...user,
        projectCount: allProjectIds.size,
        captacaoCount: captacaoProjects.length,
        edicaoCount: edicaoProjects.length,
        totalSpent,
        pendingPayment,
      };
    }));

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

    // Normalizar email
    const normalizedEmail = body.email.toLowerCase().trim();

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email já está em uso' },
        { status: 400 }
      );
    }

    // Gerar senha se não fornecida
    const plainPassword = body.password || generatePassword(12);
    const hashedPassword = hashPassword(plainPassword);

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
    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: normalizedEmail,
        password: hashedPassword,
        role: body.role,
        avatar: body.avatar || null,
        canViewFinance,
        canEditProjects,
        canViewAllProjects,
        isActive: true,
        mustChangePassword: !body.password, // Se gerada automaticamente, forçar troca
        // Novos campos V118
        collaboratorType: body.collaboratorType || null,
        iban: body.iban || null,
        bankName: body.bankName || null,
        nif: body.nif || null,
        contributorType: body.contributorType || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        canViewFinance: true,
        canEditProjects: true,
        canViewAllProjects: true,
        isActive: true,
        mustChangePassword: true,
        collaboratorType: true,
        iban: true,
        bankName: true,
        nif: true,
        contributorType: true,
      },
    });

    // Enviar email de boas-vindas com a senha
    const emailResult = await sendWelcomeEmail(
      body.name,
      normalizedEmail,
      plainPassword
    );

    return NextResponse.json({
      success: true,
      data: newUser,
      message: 'Utilizador criado com sucesso',
      emailSent: emailResult.success,
      emailError: emailResult.error,
      // Retornar senha gerada apenas se for geração automática (para debug/dev)
      ...(process.env.NODE_ENV === 'development' && !body.password ? { generatedPassword: plainPassword } : {})
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar utilizador:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar utilizador' },
      { status: 500 }
    );
  }
}
