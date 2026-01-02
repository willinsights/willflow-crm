# 🔧 Guia de Correção do Banco de Dados - Railway

## Problema Identificado

As APIs `/api/projects`, `/api/users` e `/api/categories` estão retornando erro 500.
A API `/api/clients` funciona normalmente.

Isso indica que as tabelas do Prisma podem não estar sincronizadas com o banco de dados.

---

## Solução: Executar Migração no Railway

### Passo 1: Acessar o Painel do Railway

1. Abra https://railway.app/dashboard
2. Selecione o projeto **willflow-crm**
3. Clique no serviço principal (não o PostgreSQL)

### Passo 2: Verificar DATABASE_URL

1. Clique na aba **Variables**
2. Confirme que `DATABASE_URL` está configurado
3. Deve ter formato: `postgresql://user:pass@host:port/database`

### Passo 3: Executar Migração via Deploy Command

Opção A - Adicionar comando de migração no build:

1. No Railway, vá em **Settings** > **Build**
2. No campo "Build Command", adicione:
   ```
   bun install && bunx prisma db push && bun run build
   ```
3. Clique em "Redeploy"

Opção B - Usar Railway CLI:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Executar migração
railway run bunx prisma db push --accept-data-loss
```

### Passo 4: Verificar Tabelas

Após a migração, as seguintes tabelas devem existir:
- users
- clients
- projects
- categories
- subtasks
- notifications
- project_media
- kanban_columns
- (e outras...)

---

## Verificação Rápida

Execute estes comandos para testar:

```bash
# Health check
curl https://will-flow.up.railway.app/api/health

# Clients (deve funcionar)
curl https://will-flow.up.railway.app/api/clients

# Projects (deve funcionar após migração)
curl https://will-flow.up.railway.app/api/projects

# Users (deve funcionar após migração)
curl https://will-flow.up.railway.app/api/users
```

---

## Se o Problema Persistir

1. Verifique os logs do deploy no Railway
2. Confirme que o PostgreSQL está ativo
3. Execute `prisma db push` manualmente via Railway CLI
4. Verifique se há erros de schema no Prisma

---

**Última atualização**: 01/01/2026
