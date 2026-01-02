import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePassword, hashPassword, sendPasswordResetEmail } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
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
        isActive: true,
      },
    });

    // Sempre retornar sucesso para não revelar se email existe
    if (!user || !user.isActive) {
      // Simular delay para parecer que processou
      await new Promise(resolve => setTimeout(resolve, 1000));
      return NextResponse.json({
        success: true,
        message: 'Se o email existir no sistema, você receberá uma nova senha.',
      });
    }

    // Gerar nova senha
    const newPassword = generatePassword(12);
    const hashedPassword = hashPassword(newPassword);

    // Atualizar senha no banco
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        mustChangePassword: true, // Forçar troca no próximo login
      },
    });

    // Enviar email com nova senha
    await sendPasswordResetEmail(user.email, user.name, newPassword);

    return NextResponse.json({
      success: true,
      message: 'Se o email existir no sistema, você receberá uma nova senha.',
    });

  } catch (error) {
    console.error('Erro na recuperação de senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
