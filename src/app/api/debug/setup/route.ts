import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: []
  };

  try {
    // Step 1: Create admin user
    results.steps.push({ step: 1, name: 'Create admin user', status: 'running' });

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

    results.steps[0].status = 'success';
    results.steps[0].data = { userId: adminUser.id };

    // Step 2: Create categories
    results.steps.push({ step: 2, name: 'Create categories', status: 'running' });

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

    results.steps[1].status = 'success';
    results.steps[1].data = { count: categories.length };

    // Step 3: Create clients
    results.steps.push({ step: 3, name: 'Create clients', status: 'running' });

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
        where: { email: 'joao.santos@exp.pt' },
        update: {},
        create: {
          name: 'João Santos',
          email: 'joao.santos@exp.pt',
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

    results.steps[2].status = 'success';
    results.steps[2].data = { count: clients.length };

    // Step 4: Create projects
    results.steps.push({ step: 4, name: 'Create projects', status: 'running' });

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
          clientDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
          clientDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
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
          clientDueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }
      })
    ]);

    results.steps[3].status = 'success';
    results.steps[3].data = { count: projects.length };

    results.summary = {
      status: 'success',
      message: '🎉 Banco de dados populado com sucesso!',
      data: {
        users: 1,
        categories: categories.length,
        clients: clients.length,
        projects: projects.length
      }
    };

  } catch (error: any) {
    results.error = {
      message: error.message,
      code: error.code,
      meta: error.meta
    };
    results.summary = {
      status: 'error',
      message: '❌ Erro ao popular banco: ' + error.message
    };
  }

  return NextResponse.json(results, { status: results.summary.status === 'success' ? 200 : 500 });
}
