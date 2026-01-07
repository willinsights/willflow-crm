#!/usr/bin/env tsx

/**
 * Script to initialize Kanban columns in the database
 * This can be run to bootstrap or reset the Kanban column structure
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Default columns for each phase
const DEFAULT_COLUMNS = {
  CAPTACAO: [
    { title: 'A agendar', position: 0, isLocked: false, systemKey: null },
    { title: 'Agendado', position: 1, isLocked: false, systemKey: null },
    { title: 'Em execução', position: 2, isLocked: false, systemKey: null },
    { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
  ],
  EDICAO: [
    { title: 'A iniciar', position: 0, isLocked: false, systemKey: null },
    { title: 'Em edição', position: 1, isLocked: false, systemKey: null },
    { title: 'Em revisão', position: 2, isLocked: false, systemKey: null },
    { title: 'Entregue', position: 3, isLocked: true, systemKey: 'DELIVERED' },
  ],
}

async function main() {
  const organizationId = 'default'
  
  console.log('🚀 Initializing Kanban Columns...')
  console.log('📋 Organization:', organizationId)
  
  try {
    // Test database connection
    console.log('\n🔌 Testing database connection...')
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    
    // Check existing columns
    console.log('\n📊 Checking existing columns...')
    const existingColumns = await prisma.kanbanColumn.findMany({
      where: { organizationId },
      orderBy: [{ phase: 'asc' }, { position: 'asc' }],
    })
    
    if (existingColumns.length > 0) {
      console.log(`⚠️  Found ${existingColumns.length} existing columns:`)
      for (const col of existingColumns) {
        console.log(`   - ${col.phase}: ${col.title} (pos: ${col.position}, locked: ${col.isLocked})`)
      }
      
      // Ask if user wants to continue
      console.log('\n⚠️  Columns already exist. This script will skip creation.')
      console.log('💡 To reset, delete existing columns first with: npm run db:reset')
      return
    }
    
    console.log('✅ No existing columns found')
    
    // Create columns
    console.log('\n🎨 Creating default columns...')
    let totalCreated = 0
    
    for (const [phase, phaseColumns] of Object.entries(DEFAULT_COLUMNS)) {
      console.log(`\n📝 Creating columns for ${phase}:`)
      
      for (const col of phaseColumns) {
        try {
          const created = await prisma.kanbanColumn.create({
            data: {
              organizationId,
              phase,
              title: col.title,
              position: col.position,
              isLocked: col.isLocked,
              systemKey: col.systemKey,
              isActive: true,
            },
          })
          
          console.log(`   ✅ Created: ${col.title} (ID: ${created.id.substring(0, 8)}...)`)
          totalCreated++
        } catch (error) {
          console.error(`   ❌ Failed to create: ${col.title}`)
          if (error instanceof Error) {
            console.error(`      Error: ${error.message}`)
          }
        }
      }
    }
    
    console.log(`\n🎉 Successfully created ${totalCreated} columns!`)
    
    // Verify creation
    console.log('\n🔍 Verifying columns...')
    const allColumns = await prisma.kanbanColumn.findMany({
      where: { organizationId },
      orderBy: [{ phase: 'asc' }, { position: 'asc' }],
    })
    
    console.log(`\n📊 Total columns in database: ${allColumns.length}`)
    
    const captacaoCount = allColumns.filter(c => c.phase === 'CAPTACAO').length
    const edicaoCount = allColumns.filter(c => c.phase === 'EDICAO').length
    
    console.log(`   - CAPTACAO: ${captacaoCount} columns`)
    console.log(`   - EDICAO: ${edicaoCount} columns`)
    
    if (captacaoCount === 4 && edicaoCount === 4) {
      console.log('\n✅ All columns created successfully!')
    } else {
      console.log('\n⚠️  Warning: Expected 4 columns per phase, but got different counts')
    }
    
  } catch (error) {
    console.error('\n❌ Error during initialization:')
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
