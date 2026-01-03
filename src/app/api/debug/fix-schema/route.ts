import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const results: any = {
    timestamp: new Date().toISOString(),
    steps: []
  };

  try {
    // Step 1: Check if customId column exists
    results.steps.push({ step: 1, name: 'Verificando coluna customId', status: 'running' });

    const columnCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'projects'
      AND column_name = 'customId'
    ` as any[];

    if (columnCheck.length > 0) {
      results.steps[0].status = 'skipped';
      results.steps[0].message = '✅ Coluna customId já existe';

      results.summary = {
        status: 'success',
        message: '✅ Schema já está atualizado!'
      };

      return NextResponse.json(results);
    }

    results.steps[0].status = 'success';
    results.steps[0].message = 'Coluna customId não existe, vai criar';

    // Step 2: Add customId column
    results.steps.push({ step: 2, name: 'Adicionando coluna customId', status: 'running' });

    await prisma.$executeRawUnsafe(`
      ALTER TABLE projects
      ADD COLUMN "customId" TEXT
    `);

    results.steps[1].status = 'success';
    results.steps[1].message = '✅ Coluna customId adicionada';

    // Step 3: Create index
    results.steps.push({ step: 3, name: 'Criando índice em customId', status: 'running' });

    await prisma.$executeRawUnsafe(`
      CREATE INDEX "projects_customId_idx"
      ON projects("customId")
    `);

    results.steps[2].status = 'success';
    results.steps[2].message = '✅ Índice criado';

    // Step 4: Verify column exists now
    results.steps.push({ step: 4, name: 'Verificando criação', status: 'running' });

    const verifyCheck = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'projects'
      AND column_name = 'customId'
    ` as any[];

    if (verifyCheck.length > 0) {
      results.steps[3].status = 'success';
      results.steps[3].message = '✅ Coluna customId verificada';
    } else {
      throw new Error('Coluna customId ainda não existe após migration');
    }

    results.summary = {
      status: 'success',
      message: '🎉 Schema atualizado! Agora recarregue o painel: https://will-flow.up.railway.app'
    };

  } catch (error: any) {
    results.error = {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack?.split('\n').slice(0, 3)
    };
    results.summary = {
      status: 'error',
      message: '❌ Erro: ' + error.message
    };
  } finally {
    await prisma.$disconnect();
  }

  return NextResponse.json(results, {
    status: results.summary.status === 'success' ? 200 : 500
  });
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST para corrigir schema do banco',
    endpoint: '/api/debug/fix-schema',
    method: 'POST',
    description: 'Adiciona a coluna customId na tabela projects',
    usage: 'Abra no navegador e aguarde ~2 segundos'
  });
}
