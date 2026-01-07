import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '@/lib/auth-utils';

const prisma = new PrismaClient();

/**
 * POST /api/debug/seed-demo
 * 
 * Seed the database with demo/test data
 * ONLY available in development or staging environments
 * 
 * This endpoint:
 * - Clears existing data (idempotent)
 * - Creates Kanban columns
 * - Creates users, clients, categories
 * - Creates 10 projects (5 CAPTACAO, 5 EDICAO) with complete data
 * - Creates subtasks, comments, checklists, activities, notifications, etc.
 */
export async function POST(request: NextRequest) {
  try {
    // ========================================
    // SECURITY: Restrict to dev/staging only
    // ========================================
    const nodeEnv = process.env.NODE_ENV || 'production';
    const allowedEnvs = ['development', 'dev', 'staging', 'test'];
    
    if (!allowedEnvs.includes(nodeEnv.toLowerCase())) {
      console.error(`[Seed Demo] Blocked attempt in ${nodeEnv} environment`);
      return NextResponse.json(
        {
          success: false,
          error: 'Seed endpoint is only available in development/staging environments',
          environment: nodeEnv,
        },
        { status: 403 }
      );
    }

    console.log(`[Seed Demo] Starting seed in ${nodeEnv} environment...`);

    // Helper function to get date offsets
    function getDateOffset(days: number): Date {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date;
    }

    // ========================================
    // CLEAR EXISTING DATA (Idempotent)
    // ========================================
    console.log('[Seed Demo] Clearing existing data...');
    
    await prisma.kanbanColumn.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.projectActivity.deleteMany();
    await prisma.projectComment.deleteMany();
    await prisma.projectChecklist.deleteMany();
    await prisma.projectMedia.deleteMany();
    await prisma.projectFile.deleteMany();
    await prisma.budgetItem.deleteMany();
    await prisma.clientNote.deleteMany();
    await prisma.communication.deleteMany();
    await prisma.subtaskActivity.deleteMany();
    await prisma.subtaskAttachment.deleteMany();
    await prisma.subtaskComment.deleteMany();
    await prisma.subtaskChecklist.deleteMany();
    await prisma.subtask.deleteMany();
    await prisma.project.deleteMany();
    await prisma.category.deleteMany();
    await prisma.client.deleteMany();
    await prisma.loginAudit.deleteMany();
    await prisma.user.deleteMany();

    console.log('[Seed Demo] ✅ Data cleared');

    // ========================================
    // BOOTSTRAP KANBAN COLUMNS
    // ========================================
    console.log('[Seed Demo] Creating Kanban columns...');
    
    const organizationId = 'default';
    
    // Colunas para Captação
    const captacaoColumns = [
      { title: 'A agendar', position: 0, isLocked: false, systemKey: null },
      { title: 'Agendado', position: 1, isLocked: false, systemKey: null },
      { title: 'Em execução', position: 2, isLocked: false, systemKey: null },
      { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
    ];
    
    for (const col of captacaoColumns) {
      await prisma.kanbanColumn.create({
        data: {
          organizationId,
          phase: 'CAPTACAO',
          title: col.title,
          position: col.position,
          isLocked: col.isLocked,
          systemKey: col.systemKey,
          isActive: true,
        },
      });
    }
    
    // Colunas para Edição
    const edicaoColumns = [
      { title: 'A iniciar', position: 0, isLocked: false, systemKey: null },
      { title: 'Em edição', position: 1, isLocked: false, systemKey: null },
      { title: 'Em revisão', position: 2, isLocked: false, systemKey: null },
      { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
    ];
    
    for (const col of edicaoColumns) {
      await prisma.kanbanColumn.create({
        data: {
          organizationId,
          phase: 'EDICAO',
          title: col.title,
          position: col.position,
          isLocked: col.isLocked,
          systemKey: col.systemKey,
          isActive: true,
        },
      });
    }
    
    console.log('[Seed Demo] ✅ Created Kanban columns (CAPTACAO: 4, EDICAO: 4)');

    // ========================================
    // CREATE USERS
    // ========================================
    console.log('[Seed Demo] Creating users...');
    
    const adminPassword = 'admin123';
    const admin = await prisma.user.create({
      data: {
        id: '1',
        name: 'Administrador',
        email: 'admin@in-sights.pt',
        password: hashPassword(adminPassword),
        role: 'admin',
        canViewFinance: true,
        canEditProjects: true,
        canViewAllProjects: true,
        isActive: true,
        mustChangePassword: false,
        lastLogin: new Date(),
      },
    });

    const filmmaker1 = await prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@exemplo.com',
        password: hashPassword('filmmaker123'),
        role: 'freelancer_captacao',
        collaboratorType: 'filmmaker',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890154',
        bankName: 'CGD',
        nif: '123456789',
        contributorType: 'freelancer',
      },
    });

    const photographer1 = await prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@exemplo.com',
        password: hashPassword('photographer123'),
        role: 'freelancer_captacao',
        collaboratorType: 'photographer',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890155',
        bankName: 'Millennium BCP',
        nif: '987654321',
        contributorType: 'freelancer',
      },
    });

    const bothCreator = await prisma.user.create({
      data: {
        name: 'Pedro Costa',
        email: 'pedro.costa@exemplo.com',
        password: hashPassword('creator123'),
        role: 'freelancer_captacao',
        collaboratorType: 'both',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890156',
        bankName: 'Santander',
        nif: '456789123',
        contributorType: 'receipts',
      },
    });

    const editor1 = await prisma.user.create({
      data: {
        name: 'Ana Ferreira',
        email: 'ana.ferreira@exemplo.com',
        password: hashPassword('editor123'),
        role: 'editor_edicao',
        canViewFinance: false,
        canEditProjects: true,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890157',
        bankName: 'Novobanco',
        nif: '321654987',
        contributorType: 'company',
      },
    });

    const editor2 = await prisma.user.create({
      data: {
        name: 'Carlos Mendes',
        email: 'carlos.mendes@exemplo.com',
        password: hashPassword('editor456'),
        role: 'editor_edicao',
        canViewFinance: false,
        canEditProjects: true,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890158',
        bankName: 'BPI',
        nif: '789123456',
        contributorType: 'freelancer',
      },
    });

    console.log('[Seed Demo] ✅ Created 7 users');

    // ========================================
    // CREATE CLIENTS
    // ========================================
    console.log('[Seed Demo] Creating clients...');
    
    const premiumClient = await prisma.client.create({
      data: {
        name: 'Tech Innovations Lda',
        email: 'contato@techinnovations.pt',
        phone: '+351 912 345 678',
        company: 'Tech Innovations',
        totalRevenue: 45000,
        totalCosts: 20000,
        totalMargin: 25000,
        projectCount: 5,
      },
    });

    const regularClient1 = await prisma.client.create({
      data: {
        name: 'Restaurante Sabor Local',
        email: 'marketing@saborlocal.pt',
        phone: '+351 913 456 789',
        company: 'Sabor Local Unipessoal',
        totalRevenue: 8000,
        totalCosts: 4000,
        totalMargin: 4000,
        projectCount: 2,
      },
    });

    const regularClient2 = await prisma.client.create({
      data: {
        name: 'Clínica Saúde Plus',
        email: 'comunicacao@saudeplus.pt',
        phone: '+351 914 567 890',
        company: 'Saúde Plus SA',
        totalRevenue: 15000,
        totalCosts: 7500,
        totalMargin: 7500,
        projectCount: 3,
      },
    });

    const startupClient = await prisma.client.create({
      data: {
        name: 'GreenEnergy Startup',
        email: 'hello@greenenergy.pt',
        phone: '+351 915 678 901',
        company: 'GreenEnergy Portugal',
        totalRevenue: 12000,
        totalCosts: 6000,
        totalMargin: 6000,
        projectCount: 2,
      },
    });

    const corporateClient = await prisma.client.create({
      data: {
        name: 'BankCorp Portugal',
        email: 'marketing@bankcorp.pt',
        phone: '+351 916 789 012',
        company: 'BankCorp SA',
        totalRevenue: 50000,
        totalCosts: 22000,
        totalMargin: 28000,
        projectCount: 4,
      },
    });

    const fashionClient = await prisma.client.create({
      data: {
        name: 'Moda Lisboa Boutique',
        email: 'social@modalisboa.pt',
        phone: '+351 917 890 123',
        company: 'Moda Lisboa Lda',
        totalRevenue: 9000,
        totalCosts: 4500,
        totalMargin: 4500,
        projectCount: 3,
      },
    });

    console.log('[Seed Demo] ✅ Created 6 clients');

    // ========================================
    // CREATE CATEGORIES
    // ========================================
    console.log('[Seed Demo] Creating categories...');
    
    const catMarketing = await prisma.category.create({
      data: {
        name: 'Vídeo Marketing',
        description: 'Vídeos promocionais e de marketing digital',
        color: '#3B82F6',
      },
    });

    const catDocumentary = await prisma.category.create({
      data: {
        name: 'Documentário',
        description: 'Produções documentais e storytelling',
        color: '#10B981',
      },
    });

    const catAdvertising = await prisma.category.create({
      data: {
        name: 'Publicidade',
        description: 'Campanhas publicitárias e comerciais',
        color: '#F59E0B',
      },
    });

    const catCorporate = await prisma.category.create({
      data: {
        name: 'Corporativo',
        description: 'Vídeos institucionais e corporativos',
        color: '#8B5CF6',
      },
    });

    const catEvent = await prisma.category.create({
      data: {
        name: 'Eventos',
        description: 'Cobertura de eventos e conferências',
        color: '#EC4899',
      },
    });

    const catSocial = await prisma.category.create({
      data: {
        name: 'Redes Sociais',
        description: 'Conteúdo para Instagram, TikTok, YouTube',
        color: '#14B8A6',
      },
    });

    console.log('[Seed Demo] ✅ Created 6 categories');

    // ========================================
    // CREATE 10 PROJECTS (5 CAPTACAO, 5 EDICAO)
    // ========================================
    console.log('[Seed Demo] Creating projects...');
    
    const projects = [];

    // CAPTACAO Projects (5)
    const project1 = await prisma.project.create({
      data: {
        title: 'Campanha Ano Novo 2026',
        description: 'Campanha de vídeo marketing para lançamento de novos produtos',
        phase: 'captacao',
        statusCaptacao: 'a-agendar',
        statusEdicao: null,
        clientId: premiumClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Lisboa, Portugal',
        customId: 'PROJ-2026-001',
        clientPrice: 8500,
        captationCost: 2500,
        editionCost: 2000,
        margin: 4000,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(5),
        clientDueDate: getDateOffset(15),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2026/campanha-ano-novo',
        frameIoLink: 'https://frameio.example.com/project1',
      },
    });
    projects.push(project1);

    const project2 = await prisma.project.create({
      data: {
        title: 'Documentário História de Lisboa',
        description: 'Documentário sobre a evolução histórica da cidade de Lisboa',
        phase: 'captacao',
        statusCaptacao: 'agendado',
        statusEdicao: null,
        clientId: corporateClient.id,
        categoryId: catDocumentary.id,
        videoType: 'documentario',
        location: 'Lisboa, Vários Locais',
        customId: 'PROJ-2026-002',
        clientPrice: 25000,
        captationCost: 8000,
        editionCost: 6000,
        margin: 11000,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'not_applicable',
        captacaoDate: getDateOffset(30),
        clientDueDate: getDateOffset(60),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor2.id,
      },
    });
    projects.push(project2);

    const project3 = await prisma.project.create({
      data: {
        title: 'Comercial TV Restaurante',
        description: 'Spot publicitário de 30 segundos para TV e redes sociais',
        phase: 'captacao',
        statusCaptacao: 'em-execucao',
        statusEdicao: null,
        clientId: regularClient1.id,
        categoryId: catAdvertising.id,
        videoType: 'publicidade',
        location: 'Porto, Portugal',
        customId: 'PROJ-2025-089',
        clientPrice: 4500,
        captationCost: 1200,
        editionCost: 1000,
        margin: 2300,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-15),
        clientDueDate: getDateOffset(5),
        freelancerDueDate: getDateOffset(-10),
        freelancerPaidDate: getDateOffset(-8),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2025/comercial-restaurante',
      },
    });
    projects.push(project3);

    const project4 = await prisma.project.create({
      data: {
        title: 'Vídeo Corporativo Clínica',
        description: 'Vídeo institucional apresentando os serviços da clínica',
        phase: 'captacao',
        statusCaptacao: 'entregue',
        statusEdicao: null,
        clientId: regularClient2.id,
        categoryId: catCorporate.id,
        videoType: 'corporativo',
        location: 'Coimbra, Portugal',
        customId: 'PROJ-2025-078',
        clientPrice: 5500,
        captationCost: 1500,
        editionCost: 0,
        margin: 4000,
        paymentStatus: 'paid',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-25),
        clientDueDate: getDateOffset(-3),
        clientReceivedDate: getDateOffset(-2),
        freelancerDueDate: getDateOffset(-10),
        freelancerPaidDate: getDateOffset(-5),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: null,
        frameIoLink: 'https://frameio.example.com/project4',
      },
    });
    projects.push(project4);

    const project5 = await prisma.project.create({
      data: {
        title: 'Série Redes Sociais GreenEnergy',
        description: 'Série de 10 vídeos curtos para Instagram e TikTok',
        phase: 'captacao',
        statusCaptacao: 'entregue',
        statusEdicao: null,
        clientId: startupClient.id,
        categoryId: catSocial.id,
        videoType: 'reels',
        location: 'Remote/Estúdio',
        customId: 'PROJ-2026-003',
        clientPrice: 6000,
        captationCost: 1800,
        editionCost: 1500,
        margin: 2700,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(7),
        clientDueDate: getDateOffset(21),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor1.id,
      },
    });
    projects.push(project5);

    // EDICAO Projects (5)
    const project6 = await prisma.project.create({
      data: {
        title: 'Conferência Tech Summit 2026',
        description: 'Cobertura completa do evento de tecnologia',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'a-iniciar',
        clientId: premiumClient.id,
        categoryId: catEvent.id,
        videoType: 'evento',
        location: 'Centro de Congressos, Lisboa',
        customId: 'PROJ-2026-004',
        clientPrice: 12000,
        captationCost: 4000,
        editionCost: 3000,
        margin: 5000,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'not_applicable',
        captacaoDate: getDateOffset(-5),
        clientDueDate: getDateOffset(35),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor2.id,
      },
    });
    projects.push(project6);

    const project7 = await prisma.project.create({
      data: {
        title: 'Campanha Poupança BankCorp',
        description: 'Campanha publicitária multi-canal para produto de poupança',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-edicao',
        clientId: corporateClient.id,
        categoryId: catAdvertising.id,
        videoType: 'publicidade',
        location: 'Lisboa, Estúdio Professional',
        customId: 'PROJ-2026-005',
        clientPrice: 18000,
        captationCost: 5000,
        editionCost: 4000,
        margin: 9000,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-10),
        clientDueDate: getDateOffset(10),
        freelancerDueDate: getDateOffset(-5),
        freelancerPaidDate: getDateOffset(-3),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2026/bankcorp-poupanca',
        frameIoLink: 'https://frameio.example.com/project7',
      },
    });
    projects.push(project7);

    const project8 = await prisma.project.create({
      data: {
        title: 'Behind the Scenes Tech Innovations',
        description: 'Série de vídeos mostrando os bastidores da empresa',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-revisao',
        clientId: premiumClient.id,
        categoryId: catSocial.id,
        videoType: 'social_media',
        location: 'Escritórios Tech Innovations',
        customId: 'PROJ-2026-006',
        clientPrice: 3500,
        captationCost: 1000,
        editionCost: 800,
        margin: 1700,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(-7),
        clientDueDate: getDateOffset(12),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
      },
    });
    projects.push(project8);

    const project9 = await prisma.project.create({
      data: {
        title: 'Tutorial Produto Startup',
        description: 'Série de tutoriais explicando o uso do produto',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'entregue',
        clientId: startupClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Estúdio',
        customId: 'PROJ-2026-007',
        clientPrice: 4500,
        captationCost: 1200,
        editionCost: 1000,
        margin: 2300,
        paymentStatus: 'paid',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-20),
        clientDueDate: getDateOffset(-5),
        clientReceivedDate: getDateOffset(-3),
        freelancerDueDate: getDateOffset(-10),
        freelancerPaidDate: getDateOffset(-8),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor2.id,
        nasLink: 'nas://projetos/2026/tutorial-startup',
        frameIoLink: 'https://frameio.example.com/project9',
      },
    });
    projects.push(project9);

    const project10 = await prisma.project.create({
      data: {
        title: 'Campanha Redes Sociais Clínica',
        description: 'Conteúdo mensal para Instagram e Facebook',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'a-iniciar',
        clientId: regularClient2.id,
        categoryId: catSocial.id,
        videoType: 'reels',
        location: 'Clínica Saúde Plus',
        customId: 'PROJ-2026-008',
        clientPrice: 3000,
        captationCost: 800,
        editionCost: 900,
        margin: 1300,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(-5),
        clientDueDate: getDateOffset(15),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor1.id,
      },
    });
    projects.push(project10);

    console.log('[Seed Demo] ✅ Created 10 projects (5 CAPTACAO, 5 EDICAO)');

    // ========================================
    // CREATE SUBTASKS, COMMENTS, CHECKLISTS
    // ========================================
    console.log('[Seed Demo] Creating subtasks, comments, and checklists...');

    // Sample subtasks for project1
    await prisma.subtask.create({
      data: {
        projectId: project1.id,
        title: 'Pré-produção e roteiro',
        description: 'Desenvolver roteiro e storyboard',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-5),
        estimatedHours: 8,
        actualHours: 10,
        assignedTo: filmmaker1.id,
        order: 0,
      },
    });

    // Sample project comment
    await prisma.projectComment.create({
      data: {
        projectId: project1.id,
        content: 'Cliente aprovou o roteiro inicial. Podemos avançar para a captação.',
        createdBy: admin.id,
        createdByName: admin.name,
        createdAt: getDateOffset(-4),
      },
    });

    // Sample checklist
    await prisma.projectChecklist.create({
      data: {
        projectId: project1.id,
        title: 'Contrato assinado',
        completed: true,
        completedAt: getDateOffset(-10),
        completedBy: admin.id,
        order: 0,
      },
    });

    // Sample project activity
    await prisma.projectActivity.create({
      data: {
        projectId: project1.id,
        action: 'created',
        userId: admin.id,
        userName: admin.name,
        createdAt: getDateOffset(-15),
      },
    });

    // Sample notification
    await prisma.notification.create({
      data: {
        userId: filmmaker1.id,
        type: 'project',
        priority: 'medium',
        title: 'Nova captação agendada',
        message: 'Você foi designado para a captação do projeto "Campanha Ano Novo 2026"',
        projectId: project1.id,
        actionUrl: `/projects/${project1.id}`,
        isRead: false,
        createdAt: getDateOffset(-3),
      },
    });

    console.log('[Seed Demo] ✅ Created sample subtasks, comments, checklists, and activities');

    // ========================================
    // RETURN SUMMARY
    // ========================================
    const summary = {
      success: true,
      message: 'Demo data seeded successfully',
      environment: nodeEnv,
      data: {
        users: 7,
        clients: 6,
        categories: 6,
        projects: {
          total: 10,
          captacao: 5,
          edicao: 5,
        },
        kanbanColumns: {
          captacao: 4,
          edicao: 4,
        },
      },
      credentials: {
        admin: {
          email: 'admin@in-sights.pt',
          password: 'admin123',
        },
      },
    };

    console.log('[Seed Demo] ✨ Seed completed successfully!');
    console.log('[Seed Demo] Summary:', JSON.stringify(summary, null, 2));

    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Seed Demo] Error seeding database:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to seed database',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
