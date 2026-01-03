import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, hashPassword, sendPasswordChangedEmail } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { userId, currentPassword, newPassword } = await request.json();

    if (!userId || !newPassword) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter pelo menos 8 caracteres' },
        { status: 400 }
      );
    }

    // Buscar utilizador
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        mustChangePassword: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Verificar senha atual (apenas se não for forçado a mudar)
    if (!user.mustChangePassword && currentPassword) {
      if (!user.password || !verifyPassword(currentPassword, user.password)) {
        return NextResponse.json(
          { success: false, error: 'Senha atual incorreta' },
          { status: 401 }
        );
      }
    }

    // Atualizar senha
    const hashedPassword = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    // Enviar email de confirmação
    await sendPasswordChangedEmail(user.name, user.email);

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}
