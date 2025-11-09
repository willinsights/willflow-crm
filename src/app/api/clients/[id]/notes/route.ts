import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients/[id]/notes - Lista notas do cliente
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clientId = params.id;

    // ✅ Buscar notas do cliente no banco de dados
    const notes = await prisma.clientNote.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      notes
    });
  } catch (error) {
    console.error('Erro ao buscar notas:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar notas' },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/notes - Criar nota
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clientId = params.id;
    const body = await request.json();

    // Validar dados
    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Conteúdo da nota é obrigatório' },
        { status: 400 }
      );
    }

    // ✅ Salvar no banco de dados
    const note = await prisma.clientNote.create({
      data: {
        clientId,
        content: body.content,
        createdBy: body.createdBy || 'current-user',
      }
    });

    console.log('✅ Nota criada no banco:', note);

    return NextResponse.json({
      success: true,
      note,
      message: 'Nota adicionada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar nota:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar nota' },
      { status: 500 }
    );
  }
}
