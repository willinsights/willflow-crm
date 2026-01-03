import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_EXISTS: !!process.env.DATABASE_URL,
      DATABASE_URL_PREFIX: process.env.DATABASE_URL?.substring(0, 20) + '...',
    },
    tests: {}
  };

  try {
    // Test 1: Check if Prisma can connect
    diagnostics.tests.connection = { status: 'testing...' };
    await prisma.$connect();
    diagnostics.tests.connection = {
      status: 'success',
      message: '✅ Prisma conectado ao banco'
    };

    // Test 2: Execute raw query
    diagnostics.tests.rawQuery = { status: 'testing...' };
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`;
    diagnostics.tests.rawQuery = {
      status: 'success',
      message: '✅ Query raw executada',
      result
    };

    // Test 3: Count tables
    diagnostics.tests.tablesCounts = { status: 'testing...' };
    const [
      usersCount,
      clientsCount,
      categoriesCount,
      projectsCount,
      subtasksCount
    ] = await Promise.all([
      prisma.user.count().catch(() => -1),
      prisma.client.count().catch(() => -1),
      prisma.category.count().catch(() => -1),
      prisma.project.count().catch(() => -1),
      prisma.subtask.count().catch(() => -1)
    ]);

    diagnostics.tests.tablesCounts = {
      status: 'success',
      users: usersCount,
      clients: clientsCount,
      categories: categoriesCount,
      projects: projectsCount,
      subtasks: subtasksCount
    };

    // Test 4: Check if tables exist
    diagnostics.tests.tablesExist = { status: 'testing...' };
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    diagnostics.tests.tablesExist = {
      status: 'success',
      count: (tables as any[]).length,
      tables: (tables as any[]).map((t: any) => t.table_name)
    };

    // Test 5: Get first user (if exists)
    diagnostics.tests.sampleData = { status: 'testing...' };
    const firstUser = await prisma.user.findFirst();
    const firstClient = await prisma.client.findFirst();
    const firstCategory = await prisma.category.findFirst();
    const firstProject = await prisma.project.findFirst();

    diagnostics.tests.sampleData = {
      status: 'success',
      user: firstUser ? { id: firstUser.id, email: firstUser.email } : null,
      client: firstClient ? { id: firstClient.id, name: firstClient.name } : null,
      category: firstCategory ? { id: firstCategory.id, name: firstCategory.name } : null,
      project: firstProject ? { id: firstProject.id, title: firstProject.title } : null
    };

    diagnostics.summary = {
      status: '✅ BANCO CONECTADO',
      tablesCount: (tables as any[]).length,
      hasData: usersCount > 0 || clientsCount > 0 || categoriesCount > 0 || projectsCount > 0
    };

    if (diagnostics.summary.hasData) {
      diagnostics.summary.message = '✅ Banco tem dados!';
    } else {
      diagnostics.summary.message = '⚠️ Banco vazio - precisa popular!';
    }

  } catch (error: any) {
    diagnostics.error = {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 5)
    };
    diagnostics.summary = {
      status: '❌ ERRO DE CONEXÃO',
      message: error.message
    };
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
