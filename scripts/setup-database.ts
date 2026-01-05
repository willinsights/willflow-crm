#!/usr/bin/env tsx

/**
 * Database Setup Script for WillFlow CRM
 * Automates database initialization and seeding
 */

import { execSync } from 'child_process';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('🚀 WillFlow CRM - Database Setup');
  console.log('================================\n');

  try {
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não está configurada!');
      console.log('Por favor, configure a variável de ambiente DATABASE_URL no arquivo .env');
      process.exit(1);
    }

    console.log('✓ DATABASE_URL encontrada\n');

    // Ask if user wants to reset database
    const reset = await question('Deseja resetar o banco de dados? (s/N): ');
    
    if (reset.toLowerCase() === 's' || reset.toLowerCase() === 'sim') {
      console.log('\n📦 Resetando banco de dados...');
      execSync('npx prisma migrate reset --force', { stdio: 'inherit' });
    } else {
      console.log('\n📦 Aplicando migrações...');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    }

    console.log('\n✅ Migrações aplicadas com sucesso!\n');

    // Ask if user wants to populate with sample data
    const populate = await question('Deseja popular com dados de exemplo? (S/n): ');
    
    if (populate.toLowerCase() !== 'n' && populate.toLowerCase() !== 'não' && populate.toLowerCase() !== 'nao') {
      console.log('\n🌱 Populando banco de dados com dados de exemplo...');
      
      // Set environment variable for seed
      process.env.SEED_WITH_SAMPLE_DATA = 'true';
      
      execSync('npm run db:seed', { stdio: 'inherit' });
      
      console.log('\n✅ Banco de dados populado com sucesso!');
      console.log('\n📋 Dados de exemplo criados:');
      console.log('  - 1 Administrador');
      console.log('  - 2 Clientes');
      console.log('  - 3 Categorias');
      console.log('  - 3 Projetos');
    } else {
      console.log('\n🌱 Executando seed básico...');
      execSync('npm run db:seed', { stdio: 'inherit' });
      console.log('\n✅ Usuário administrador criado!');
    }

    console.log('\n✨ Setup concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('  1. Execute: npm run dev');
    console.log('  2. Acesse: http://localhost:3000');
    console.log('  3. Login: admin@in-sights.pt\n');

  } catch (error) {
    console.error('\n❌ Erro durante o setup:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();
