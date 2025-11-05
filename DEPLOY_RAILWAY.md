# 🚀 Guia de Deploy - Railway

Este guia explica como fazer deploy do **Audiovisual CRM** na plataforma Railway.

## 📋 Pré-requisitos

- Conta no [Railway](https://railway.app/) (pode usar GitHub login)
- Repositório no GitHub com o código do projeto
- Conta no GitHub (para conectar ao Railway)

## 🎯 Passo a Passo

### 1️⃣ Criar Conta no Railway

1. Acesse [railway.app](https://railway.app/)
2. Clique em **"Start a New Project"** ou **"Login"**
3. Faça login com sua conta GitHub
4. Autorize o Railway a acessar seus repositórios

### 2️⃣ Criar Novo Projeto

1. No dashboard do Railway, clique em **"New Project"**
2. Selecione **"Deploy from GitHub repo"**
3. Escolha o repositório do **audiovisual-crm**
4. O Railway vai detectar automaticamente que é um projeto Next.js

### 3️⃣ Adicionar PostgreSQL Database

1. No seu projeto, clique em **"+ New"**
2. Selecione **"Database"**
3. Escolha **"Add PostgreSQL"**
4. O Railway criará automaticamente um banco de dados PostgreSQL
5. Copie a **DATABASE_URL** gerada (será necessária depois)

### 4️⃣ Configurar Variáveis de Ambiente

Na aba **"Variables"** do seu serviço web, adicione as seguintes variáveis:

```bash
# Banco de Dados (será gerado automaticamente pelo Railway)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Node Environment
NODE_ENV=production

# Porta (Railway configura automaticamente)
PORT=${{PORT}}

# Next.js
NEXT_PUBLIC_API_URL=${{RAILWAY_PUBLIC_DOMAIN}}

# Prisma
PRISMA_CLI_QUERY_ENGINE_TYPE=binary
```

### 5️⃣ Executar Migrations do Prisma

Após o primeiro deploy:

1. Abra o **Terminal** do Railway (aba "Deployments" > "View Logs" > "Shell")
2. Execute os comandos:

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrations
npx prisma migrate deploy

# (Opcional) Seed inicial de dados
npm run db:seed
```

**OU** adicione um script de deploy que rode automaticamente:

Crie o arquivo `scripts/railway-deploy.sh`:

```bash
#!/bin/bash
echo "🔧 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run db:seed || echo "Seed failed or already executed"

echo "✅ Deploy completed!"
```

E atualize o `railway.toml`:

```toml
[deploy]
startCommand = "bash ./scripts/railway-deploy.sh && npm start"
```

### 6️⃣ Configurar Custom Domain (Opcional)

1. Na aba **"Settings"** do serviço
2. Role até **"Domains"**
3. Clique em **"Generate Domain"** para obter um domínio gratuito `.railway.app`
4. Ou adicione seu próprio domínio customizado

### 7️⃣ Verificar Deploy

1. Aguarde o build finalizar (pode levar 3-5 minutos)
2. Acesse a URL gerada pelo Railway
3. Faça login com as credenciais padrão:
   - **Admin**: `admin@in-sights.pt` / `admin123`
   - **Editor**: `editor@in-sights.pt` / `editor123`
   - **Freelancer**: `freelancer@in-sights.pt` / `freelancer123`

## 🔍 Monitoramento

### Logs
- Acesse a aba **"Deployments"** > **"View Logs"**
- Monitore erros e avisos em tempo real

### Métricas
- CPU, RAM, e Network usage na aba **"Metrics"**
- Healthcheck status em `/api/health`

### Custos
- Railway oferece **$5 USD de crédito gratuito por mês**
- Monitore o uso na aba **"Usage"**

## ⚙️ Configurações Importantes

### Variáveis de Ambiente Necessárias

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL do PostgreSQL | `postgresql://user:pass@host:5432/db` |
| `NODE_ENV` | Ambiente de execução | `production` |
| `PORT` | Porta do servidor | `3000` (auto pelo Railway) |

### Scripts do Package.json

Certifique-se que o `package.json` contém:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "start": "NODE_ENV=production node server.js",
    "dev": "node server.js",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "postinstall": "prisma generate"
  }
}
```

## 🐛 Troubleshooting

### Erro: "Module not found: Can't resolve 'prisma'"

**Solução:**
```bash
# No terminal do Railway
npm install prisma @prisma/client
npx prisma generate
```

### Erro: "Database connection failed"

**Solução:**
1. Verifique se a variável `DATABASE_URL` está configurada corretamente
2. Certifique-se que o PostgreSQL está rodando
3. Execute: `npx prisma migrate deploy`

### Erro: "Build failed"

**Solução:**
1. Verifique os logs de build na aba "Deployments"
2. Certifique-se que todas as dependências estão no `package.json`
3. Rode localmente: `npm run build` para testar

### Erro: "Port already in use"

**Solução:**
- Railway configura a porta automaticamente via variável `$PORT`
- Certifique-se que o `server.js` usa: `process.env.PORT || 3000`

### Erro: "Prisma Client not initialized"

**Solução:**
```bash
npx prisma generate
```

### Aplicação muito lenta

**Solução:**
1. Verifique o plano do Railway (free tier tem limitações)
2. Otimize queries do Prisma
3. Adicione índices no banco de dados
4. Configure caching

## 📚 Recursos Adicionais

- [Documentação Railway](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)
- [Prisma Docs](https://www.prisma.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

## 🔄 Atualizações

Para fazer deploy de novas versões:

1. **Push para o GitHub**
   ```bash
   git add .
   git commit -m "Nova feature"
   git push origin main
   ```

2. **Railway deploy automático**
   - Railway detecta o push e faz deploy automaticamente
   - Acompanhe o progresso na aba "Deployments"

3. **Rollback se necessário**
   - Na aba "Deployments", clique em um deployment anterior
   - Clique em "Redeploy" para voltar para aquela versão

## ✅ Checklist Final

Antes de colocar em produção:

- [ ] Todas as variáveis de ambiente configuradas
- [ ] PostgreSQL conectado e funcionando
- [ ] Migrations executadas com sucesso
- [ ] Seed de dados inicial executado
- [ ] Login funcionando com credenciais padrão
- [ ] Todas as funcionalidades testadas
- [ ] Logs sem erros críticos
- [ ] Healthcheck respondendo (acesse `/api/health`)
- [ ] Performance aceitável
- [ ] Backup do banco de dados configurado

## 🎉 Pronto!

Seu sistema Audiovisual CRM está no ar! 🚀

Para suporte, entre em contato com a equipe de desenvolvimento.

---

**© 2024 IN-SIGHTS - Sistema de Produção Audiovisual**
