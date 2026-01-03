import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, sendPasswordChangedEmail, generatePassword, sendWelcomeEmail } from '@/lib/auth-utils';

// GET /api/users/[id] - Buscar usuário específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Get project stats
    const captacaoProjects = await prisma.project.count({
      where: { responsavelCaptacaoId: id },
    });

    const edicaoProjects = await prisma.project.count({
      where: { responsavelEdicaoId: id },
    });

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        captacaoCount: captacaoProjects,
        edicaoCount: edicaoProjects,
      }
    });

  } catch (error) {
    console.error('Erro ao buscar utilizador:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar utilizador' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Atualizar usuário
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Check email uniqueness if email is being changed
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email }
      });

      if (emailExists) {
        return NextResponse.json(
          { success: false, error: 'Email já está em uso' },
          { status: 400 }
        );
      }
    }

    // Update permissions based on role if role is changing
    const updateData: any = { ...body };

    // Handle password change
    if (body.newPassword) {
      updateData.password = hashPassword(body.newPassword);
      updateData.mustChangePassword = false;
      delete updateData.newPassword;

      // Send password changed notification
      await sendPasswordChangedEmail(existingUser.name, existingUser.email);
    }

    // Handle password reset (generate new password)
    let generatedPassword: string | undefined;
    if (body.resetPassword) {
      generatedPassword = generatePassword(12);
      updateData.password = hashPassword(generatedPassword);
      updateData.mustChangePassword = true;
      delete updateData.resetPassword;

      // Send new password email
      await sendWelcomeEmail(
        existingUser.name,
        body.email || existingUser.email,
        generatedPassword
      );
    }

    if (body.role && body.role !== existingUser.role) {
      switch (body.role) {
        case 'admin':
          updateData.canViewFinance = true;
          updateData.canEditProjects = true;
          updateData.canViewAllProjects = true;
          break;
        case 'editor_edicao':
          updateData.canViewFinance = false;
          updateData.canEditProjects = true;
          updateData.canViewAllProjects = true;
          break;
        case 'freelancer_captacao':
          updateData.canViewFinance = false;
          updateData.canEditProjects = false;
          updateData.canViewAllProjects = false;
          break;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
        mustChangePassword: true,
        collaboratorType: true,
        iban: true,
        bankName: true,
        nif: true,
        contributorType: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: body.resetPassword
        ? 'Senha resetada e enviada por email'
        : 'Utilizador atualizado com sucesso',
      ...(process.env.NODE_ENV === 'development' && generatedPassword ? { generatedPassword } : {})
    });

  } catch (error) {
    console.error('Erro ao atualizar utilizador:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar utilizador' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Deletar usuário
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, error: 'Utilizador não encontrado' },
        { status: 404 }
      );
    }

    // Check if user has associated projects
    const hasProjects = await prisma.project.findFirst({
      where: {
        OR: [
          { responsavelCaptacaoId: id },
          { responsavelEdicaoId: id },
        ]
      }
    });

    if (hasProjects) {
      return NextResponse.json(
        { success: false, error: 'Não é possível deletar utilizador com projetos associados. Remova os projetos primeiro ou reatribua-os a outro utilizador.' },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Utilizador deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar utilizador:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar utilizador' },
      { status: 500 }
    );
  }
}
