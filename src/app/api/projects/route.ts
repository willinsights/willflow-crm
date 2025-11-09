import { NextRequest, NextResponse } from 'next/server';
import { Project, VideoType, PaymentStatus, FreelancerPaymentStatus, ProjectPhase, StatusCaptacao, StatusEdicao } from '@/lib/types';
import { prisma } from '@/lib/prisma';

// GET /api/projects - Listar projetos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Filtros opcionais
    const phase = searchParams.get('phase') as ProjectPhase | null;
    const clientId = searchParams.get('clientId');
    const videoType = searchParams.get('videoType') as VideoType | null;
    const assignedToMe = searchParams.get('assignedToMe');
    const userId = searchParams.get('userId'); // Para filtros de permissão

    // Buscar do banco com filtros
    const where: any = {};

    if (phase) where.phase = phase;
    if (clientId) where.clientId = clientId;
    if (videoType) where.videoType = videoType;
    if (assignedToMe === 'true' && userId) {
      where.OR = [
        { responsavelCaptacaoId: userId },
        { responsavelEdicaoId: userId }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: true,
        category: true,
        responsavelCaptacao: true,
        responsavelEdicao: true,
        subtasks: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    // Calcular margem para cada projeto
    const projectsWithMargin = projects.map(p => ({
      ...p,
      margin: p.clientPrice - p.captationCost - p.editionCost
    }));

    return NextResponse.json({
      success: true,
      data: projectsWithMargin,
      total: projectsWithMargin.length
    });

  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar projetos' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Criar projeto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validações básicas
    if (!body.title || !body.clientId) {
      return NextResponse.json(
        { success: false, error: 'Título e cliente são obrigatórios' },
        { status: 400 }
      );
    }

    // Calcular margem
    const clientPrice = parseFloat(body.clientPrice) || 0;
    const captationCost = parseFloat(body.captationCost) || 0;
    const editionCost = parseFloat(body.editionCost) || 0;
    const margin = clientPrice - captationCost - editionCost;

    // Criar no banco
    const newProject = await prisma.project.create({
      data: {
        title: body.title,
        clientId: body.clientId,
        videoType: body.videoType || 'outro',
        categoryId: body.categoryId,
        location: body.location,
        description: body.description,
        phase: body.phase || 'captacao',
        statusCaptacao: body.statusCaptacao || 'agendado',
        statusEdicao: body.statusEdicao,
        responsavelCaptacaoId: body.responsavelCaptacaoId,
        responsavelEdicaoId: body.responsavelEdicaoId,
        nasLink: body.nasLink,
        frameIoLink: body.frameIoLink,
        clientPrice,
        captationCost,
        editionCost,
        margin,
        paymentStatus: body.paymentStatus || 'a-faturar',
        freelancerPaymentStatus: body.freelancerPaymentStatus || 'a-pagar',
        clientDueDate: body.clientDueDate ? new Date(body.clientDueDate) : undefined,
        clientReceivedDate: body.clientReceivedDate ? new Date(body.clientReceivedDate) : undefined,
        freelancerDueDate: body.freelancerDueDate ? new Date(body.freelancerDueDate) : undefined,
        freelancerPaidDate: body.freelancerPaidDate ? new Date(body.freelancerPaidDate) : undefined,
      },
      include: {
        client: true,
        category: true,
        responsavelCaptacao: true,
        responsavelEdicao: true,
        subtasks: true
      }
    });

    return NextResponse.json({
      success: true,
      data: newProject,
      message: 'Projeto criado com sucesso'
    }, { status: 201 });

  } catch (error) {
    console.error('Erro ao criar projeto:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar projeto' },
      { status: 500 }
    );
  }
}

// PUT /api/projects - Atualização em lote (se necessário)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.updates)) {
      return NextResponse.json(
        { success: false, error: 'Formato inválido para atualização em lote' },
        { status: 400 }
      );
    }

    const updatedProjects = [];

    for (const update of body.updates) {
      // Recalcular margem se necessário
      let updateData = { ...update.data };
      if (update.data.clientPrice || update.data.captationCost || update.data.editionCost) {
        // Buscar valores atuais
        const current = await prisma.project.findUnique({
          where: { id: update.id },
          select: { clientPrice: true, captationCost: true, editionCost: true }
        });

        if (current) {
          const clientPrice = update.data.clientPrice ?? current.clientPrice;
          const captationCost = update.data.captationCost ?? current.captationCost;
          const editionCost = update.data.editionCost ?? current.editionCost;
          updateData.margin = clientPrice - captationCost - editionCost;
        }
      }

      const updatedProject = await prisma.project.update({
        where: { id: update.id },
        data: updateData
      });

      if (updatedProject) {
        updatedProjects.push(updatedProject);
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedProjects,
      message: `${updatedProjects.length} projetos atualizados`
    });

  } catch (error) {
    console.error('Erro ao atualizar projetos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar projetos' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects - Deletar múltiplos projetos
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { success: false, error: 'IDs são obrigatórios' },
        { status: 400 }
      );
    }

    const ids = idsParam.split(',');

    // Deletar projetos no banco
    const result = await prisma.project.deleteMany({
      where: { id: { in: ids } }
    });

    return NextResponse.json({
      success: true,
      message: `${result.count} projetos deletados`,
      deletedCount: result.count
    });

  } catch (error) {
    console.error('Erro ao deletar projetos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar projetos' },
      { status: 500 }
    );
  }
}
