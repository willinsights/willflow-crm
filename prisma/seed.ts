import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper function to get date offsets
function getDateOffset(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar banco de dados em ordem correta devido às relações
  console.log('🧹 Limpando banco de dados...')
  await prisma.notification.deleteMany()
  await prisma.projectActivity.deleteMany()
  await prisma.projectComment.deleteMany()
  await prisma.projectChecklist.deleteMany()
  await prisma.projectMedia.deleteMany()
  await prisma.projectFile.deleteMany()
  await prisma.budgetItem.deleteMany()
  await prisma.clientNote.deleteMany()
  await prisma.communication.deleteMany()
  await prisma.subtaskActivity.deleteMany()
  await prisma.subtaskAttachment.deleteMany()
  await prisma.subtaskComment.deleteMany()
  await prisma.subtaskChecklist.deleteMany()
  await prisma.subtask.deleteMany()
  await prisma.project.deleteMany()
  await prisma.category.deleteMany()
  await prisma.client.deleteMany()
  await prisma.loginAudit.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuário administrador
  const admin = await prisma.user.create({
    data: {
      id: '1',
      name: 'Administrador',
      email: 'admin@in-sights.pt',
      role: 'admin',
      canViewFinance: true,
      canEditProjects: true,
      canViewAllProjects: true,
      isActive: true,
      mustChangePassword: false,
      lastLogin: new Date(),
    },
  })

  console.log('✅ Criado 1 usuário administrador')

  const shouldPopulate = process.env.SEED_WITH_SAMPLE_DATA === 'true'

  if (shouldPopulate) {
    console.log('📦 Populando banco com dados completos de exemplo...')

    // ========================================
    // CRIAR USUÁRIOS DIVERSOS
    // ========================================
    console.log('👥 Criando usuários...')
    
    const filmmaker1 = await prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@exemplo.com',
        role: 'freelancer_captacao',
        collaboratorType: 'filmmaker',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: false,
        iban: 'PT50000201231234567890154',
        bankName: 'CGD',
        nif: '123456789',
        contributorType: 'freelancer',
      },
    })

    const photographer1 = await prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@exemplo.com',
        role: 'freelancer_captacao',
        collaboratorType: 'photographer',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: false,
        iban: 'PT50000201231234567890155',
        bankName: 'Millennium BCP',
        nif: '987654321',
        contributorType: 'freelancer',
      },
    })

    const bothCreator = await prisma.user.create({
      data: {
        name: 'Pedro Costa',
        email: 'pedro.costa@exemplo.com',
        role: 'freelancer_captacao',
        collaboratorType: 'both',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: false,
        iban: 'PT50000201231234567890156',
        bankName: 'Santander',
        nif: '456789123',
        contributorType: 'receipts',
      },
    })

    const editor1 = await prisma.user.create({
      data: {
        name: 'Ana Ferreira',
        email: 'ana.ferreira@exemplo.com',
        role: 'editor_edicao',
        canViewFinance: false,
        canEditProjects: true,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: false,
        iban: 'PT50000201231234567890157',
        bankName: 'Novobanco',
        nif: '321654987',
        contributorType: 'company',
      },
    })

    const editor2 = await prisma.user.create({
      data: {
        name: 'Carlos Mendes',
        email: 'carlos.mendes@exemplo.com',
        role: 'editor_edicao',
        canViewFinance: false,
        canEditProjects: true,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: false,
        iban: 'PT50000201231234567890158',
        bankName: 'BPI',
        nif: '789123456',
        contributorType: 'freelancer',
      },
    })

    const viewer = await prisma.user.create({
      data: {
        name: 'Sofia Oliveira',
        email: 'sofia.oliveira@exemplo.com',
        role: 'viewer',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: true,
        isActive: true,
        mustChangePassword: false,
      },
    })

    console.log('✅ Criados 7 usuários com diferentes perfis')

    // ========================================
    // CRIAR CLIENTES DIVERSOS
    // ========================================
    console.log('🏢 Criando clientes...')
    
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
    })

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
    })

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
    })

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
    })

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
    })

    console.log('✅ Criados 5 clientes com perfis variados')

    // ========================================
    // CRIAR CATEGORIAS
    // ========================================
    console.log('📁 Criando categorias...')
    
    const catMarketing = await prisma.category.create({
      data: {
        name: 'Vídeo Marketing',
        description: 'Vídeos promocionais e de marketing digital',
        color: '#3B82F6',
      },
    })

    const catDocumentary = await prisma.category.create({
      data: {
        name: 'Documentário',
        description: 'Produções documentais e storytelling',
        color: '#10B981',
      },
    })

    const catAdvertising = await prisma.category.create({
      data: {
        name: 'Publicidade',
        description: 'Campanhas publicitárias e comerciais',
        color: '#F59E0B',
      },
    })

    const catCorporate = await prisma.category.create({
      data: {
        name: 'Corporativo',
        description: 'Vídeos institucionais e corporativos',
        color: '#8B5CF6',
      },
    })

    const catEvent = await prisma.category.create({
      data: {
        name: 'Eventos',
        description: 'Cobertura de eventos e conferências',
        color: '#EC4899',
      },
    })

    const catSocial = await prisma.category.create({
      data: {
        name: 'Redes Sociais',
        description: 'Conteúdo para Instagram, TikTok, YouTube',
        color: '#14B8A6',
      },
    })

    console.log('✅ Criadas 6 categorias')

    // ========================================
    // CRIAR PROJETOS COM DIFERENTES STATUS
    // ========================================
    console.log('🎬 Criando projetos...')
    
    // Projeto 1: Em andamento - mês atual
    const project1 = await prisma.project.create({
      data: {
        title: 'Campanha Ano Novo 2026',
        description: 'Campanha de vídeo marketing para lançamento de novos produtos no início do ano',
        phase: 'captacao',
        statusCaptacao: 'em-captacao',
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
    })

    // Projeto 2: Planejamento - próximo mês
    const project2 = await prisma.project.create({
      data: {
        title: 'Documentário História de Lisboa',
        description: 'Documentário sobre a evolução histórica da cidade de Lisboa nos últimos 100 anos',
        phase: 'planejamento',
        statusCaptacao: null,
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
    })

    // Projeto 3: Em edição - atrasado
    const project3 = await prisma.project.create({
      data: {
        title: 'Comercial TV Restaurante',
        description: 'Spot publicitário de 30 segundos para TV e redes sociais',
        phase: 'edicao',
        statusCaptacao: 'concluida',
        statusEdicao: 'em-edicao',
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
        clientDueDate: getDateOffset(-5),
        freelancerDueDate: getDateOffset(-10),
        freelancerPaidDate: getDateOffset(-8),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2025/comercial-restaurante',
      },
    })

    // Projeto 4: Concluído recentemente
    const project4 = await prisma.project.create({
      data: {
        title: 'Vídeo Corporativo Clínica',
        description: 'Vídeo institucional apresentando os serviços da clínica',
        phase: 'concluido',
        statusCaptacao: 'concluida',
        statusEdicao: 'concluida',
        clientId: regularClient2.id,
        categoryId: catCorporate.id,
        videoType: 'corporativo',
        location: 'Coimbra, Portugal',
        customId: 'PROJ-2025-078',
        clientPrice: 5500,
        captationCost: 1500,
        editionCost: 1200,
        margin: 2800,
        paymentStatus: 'paid',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-25),
        clientDueDate: getDateOffset(-3),
        clientReceivedDate: getDateOffset(-2),
        freelancerDueDate: getDateOffset(-10),
        freelancerPaidDate: getDateOffset(-5),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor2.id,
        frameIoLink: 'https://frameio.example.com/project4',
      },
    })

    // Projeto 5: Em produção - próxima semana
    const project5 = await prisma.project.create({
      data: {
        title: 'Série Redes Sociais GreenEnergy',
        description: 'Série de 10 vídeos curtos para Instagram e TikTok sobre energia sustentável',
        phase: 'captacao',
        statusCaptacao: 'em-captacao',
        statusEdicao: null,
        clientId: startupClient.id,
        categoryId: catSocial.id,
        videoType: 'social_media',
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
    })

    // Projeto 6: Cobertura de Evento - mês atual
    const project6 = await prisma.project.create({
      data: {
        title: 'Conferência Tech Summit 2026',
        description: 'Cobertura completa do evento de tecnologia com entrevistas e highlights',
        phase: 'planejamento',
        statusCaptacao: null,
        statusEdicao: null,
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
        captacaoDate: getDateOffset(20),
        clientDueDate: getDateOffset(35),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    // Projeto 7: Campanha BankCorp - próximo mês
    const project7 = await prisma.project.create({
      data: {
        title: 'Campanha Poupança BankCorp',
        description: 'Campanha publicitária multi-canal para produto de poupança',
        phase: 'edicao',
        statusCaptacao: 'concluida',
        statusEdicao: 'revisao',
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
    })

    // Projeto 8: Vídeo redes sociais - esta semana
    const project8 = await prisma.project.create({
      data: {
        title: 'Behind the Scenes Tech Innovations',
        description: 'Série de vídeos mostrando os bastidores da empresa',
        phase: 'captacao',
        statusCaptacao: 'em-captacao',
        statusEdicao: null,
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
        captacaoDate: getDateOffset(3),
        clientDueDate: getDateOffset(12),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    console.log('✅ Criados 8 projetos com diferentes status e prazos')

    // ========================================
    // CRIAR SUBTASKS PARA PROJETOS
    // ========================================
    console.log('✅ Criando subtasks...')
    
    // Subtasks para projeto 1
    const subtask1_1 = await prisma.subtask.create({
      data: {
        projectId: project1.id,
        title: 'Pré-produção e roteiro',
        description: 'Desenvolver roteiro e storyboard para a campanha',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-5),
        estimatedHours: 8,
        actualHours: 10,
        assignedTo: filmmaker1.id,
        dueDate: getDateOffset(-3),
        order: 0,
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project1.id,
        title: 'Captação de imagens',
        description: 'Filmagem em estúdio e locações externas',
        status: 'in_progress',
        priority: 'urgent',
        completed: false,
        estimatedHours: 16,
        assignedTo: filmmaker1.id,
        dueDate: getDateOffset(5),
        order: 1,
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project1.id,
        title: 'Edição e pós-produção',
        description: 'Edição de vídeo, correção de cor e efeitos',
        status: 'todo',
        priority: 'high',
        completed: false,
        estimatedHours: 20,
        assignedTo: editor1.id,
        dueDate: getDateOffset(12),
        order: 2,
      },
    })

    // Subtasks para projeto 3 (atrasado)
    await prisma.subtask.create({
      data: {
        projectId: project3.id,
        title: 'Primeira versão de edição',
        description: 'Criar primeira versão para aprovação do cliente',
        status: 'review',
        priority: 'urgent',
        completed: false,
        estimatedHours: 12,
        actualHours: 15,
        assignedTo: editor1.id,
        dueDate: getDateOffset(-2),
        order: 0,
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project3.id,
        title: 'Correções pós-feedback',
        description: 'Implementar alterações solicitadas pelo cliente',
        status: 'in_progress',
        priority: 'urgent',
        completed: false,
        estimatedHours: 6,
        assignedTo: editor1.id,
        dueDate: getDateOffset(2),
        order: 1,
      },
    })

    // Subtasks para projeto 5
    await prisma.subtask.create({
      data: {
        projectId: project5.id,
        title: 'Script para vídeos 1-5',
        description: 'Desenvolver scripts para os primeiros 5 vídeos da série',
        status: 'done',
        priority: 'medium',
        completed: true,
        completedAt: getDateOffset(-2),
        estimatedHours: 10,
        actualHours: 8,
        assignedTo: bothCreator.id,
        dueDate: getDateOffset(-1),
        order: 0,
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project5.id,
        title: 'Gravação vídeos 1-5',
        description: 'Gravar os primeiros 5 vídeos da série',
        status: 'in_progress',
        priority: 'high',
        completed: false,
        estimatedHours: 8,
        assignedTo: bothCreator.id,
        dueDate: getDateOffset(7),
        order: 1,
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project5.id,
        title: 'Script para vídeos 6-10',
        description: 'Desenvolver scripts para os últimos 5 vídeos',
        status: 'todo',
        priority: 'medium',
        completed: false,
        estimatedHours: 10,
        assignedTo: bothCreator.id,
        dueDate: getDateOffset(14),
        order: 2,
      },
    })

    console.log('✅ Criadas subtasks para os projetos')

    // ========================================
    // CRIAR COMENTÁRIOS EM PROJETOS
    // ========================================
    console.log('💬 Criando comentários...')
    
    await prisma.projectComment.create({
      data: {
        projectId: project1.id,
        content: 'Cliente aprovou o roteiro inicial. Podemos avançar para a captação.',
        createdBy: admin.id,
        createdByName: admin.name,
        createdAt: getDateOffset(-4),
      },
    })

    await prisma.projectComment.create({
      data: {
        projectId: project1.id,
        content: 'Equipamento reservado para o dia da filmagem. Tudo pronto!',
        createdBy: filmmaker1.id,
        createdByName: filmmaker1.name,
        createdAt: getDateOffset(-2),
      },
    })

    await prisma.projectComment.create({
      data: {
        projectId: project3.id,
        content: 'Cliente solicitou mudanças na trilha sonora. Em andamento.',
        createdBy: editor1.id,
        createdByName: editor1.name,
        createdAt: getDateOffset(-1),
      },
    })

    await prisma.projectComment.create({
      data: {
        projectId: project7.id,
        content: 'Primeira versão enviada para revisão do cliente via Frame.io',
        createdBy: editor1.id,
        createdByName: editor1.name,
        createdAt: getDateOffset(-2),
      },
    })

    console.log('✅ Criados comentários nos projetos')

    // ========================================
    // CRIAR CHECKLISTS DE PROJETO
    // ========================================
    console.log('☑️ Criando checklists...')
    
    await prisma.projectChecklist.create({
      data: {
        projectId: project1.id,
        title: 'Contrato assinado',
        completed: true,
        completedAt: getDateOffset(-10),
        completedBy: admin.id,
        order: 0,
      },
    })

    await prisma.projectChecklist.create({
      data: {
        projectId: project1.id,
        title: 'Briefing recebido',
        completed: true,
        completedAt: getDateOffset(-8),
        completedBy: admin.id,
        order: 1,
      },
    })

    await prisma.projectChecklist.create({
      data: {
        projectId: project1.id,
        title: 'Locações confirmadas',
        completed: true,
        completedAt: getDateOffset(-3),
        completedBy: filmmaker1.id,
        order: 2,
      },
    })

    await prisma.projectChecklist.create({
      data: {
        projectId: project1.id,
        title: 'Material bruto organizado',
        completed: false,
        order: 3,
      },
    })

    console.log('✅ Criadas checklists para projetos')

    // ========================================
    // CRIAR ATIVIDADES DE PROJETO
    // ========================================
    console.log('📝 Criando log de atividades...')
    
    await prisma.projectActivity.create({
      data: {
        projectId: project1.id,
        action: 'created',
        userId: admin.id,
        userName: admin.name,
        createdAt: getDateOffset(-15),
      },
    })

    await prisma.projectActivity.create({
      data: {
        projectId: project1.id,
        action: 'status_changed',
        field: 'phase',
        oldValue: 'planejamento',
        newValue: 'captacao',
        userId: admin.id,
        userName: admin.name,
        createdAt: getDateOffset(-7),
      },
    })

    await prisma.projectActivity.create({
      data: {
        projectId: project3.id,
        action: 'status_changed',
        field: 'statusEdicao',
        oldValue: 'aguardando-edicao',
        newValue: 'em-edicao',
        userId: editor1.id,
        userName: editor1.name,
        createdAt: getDateOffset(-12),
      },
    })

    await prisma.projectActivity.create({
      data: {
        projectId: project3.id,
        action: 'comment_added',
        userId: editor1.id,
        userName: editor1.name,
        createdAt: getDateOffset(-1),
      },
    })

    console.log('✅ Criado log de atividades')

    // ========================================
    // CRIAR NOTIFICAÇÕES
    // ========================================
    console.log('🔔 Criando notificações...')
    
    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'deadline',
        priority: 'high',
        title: 'Projeto próximo do prazo',
        message: 'O projeto "Comercial TV Restaurante" está atrasado em 5 dias',
        projectId: project3.id,
        actionUrl: `/projects/${project3.id}`,
        isRead: false,
        createdAt: getDateOffset(-1),
      },
    })

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
    })

    await prisma.notification.create({
      data: {
        userId: editor1.id,
        type: 'comment',
        priority: 'medium',
        title: 'Novo comentário no projeto',
        message: 'Cliente adicionou feedback no projeto "Campanha Poupança BankCorp"',
        projectId: project7.id,
        actionUrl: `/projects/${project7.id}`,
        isRead: true,
        readAt: getDateOffset(-1),
        createdAt: getDateOffset(-2),
      },
    })

    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'payment',
        priority: 'high',
        title: 'Pagamento pendente',
        message: 'Fatura do cliente Tech Innovations Lda vence em 5 dias',
        projectId: project1.id,
        actionUrl: `/finance`,
        isRead: false,
        createdAt: getDateOffset(-1),
      },
    })

    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'payment',
        priority: 'urgent',
        title: 'Pagamento atrasado',
        message: 'Pagamento ao freelancer João Silva está atrasado há 3 dias',
        isRead: false,
        createdAt: new Date(),
      },
    })

    await prisma.notification.create({
      data: {
        userId: photographer1.id,
        type: 'project',
        priority: 'low',
        title: 'Projeto concluído',
        message: 'O projeto "Vídeo Corporativo Clínica" foi marcado como concluído',
        projectId: project4.id,
        actionUrl: `/projects/${project4.id}`,
        isRead: true,
        readAt: getDateOffset(-1),
        createdAt: getDateOffset(-2),
      },
    })

    console.log('✅ Criadas notificações variadas')

    // ========================================
    // CRIAR ARQUIVOS DE PROJETO
    // ========================================
    console.log('📄 Criando arquivos de projeto...')
    
    await prisma.projectFile.create({
      data: {
        projectId: project1.id,
        name: 'roteiro-campanha-v2.pdf',
        url: '/uploads/roteiro-campanha-v2.pdf',
        size: 524288,
        mimeType: 'application/pdf',
        category: 'document',
        description: 'Roteiro final aprovado pelo cliente',
        uploadedBy: admin.id,
        uploadedAt: getDateOffset(-6),
      },
    })

    await prisma.projectFile.create({
      data: {
        projectId: project1.id,
        name: 'storyboard.png',
        url: '/uploads/storyboard.png',
        size: 2097152,
        mimeType: 'image/png',
        category: 'image',
        description: 'Storyboard visual do projeto',
        uploadedBy: filmmaker1.id,
        uploadedAt: getDateOffset(-5),
      },
    })

    await prisma.projectFile.create({
      data: {
        projectId: project4.id,
        name: 'video-final-clinica.mp4',
        url: '/uploads/video-final-clinica.mp4',
        size: 157286400,
        mimeType: 'video/mp4',
        category: 'video',
        description: 'Vídeo final entregue ao cliente',
        uploadedBy: editor2.id,
        uploadedAt: getDateOffset(-3),
      },
    })

    console.log('✅ Criados arquivos de projeto')

    // ========================================
    // CRIAR MEDIA DE PROJETO
    // ========================================
    console.log('🎥 Criando links de media...')
    
    await prisma.projectMedia.create({
      data: {
        projectId: project1.id,
        type: 'frameio',
        title: 'Review Campanha Ano Novo',
        url: 'https://app.frame.io/reviews/abc123',
        description: 'Link para revisão de material bruto',
        status: 'active',
        addedBy: filmmaker1.id,
        addedByName: filmmaker1.name,
        order: 0,
      },
    })

    await prisma.projectMedia.create({
      data: {
        projectId: project4.id,
        type: 'vimeo',
        title: 'Vídeo Final Clínica Saúde Plus',
        url: 'https://vimeo.com/123456789',
        description: 'Versão final aprovada',
        thumbnail: 'https://i.vimeocdn.com/video/123456789_640.jpg',
        duration: '02:30',
        status: 'active',
        addedBy: editor2.id,
        addedByName: editor2.name,
        order: 0,
      },
    })

    await prisma.projectMedia.create({
      data: {
        projectId: project7.id,
        type: 'nas',
        title: 'Material Bruto BankCorp',
        url: 'nas://projetos/2026/bankcorp-poupanca/raw',
        description: 'Todo o material capturado',
        status: 'active',
        addedBy: photographer1.id,
        addedByName: photographer1.name,
        order: 0,
      },
    })

    console.log('✅ Criados links de media')

    // ========================================
    // CRIAR ITENS DE ORÇAMENTO
    // ========================================
    console.log('💰 Criando itens de orçamento...')
    
    await prisma.budgetItem.create({
      data: {
        projectId: project1.id,
        category: 'equipamento',
        description: 'Aluguer de câmara Sony FX6',
        quantity: 2,
        unitPrice: 300,
        total: 600,
        phase: 'captacao',
        isPaid: true,
      },
    })

    await prisma.budgetItem.create({
      data: {
        projectId: project1.id,
        category: 'equipe',
        description: 'Filmmaker - Diária',
        quantity: 2,
        unitPrice: 500,
        total: 1000,
        phase: 'captacao',
        isPaid: false,
      },
    })

    await prisma.budgetItem.create({
      data: {
        projectId: project1.id,
        category: 'pos-producao',
        description: 'Edição e pós-produção',
        quantity: 1,
        unitPrice: 2000,
        total: 2000,
        phase: 'edicao',
        isPaid: false,
      },
    })

    await prisma.budgetItem.create({
      data: {
        projectId: project2.id,
        category: 'transporte',
        description: 'Deslocações em Lisboa',
        quantity: 5,
        unitPrice: 80,
        total: 400,
        phase: 'captacao',
        isPaid: false,
      },
    })

    await prisma.budgetItem.create({
      data: {
        projectId: project2.id,
        category: 'alimentacao',
        description: 'Refeições equipa',
        quantity: 10,
        unitPrice: 15,
        total: 150,
        phase: 'captacao',
        isPaid: false,
      },
    })

    console.log('✅ Criados itens de orçamento')

    // ========================================
    // CRIAR NOTAS E COMUNICAÇÕES DE CLIENTES
    // ========================================
    console.log('📝 Criando notas e comunicações...')
    
    await prisma.clientNote.create({
      data: {
        clientId: premiumClient.id,
        content: 'Cliente muito satisfeito com trabalhos anteriores. Sempre pontual nos pagamentos.',
        createdBy: admin.id,
        createdAt: getDateOffset(-30),
      },
    })

    await prisma.clientNote.create({
      data: {
        clientId: regularClient1.id,
        content: 'Prefere comunicação por WhatsApp. Disponibilidade apenas após as 18h.',
        createdBy: admin.id,
        createdAt: getDateOffset(-20),
      },
    })

    await prisma.communication.create({
      data: {
        clientId: premiumClient.id,
        type: 'email',
        subject: 'Proposta para Campanha Ano Novo',
        content: 'Enviada proposta comercial com orçamento detalhado',
        status: 'sent',
        sentBy: admin.id,
        sentAt: getDateOffset(-20),
      },
    })

    await prisma.communication.create({
      data: {
        clientId: premiumClient.id,
        type: 'meeting',
        subject: 'Reunião de Kickoff',
        content: 'Reunião presencial para alinhar expectativas do projeto',
        status: 'completed',
        sentBy: admin.id,
        sentAt: getDateOffset(-12),
        notes: 'Cliente aprovou roteiro e timeline propostos',
      },
    })

    await prisma.communication.create({
      data: {
        clientId: corporateClient.id,
        type: 'phone',
        subject: 'Feedback sobre primeira versão',
        content: 'Cliente ligou com sugestões de ajustes',
        status: 'received',
        sentAt: getDateOffset(-3),
        notes: 'Solicitou mudança na música de fundo e ajustes de cor',
      },
    })

    console.log('✅ Criadas notas e comunicações de clientes')

    // ========================================
    // CRIAR COMENTÁRIOS EM SUBTASKS
    // ========================================
    console.log('💭 Criando comentários em subtasks...')
    
    await prisma.subtaskComment.create({
      data: {
        subtaskId: subtask1_1.id,
        content: 'Roteiro aprovado pelo cliente. Excelente trabalho!',
        createdBy: admin.id,
        createdAt: getDateOffset(-4),
      },
    })

    await prisma.subtaskComment.create({
      data: {
        subtaskId: subtask1_1.id,
        content: 'Storyboard também ficou muito bom. Cliente adorou a proposta visual.',
        createdBy: filmmaker1.id,
        createdAt: getDateOffset(-3),
      },
    })

    console.log('✅ Criados comentários em subtasks')

    console.log('✨ Seed completado com dados completos e realistas!')
  } else {
    console.log('✨ Seed completado - Sistema limpo!')
  }
}

main()
  .catch((e) => {
    console.error('❌ Erro ao fazer seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
