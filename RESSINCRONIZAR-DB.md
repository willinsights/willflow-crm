# 🔄 Como Ressincronizar com Railway PostgreSQL

## ❌ Problema

Projetos não aparecem no sistema em produção (https://will-flow.up.railway.app)

## ✅ Solução

Vamos verificar e popular o banco de dados Railway PostgreSQL.

---

## 📋 Passo 1: Pegar a DATABASE_URL do Railway

1. **Acesse o Railway Dashboard**: https://railway.app
2. **Entre no projeto**: WillFlow CRM
3. **Clique no serviço PostgreSQL** (não no Next.js)
4. **Vá em "Variables"** ou **"Connect"**
5. **Copie a DATABASE_URL** completa

Deve ser algo como:
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:PORT/railway
```

---

## 📋 Passo 2: Executar Migrations e Seed

### Opção A: Via Railway CLI (Recomendado)

```bash
# Instalar Railway CLI (se não tiver)
npm install -g @railway/cli

# Login
railway login

# Link ao projeto
railway link

# Executar migrations
railway run npx prisma migrate deploy

# Popular banco de dados
railway run bun run scripts/check-railway-db.ts
```

---

### Opção B: Localmente com DATABASE_URL do Railway

**1. Configure a DATABASE_URL temporariamente:**

```bash
cd willflow-crm-atual

# Editar .env (CUIDADO: não commitar isso!)
echo "DATABASE_URL='postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:PORT/railway'" > .env.railway
```

Substitua pela URL real copiada do Railway.

**2. Execute as migrations:**

```bash
# Carregar .env.railway
export $(cat .env.railway | xargs)

# Executar migrations
bun prisma migrate deploy

# Gerar Prisma Client
bun prisma generate
```

**3. Popular o banco:**

```bash
# Verificar e popular banco
bun run scripts/check-railway-db.ts
```

**4. Limpar .env.railway (IMPORTANTE):**

```bash
rm .env.railway
```

---

## 📋 Passo 3: Verificar no Railway

Após executar, verifique:

```bash
# Via Railway CLI
railway run npx prisma studio
```

Isso abrirá uma interface web para visualizar os dados do banco Railway.

**Ou acesse**: https://will-flow.up.railway.app e faça login:
- Email: admin@willflow.com
- Senha: admin123

---

## 🎯 O Que o Script Faz

O script `check-railway-db.ts` vai:

1. ✅ **Conectar** ao Railway PostgreSQL
2. ✅ **Verificar** se há dados
3. ✅ **Criar** (se não existir):
   - 1 usuário admin
   - 4 categorias (Hotel, Experiência, Drone, Reels)
   - 3 clientes
   - 3 projetos de exemplo
4. ✅ **Mostrar** resumo dos dados

---

## 📊 Dados que Serão Criados

### Usuário Admin
- Nome: Administrador
- Email: admin@willflow.com
- Permissões: Full access

### Categorias
1. Hotel (azul)
2. Experiência (verde)
3. Drone (laranja)
4. Reels (vermelho)

### Clientes
1. Ana Silva - Hotel Vista Mar
2. João Santos - Experiências Portugal
3. Maria Costa - Resort Algarve

### Projetos
1. **Vídeo Promocional Hotel Vista Mar**
   - Fase: Edição
   - Status: Em Edição
   - Preço: €2.500
   - Margem: €1.200

2. **Tour Virtual Resort Algarve**
   - Fase: Captação
   - Status: Agendado
   - Preço: €3.500
   - Margem: €1.500

3. **Reels Experiências Portugal**
   - Fase: Edição
   - Status: Revisão Cliente
   - Preço: €1.500
   - Margem: €800

---

## 🚨 Troubleshooting

### Erro: "Cannot connect to database"

**Solução**: Verifique se a DATABASE_URL está correta
- Deve começar com `postgresql://`
- Deve ter o host correto do Railway
- Deve ter a senha correta

### Erro: "Schema not in sync"

**Solução**: Execute as migrations primeiro
```bash
railway run npx prisma migrate deploy
```

### Erro: "Permission denied"

**Solução**: Verifique se o usuário PostgreSQL tem permissões
- O Railway deve ter criado automaticamente
- Tente recriar o serviço PostgreSQL se necessário

---

## ✅ Verificação Final

Após executar tudo:

1. **Acesse**: https://will-flow.up.railway.app
2. **Login**: admin@willflow.com / admin123
3. **Vá em**: Dashboard
4. **Deve mostrar**: 3 projetos, 3 clientes
5. **Vá em**: Projetos → Edição
6. **Deve mostrar**: 2 projetos (1 em edição, 1 em revisão)
7. **Clique** num projeto → Painel deve abrir!

---

## 💡 Nota Importante

**NÃO commite o arquivo `.env.railway` com a DATABASE_URL do Railway!**

Ele contém credenciais sensíveis. Use apenas localmente e delete após o uso.

---

## 🎉 Pronto!

Seu banco de dados Railway está sincronizado e pronto para uso! 🚀
