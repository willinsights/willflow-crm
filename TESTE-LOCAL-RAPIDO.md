# ⚡ Teste Local Rápido - 5 Minutos

## 🚀 Opção 1: Com Docker (Recomendado)

```bash
# 1. Iniciar setup automático
./setup-local.sh

# Isso vai:
# ✅ Iniciar PostgreSQL no Docker
# ✅ Aplicar migrations
# ✅ Gerar Prisma Client
# ✅ Deixar tudo pronto!

# 2. Iniciar servidor
bun run dev

# 3. Abrir navegador
# http://localhost:3000
```

**Pronto!** Em 5 minutos você terá:
- PostgreSQL rodando
- Banco configurado
- Sistema funcionando
- Modal de tarefas integrado

---

## 🔧 Opção 2: Sem Docker (Manual)

### Passo 1: Configurar Banco de Dados

Edite `.env`:

```env
# Opção A: PostgreSQL local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/willflow_crm"

# Opção B: Railway (usar banco de produção)
DATABASE_URL="postgresql://postgres:senha@containers-us-west-xxx.railway.app:5432/railway"
```

### Passo 2: Aplicar Migrations

```bash
bunx prisma migrate dev
```

### Passo 3: Gerar Prisma Client

```bash
bunx prisma generate
```

### Passo 4: Iniciar Servidor

```bash
bun run dev
```

---

## ✅ Como Testar o Modal de Task Details

### 1. Fazer Login

Abra `http://localhost:3000` e faça login (se necessário).

### 2. Ir para Projetos

Navegue até a view de projetos (Kanban).

### 3. Criar/Ver Projeto com Subtasks

Se não tiver subtasks, você pode:

**Opção A: Via Prisma Studio**
```bash
bunx prisma studio
# Abre em http://localhost:5555
# Crie uma subtask manualmente para testar
```

**Opção B: Via API**
```bash
# Criar subtask de exemplo
curl -X POST http://localhost:3000/api/projects/SEU_PROJECT_ID/subtasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Editar vídeo",
    "description": "Fazer edição completa do vídeo promocional",
    "priority": "high",
    "status": "in_progress"
  }'
```

### 4. Clicar na Subtask

No card do projeto, você verá uma seção "Tarefas" (se houver subtasks).

Clique em uma subtask → **Modal abre!** 🎉

### 5. Testar Funcionalidades

No modal:

- ✅ **Tab Detalhes**: Edite descrição, status, prioridade
- ✅ **Tab Checklist**: Adicione items, marque como completo
- ✅ **Tab Comentários**: Escreva comentários
- ✅ **Tab Histórico**: Veja as mudanças

---

## 🐛 Problemas Comuns

### ❌ Erro: Cannot connect to database

**Solução:**
```bash
# Se usando Docker:
docker-compose up -d postgres

# Aguardar PostgreSQL iniciar:
docker-compose logs -f postgres
# Esperar ver: "database system is ready to accept connections"
```

### ❌ Erro: Table doesn't exist

**Solução:**
```bash
bunx prisma migrate dev
bunx prisma generate
```

### ❌ Modal não abre

**Verificar:**
1. Projeto tem subtasks?
2. Console do navegador (F12) tem erros?
3. Prisma Client foi gerado? `bunx prisma generate`

### ❌ Subtasks não aparecem no card

**Verificar:**
1. Projeto tem subtasks no banco?
2. API retorna subtasks? Ver Network tab
3. Fazer fetch com include:
   ```typescript
   const project = await prisma.project.findUnique({
     where: { id },
     include: {
       subtasks: {
         include: {
           checklistItems: true,
           comments: true,
         }
       }
     }
   });
   ```

---

## 📊 Verificar que Está Funcionando

### 1. PostgreSQL Rodando

```bash
docker-compose ps
# Deve mostrar: willflow-postgres ... Up
```

### 2. Banco de Dados Criado

```bash
bunx prisma studio
# Abre em http://localhost:5555
# Ver tabelas: subtasks, subtask_checklist, subtask_comments, etc
```

### 3. API Funcionando

```bash
curl http://localhost:3000/api/health
# Deve retornar: {"status":"ok"}
```

### 4. Modal Renderizando

Abra DevTools (F12) → Console:
- Não deve ter erros vermelhos
- Se clicar em subtask, ver console.log de debug

---

## 🎯 Fluxo de Teste Completo

```
1. ./setup-local.sh                    (5 min)
   ↓
2. bun run dev                          (10 seg)
   ↓
3. Abrir http://localhost:3000          (imediato)
   ↓
4. Login (se necessário)                (10 seg)
   ↓
5. Ir para Projetos                     (5 seg)
   ↓
6. Clicar em subtask                    (5 seg)
   ↓
7. Modal abre! ✅                       (imediato)
   ↓
8. Testar todas as tabs                 (2 min)
   ↓
9. Funciona! 🎉                         (satisfação total)
```

**Tempo total:** ~8 minutos

---

## 💡 Dicas

### Ver Logs do Banco

```bash
docker-compose logs -f postgres
```

### Resetar Banco (se necessário)

```bash
docker-compose down -v
./setup-local.sh
```

### Ver Queries do Prisma

Adicione ao `.env`:
```env
DEBUG="prisma:query"
```

### Hot Reload Funciona!

Edite código → Salve → Página atualiza automaticamente

---

## 🚀 Depois de Testar

### Parar Servidor

```
Ctrl + C no terminal onde rodou `bun run dev`
```

### Parar PostgreSQL

```bash
docker-compose down
```

### Manter PostgreSQL Rodando

Se quiser deixar PostgreSQL rodando para próxima vez:
```bash
# Não faça docker-compose down
# Na próxima vez, só rode:
bun run dev
```

---

## ✅ Checklist de Teste

- [ ] PostgreSQL iniciado
- [ ] Migrations aplicadas
- [ ] Servidor rodando
- [ ] Login funcionando
- [ ] Projetos carregam
- [ ] Subtasks aparecem no card
- [ ] Clicar em subtask abre modal
- [ ] Tab Detalhes funciona
- [ ] Tab Checklist funciona
- [ ] Tab Comentários funciona
- [ ] Tab Histórico mostra dados
- [ ] Salvar mudanças funciona
- [ ] Fechar modal funciona
- [ ] Tudo funcionando! 🎉

---

## 🎉 Pronto!

Se tudo acima funcionou, seu ambiente local está **PERFEITO** e você pode:

1. Continuar desenvolvendo
2. Testar novas features
3. Fazer deploy no Railway quando quiser

**BOA SORTE! 🚀**
