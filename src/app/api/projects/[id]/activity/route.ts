import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Buscar todas as atividades do projeto
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const activities = await prisma.projectActivity.findMany({
      where: { projectId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar atividades' },
      { status: 500 }
    );
  }
}

// POST - Registrar nova atividade
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { action, field, oldValue, newValue, userId, userName } = body;

    // Verificar se projeto existe
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    const activity = await prisma.projectActivity.create({
      data: {
        projectId: id,
        action,
        field: field || null,
        oldValue: oldValue || null,
        newValue: newValue || null,
        userId: userId || 'system',
        userName: userName || 'Sistema',
      },
    });

    return NextResponse.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar atividade' },
      { status: 500 }
    );
  }
}
