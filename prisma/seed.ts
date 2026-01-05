import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar banco de dados
  await prisma.subtask.deleteMany()
  await prisma.project.deleteMany()
  await prisma.category.deleteMany()
  await prisma.client.deleteMany()
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
    },
  })

  console.log('✅ Criado 1 usuário administrador')

  // Verificar se deve popular com dados de exemplo
  const shouldPopulate = process.env.SEED_WITH_SAMPLE_DATA === 'true' || process.env.NODE_ENV === 'development'

  if (shouldPopulate) {
    console.log('📦 Populando banco com dados de exemplo...')

    // Criar clientes de exemplo
    const client1 = await prisma.client.create({
      data: {
        name: 'Cliente Exemplo 1',
        email: 'cliente1@exemplo.com',
        phone: '+351 912 345 678',
        company: 'Empresa A',
      },
    })

    const client2 = await prisma.client.create({
      data: {
        name: 'Cliente Exemplo 2',
        email: 'cliente2@exemplo.com',
        phone: '+351 913 456 789',
        company: 'Empresa B',
      },
    })

    console.log('✅ Criados 2 clientes de exemplo')

    // Criar categorias de exemplo
    const category1 = await prisma.category.create({
      data: {
        name: 'Vídeo Marketing',
        color: '#3B82F6',
      },
    })

    const category2 = await prisma.category.create({
      data: {
        name: 'Documentário',
        color: '#10B981',
      },
    })

    const category3 = await prisma.category.create({
      data: {
        name: 'Publicidade',
        color: '#F59E0B',
      },
    })

    console.log('✅ Criadas 3 categorias de exemplo')

    // Criar projetos de exemplo
    const project1 = await prisma.project.create({
      data: {
        title: 'Projeto Exemplo - Vídeo Corporativo',
        description: 'Vídeo institucional para apresentação da empresa',
        phase: 'em_producao',
        clientId: client1.id,
        categoryId: category1.id,
        videoType: 'corporativo',
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        clientPrice: 5000,
        captationCost: 1500,
        editionCost: 1000,
        margin: 2500,
      },
    })

    const project2 = await prisma.project.create({
      data: {
        title: 'Projeto Exemplo - Documentário',
        description: 'Documentário sobre história local',
        phase: 'planejamento',
        clientId: client2.id,
        categoryId: category2.id,
        videoType: 'documentario',
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        clientPrice: 15000,
        captationCost: 5000,
        editionCost: 3000,
        margin: 7000,
      },
    })

    const project3 = await prisma.project.create({
      data: {
        title: 'Campanha Publicitária Digital',
        description: 'Série de vídeos curtos para redes sociais',
        phase: 'em_producao',
        clientId: client1.id,
        categoryId: category3.id,
        videoType: 'publicidade',
        paymentStatus: 'pending',
        freelancerPaymentStatus: 'pending',
        clientPrice: 8000,
        captationCost: 2000,
        editionCost: 1500,
        margin: 4500,
      },
    })

    console.log('✅ Criados 3 projetos de exemplo')

    console.log('✨ Seed completado com dados de exemplo!')
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
