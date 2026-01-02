import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/auth/audit - Listar logs de auditoria
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const action = searchParams.get('action');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    const where: any = {};

    if (userId) {
      where.userId = userId;
    }

    if (action) {
      where.action = action;
    }

    const [audits, total] = await Promise.all([
      prisma.loginAudit.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.loginAudit.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: audits,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar auditoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar logs de auditoria' },
      { status: 500 }
    );
  }
}

// POST /api/auth/audit - Registrar log de auditoria
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, success, details } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { success: false, error: 'userId e action são obrigatórios' },
        { status: 400 }
      );
    }

    // Extrair informações do request
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const audit = await prisma.loginAudit.create({
      data: {
        userId,
        action,
        success: success !== false,
        details,
        ipAddress,
        userAgent: userAgent.slice(0, 500), // Limitar tamanho
      },
    });

    return NextResponse.json({
      success: true,
      data: audit,
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar log' },
      { status: 500 }
    );
  }
}
