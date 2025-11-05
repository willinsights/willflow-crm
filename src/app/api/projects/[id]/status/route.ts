import { NextRequest, NextResponse } from 'next/server';
import { Project, ProjectPhase, StatusCaptacao, StatusEdicao } from '@/lib/types';
import { statusTransitions } from '@/lib/data';
import { prisma } from '@/lib/prisma';

// PUT /api/projects/[id]/status - Atualizar status com automações
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { phase, newStatus, userId } = body;

    if (!phase || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'Fase e novo status são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar projeto do banco
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Validar transição de status
    const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
    if (currentStatus && statusTransitions[currentStatus] && !statusTransitions[currentStatus].includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: 'Transição de status não permitida' },
        { status: 400 }
      );
    }

    let updates: any = {};

    // Atualizar status da fase correta
    if (phase === 'captacao') {
      updates.statusCaptacao = newStatus;
    } else {
      updates.statusEdicao = newStatus;
    }

    // 🤖 AUTOMAÇÕES BASEADAS NO STATUS

    // Captação → Concluído: Move para Edição
    if (phase === 'captacao' && newStatus === 'concluido') {
      updates.phase = 'edicao';
      updates.statusEdicao = 'receber-ficheiros';
      updates.paymentStatus = 'a-faturar';
      console.log('🤖 Automação: Movendo projeto de Captação → Edição');
    }

    // Edição → Revisão Cliente: Muda status de pagamento
    else if (phase === 'edicao' && newStatus === 'revisao-cliente') {
      updates.paymentStatus = 'a-receber';
    }

    // Edição → Entregue: Atualiza pagamento e move para finalizados
    else if (phase === 'edicao' && newStatus === 'entregue') {
      updates.paymentStatus = 'recebido';
      updates.phase = 'finalizados';
      console.log('🤖 Automação: Movendo projeto de Edição → Finalizados');
    }

    // Auto-atribuição se userId fornecido
    if (userId && phase === 'edicao' && !project.responsavelEdicaoId) {
      updates.responsavelEdicaoId = userId;
    }

    // Atualizar projeto no banco
    const updatedProject = await prisma.project.update({
      where: { id },
      data: updates,
      include: {
        client: true,
        category: true,
        responsavelCaptacao: true,
        responsavelEdicao: true,
        subtasks: true
      }
    });

    if (!updatedProject) {
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar projeto' },
        { status: 500 }
      );
    }

    // Log da automação (em produção seria auditoria)
    console.log(`🤖 Automação executada: ${phase}/${currentStatus} → ${newStatus}`, {
      projectId: id,
      userId,
      updates: Object.keys(updates)
    });

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Status atualizado com sucesso',
      automations: Object.keys(updates).filter(key =>
        key !== `status${phase.charAt(0).toUpperCase() + phase.slice(1)}`
      )
    });

  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar status' },
      { status: 500 }
    );
  }
}

// GET /api/projects/[id]/status - Obter status e transições disponíveis
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Buscar projeto do banco
    const project = await prisma.project.findUnique({
      where: { id }
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Projeto não encontrado' },
        { status: 404 }
      );
    }

    // Obter transições disponíveis
    const captacaoTransitions = project.statusCaptacao
      ? statusTransitions[project.statusCaptacao] || []
      : [];

    const edicaoTransitions = project.statusEdicao
      ? statusTransitions[project.statusEdicao] || []
      : [];

    return NextResponse.json({
      success: true,
      data: {
        currentStatus: {
          captacao: project.statusCaptacao,
          edicao: project.statusEdicao
        },
        availableTransitions: {
          captacao: captacaoTransitions,
          edicao: edicaoTransitions
        },
        phase: project.phase
      }
    });

  } catch (error) {
    console.error('Erro ao buscar status:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar status' },
      { status: 500 }
    );
  }
}
