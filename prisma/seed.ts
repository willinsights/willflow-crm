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

  // Criar apenas usuário administrador
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
  console.log('✨ Seed completado - Sistema limpo!')
}

main()
  .catch((e) => {
    console.error('❌ Erro ao fazer seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
