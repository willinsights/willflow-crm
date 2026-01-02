import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/notifications - Listar notificações do usuário
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    const where: any = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Erro ao buscar notificações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar notificações' },
      { status: 500 }
    );
  }
}

// POST /api/notifications - Criar notificação
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, type, priority, title, message, projectId, actionUrl } = body;

    if (!userId || !type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'userId, type, title e message são obrigatórios' },
        { status: 400 }
      );
    }

    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        priority: priority || 'medium',
        title,
        message,
        projectId: projectId || null,
        actionUrl: actionUrl || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar notificação' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications - Marcar como lida (em lote)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { notificationIds, userId, markAllAsRead } = body;

    if (markAllAsRead && userId) {
      // Marcar todas como lidas para o usuário
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true, readAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        message: 'Todas as notificações marcadas como lidas',
      });
    }

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return NextResponse.json(
        { success: false, error: 'notificationIds é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.notification.updateMany({
      where: { id: { in: notificationIds } },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: `${notificationIds.length} notificações marcadas como lidas`,
    });
  } catch (error) {
    console.error('Erro ao atualizar notificações:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar notificações' },
      { status: 500 }
    );
  }
}

// DELETE /api/notifications - Deletar notificações
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const deleteAll = searchParams.get('deleteAll') === 'true';

    if (deleteAll && userId) {
      await prisma.notification.deleteMany({
        where: { userId },
      });

      return NextResponse.json({
        success: true,
        message: 'Todas as notificações deletadas',
      });
    }

    if (!notificationId) {
      return NextResponse.json(
        { success: false, error: 'id é obrigatório' },
        { status: 400 }
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({
      success: true,
      message: 'Notificação deletada',
    });
  } catch (error) {
    console.error('Erro ao deletar notificação:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar notificação' },
      { status: 500 }
    );
  }
}
