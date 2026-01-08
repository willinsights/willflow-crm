import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script de migração para popular statusKey em colunas do Kanban
 * 
 * Este script:
 * 1. Verifica colunas existentes sem statusKey
 * 2. Popula statusKey baseado no título (normalizado para ASCII sem acentos)
 * 3. Log detalhado das correções
 */

/**
 * Normaliza texto removendo acentos e convertendo para lowercase com hífens
 * Mantém compatibilidade com os status usados nos projetos
 */
function normalizeToStatusKey(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompor caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas (acentos)
    .replace(/\s+/g, '-') // Substituir espaços por hífens
    .replace(/[^a-z0-9-]/g, ''); // Remover caracteres especiais
}

async function main() {
  console.log('🔧 Iniciando migração de statusKey das colunas do Kanban...\n');

  try {
    // Verificar conexão com o banco
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com banco de dados estabelecida\n');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }

  // Buscar todas as colunas
  const allColumns = await prisma.kanbanColumn.findMany({
    orderBy: [
      { phase: 'asc' },
      { position: 'asc' }
    ]
  });

  console.log(`📊 Total de colunas encontradas: ${allColumns.length}\n`);

  // Filtrar colunas sem statusKey
  const columnsWithoutStatusKey = allColumns.filter(col => !col.statusKey);

  if (columnsWithoutStatusKey.length === 0) {
    console.log('✨ Todas as colunas já possuem statusKey definido!');
    console.log('\n📋 Resumo das colunas existentes:');
    
    for (const col of allColumns) {
      console.log(`  - [${col.phase}] "${col.title}" -> statusKey: "${col.statusKey}"`);
    }
    
    return;
  }

  console.log(`⚠️  Encontradas ${columnsWithoutStatusKey.length} colunas sem statusKey:\n`);

  let updatedCount = 0;
  let errorCount = 0;

  // Processar cada coluna sem statusKey
  for (const column of columnsWithoutStatusKey) {
    const statusKey = normalizeToStatusKey(column.title);
    
    console.log(`📝 Processando coluna:`);
    console.log(`   ID: ${column.id}`);
    console.log(`   Phase: ${column.phase}`);
    console.log(`   Título: "${column.title}"`);
    console.log(`   StatusKey gerado: "${statusKey}"`);

    try {
      await prisma.kanbanColumn.update({
        where: { id: column.id },
        data: { statusKey }
      });

      console.log(`   ✅ StatusKey atualizado com sucesso!\n`);
      updatedCount++;
    } catch (error) {
      console.error(`   ❌ Erro ao atualizar coluna:`, error);
      errorCount++;
    }
  }

  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO DA MIGRAÇÃO');
  console.log('='.repeat(60));
  console.log(`Total de colunas processadas: ${columnsWithoutStatusKey.length}`);
  console.log(`✅ Atualizadas com sucesso: ${updatedCount}`);
  if (errorCount > 0) {
    console.log(`❌ Erros encontrados: ${errorCount}`);
  }

  // Mostrar estado final de todas as colunas
  console.log('\n📋 Estado final de todas as colunas:');
  console.log('─'.repeat(60));
  
  const finalColumns = await prisma.kanbanColumn.findMany({
    orderBy: [
      { phase: 'asc' },
      { position: 'asc' }
    ]
  });

  let currentPhase = '';
  for (const col of finalColumns) {
    if (col.phase !== currentPhase) {
      currentPhase = col.phase;
      console.log(`\n[${currentPhase}]`);
    }
    const lockIndicator = col.isLocked ? '🔒' : '  ';
    console.log(`  ${lockIndicator} Pos ${col.position}: "${col.title}" -> statusKey: "${col.statusKey}"`);
  }

  console.log('\n✨ Migração concluída!');
}

main()
  .catch((error) => {
    console.error('\n❌ Erro fatal durante migração:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
