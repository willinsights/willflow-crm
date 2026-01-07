# 🚀 Guia Completo de Deploy - WillFlow CRM

## ⚠️ Problema Resolvido

Este guia documenta a solução para o erro de deploy:
```
Could not find a production build in the '.next' directory. 
Try building your app with 'next build' before starting the production server.
```

## 🔧 Mudanças Implementadas

### 1. **Railway Configuration (railway.toml)**
- ✅ Removida dependência de `bun`, usando apenas `npm` e `node`
- ✅ Configuração alinhada com package.json
- ✅ Build sequence otimizada:
  1. `npx prisma generate` - Gera cliente Prisma
  2. `npx prisma db push --accept-data-loss` - Aplica schema no DB
  3. `npm run build` - Cria build de produção do Next.js

### 2. **Nixpacks Configuration (.nixpacksrc)**
- ✅ Removida dependência de `yarn`
- ✅ Simplificado para usar apenas Node.js 20.x e OpenSSL

### 3. **Database Reset Script**
- ✅ Criado `scripts/reset-database.ts`
- ✅ Adicionado comando `npm run db:reset`
- ✅ Reset completo com dados fictícios

## 📋 Build Process

### Local Development

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# 3. Gerar cliente Prisma
npx prisma generate

# 4. Aplicar schema no banco (opcional - reset completo)
npm run db:reset

# 5. Build de produção
npm run build

# 6. Verificar build
ls -la .next/

# 7. Iniciar servidor de produção
npm run start
```

### Railway Deployment

O Railway executa automaticamente:

```bash
# Install Phase
npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Build Phase
npx prisma generate
npx prisma db push --accept-data-loss || echo 'DB migration skipped'
npm run build

# Start Phase
npm run start
```

## 🗄️ Database Management

### Reset Completo do Banco de Dados

```bash
# Uso local
npm run db:reset

# Uso no Railway (via Railway CLI)
railway run npm run db:reset
```

Este comando:
1. ✅ Apaga completamente o banco atual (`--force-reset`)
2. ✅ Recria o schema do Prisma
3. ✅ Popula com dados fictícios:
   - Usuários (incluindo admin)
   - Projetos de exemplo
   - Clientes
   - Categorias
   - Pagamentos pendentes
   - Colunas Kanban

### Apenas Popular com Dados (sem reset)

```bash
npm run db:seed
```

### Aplicar Schema sem Perder Dados

```bash
npm run db:push
```

## 🔐 Credenciais Padrão

Após executar `npm run db:reset` ou `npm run db:seed`:

- **Email:** admin@willflow.com
- **Senha:** admin123

## ✅ Checklist de Deploy

### Antes do Deploy

- [ ] Variáveis de ambiente configuradas no Railway:
  - `DATABASE_URL` (PostgreSQL connection string)
  - `NODE_ENV=production`
  - `PORT` (opcional, Railway define automaticamente)
- [ ] Branch main atualizada no GitHub
- [ ] Commits pusheados

### Durante o Deploy

Railway executa automaticamente:
1. ✅ Install dependencies
2. ✅ Generate Prisma Client
3. ✅ Apply database schema
4. ✅ Build Next.js application
5. ✅ Start production server

### Após o Deploy

- [ ] Verificar logs no Railway Dashboard
- [ ] Testar health check: `https://seu-app.railway.app/api/health`
- [ ] Testar login com credenciais padrão
- [ ] Verificar se projetos aparecem no dashboard

## 🐛 Troubleshooting

### Erro: "Could not find a production build"

**Causa:** Build do Next.js falhou ou `.next` não foi criado

**Solução:**
1. Verificar logs de build no Railway
2. Confirmar que `npm run build` completa com sucesso
3. Verificar variáveis de ambiente (especialmente `DATABASE_URL`)
4. Redesployar com configuração corrigida

### Erro: Prisma Client not generated

**Causa:** `prisma generate` não foi executado

**Solução:**
```bash
npx prisma generate
```

### Erro: Database connection failed

**Causa:** `DATABASE_URL` incorreta ou banco não acessível

**Solução:**
1. Verificar `DATABASE_URL` nas variáveis de ambiente
2. Confirmar que o PostgreSQL está rodando
3. Testar conexão manualmente

### Build Timeout no Railway

**Causa:** Build muito longo

**Solução:**
1. Railway tem timeout de 10 minutos por padrão
2. Build deve completar em 2-3 minutos normalmente
3. Se timeout persistir, verificar logs para identificar o passo lento

## 🔄 CI/CD Pipeline

O GitHub Actions (`.github/workflows/main.yml`) executa automaticamente:

1. ✅ Lint do código
2. ✅ Build de produção
3. ✅ Testes unitários
4. ✅ Verificação de artefatos de build

## 📊 Estrutura de Build

```
.next/
├── BUILD_ID                    # ID único do build
├── app-build-manifest.json     # Manifest de build do App Router
├── build-manifest.json         # Manifest geral de build
├── cache/                      # Cache de build
├── server/                     # Arquivos do servidor
├── static/                     # Assets estáticos com hash
└── ...
```

## 🚀 Deploy Manual (via Railway CLI)

```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Linkar ao projeto
railway link

# 4. Deploy
railway up

# 5. Ver logs
railway logs

# 6. Executar comandos
railway run npm run db:reset
```

## 📝 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run build` | Build de produção (gera Prisma + Next.js) |
| `npm run start` | Inicia servidor de produção |
| `npm run dev` | Desenvolvimento |
| `npm run db:reset` | Reset completo + seed |
| `npm run db:seed` | Apenas popular dados |
| `npm run db:push` | Aplicar schema |
| `npm run db:studio` | Abrir Prisma Studio |

## 🎯 Próximos Passos

1. ✅ Deploy configurado corretamente
2. ✅ Build funcional
3. ✅ Banco de dados pronto para uso
4. 🔄 Monitorar logs de produção
5. 🔄 Configurar domínio customizado (opcional)
6. 🔄 Configurar backup do banco de dados

## 📞 Suporte

Em caso de problemas:
1. Verificar logs no Railway Dashboard
2. Executar build localmente para reproduzir
3. Consultar este guia de troubleshooting
4. Verificar variáveis de ambiente

---

**Última atualização:** 07/01/2026  
**Versão do Next.js:** 15.3.8  
**Versão do Node.js:** 20.x  
**Plataforma:** Railway (Nixpacks)
