import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDatabase() {
  console.log('🔍 Verificando conexão com Railway PostgreSQL...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!\n');

    // Check projects count
    const projectsCount = await prisma.project.count();
    console.log(`📊 Total de projetos no banco: ${projectsCount}`);

    if (projectsCount === 0) {
      console.log('\n⚠️  Banco de dados vazio! Populando com dados de exemplo...\n');
      await seedDatabase();
    } else {
      console.log('\n✅ Banco de dados já possui dados!');

      // Show projects
      const projects = await prisma.project.findMany({
        take: 5,
        include: {
          client: true,
          category: true
        },
        orderBy: { createdAt: 'desc' }
      });

      console.log('\n📝 Últimos 5 projetos:');
      projects.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title} - Cliente: ${p.client?.name || 'N/A'}`);
      });
    }

    // Check clients
    const clientsCount = await prisma.client.count();
    console.log(`\n👥 Total de clientes: ${clientsCount}`);

    // Check categories
    const categoriesCount = await prisma.category.count();
    console.log(`🏷️  Total de categorias: ${categoriesCount}`);

    // Check users
    const usersCount = await prisma.user.count();
    console.log(`👤 Total de usuários: ${usersCount}`);

    console.log('\n✅ Verificação concluída!');

  } catch (error) {
    console.error('❌ Erro ao conectar com banco de dados:', error);
    console.log('\n💡 Verifique se a DATABASE_URL está correta no Railway.');
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

async function seedDatabase() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  try {
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@willflow.com' },
      update: {},
      create: {
        name: 'Administrador',
        email: 'admin@willflow.com',
        role: 'admin',
        canViewFinance: true,
        canEditProjects: true,
        canViewAllProjects: true
      }
    });
    console.log('✅ Usuário admin criado');

    // Create categories
    const categories = await Promise.all([
      prisma.category.upsert({
        where: { name: 'Hotel' },
        update: {},
        create: {
          name: 'Hotel',
          description: 'Vídeos para hotéis e resorts',
          color: '#3B82F6'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Experiência' },
        update: {},
        create: {
          name: 'Experiência',
          description: 'Vídeos de experiências turísticas',
          color: '#10B981'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Drone' },
        update: {},
        create: {
          name: 'Drone',
          description: 'Captação aérea com drone',
          color: '#F59E0B'
        }
      }),
      prisma.category.upsert({
        where: { name: 'Reels' },
        update: {},
        create: {
          name: 'Reels',
          description: 'Conteúdo para redes sociais',
          color: '#EF4444'
        }
      })
    ]);
    console.log(`✅ ${categories.length} categorias criadas`);

    // Create clients
    const clients = await Promise.all([
      prisma.client.upsert({
        where: { email: 'ana.silva@hotel.com' },
        update: {},
        create: {
          name: 'Ana Silva',
          email: 'ana.silva@hotel.com',
          phone: '+351 912 345 678',
          company: 'Hotel Vista Mar',
          totalRevenue: 0,
          totalCosts: 0,
          totalMargin: 0,
          projectCount: 0
        }
      }),
      prisma.client.upsert({
        where: { email: 'joao.santos@experiencias.pt' },
        update: {},
        create: {
          name: 'João Santos',
          email: 'joao.santos@experiencias.pt',
          phone: '+351 913 456 789',
          company: 'Experiências Portugal',
          totalRevenue: 0,
          totalCosts: 0,
          totalMargin: 0,
          projectCount: 0
        }
      }),
      prisma.client.upsert({
        where: { email: 'maria.costa@resort.com' },
        update: {},
        create: {
          name: 'Maria Costa',
          email: 'maria.costa@resort.com',
          phone: '+351 914 567 890',
          company: 'Resort Algarve',
          totalRevenue: 0,
          totalCosts: 0,
          totalMargin: 0,
          projectCount: 0
        }
      })
    ]);
    console.log(`✅ ${clients.length} clientes criados`);

    // Create projects
    const projects = await Promise.all([
      prisma.project.create({
        data: {
          title: 'Vídeo Promocional Hotel Vista Mar',
          clientId: clients[0].id,
          categoryId: categories[0].id,
          phase: 'edicao',
          statusEdicao: 'em-edicao',
          videoType: 'hotel',
          location: 'Lisboa',
          description: 'Vídeo promocional para redes sociais',
          clientPrice: 2500,
          captationCost: 800,
          editionCost: 500,
          margin: 1200,
          paymentStatus: 'a-faturar',
          freelancerPaymentStatus: 'a-pagar',
          responsavelEdicaoId: adminUser.id,
          clientDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        }
      }),
      prisma.project.create({
        data: {
          title: 'Tour Virtual Resort Algarve',
          clientId: clients[2].id,
          categoryId: categories[2].id,
          phase: 'captacao',
          statusCaptacao: 'agendado',
          videoType: 'drone',
          location: 'Algarve',
          description: 'Tour aéreo do resort',
          clientPrice: 3500,
          captationCost: 1200,
          editionCost: 800,
          margin: 1500,
          paymentStatus: 'a-faturar',
          freelancerPaymentStatus: 'a-pagar',
          responsavelCaptacaoId: adminUser.id,
          clientDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
        }
      }),
      prisma.project.create({
        data: {
          title: 'Reels Experiências Portugal',
          clientId: clients[1].id,
          categoryId: categories[3].id,
          phase: 'edicao',
          statusEdicao: 'revisao-cliente',
          videoType: 'reels',
          location: 'Porto',
          description: '5 reels para Instagram',
          clientPrice: 1500,
          captationCost: 400,
          editionCost: 300,
          margin: 800,
          paymentStatus: 'a-receber',
          freelancerPaymentStatus: 'a-pagar',
          responsavelEdicaoId: adminUser.id,
          clientDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
        }
      })
    ]);
    console.log(`✅ ${projects.length} projetos criados`);

    console.log('\n🎉 Seed concluído com sucesso!');
    console.log('\n📊 Resumo:');
    console.log(`   - ${projects.length} projetos`);
    console.log(`   - ${clients.length} clientes`);
    console.log(`   - ${categories.length} categorias`);
    console.log(`   - 1 usuário admin`);
    console.log('\n✅ Banco de dados pronto para uso!');

  } catch (error) {
    console.error('❌ Erro ao popular banco:', error);
    throw error;
  }
}

checkDatabase()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
