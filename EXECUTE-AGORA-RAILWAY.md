# ⚡ EXECUTE AGORA - Ressincronizar Railway DB

## 🎯 Passos Rápidos (2 minutos)

### 1️⃣ Instalar Railway CLI

```bash
npm install -g @railway/cli
```

### 2️⃣ Login no Railway

```bash
railway login
```

Vai abrir o navegador para você fazer login.

### 3️⃣ Linkar ao Projeto

```bash
cd /home/project/willflow-crm-atual
railway link
```

Escolha o projeto **WillFlow CRM** quando perguntado.

### 4️⃣ Executar Migrations

```bash
railway run npx prisma migrate deploy
```

Isso vai criar todas as tabelas no PostgreSQL do Railway.

### 5️⃣ Popular Banco de Dados

```bash
railway run bun run db:check-railway
```

Isso vai:
- ✅ Verificar conexão com Railway PostgreSQL
- ✅ Criar usuário admin
- ✅ Criar 4 categorias
- ✅ Criar 3 clientes
- ✅ Criar 3 projetos de exemplo

### 6️⃣ Verificar

Acesse: https://will-flow.up.railway.app

Login:
- Email: `admin@willflow.com`
- Senha: `admin123`

**Deve aparecer**:
- 3 projetos no Dashboard
- 2 projetos em "Projetos → Edição"
- 1 projeto em "Projetos → Captação"

---

## 🚀 Pronto!

Seu banco Railway está sincronizado! 🎉

---

## 💡 Se der erro "railway: command not found"

Use NPX:
```bash
npx @railway/cli login
npx @railway/cli link
npx @railway/cli run npx prisma migrate deploy
npx @railway/cli run bun run db:check-railway
```

---

## 📊 O Que Foi Criado

**Projetos**:
1. Vídeo Promocional Hotel Vista Mar (€2.500) - Em Edição
2. Tour Virtual Resort Algarve (€3.500) - Agendado (Captação)
3. Reels Experiências Portugal (€1.500) - Revisão Cliente

**Clientes**:
1. Ana Silva - Hotel Vista Mar
2. João Santos - Experiências Portugal
3. Maria Costa - Resort Algarve

**Categorias**:
- Hotel (azul)
- Experiência (verde)
- Drone (laranja)
- Reels (vermelho)

**Usuário Admin**:
- Email: admin@willflow.com
- Senha: admin123
- Permissões: Full access

---

## ✅ Depois de Sincronizar

Você pode:
1. Clicar em qualquer projeto → Painel modal abre
2. Criar novos projetos
3. Editar informações
4. Ver dashboard atualizado
5. Testar todas as features!

🎉 **SISTEMA PRONTO PARA USO!**
