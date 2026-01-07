#!/usr/bin/env tsx

/**
 * Script to generate test/mock data for Kanban boards
 * Creates projects distributed across different columns
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample project data
const sampleProjects = [
  {
    title: 'Vídeo Promocional Hotel Luxo',
    videoType: 'hotel',
    location: 'Lisboa',
    description: 'Vídeo promocional para hotel 5 estrelas',
    clientPrice: 5000,
    captationCost: 1500,
    editionCost: 1000,
  },
  {
    title: 'Cobertura Evento Corporativo',
    videoType: 'experiencia',
    location: 'Porto',
    description: 'Cobertura de evento corporativo anual',
    clientPrice: 3500,
    captationCost: 1000,
    editionCost: 800,
  },
  {
    title: 'Reels Instagram - Restaurante',
    videoType: 'reels',
    location: 'Cascais',
    description: 'Série de reels para redes sociais',
    clientPrice: 1200,
    captationCost: 400,
    editionCost: 300,
  },
  {
    title: 'Tour Virtual Imobiliária',
    videoType: 'hotel',
    location: 'Sintra',
    description: 'Tour virtual para propriedade de luxo',
    clientPrice: 4000,
    captationCost: 1200,
    editionCost: 900,
  },
  {
    title: 'Vídeo Corporativo Empresa Tech',
    videoType: 'experiencia',
    location: 'Braga',
    description: 'Vídeo institucional para startup',
    clientPrice: 6000,
    captationCost: 2000,
    editionCost: 1500,
  },
]

async function main() {
  console.log('🎬 Generating test data for Kanban boards...\n')
  
  try {
    // Test database connection
    console.log('🔌 Testing database connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful\n')
    
    // Get or create default client
    console.log('👤 Setting up test client...')
    let client = await prisma.client.findFirst({
      where: { email: 'test@example.com' },
    })
    
    if (!client) {
      client = await prisma.client.create({
        data: {
          name: 'Cliente de Teste',
          email: 'test@example.com',
          phone: '+351 912 345 678',
          company: 'Empresa Teste Lda',
        },
      })
      console.log(`✅ Created test client (ID: ${client.id.substring(0, 8)}...)\n`)
    } else {
      console.log(`✅ Using existing test client (ID: ${client.id.substring(0, 8)}...)\n`)
    }
    
    // Get or create category
    console.log('📂 Setting up test category...')
    let category = await prisma.category.findFirst({
      where: { name: 'Marketing Digital' },
    })
    
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Marketing Digital',
          description: 'Projetos de marketing digital e conteúdo',
          color: '#8B5CF6',
        },
      })
      console.log(`✅ Created test category (ID: ${category.id.substring(0, 8)}...)\n`)
    } else {
      console.log(`✅ Using existing category (ID: ${category.id.substring(0, 8)}...)\n`)
    }
    
    // Get or create user
    console.log('👨‍💼 Setting up test user...')
    let user = await prisma.user.findFirst({
      where: { email: 'admin@example.com' },
    })
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: 'Admin Teste',
          email: 'admin@example.com',
          role: 'admin',
          password: 'hashed_password_here',
          canViewFinance: true,
          canEditProjects: true,
          canViewAllProjects: true,
        },
      })
      console.log(`✅ Created test user (ID: ${user.id.substring(0, 8)}...)\n`)
    } else {
      console.log(`✅ Using existing user (ID: ${user.id.substring(0, 8)}...)\n`)
    }
    
    // Get Kanban columns
    console.log('📋 Fetching Kanban columns...')
    const captacaoColumns = await prisma.kanbanColumn.findMany({
      where: { phase: 'CAPTACAO', organizationId: 'default' },
      orderBy: { position: 'asc' },
    })
    
    const edicaoColumns = await prisma.kanbanColumn.findMany({
      where: { phase: 'EDICAO', organizationId: 'default' },
      orderBy: { position: 'asc' },
    })
    
    if (captacaoColumns.length === 0 || edicaoColumns.length === 0) {
      console.log('❌ Error: Kanban columns not found!')
      console.log('💡 Run: npm run db:seed or node scripts/init-kanban-columns.ts first')
      process.exit(1)
    }
    
    console.log(`✅ Found ${captacaoColumns.length} CAPTACAO columns`)
    console.log(`✅ Found ${edicaoColumns.length} EDICAO columns\n`)
    
    // Create projects distributed across columns
    console.log('🎨 Creating test projects...\n')
    
    const captacaoStatuses = captacaoColumns.map(col => 
      col.title.toLowerCase().replace(/\s+/g, '-')
    )
    const edicaoStatuses = edicaoColumns.map(col => 
      col.title.toLowerCase().replace(/\s+/g, '-')
    )
    
    let projectsCreated = 0
    
    // Create projects for CAPTACAO phase
    console.log('📹 Creating CAPTACAO projects:')
    for (let i = 0; i < sampleProjects.length; i++) {
      const project = sampleProjects[i]
      const statusIndex = i % captacaoStatuses.length
      const status = captacaoStatuses[statusIndex]
      
      try {
        const created = await prisma.project.create({
          data: {
            title: `${project.title} - Teste ${i + 1}`,
            clientId: client.id,
            categoryId: category.id,
            phase: 'captacao',
            statusCaptacao: status,
            videoType: project.videoType,
            location: project.location,
            description: project.description,
            clientPrice: project.clientPrice,
            captationCost: project.captationCost,
            editionCost: project.editionCost,
            margin: project.clientPrice - project.captationCost - project.editionCost,
            paymentStatus: 'pending',
            freelancerPaymentStatus: 'pending',
            responsavelCaptacaoId: user.id,
            captacaoDate: new Date(Date.now() + (i * 86400000)), // Spread over next days
            clientDueDate: new Date(Date.now() + ((i + 7) * 86400000)),
          },
        })
        
        console.log(`   ✅ ${created.title} -> ${status}`)
        projectsCreated++
      } catch (error) {
        console.error(`   ❌ Failed to create project: ${project.title}`)
        if (error instanceof Error) {
          console.error(`      Error: ${error.message}`)
        }
      }
    }
    
    // Create projects for EDICAO phase
    console.log('\n✂️  Creating EDICAO projects:')
    for (let i = 0; i < sampleProjects.length; i++) {
      const project = sampleProjects[i]
      const statusIndex = i % edicaoStatuses.length
      const status = edicaoStatuses[statusIndex]
      
      try {
        const created = await prisma.project.create({
          data: {
            title: `${project.title} - Edição ${i + 1}`,
            clientId: client.id,
            categoryId: category.id,
            phase: 'edicao',
            statusCaptacao: 'entregue',
            statusEdicao: status,
            videoType: project.videoType,
            location: project.location,
            description: project.description,
            clientPrice: project.clientPrice,
            captationCost: project.captationCost,
            editionCost: project.editionCost,
            margin: project.clientPrice - project.captationCost - project.editionCost,
            paymentStatus: 'pending',
            freelancerPaymentStatus: 'pending',
            responsavelCaptacaoId: user.id,
            responsavelEdicaoId: user.id,
            captacaoDate: new Date(Date.now() - (i * 86400000)), // Past dates
            clientDueDate: new Date(Date.now() + ((i + 3) * 86400000)),
          },
        })
        
        console.log(`   ✅ ${created.title} -> ${status}`)
        projectsCreated++
      } catch (error) {
        console.error(`   ❌ Failed to create project: ${project.title}`)
        if (error instanceof Error) {
          console.error(`      Error: ${error.message}`)
        }
      }
    }
    
    console.log(`\n🎉 Successfully created ${projectsCreated} test projects!`)
    console.log('\n✨ Test data generation complete!')
    console.log('💡 You can now view the projects in the Kanban boards')
    
  } catch (error) {
    console.error('\n❌ Error generating test data:')
    if (error instanceof Error) {
      console.error(`   Name: ${error.name}`)
      console.error(`   Message: ${error.message}`)
      if (error.stack) {
        console.error('\n   Stack trace:')
        console.error(error.stack)
      }
    } else {
      console.error(error)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
