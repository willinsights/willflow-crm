import { PrismaClient } from '@prisma/client'
// Note: Using relative import as seed.ts is in prisma/ directory, not src/
// The @/ alias only works within the src/ directory
import { hashPassword } from '../src/lib/auth-utils'

const prisma = new PrismaClient()

// Helper function to get date offsets
// JavaScript's Date.setDate() automatically handles month/year rollovers
function getDateOffset(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  const shouldCleanDatabase = process.env.SEED_CLEAN_DATABASE === 'true'
  
  if (shouldCleanDatabase) {
    // Limpar banco de dados em ordem correta devido às relações
    console.log('🧹 Limpando banco de dados...')
    await prisma.kanbanColumn.deleteMany()
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
    console.log('✅ Banco de dados limpo')
  } else {
    console.log('ℹ️  Modo idempotente - Verificando dados existentes...')
  }

  // ========================================
  // BOOTSTRAP KANBAN COLUMNS
  // ========================================
  console.log('📋 Verificando colunas do Kanban...')
  
  const organizationId = 'default'
  
  // Check if Kanban columns already exist
  const existingColumns = await prisma.kanbanColumn.findMany({
    where: { organizationId }
  })
  
  if (existingColumns.length === 0) {
    console.log('📋 Criando colunas padrão do Kanban...')
    
    // Colunas para Captação
    const captacaoColumns = [
      { title: 'A agendar', statusKey: 'a-agendar', position: 0, isLocked: false, systemKey: null },
      { title: 'Agendado', statusKey: 'agendado', position: 1, isLocked: false, systemKey: null },
      { title: 'Em execução', statusKey: 'em-execucao', position: 2, isLocked: false, systemKey: null },
      { title: 'Entregue', statusKey: 'entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
    ]
    
    for (const col of captacaoColumns) {
      await prisma.kanbanColumn.create({
        data: {
          organizationId,
          phase: 'CAPTACAO',
          title: col.title,
          statusKey: col.statusKey,
          position: col.position,
          isLocked: col.isLocked,
          systemKey: col.systemKey,
          isActive: true,
        },
      })
    }
    
    // Colunas para Edição
    const edicaoColumns = [
      { title: 'A iniciar', statusKey: 'a-iniciar', position: 0, isLocked: false, systemKey: null },
      { title: 'Em edição', statusKey: 'em-edicao', position: 1, isLocked: false, systemKey: null },
      { title: 'Em revisão', statusKey: 'em-revisao', position: 2, isLocked: false, systemKey: null },
      { title: 'Entregue', statusKey: 'entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
    ]
    
    for (const col of edicaoColumns) {
      await prisma.kanbanColumn.create({
        data: {
          organizationId,
          phase: 'EDICAO',
          title: col.title,
          statusKey: col.statusKey,
          position: col.position,
          isLocked: col.isLocked,
          systemKey: col.systemKey,
          isActive: true,
        },
      })
    }
    
    console.log('✅ Criadas colunas do Kanban (Captação: 4, Edição: 4)')
  } else {
    console.log(`✅ Colunas do Kanban já existem (${existingColumns.length} encontradas)`)
  }

  // Criar usuário administrador
  const adminPassword = 'admin123';
  
  // Check if admin already exists
  let admin = await prisma.user.findUnique({
    where: { email: 'admin@in-sights.pt' }
  })
  
  if (!admin) {
    console.log('👤 Criando usuário administrador...')
    admin = await prisma.user.create({
      data: {
        // Using a predictable ID for seed data
        id: 'seed-admin-1',
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
    })
    console.log('✅ Criado 1 usuário administrador')
    console.log(`   Email: admin@in-sights.pt`)
    console.log(`   Senha: ${adminPassword}`)
  } else {
    console.log('✅ Usuário administrador já existe')
  }

  const shouldPopulate = process.env.SEED_WITH_SAMPLE_DATA === 'true'

  if (shouldPopulate) {
    console.log('📦 Verificando dados de exemplo...')
    
    // Check if sample data already exists
    const existingSampleProjects = await prisma.project.count()
    
    if (existingSampleProjects > 0 && !shouldCleanDatabase) {
      console.log(`✅ Dados de exemplo já existem (${existingSampleProjects} projetos encontrados)`)
      console.log('   Use SEED_CLEAN_DATABASE=true para limpar e recriar os dados')
    } else {
      console.log('📦 Populando banco com dados completos de exemplo...')

      // ========================================
      // CRIAR USUÁRIOS DIVERSOS
      // ========================================
      console.log('👥 Criando usuários...')
    
    const filmmaker1Password = 'filmmaker123';
    const filmmaker1 = await prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao.silva@exemplo.com',
        password: hashPassword(filmmaker1Password),
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
    })

    const photographer1Password = 'photographer123';
    const photographer1 = await prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria.santos@exemplo.com',
        password: hashPassword(photographer1Password),
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
    })

    const bothCreatorPassword = 'creator123';
    const bothCreator = await prisma.user.create({
      data: {
        name: 'Pedro Costa',
        email: 'pedro.costa@exemplo.com',
        password: hashPassword(bothCreatorPassword),
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
    })

    const editor1Password = 'editor123';
    const editor1 = await prisma.user.create({
      data: {
        name: 'Ana Ferreira',
        email: 'ana.ferreira@exemplo.com',
        password: hashPassword(editor1Password),
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
    })

    const editor2Password = 'editor456';
    const editor2 = await prisma.user.create({
      data: {
        name: 'Carlos Mendes',
        email: 'carlos.mendes@exemplo.com',
        password: hashPassword(editor2Password),
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
    })

    const viewerPassword = 'viewer123';
    const viewer = await prisma.user.create({
      data: {
        name: 'Sofia Oliveira',
        email: 'sofia.oliveira@exemplo.com',
        password: hashPassword(viewerPassword),
        role: 'viewer',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: true,
        isActive: true,
        mustChangePassword: true,
      },
    })

    // Adicionar mais usuários para expandir o sistema
    const filmmaker2 = await prisma.user.create({
      data: {
        name: 'Ricardo Almeida',
        email: 'ricardo.almeida@exemplo.com',
        password: hashPassword('filmmaker456'),
        role: 'freelancer_captacao',
        collaboratorType: 'filmmaker',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890159',
        bankName: 'CGD',
        nif: '234567890',
        contributorType: 'freelancer',
      },
    })

    const photographer2 = await prisma.user.create({
      data: {
        name: 'Luísa Rodrigues',
        email: 'luisa.rodrigues@exemplo.com',
        password: hashPassword('photographer456'),
        role: 'freelancer_captacao',
        collaboratorType: 'photographer',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890160',
        bankName: 'Millennium BCP',
        nif: '345678901',
        contributorType: 'receipts',
      },
    })

    const editor3 = await prisma.user.create({
      data: {
        name: 'Bruno Martins',
        email: 'bruno.martins@exemplo.com',
        password: hashPassword('editor789'),
        role: 'editor_edicao',
        canViewFinance: false,
        canEditProjects: true,
        canViewAllProjects: false,
        isActive: true,
        mustChangePassword: true,
        iban: 'PT50000201231234567890161',
        bankName: 'Santander',
        nif: '456789012',
        contributorType: 'company',
      },
    })

    const inactiveUser = await prisma.user.create({
      data: {
        name: 'Teresa Cardoso (Inativa)',
        email: 'teresa.cardoso@exemplo.com',
        password: hashPassword('inactive123'),
        role: 'freelancer_captacao',
        collaboratorType: 'photographer',
        canViewFinance: false,
        canEditProjects: false,
        canViewAllProjects: false,
        isActive: false, // Usuário inativo
        mustChangePassword: true,
        iban: 'PT50000201231234567890162',
        bankName: 'BPI',
        nif: '567890123',
        contributorType: 'freelancer',
      },
    })

    const admin2 = await prisma.user.create({
      data: {
        name: 'Miguel Santos',
        email: 'miguel.santos@in-sights.pt',
        password: hashPassword('admin456'),
        role: 'admin',
        canViewFinance: true,
        canEditProjects: true,
        canViewAllProjects: true,
        isActive: true,
        mustChangePassword: false,
        lastLogin: getDateOffset(-2),
      },
    })

    console.log('✅ Criados 12 usuários com diferentes perfis')
    console.log('   João Silva (filmmaker): filmmaker123')
    console.log('   Maria Santos (photographer): photographer123')
    console.log('   Pedro Costa (both): creator123')
    console.log('   Ana Ferreira (editor): editor123')
    console.log('   Carlos Mendes (editor): editor456')
    console.log('   Sofia Oliveira (viewer): viewer123')
    console.log('   Ricardo Almeida (filmmaker): filmmaker456')
    console.log('   Luísa Rodrigues (photographer): photographer456')
    console.log('   Bruno Martins (editor): editor789')
    console.log('   Teresa Cardoso (INATIVO): inactive123')
    console.log('   Miguel Santos (admin): admin456')

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
    })

    const realEstateClient = await prisma.client.create({
      data: {
        name: 'Imobiliária Prime Properties',
        email: 'geral@primeproperties.pt',
        phone: '+351 918 901 234',
        company: 'Prime Properties SA',
        totalRevenue: 18000,
        totalCosts: 8000,
        totalMargin: 10000,
        projectCount: 4,
      },
    })

    const fitnessClient = await prisma.client.create({
      data: {
        name: 'FitZone Academia',
        email: 'marketing@fitzone.pt',
        phone: '+351 919 012 345',
        company: 'FitZone Lda',
        totalRevenue: 7500,
        totalCosts: 3500,
        totalMargin: 4000,
        projectCount: 2,
      },
    })

    const touristicClient = await prisma.client.create({
      data: {
        name: 'Viagens Portugal Tours',
        email: 'comercial@viagensportugal.pt',
        phone: '+351 920 123 456',
        company: 'Viagens Portugal SA',
        totalRevenue: 22000,
        totalCosts: 10000,
        totalMargin: 12000,
        projectCount: 5,
      },
    })

    const educationClient = await prisma.client.create({
      data: {
        name: 'Academia Digital Cursos',
        email: 'info@academiadigital.pt',
        phone: '+351 921 234 567',
        company: 'Academia Digital Lda',
        totalRevenue: 11000,
        totalCosts: 5000,
        totalMargin: 6000,
        projectCount: 3,
      },
    })

    // Adicionar mais clientes para expandir o sistema
    const hotelClient = await prisma.client.create({
      data: {
        name: 'Hotel Estrela do Mar',
        email: 'marketing@hotelestrelmar.pt',
        phone: '+351 922 345 678',
        company: 'Estrela do Mar Hotéis SA',
        totalRevenue: 32000,
        totalCosts: 14000,
        totalMargin: 18000,
        projectCount: 6,
      },
    })

    const eventClient = await prisma.client.create({
      data: {
        name: 'EventPro Organizadores',
        email: 'geral@eventpro.pt',
        phone: '+351 923 456 789',
        company: 'EventPro Lda',
        totalRevenue: 19000,
        totalCosts: 8500,
        totalMargin: 10500,
        projectCount: 4,
      },
    })

    const constructionClient = await prisma.client.create({
      data: {
        name: 'Construções Silva & Filhos',
        email: 'comercial@silvafilhos.pt',
        phone: '+351 924 567 890',
        company: 'Silva & Filhos SA',
        totalRevenue: 13500,
        totalCosts: 6000,
        totalMargin: 7500,
        projectCount: 3,
      },
    })

    const newClient = await prisma.client.create({
      data: {
        name: 'Startup InnovaTech',
        email: 'hello@innovatech.pt',
        phone: '+351 925 678 901',
        company: 'InnovaTech Portugal Lda',
        totalRevenue: 0, // Cliente novo sem projetos ainda
        totalCosts: 0,
        totalMargin: 0,
        projectCount: 0,
      },
    })

    const inactiveClient = await prisma.client.create({
      data: {
        name: 'Antiga Parceria Comércio',
        email: 'antigo@parceria.pt',
        phone: '+351 926 789 012',
        company: 'Parceria Comércio Lda',
        totalRevenue: 5000, // Cliente inativo com histórico
        totalCosts: 2500,
        totalMargin: 2500,
        projectCount: 1,
      },
    })

    const retailClient = await prisma.client.create({
      data: {
        name: 'Supermercado Central',
        email: 'marketing@supercentral.pt',
        phone: '+351 927 890 123',
        company: 'Supermercado Central SA',
        totalRevenue: 16000,
        totalCosts: 7000,
        totalMargin: 9000,
        projectCount: 4,
      },
    })

    console.log('✅ Criados 16 clientes com perfis variados (incluindo premium, regulares, novos e inativos)')

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

    // Adicionar mais categorias
    const catHotel = await prisma.category.create({
      data: {
        name: 'Hotel',
        description: 'Vídeos promocionais para hotéis e resorts',
        color: '#06B6D4',
      },
    })

    const catExperiencia = await prisma.category.create({
      data: {
        name: 'Experiência',
        description: 'Vídeos de experiências turísticas e atividades',
        color: '#F97316',
      },
    })

    const catDrone = await prisma.category.create({
      data: {
        name: 'Drone',
        description: 'Filmagens aéreas com drone',
        color: '#6366F1',
      },
    })

    const catReels = await prisma.category.create({
      data: {
        name: 'Reels',
        description: 'Vídeos curtos para redes sociais',
        color: '#EC4899',
      },
    })

    const catWedding = await prisma.category.create({
      data: {
        name: 'Casamento',
        description: 'Cobertura de casamentos e eventos especiais',
        color: '#DB2777',
      },
    })

    const catRealEstate = await prisma.category.create({
      data: {
        name: 'Imobiliário',
        description: 'Tours virtuais e apresentações de imóveis',
        color: '#0891B2',
      },
    })

    console.log('✅ Criadas 12 categorias com descrições e cores variadas')

    // ========================================
    // CRIAR PROJETOS COM DIFERENTES STATUS
    // ========================================
    console.log('🎬 Criando projetos...')
    
    // Projeto 1: A agendar - CAPTACAO
    const project1 = await prisma.project.create({
      data: {
        title: 'Campanha Ano Novo 2026',
        description: 'Campanha de vídeo marketing para lançamento de novos produtos no início do ano',
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
    })

    // Projeto 2: Agendado - CAPTACAO
    const project2 = await prisma.project.create({
      data: {
        title: 'Documentário História de Lisboa',
        description: 'Documentário sobre a evolução histórica da cidade de Lisboa nos últimos 100 anos',
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
    })

    // Projeto 3: Em execução - CAPTACAO
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
        clientDueDate: getDateOffset(-5),
        freelancerDueDate: getDateOffset(-10),
        freelancerPaidDate: getDateOffset(-8),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2025/comercial-restaurante',
      },
    })

    // Projeto 4: Entregue - CAPTACAO (sem edição necessária)
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
    })

    // Projeto 5: Entregue - CAPTACAO (vai para edição)
    const project5 = await prisma.project.create({
      data: {
        title: 'Série Redes Sociais GreenEnergy',
        description: 'Série de 10 vídeos curtos para Instagram e TikTok sobre energia sustentável',
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
    })

    // Projeto 6: A iniciar - EDICAO
    const project6 = await prisma.project.create({
      data: {
        title: 'Conferência Tech Summit 2026',
        description: 'Cobertura completa do evento de tecnologia com entrevistas e highlights',
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
        captacaoDate: getDateOffset(20),
        clientDueDate: getDateOffset(35),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    // Projeto 7: Em edição - EDICAO
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
    })

    // Projeto 8: Em revisão - EDICAO
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
        captacaoDate: getDateOffset(3),
        clientDueDate: getDateOffset(12),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    // Projeto 9: Entregue - EDICAO
    const project9 = await prisma.project.create({
      data: {
        title: 'Tutorial Produto Startup',
        description: 'Série de tutoriais explicando o uso do produto da startup',
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
    })

    // Projeto 10: A iniciar - EDICAO
    const project10 = await prisma.project.create({
      data: {
        title: 'Campanha Redes Sociais Clínica',
        description: 'Conteúdo mensal para Instagram e Facebook da clínica',
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
    })

    // ========================================
    // ADICIONAR MAIS PROJETOS PARA COBERTURA COMPLETA DO KANBAN
    // ========================================
    
    // CAPTACAO - A agendar
    await prisma.project.create({
      data: {
        title: 'Tour Virtual Apartamentos Prime',
        description: 'Tour virtual 360° para novos empreendimentos imobiliários',
        phase: 'captacao',
        statusCaptacao: 'a-agendar',
        statusEdicao: null,
        clientId: realEstateClient.id,
        categoryId: catCorporate.id,
        videoType: 'corporativo',
        location: 'Lisboa, Novos Empreendimentos',
        customId: 'PROJ-2026-011',
        clientPrice: 7000,
        captationCost: 2200,
        editionCost: 1800,
        margin: 3000,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(8),
        clientDueDate: getDateOffset(25),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor1.id,
      },
    })

    await prisma.project.create({
      data: {
        title: 'Campanha Fitness 2026',
        description: 'Vídeos promocionais para nova temporada de treinos',
        phase: 'captacao',
        statusCaptacao: 'a-agendar',
        statusEdicao: null,
        clientId: fitnessClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'FitZone Academia',
        customId: 'PROJ-2026-012',
        clientPrice: 3500,
        captationCost: 1000,
        editionCost: 800,
        margin: 1700,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(12),
        clientDueDate: getDateOffset(22),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    // CAPTACAO - Agendado
    await prisma.project.create({
      data: {
        title: 'Destinos Portugal 2026',
        description: 'Série de vídeos promocionais sobre destinos turísticos portugueses',
        phase: 'captacao',
        statusCaptacao: 'agendado',
        statusEdicao: null,
        clientId: touristicClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Algarve, Porto, Madeira',
        customId: 'PROJ-2026-013',
        clientPrice: 15000,
        captationCost: 5000,
        editionCost: 3500,
        margin: 6500,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(18),
        clientDueDate: getDateOffset(45),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor1.id,
      },
    })

    await prisma.project.create({
      data: {
        title: 'Webinar Academia Digital',
        description: 'Gravação e edição de webinar sobre marketing digital',
        phase: 'captacao',
        statusCaptacao: 'agendado',
        statusEdicao: null,
        clientId: educationClient.id,
        categoryId: catEvent.id,
        videoType: 'evento',
        location: 'Online/Remoto',
        customId: 'PROJ-2026-014',
        clientPrice: 2500,
        captationCost: 600,
        editionCost: 700,
        margin: 1200,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'not_applicable',
        captacaoDate: getDateOffset(10),
        clientDueDate: getDateOffset(17),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    await prisma.project.create({
      data: {
        title: 'Lançamento Nova Coleção Fashion',
        description: 'Fashion film para lançamento da coleção primavera/verão',
        phase: 'captacao',
        statusCaptacao: 'agendado',
        statusEdicao: null,
        clientId: fashionClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Lisboa, Estúdio de Moda',
        customId: 'PROJ-2026-015',
        clientPrice: 5500,
        captationCost: 1800,
        editionCost: 1200,
        margin: 2500,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(14),
        clientDueDate: getDateOffset(28),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor1.id,
      },
    })

    // CAPTACAO - Em execução
    await prisma.project.create({
      data: {
        title: 'Imóveis Destaque Prime',
        description: 'Vídeos de apresentação de imóveis de luxo',
        phase: 'captacao',
        statusCaptacao: 'em-execucao',
        statusEdicao: null,
        clientId: realEstateClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Cascais, Sintra',
        customId: 'PROJ-2026-016',
        clientPrice: 8500,
        captationCost: 2800,
        editionCost: 2000,
        margin: 3700,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(-2),
        clientDueDate: getDateOffset(18),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    await prisma.project.create({
      data: {
        title: 'Testemunhos Alunos FitZone',
        description: 'Série de vídeos com testemunhos de alunos satisfeitos',
        phase: 'captacao',
        statusCaptacao: 'em-execucao',
        statusEdicao: null,
        clientId: fitnessClient.id,
        categoryId: catSocial.id,
        videoType: 'reels',
        location: 'FitZone Academia',
        customId: 'PROJ-2026-017',
        clientPrice: 2200,
        captationCost: 700,
        editionCost: 500,
        margin: 1000,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(-1),
        clientDueDate: getDateOffset(7),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor1.id,
      },
    })

    await prisma.project.create({
      data: {
        title: 'Experiências Autênticas Portugal',
        description: 'Documentário sobre experiências turísticas genuínas',
        phase: 'captacao',
        statusCaptacao: 'em-execucao',
        statusEdicao: null,
        clientId: touristicClient.id,
        categoryId: catDocumentary.id,
        videoType: 'documentario',
        location: 'Norte de Portugal',
        customId: 'PROJ-2026-018',
        clientPrice: 12000,
        captationCost: 4000,
        editionCost: 3000,
        margin: 5000,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        captacaoDate: getDateOffset(0),
        clientDueDate: getDateOffset(30),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    // CAPTACAO - Entregue (irão para edição)
    await prisma.project.create({
      data: {
        title: 'Aulas Online Academia Digital',
        description: 'Gravação de conteúdo educativo para plataforma online',
        phase: 'captacao',
        statusCaptacao: 'entregue',
        statusEdicao: null,
        clientId: educationClient.id,
        categoryId: catCorporate.id,
        videoType: 'corporativo',
        location: 'Estúdio Academia Digital',
        customId: 'PROJ-2026-019',
        clientPrice: 6000,
        captationCost: 1500,
        editionCost: 1500,
        margin: 3000,
        paymentStatus: 'paid',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-8),
        clientDueDate: getDateOffset(12),
        freelancerDueDate: getDateOffset(-3),
        freelancerPaidDate: getDateOffset(-1),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor1.id,
      },
    })

    await prisma.project.create({
      data: {
        title: 'Editorial Fashion Boutique',
        description: 'Editorial de moda para revista e redes sociais',
        phase: 'captacao',
        statusCaptacao: 'entregue',
        statusEdicao: null,
        clientId: fashionClient.id,
        categoryId: catSocial.id,
        videoType: 'reels',
        location: 'Porto Fashion District',
        customId: 'PROJ-2026-020',
        clientPrice: 4000,
        captationCost: 1200,
        editionCost: 1000,
        margin: 1800,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-12),
        clientDueDate: getDateOffset(8),
        freelancerDueDate: getDateOffset(-7),
        freelancerPaidDate: getDateOffset(-5),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    // EDICAO - A iniciar
    await prisma.project.create({
      data: {
        title: 'Showcase Propriedades Luxo',
        description: 'Montagem de vídeo showcase para portfólio de imóveis de luxo',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'a-iniciar',
        clientId: realEstateClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Lisboa, Cascais',
        customId: 'PROJ-2026-021',
        clientPrice: 5500,
        captationCost: 1800,
        editionCost: 1500,
        margin: 2200,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-5),
        clientDueDate: getDateOffset(20),
        freelancerDueDate: getDateOffset(-2),
        freelancerPaidDate: getDateOffset(0),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2026/showcase-prime',
      },
    })

    await prisma.project.create({
      data: {
        title: 'Rotinas Treino FitZone',
        description: 'Vídeos de rotinas de treino para YouTube',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'a-iniciar',
        clientId: fitnessClient.id,
        categoryId: catSocial.id,
        videoType: 'reels',
        location: 'FitZone Academia',
        customId: 'PROJ-2026-022',
        clientPrice: 3200,
        captationCost: 900,
        editionCost: 1000,
        margin: 1300,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-3),
        clientDueDate: getDateOffset(14),
        freelancerDueDate: getDateOffset(-1),
        freelancerPaidDate: getDateOffset(1),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor2.id,
      },
    })

    // EDICAO - Em edição
    await prisma.project.create({
      data: {
        title: 'Guias Turísticos Viagens Portugal',
        description: 'Série de guias em vídeo para destinos portugueses',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-edicao',
        clientId: touristicClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Vários destinos',
        customId: 'PROJ-2026-023',
        clientPrice: 9000,
        captationCost: 3000,
        editionCost: 2500,
        margin: 3500,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-15),
        clientDueDate: getDateOffset(10),
        freelancerDueDate: getDateOffset(-10),
        freelancerPaidDate: getDateOffset(-8),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2026/guias-viagens',
        frameIoLink: 'https://frameio.example.com/guias-viagens',
      },
    })

    await prisma.project.create({
      data: {
        title: 'Tutorial Cursos Online',
        description: 'Edição de módulos de curso online completo',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-edicao',
        clientId: educationClient.id,
        categoryId: catCorporate.id,
        videoType: 'corporativo',
        location: 'Estúdio',
        customId: 'PROJ-2026-024',
        clientPrice: 7500,
        captationCost: 2000,
        editionCost: 2000,
        margin: 3500,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-10),
        clientDueDate: getDateOffset(15),
        freelancerDueDate: getDateOffset(-5),
        freelancerPaidDate: getDateOffset(-3),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor2.id,
        nasLink: 'nas://projetos/2026/tutorial-academia',
      },
    })

    await prisma.project.create({
      data: {
        title: 'Lookbook Digital Moda Lisboa',
        description: 'Lookbook digital para coleção de inverno',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-edicao',
        clientId: fashionClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'Lisboa',
        customId: 'PROJ-2026-025',
        clientPrice: 4200,
        captationCost: 1300,
        editionCost: 1100,
        margin: 1800,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-7),
        clientDueDate: getDateOffset(8),
        freelancerDueDate: getDateOffset(-4),
        freelancerPaidDate: getDateOffset(-2),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor1.id,
      },
    })

    // EDICAO - Em revisão
    await prisma.project.create({
      data: {
        title: 'Apresentação Corporativa Prime',
        description: 'Vídeo de apresentação corporativa para investidores',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-revisao',
        clientId: realEstateClient.id,
        categoryId: catCorporate.id,
        videoType: 'corporativo',
        location: 'Escritórios Prime',
        customId: 'PROJ-2026-026',
        clientPrice: 6500,
        captationCost: 2000,
        editionCost: 1800,
        margin: 2700,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-20),
        clientDueDate: getDateOffset(5),
        freelancerDueDate: getDateOffset(-15),
        freelancerPaidDate: getDateOffset(-13),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor2.id,
        frameIoLink: 'https://frameio.example.com/prime-corporate',
      },
    })

    await prisma.project.create({
      data: {
        title: 'Transformações FitZone',
        description: 'Vídeo com histórias de transformação de alunos',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-revisao',
        clientId: fitnessClient.id,
        categoryId: catMarketing.id,
        videoType: 'marketing',
        location: 'FitZone Academia',
        customId: 'PROJ-2026-027',
        clientPrice: 3800,
        captationCost: 1100,
        editionCost: 1000,
        margin: 1700,
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-18),
        clientDueDate: getDateOffset(6),
        freelancerDueDate: getDateOffset(-12),
        freelancerPaidDate: getDateOffset(-10),
        responsavelCaptacaoId: bothCreator.id,
        responsavelEdicaoId: editor1.id,
        frameIoLink: 'https://frameio.example.com/transformacoes-fitzone',
      },
    })

    await prisma.project.create({
      data: {
        title: 'Pacotes Turísticos 2026',
        description: 'Vídeo promocional de novos pacotes turísticos',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'em-revisao',
        clientId: touristicClient.id,
        categoryId: catAdvertising.id,
        videoType: 'publicidade',
        location: 'Vários destinos',
        customId: 'PROJ-2026-028',
        clientPrice: 8000,
        captationCost: 2500,
        editionCost: 2000,
        margin: 3500,
        paymentStatus: 'partial',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-14),
        clientDueDate: getDateOffset(7),
        freelancerDueDate: getDateOffset(-9),
        freelancerPaidDate: getDateOffset(-7),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
        frameIoLink: 'https://frameio.example.com/pacotes-2026',
      },
    })

    // EDICAO - Entregue (concluído)
    await prisma.project.create({
      data: {
        title: 'Curso Completo Marketing Digital',
        description: 'Série completa de vídeo-aulas sobre marketing digital',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'entregue',
        clientId: educationClient.id,
        categoryId: catCorporate.id,
        videoType: 'corporativo',
        location: 'Estúdio',
        customId: 'PROJ-2026-029',
        clientPrice: 10000,
        captationCost: 2500,
        editionCost: 2500,
        margin: 5000,
        paymentStatus: 'paid',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-30),
        clientDueDate: getDateOffset(-5),
        clientReceivedDate: getDateOffset(-3),
        freelancerDueDate: getDateOffset(-20),
        freelancerPaidDate: getDateOffset(-18),
        responsavelCaptacaoId: filmmaker1.id,
        responsavelEdicaoId: editor1.id,
        nasLink: 'nas://projetos/2026/curso-marketing',
        frameIoLink: 'https://frameio.example.com/curso-marketing',
      },
    })

    await prisma.project.create({
      data: {
        title: 'Campanha Inverno Moda Lisboa',
        description: 'Campanha completa de moda para inverno',
        phase: 'edicao',
        statusCaptacao: 'entregue',
        statusEdicao: 'entregue',
        clientId: fashionClient.id,
        categoryId: catAdvertising.id,
        videoType: 'publicidade',
        location: 'Lisboa',
        customId: 'PROJ-2026-030',
        clientPrice: 6200,
        captationCost: 2000,
        editionCost: 1500,
        margin: 2700,
        paymentStatus: 'paid',
        freelancerPaymentStatus: 'paid',
        captacaoDate: getDateOffset(-25),
        clientDueDate: getDateOffset(-7),
        clientReceivedDate: getDateOffset(-5),
        freelancerDueDate: getDateOffset(-18),
        freelancerPaidDate: getDateOffset(-16),
        responsavelCaptacaoId: photographer1.id,
        responsavelEdicaoId: editor2.id,
        nasLink: 'nas://projetos/2026/inverno-moda',
        frameIoLink: 'https://frameio.example.com/inverno-moda',
      },
    })

    console.log('✅ Criados 30 projetos distribuídos em todas as colunas do Kanban')
    console.log('   - CAPTACAO (a-agendar): 3 projetos')
    console.log('   - CAPTACAO (agendado): 5 projetos')
    console.log('   - CAPTACAO (em-execucao): 6 projetos')
    console.log('   - CAPTACAO (entregue): 4 projetos')
    console.log('   - EDICAO (a-iniciar): 4 projetos')
    console.log('   - EDICAO (em-edicao): 5 projetos')
    console.log('   - EDICAO (em-revisao): 5 projetos')
    console.log('   - EDICAO (entregue): 4 projetos')

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

    // Mais subtasks para projeto 2
    await prisma.subtask.create({
      data: {
        projectId: project2.id,
        title: 'Pesquisa histórica',
        description: 'Levantar dados históricos e preparar linha temporal',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-8),
        estimatedHours: 12,
        actualHours: 14,
        assignedTo: bothCreator.id,
        dueDate: getDateOffset(-5),
        order: 0,
        tags: '["pesquisa", "documentário", "histórico"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project2.id,
        title: 'Agendar entrevistas',
        description: 'Contactar e agendar entrevistas com historiadores',
        status: 'in_progress',
        priority: 'urgent',
        completed: false,
        estimatedHours: 6,
        assignedTo: admin.id,
        dueDate: getDateOffset(3),
        order: 1,
        tags: '["logística", "entrevistas"]',
      },
    })

    // Subtasks para projeto 6
    await prisma.subtask.create({
      data: {
        projectId: project6.id,
        title: 'Organizar material bruto',
        description: 'Importar e organizar todo material capturado do evento',
        status: 'in_progress',
        priority: 'high',
        completed: false,
        estimatedHours: 8,
        actualHours: 5,
        assignedTo: editor2.id,
        dueDate: getDateOffset(2),
        order: 0,
        tags: '["organização", "material bruto"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project6.id,
        title: 'Selecionar melhores momentos',
        description: 'Revisar todo material e marcar highlights',
        status: 'todo',
        priority: 'medium',
        completed: false,
        estimatedHours: 10,
        assignedTo: editor2.id,
        dueDate: getDateOffset(5),
        order: 1,
        tags: '["seleção", "highlights"]',
      },
    })

    // Subtasks para projeto 7
    await prisma.subtask.create({
      data: {
        projectId: project7.id,
        title: 'Montagem inicial',
        description: 'Primeira montagem seguindo o roteiro aprovado',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-4),
        estimatedHours: 15,
        actualHours: 18,
        assignedTo: editor1.id,
        dueDate: getDateOffset(-3),
        order: 0,
        tags: '["montagem", "edição"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project7.id,
        title: 'Correção de cor',
        description: 'Color grading e harmonização de todas as cenas',
        status: 'in_progress',
        priority: 'high',
        completed: false,
        estimatedHours: 8,
        actualHours: 4,
        assignedTo: editor1.id,
        dueDate: getDateOffset(4),
        order: 1,
        tags: '["color grading", "pós-produção"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project7.id,
        title: 'Mixagem de áudio',
        description: 'Ajustar níveis de áudio e adicionar música',
        status: 'todo',
        priority: 'medium',
        completed: false,
        estimatedHours: 6,
        assignedTo: editor1.id,
        dueDate: getDateOffset(6),
        order: 2,
        tags: '["áudio", "mixagem"]',
      },
    })

    // Subtasks para projeto 8
    await prisma.subtask.create({
      data: {
        projectId: project8.id,
        title: 'Feedback do cliente',
        description: 'Aguardar e processar feedback da primeira versão',
        status: 'review',
        priority: 'urgent',
        completed: false,
        estimatedHours: 2,
        assignedTo: editor2.id,
        dueDate: getDateOffset(1),
        order: 0,
        tags: '["revisão", "feedback"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project8.id,
        title: 'Ajustes finais',
        description: 'Implementar alterações solicitadas pelo cliente',
        status: 'todo',
        priority: 'high',
        completed: false,
        estimatedHours: 4,
        assignedTo: editor2.id,
        dueDate: getDateOffset(3),
        order: 1,
        tags: '["ajustes", "finalização"]',
      },
    })

    // Subtasks para projeto 9 (concluído)
    await prisma.subtask.create({
      data: {
        projectId: project9.id,
        title: 'Roteiro e planejamento',
        description: 'Criar roteiros para todos os tutoriais',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-25),
        estimatedHours: 12,
        actualHours: 10,
        assignedTo: bothCreator.id,
        dueDate: getDateOffset(-24),
        order: 0,
        tags: '["roteiro", "planejamento"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project9.id,
        title: 'Gravação de screencasts',
        description: 'Gravar demonstrações do produto',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-18),
        estimatedHours: 8,
        actualHours: 9,
        assignedTo: bothCreator.id,
        dueDate: getDateOffset(-17),
        order: 1,
        tags: '["gravação", "screencast"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project9.id,
        title: 'Edição completa',
        description: 'Editar todos os vídeos com legendas e gráficos',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-8),
        estimatedHours: 20,
        actualHours: 22,
        assignedTo: editor2.id,
        dueDate: getDateOffset(-7),
        order: 2,
        tags: '["edição", "legendas", "gráficos"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project9.id,
        title: 'Revisão final e entrega',
        description: 'Revisão completa e preparação para entrega',
        status: 'done',
        priority: 'medium',
        completed: true,
        completedAt: getDateOffset(-4),
        estimatedHours: 4,
        actualHours: 3,
        assignedTo: editor2.id,
        dueDate: getDateOffset(-3),
        order: 3,
        tags: '["revisão", "entrega"]',
      },
    })

    // Subtasks para projeto 10
    await prisma.subtask.create({
      data: {
        projectId: project10.id,
        title: 'Briefing com cliente',
        description: 'Reunião para entender necessidades e objetivos',
        status: 'done',
        priority: 'high',
        completed: true,
        completedAt: getDateOffset(-7),
        estimatedHours: 2,
        actualHours: 2,
        assignedTo: admin.id,
        dueDate: getDateOffset(-6),
        order: 0,
        tags: '["briefing", "planejamento"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project10.id,
        title: 'Captar conteúdo',
        description: 'Gravar material para posts do mês',
        status: 'todo',
        priority: 'urgent',
        completed: false,
        estimatedHours: 6,
        assignedTo: photographer1.id,
        dueDate: getDateOffset(2),
        order: 1,
        tags: '["captação", "social media"]',
      },
    })

    // Adicionar mais subtasks variadas com baixa prioridade
    await prisma.subtask.create({
      data: {
        projectId: project1.id,
        title: 'Backup de material',
        description: 'Fazer backup de segurança de todo material',
        status: 'todo',
        priority: 'low',
        completed: false,
        estimatedHours: 2,
        assignedTo: filmmaker1.id,
        dueDate: getDateOffset(20),
        order: 3,
        tags: '["backup", "segurança"]',
      },
    })

    await prisma.subtask.create({
      data: {
        projectId: project3.id,
        title: 'Exportar versões finais',
        description: 'Exportar em múltiplos formatos conforme especificado',
        status: 'todo',
        priority: 'medium',
        completed: false,
        estimatedHours: 3,
        assignedTo: editor1.id,
        dueDate: getDateOffset(5),
        order: 2,
        tags: '["export", "entrega"]',
      },
    })

    console.log('✅ Criadas 30+ subtasks distribuídas pelos projetos com todos os campos preenchidos')

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

    // Expandir notificações com mais variedade
    await prisma.notification.create({
      data: {
        userId: editor2.id,
        type: 'deadline',
        priority: 'urgent',
        title: 'Prazo urgente!',
        message: 'O projeto "Conferência Tech Summit 2026" vence amanhã',
        projectId: project6.id,
        actionUrl: `/projects/${project6.id}`,
        isRead: false,
        createdAt: getDateOffset(-1),
      },
    })

    await prisma.notification.create({
      data: {
        userId: bothCreator.id,
        type: 'comment',
        priority: 'medium',
        title: 'Mencionado em comentário',
        message: 'Você foi mencionado em um comentário do projeto "Série Redes Sociais GreenEnergy"',
        projectId: project5.id,
        actionUrl: `/projects/${project5.id}`,
        isRead: false,
        createdAt: getDateOffset(0),
      },
    })

    await prisma.notification.create({
      data: {
        userId: editor1.id,
        type: 'project',
        priority: 'high',
        title: 'Material disponível para edição',
        message: 'Material de captação do projeto "Campanha Ano Novo 2026" já está disponível no NAS',
        projectId: project1.id,
        actionUrl: `/projects/${project1.id}`,
        isRead: false,
        createdAt: getDateOffset(-1),
      },
    })

    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'payment',
        priority: 'medium',
        title: 'Pagamento recebido',
        message: 'Cliente GreenEnergy Startup efetuou pagamento de €6.000',
        projectId: project5.id,
        actionUrl: `/finance`,
        isRead: true,
        readAt: getDateOffset(-2),
        createdAt: getDateOffset(-3),
      },
    })

    await prisma.notification.create({
      data: {
        userId: filmmaker1.id,
        type: 'deadline',
        priority: 'high',
        title: 'Captação próxima',
        message: 'Lembrete: captação agendada para daqui a 2 dias',
        projectId: project2.id,
        actionUrl: `/projects/${project2.id}`,
        isRead: false,
        createdAt: getDateOffset(0),
      },
    })

    await prisma.notification.create({
      data: {
        userId: photographer1.id,
        type: 'project',
        priority: 'low',
        title: 'Novo projeto atribuído',
        message: 'Você foi designado para o projeto "Testemunhos Alunos FitZone"',
        actionUrl: `/projects`,
        isRead: true,
        readAt: getDateOffset(-5),
        createdAt: getDateOffset(-6),
      },
    })

    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'system',
        priority: 'low',
        title: 'Backup concluído',
        message: 'Backup automático do NAS concluído com sucesso',
        actionUrl: `/settings`,
        isRead: true,
        readAt: getDateOffset(-1),
        createdAt: getDateOffset(-1),
      },
    })

    await prisma.notification.create({
      data: {
        userId: editor2.id,
        type: 'comment',
        priority: 'medium',
        title: 'Cliente respondeu feedback',
        message: 'Cliente adicionou resposta ao seu comentário no projeto "Behind the Scenes"',
        projectId: project8.id,
        actionUrl: `/projects/${project8.id}`,
        isRead: false,
        createdAt: getDateOffset(-1),
      },
    })

    await prisma.notification.create({
      data: {
        userId: filmmaker2.id,
        type: 'project',
        priority: 'medium',
        title: 'Oportunidade de projeto',
        message: 'Novo projeto disponível: Tour Virtual Apartamentos Prime',
        actionUrl: `/projects`,
        isRead: false,
        createdAt: getDateOffset(-2),
      },
    })

    await prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'deadline',
        priority: 'high',
        title: 'Múltiplos prazos próximos',
        message: '5 projetos com entrega prevista para esta semana',
        actionUrl: `/dashboard`,
        isRead: false,
        createdAt: getDateOffset(0),
      },
    })

    console.log('✅ Criadas notificações variadas (todos os tipos e prioridades, lidas e não lidas)')

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

    // Expandir comunicações com mais tipos e status
    await prisma.clientNote.create({
      data: {
        clientId: corporateClient.id,
        content: 'Cliente corporativo de grande porte. Processos de aprovação lentos - incluir buffer no timeline.',
        createdBy: admin.id,
        createdAt: getDateOffset(-45),
      },
    })

    await prisma.clientNote.create({
      data: {
        clientId: startupClient.id,
        content: 'Startup em crescimento. Orçamento limitado mas projetos frequentes. Boa parceria de longo prazo.',
        createdBy: admin.id,
        createdAt: getDateOffset(-35),
      },
    })

    await prisma.clientNote.create({
      data: {
        clientId: fashionClient.id,
        content: 'Muito exigente com estética. Sempre solicita múltiplas revisões. Prever tempo extra.',
        createdBy: editor1.id,
        createdAt: getDateOffset(-15),
      },
    })

    await prisma.clientNote.create({
      data: {
        clientId: hotelClient.id,
        content: 'Excelente cliente! Pagamentos sempre adiantados. Trabalho recorrente garantido.',
        createdBy: admin.id,
        createdAt: getDateOffset(-50),
      },
    })

    // Comunicações variadas
    await prisma.communication.create({
      data: {
        clientId: regularClient1.id,
        type: 'email',
        subject: 'Envio de primeira versão',
        content: 'Primeira versão do comercial enviada para aprovação',
        status: 'sent',
        sentBy: editor1.id,
        sentAt: getDateOffset(-5),
      },
    })

    await prisma.communication.create({
      data: {
        clientId: regularClient2.id,
        type: 'meeting',
        subject: 'Reunião de Planejamento',
        content: 'Reunião para discutir próximos projetos do trimestre',
        status: 'completed',
        sentBy: admin.id,
        sentAt: getDateOffset(-10),
        notes: 'Cliente interessado em 3 projetos adicionais. Enviar propostas.',
      },
    })

    await prisma.communication.create({
      data: {
        clientId: startupClient.id,
        type: 'message',
        subject: 'Alteração no cronograma',
        content: 'Cliente solicitou adiantamento da data de entrega',
        status: 'received',
        sentAt: getDateOffset(-2),
        notes: 'Verificar viabilidade com a equipe',
      },
    })

    await prisma.communication.create({
      data: {
        clientId: fashionClient.id,
        type: 'phone',
        subject: 'Aprovação final',
        content: 'Cliente ligou para aprovar versão final',
        status: 'completed',
        sentAt: getDateOffset(-8),
        notes: 'Aprovado sem alterações. Proceder com entrega.',
      },
    })

    await prisma.communication.create({
      data: {
        clientId: touristicClient.id,
        type: 'email',
        subject: 'Proposta de Parceria Anual',
        content: 'Enviada proposta para pacote anual de vídeos',
        status: 'sent',
        sentBy: admin.id,
        sentAt: getDateOffset(-15),
      },
    })

    await prisma.communication.create({
      data: {
        clientId: hotelClient.id,
        type: 'meeting',
        subject: 'Visita às instalações',
        content: 'Reunião presencial no hotel para scout de locações',
        status: 'pending',
        sentBy: filmmaker1.id,
        sentAt: getDateOffset(5),
      },
    })

    await prisma.communication.create({
      data: {
        clientId: eventClient.id,
        type: 'phone',
        subject: 'Detalhes técnicos do evento',
        content: 'Discussão sobre requisitos técnicos e logística',
        status: 'completed',
        sentAt: getDateOffset(-7),
        notes: 'Necessário equipamento de som adicional. Confirmar com equipe.',
      },
    })

    await prisma.communication.create({
      data: {
        clientId: realEstateClient.id,
        type: 'email',
        subject: 'Agendamento de filmagem',
        content: 'Confirmar disponibilidade para filmagem dos imóveis',
        status: 'pending',
        sentBy: photographer1.id,
        sentAt: getDateOffset(3),
      },
    })

    console.log('✅ Criadas notas e comunicações expandidas de clientes (todos os tipos e status)')

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

    // ========================================
    // CRIAR CHECKLISTS DE SUBTASKS
    // ========================================
    console.log('☑️  Criando checklists de subtasks...')
    
    // Checklist para subtask1_1
    await prisma.subtaskChecklist.create({
      data: {
        subtaskId: subtask1_1.id,
        title: 'Criar sinopse inicial',
        completed: true,
        completedAt: getDateOffset(-6),
        completedBy: filmmaker1.id,
        order: 0,
      },
    })

    await prisma.subtaskChecklist.create({
      data: {
        subtaskId: subtask1_1.id,
        title: 'Desenvolver storyboard',
        completed: true,
        completedAt: getDateOffset(-5),
        completedBy: filmmaker1.id,
        order: 1,
      },
    })

    await prisma.subtaskChecklist.create({
      data: {
        subtaskId: subtask1_1.id,
        title: 'Aprovar com cliente',
        completed: true,
        completedAt: getDateOffset(-4),
        completedBy: admin.id,
        order: 2,
      },
    })

    console.log('✅ Criados itens de checklist para subtasks')

    // ========================================
    // CRIAR ATTACHMENTS DE SUBTASKS
    // ========================================
    console.log('📎 Criando anexos de subtasks...')
    
    await prisma.subtaskAttachment.create({
      data: {
        subtaskId: subtask1_1.id,
        fileName: 'roteiro-v1.pdf',
        fileSize: 245760,
        fileType: 'application/pdf',
        fileUrl: '/uploads/subtasks/roteiro-v1.pdf',
        uploadedBy: filmmaker1.id,
        uploadedAt: getDateOffset(-6),
      },
    })

    await prisma.subtaskAttachment.create({
      data: {
        subtaskId: subtask1_1.id,
        fileName: 'storyboard-sketches.jpg',
        fileSize: 1048576,
        fileType: 'image/jpeg',
        fileUrl: '/uploads/subtasks/storyboard-sketches.jpg',
        uploadedBy: filmmaker1.id,
        uploadedAt: getDateOffset(-5),
      },
    })

    console.log('✅ Criados anexos para subtasks')

    // ========================================
    // CRIAR ATIVIDADES DE SUBTASKS
    // ========================================
    console.log('📝 Criando log de atividades de subtasks...')
    
    await prisma.subtaskActivity.create({
      data: {
        subtaskId: subtask1_1.id,
        action: 'created',
        userId: filmmaker1.id,
        createdAt: getDateOffset(-10),
      },
    })

    await prisma.subtaskActivity.create({
      data: {
        subtaskId: subtask1_1.id,
        action: 'status_changed',
        field: 'status',
        oldValue: 'todo',
        newValue: 'in_progress',
        userId: filmmaker1.id,
        createdAt: getDateOffset(-8),
      },
    })

    await prisma.subtaskActivity.create({
      data: {
        subtaskId: subtask1_1.id,
        action: 'status_changed',
        field: 'status',
        oldValue: 'in_progress',
        newValue: 'done',
        userId: filmmaker1.id,
        createdAt: getDateOffset(-5),
      },
    })

    await prisma.subtaskActivity.create({
      data: {
        subtaskId: subtask1_1.id,
        action: 'comment_added',
        userId: admin.id,
        createdAt: getDateOffset(-4),
      },
    })

    console.log('✅ Criados logs de atividade para subtasks')

    console.log('✨ Seed completado com dados completos e realistas!')
    }
  } else {
    console.log('✨ Seed completado - Sistema básico configurado!')
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
