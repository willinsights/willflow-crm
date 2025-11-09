import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/clients/[id]/communications - Lista comunicações do cliente
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clientId = params.id;

    // ✅ Buscar comunicações do cliente no banco de dados
    const communications = await prisma.communication.findMany({
      where: { clientId },
      orderBy: { sentAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      communications
    });
  } catch (error) {
    console.error('Erro ao buscar comunicações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar comunicações' },
      { status: 500 }
    );
  }
}

// POST /api/clients/[id]/communications - Criar comunicação
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const clientId = params.id;
    const body = await request.json();

    // Validar dados
    if (!body.type || !body.subject) {
      return NextResponse.json(
        { success: false, error: 'Tipo e assunto são obrigatórios' },
        { status: 400 }
      );
    }

    // ✅ Salvar no banco de dados
    const communication = await prisma.communication.create({
      data: {
        clientId,
        type: body.type,
        subject: body.subject,
        content: body.content || '',
        status: body.status || 'pending',
        sentBy: body.sentBy || 'system',
        notes: body.notes || '',
      }
    });

    console.log('✅ Comunicação criada no banco:', communication);

    return NextResponse.json({
      success: true,
      communication,
      message: 'Comunicação registrada com sucesso!'
    });
  } catch (error) {
    console.error('Erro ao criar comunicação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar comunicação' },
      { status: 500 }
    );
  }
}
