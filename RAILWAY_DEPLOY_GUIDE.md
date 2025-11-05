# 🚂 Deploy Railway - WillFlow CRM

## ✅ PRÉ-REQUISITOS CONCLUÍDOS
- ✅ Código no GitHub: https://github.com/willinsights/willflow-crm
- ✅ Commit: c07afb4
- ✅ PostgreSQL configurado no Railway
- ✅ Project ID: e3a3fe19-4fd9-4ffb-9edc-4563926fd9ac

---

## 🚀 PASSO A PASSO PARA DEPLOY

### 1. Abrir Projeto Railway
**Link direto**: https://railway.app/project/e3a3fe19-4fd9-4ffb-9edc-4563926fd9ac

### 2. Adicionar Serviço GitHub

1. Clicar em **"+ New"** (botão roxo no canto superior direito)
2. Selecionar **"GitHub Repo"**
3. Se pedir autorização, autorizar Railway no GitHub
4. Selecionar o repositório: **`willinsights/willflow-crm`**
5. Clicar em **"Deploy Now"**

### 3. Configurar Variáveis de Ambiente

Railway detecta Next.js automaticamente, mas precisa das variáveis:

**No serviço recém-criado:**
1. Clicar no serviço (card que apareceu)
2. Ir em **"Variables"**
3. Clicar em **"+ New Variable"**

**Adicionar estas variáveis:**

```env
# Banco de dados (copiar do PostgreSQL)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Produção
NODE_ENV=production

# URL pública (vai aparecer depois do deploy)
NEXT_PUBLIC_APP_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

**DICA**: Use `${{Postgres.DATABASE_URL}}` para referenciar automaticamente!

### 4. Configurar Settings

**No serviço, ir em "Settings":**

#### Build Command (deve detectar automaticamente):
```bash
prisma generate && next build
```

#### Start Command (deve detectar automaticamente):
```bash
node server.js
```

#### Root Directory:
```
/ (deixar vazio ou /)
```

### 5. Habilitar Domain Público

1. No serviço, ir em **"Settings"**
2. Seção **"Networking"**
3. Clicar em **"Generate Domain"**
4. Railway vai gerar algo como: `willflow-crm-production.up.railway.app`

### 6. Deploy Automático

 Já está configurado!
- Cada `git push` no GitHub = deploy automático
- Railway detecta o push e faz build + deploy

---

## 🔧 VERIFICAR DEPLOY

### Logs do Build
1. Clicar no serviço
2. Aba **"Deployments"**
3. Clicar no deploy mais recente
4. Ver logs em tempo real

### O que esperar nos logs:
```
 Prisma Client generated
 Next.js build completed
 Server started on :3000
 Deployment successful
```

### Acessar o Sistema
Depois do deploy:
- URL: `https://SEU-DOMINIO.up.railway.app`
- Login: `admin@in-sights.pt` / `admin123`

---

## ⚡ CONFIGURAÇÃO RÁPIDA (Alternativa)

Se Railway já detectou tudo automaticamente:

1. ✅ Verificar que `DATABASE_URL` está referenciando PostgreSQL
2. ✅ Gerar domínio público
3. ✅ Aguardar primeiro deploy (3-5 minutos)

---

## 🐛 TROUBLESHOOTING

### Deploy falhou - "Prisma not found"
**Solução**: Adicionar build command:
```bash
npm install && prisma generate && next build
```

### Erro "DATABASE_URL not set"
**Solução**: Verificar variável aponta para:
```
${{Postgres.DATABASE_URL}}
```

### Erro "Port already in use"
**Solução**: Railway usa variável `PORT` automaticamente
Verificar que `server.js` usa `process.env.PORT`

### Site não carrega / 404
**Solução**: 
1. Verificar se domínio foi gerado
2. Esperar propagação DNS (1-2 minutos)
3. Verificar logs do deploy

---

## 📊 MONITORAMENTO

### Métricas Disponíveis
- CPU Usage
- Memory Usage
- Network I/O
- Build Time
- Response Time

### Acessar Métricas:
1. Clicar no serviço
2. Aba **"Metrics"**

---

## 🔄 REDEPLOY MANUAL

Se precisar forçar novo deploy:

1. Ir no serviço
2. Aba **"Deployments"**
3. Clicar em **"⋮"** no deploy
4. **"Redeploy"**

---

## 🎯 CHECKLIST DEPLOY

- [ ] Serviço GitHub criado no Railway
- [ ] Variável DATABASE_URL configurada
- [ ] Variável NODE_ENV=production
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Domínio público gerado
- [ ] Primeiro deploy concluído
- [ ] Site acessível
- [ ] Login funcionando
- [ ] Banco de dados conectado

---

## 📞 SUPORTE

**Railway Docs**: https://docs.railway.app
**Railway Discord**: https://discord.gg/railway
**GitHub Repo**: https://github.com/willinsights/willflow-crm

---

**Última atualização**: 04/11/2025, 23:50
**Versão**: 25
**Commit**: c07afb4
**Status**: ⏳ Aguardando deploy no Railway
