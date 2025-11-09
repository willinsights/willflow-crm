# 🚀 WillFlow CRM - Setup GitHub e PostgreSQL

## 📦 Commit Realizado

✅ Commit `90fc921` criado com sucesso!
✅ 92 arquivos commitados
✅ Sistema completo: Logo, CRUD, Categorias, Otimizações

---

## 🐙 Push para GitHub

### Opção 1: Usando GitHub CLI (Recomendado)

```bash
# 1. Autenticar no GitHub
gh auth login

# 2. Criar repositório
gh repo create willflow-crm --private --source=. --remote=origin --push

# Ou se já tiver um repositório:
gh repo create willflow-crm --private
git remote add origin https://github.com/SEU_USERNAME/willflow-crm.git
git branch -M main
git push -u origin main
```

### Opção 2: Manualmente via Web

```bash
# 1. Ir para https://github.com/new
# 2. Nome do repositório: willflow-crm
# 3. Privado: Sim
# 4. NÃO inicializar com README (já temos código)
# 5. Criar repositório

# 6. Depois, no terminal:
git remote add origin https://github.com/SEU_USERNAME/willflow-crm.git
git branch -M main
git push -u origin main
```

---

## 🐘 Conectar PostgreSQL

### 1. Obter DATABASE_URL

**Opção A: Railway (Recomendado)**
```bash
# Railway fornece PostgreSQL grátis
# 1. Ir para railway.app
# 2. New Project > Deploy PostgreSQL
# 3. Copiar DATABASE_URL das variáveis
```

**Opção B: Supabase**
```bash
# 1. Ir para supabase.com
# 2. New Project
# 3. Settings > Database > Connection String (URI)
```

**Opção C: Neon.tech**
```bash
# 1. Ir para neon.tech
# 2. New Project
# 3. Copiar connection string
```

### 2. Configurar no Projeto

```bash
# Editar arquivo .env
cd audiovisual-crm
nano .env

# Adicionar:
DATABASE_URL="postgresql://user:password@host:5432/database"
```

### 3. Executar Migrações

```bash
# Push do schema para o banco
bun run prisma db push

# Ver banco no Prisma Studio (opcional)
bun run prisma studio
```

### 4. Seed de Dados Iniciais (Opcional)

```bash
# Popular banco com dados de exemplo
bun run prisma db seed
```

---

## 🚂 Deploy no Railway

### Conectar GitHub ao Railway

```bash
# 1. Ir para railway.app
# 2. New Project > Deploy from GitHub repo
# 3. Selecionar: willflow-crm
# 4. Railway vai detectar Next.js automaticamente

# 5. Adicionar PostgreSQL:
#    - No projeto Railway, clicar "+ New"
#    - Selecionar "Database" > "Add PostgreSQL"
#    - Railway vai adicionar DATABASE_URL automaticamente

# 6. Variáveis de ambiente (adicionar manualmente se necessário):
#    - DATABASE_URL (já adicionada automaticamente)
#    - NODE_ENV=production
```

### Railway vai auto-deployar quando você fizer push!

```bash
git push origin main
# Railway detecta o push e faz deploy automático
```

---

## ✅ Checklist de Setup

- [ ] Commit realizado (✅ Já feito!)
- [ ] Push para GitHub
- [ ] PostgreSQL configurado
- [ ] Variável DATABASE_URL no .env
- [ ] `prisma db push` executado
- [ ] Deploy no Railway conectado
- [ ] Sistema funcionando em produção

---

## 📝 Comandos Úteis

```bash
# Ver status do git
git status

# Ver histórico de commits
git log --oneline

# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão com banco
bun run prisma db pull

# Resetar banco (CUIDADO!)
bun run prisma migrate reset
```

---

## 🆘 Troubleshooting

### Erro: "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/SEU_USERNAME/willflow-crm.git
```

### Erro: "DATABASE_URL not set"
```bash
# Verificar se .env existe
cat .env

# Verificar se variável está configurada
echo $DATABASE_URL
```

### Railway não detecta Next.js
```bash
# Verificar package.json tem scripts:
# "build": "prisma generate && next build"
# "start": "node server.js"
```

---

## 📞 Suporte

- Same Support: support@same.new
- Railway Docs: docs.railway.app
- Prisma Docs: prisma.io/docs

---

**Última atualização**: 04/11/2025, 22:40
**Versão**: 23
**Commit**: 90fc921
