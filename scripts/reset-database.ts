#!/usr/bin/env tsx
/**
 * Script para resetar completamente o banco de dados
 * Uso: npm run db:reset
 * 
 * Este script:
 * 1. Aplica o schema Prisma (reset completo)
 * 2. Executa o seed para popular com dados fictícios
 */

import { execSync } from 'child_process'

console.log('🗑️  Iniciando reset completo do banco de dados...\n')

try {
  // Step 1: Force reset database schema
  console.log('1️⃣  Aplicando reset do schema...')
  execSync('npx prisma db push --force-reset --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
  })
  console.log('✅ Schema resetado com sucesso!\n')

  // Step 2: Seed database with test data
  console.log('2️⃣  Populando banco de dados com dados fictícios...')
  execSync('npx prisma db seed', {
    stdio: 'inherit',
    env: process.env,
  })
  console.log('✅ Dados fictícios criados com sucesso!\n')

  console.log('🎉 Reset completo do banco de dados finalizado!')
  console.log('\n📊 Dados criados:')
  console.log('   - Usuários (incluindo admin)')
  console.log('   - Projetos de exemplo')
  console.log('   - Clientes')
  console.log('   - Categorias')
  console.log('   - Pagamentos pendentes')
  console.log('\n🔐 Login padrão:')
  console.log('   Email: admin@willflow.com')
  console.log('   Senha: admin123')

} catch (error) {
  console.error('❌ Erro durante o reset:', error)
  process.exit(1)
}
