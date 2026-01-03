import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth-utils';

// Helper to log audit
async function logAudit(
  userId: string | null,
  action: string,
  success: boolean,
  details: string | null,
  request: NextRequest
) {
  if (!userId) return;

  try {
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    await prisma.loginAudit.create({
      data: {
        userId,
        action,
        success,
        details,
        ipAddress,
        userAgent: userAgent.slice(0, 500),
      },
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar utilizador pelo email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        avatar: true,
        canViewFinance: true,
        canEditProjects: true,
        canViewAllProjects: true,
        isActive: true,
        mustChangePassword: true,
        collaboratorType: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar se conta está ativa
    if (!user.isActive) {
      await logAudit(user.id, 'failed_login', false, 'Conta desativada', request);
      return NextResponse.json(
        { success: false, error: 'Conta desativada. Contacte o administrador.' },
        { status: 403 }
      );
    }

    // Verificar senha
    if (!user.password || !verifyPassword(password, user.password)) {
      await logAudit(user.id, 'failed_login', false, 'Senha incorreta', request);
      return NextResponse.json(
        { success: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Atualizar último login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Registrar login bem sucedido
    await logAudit(user.id, 'login', true, null, request);

    // Remover password do retorno
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      data: {
        user: userWithoutPassword,
        mustChangePassword: user.mustChangePassword,
      },
      message: 'Login realizado com sucesso',
    });

  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}
