# Guia de Migração: Sistema de Colunas Kanban Personalizável

## 📋 Resumo das Mudanças

Este PR implementa um sistema de colunas Kanban personalizáveis com regras específicas:

- ✅ Colunas organizadas por organização (`organizationId`)
- ✅ Coluna "Entregue" bloqueada (sempre última, não pode ser movida/renomeada/removida)
- ✅ Administradores podem criar, renomear e reordenar outras colunas
- ✅ **Removidas** ações de massa ("Mover todos para X")
- ✅ Novos fluxos padrão para Captação e Edição

## 🔄 Fluxos Padrão

### Captação
```
A agendar → Agendado → Em execução → Entregue 🔒
```

### Edição
```
A iniciar → Em edição → Em revisão → Entregue 🔒
```

## 🗄️ Mudanças no Schema (Prisma)

### Modelo `KanbanColumn` - NOVO

```prisma
model KanbanColumn {
  id             String   @id @default(uuid())
  organizationId String   @default("default")
  phase          String   // CAPTACAO | EDICAO
  title          String   
  position       Int      @default(0)
  isLocked       Boolean  @default(false)
  systemKey      String?  // DELIVERED para coluna "Entregue"
  color          String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@unique([organizationId, phase, systemKey])
  @@unique([organizationId, phase, title])
  @@index([organizationId, phase])
  @@map("kanban_columns")
}
```

### Campos Anteriores (Removidos)
- `statusKey` → renomeado para `title`
- `customName` → removido (agora usa `title` diretamente)
- `order` → renomeado para `position`

## 🚀 Passos de Migração

### 1. Preparar o Ambiente

```bash
# Pull das mudanças
git pull origin copilot/implement-kanban-rules

# Instalar dependências (caso necessário)
npm install
```

### 2. Migração do Banco de Dados

#### Opção A: Development (Sincronizar Schema)

```bash
# Gera o Prisma Client e sincroniza o schema
npm run db:push
```

⚠️ **ATENÇÃO**: Isto pode causar perda de dados nas tabelas `kanban_columns` existentes!

#### Opção B: Production (Criar Migração)

```bash
# Criar migração
npx prisma migrate dev --name add_kanban_column_structure

# Aplicar em produção
npx prisma migrate deploy
```

### 3. Popular Colunas Padrão

Após aplicar o schema, execute o seed para criar as colunas padrão:

```bash
npm run db:seed
```

Ou chame o endpoint de bootstrap via API:

```bash
curl -X POST http://localhost:3000/api/kanban/columns/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"default"}'
```

### 4. Verificar a Aplicação

```bash
# Build de produção
npm run build

# Iniciar servidor
npm start
```

## 📝 Migração de Dados Existentes

### Projetos com Status Antigos

Os projetos existentes continuarão funcionando porque os tipos foram atualizados para manter retrocompatibilidade:

```typescript
// Novos status
export type StatusCaptacao = 
  | 'a-agendar'     // NOVO
  | 'agendado' 
  | 'em-execucao'   // NOVO (era 'em-gravacao')
  | 'entregue'
  // Mantidos para compatibilidade
  | 'em-gravacao'
  | 'upload-nas'
  | 'concluido'

export type StatusEdicao = 
  | 'a-iniciar'     // NOVO
  | 'em-edicao'
  | 'em-revisao'    // NOVO
  | 'entregue'
  // Mantidos para compatibilidade
  | 'receber-ficheiros'
  | 'decupagem'
  | 'feedback'
  | 'revisao-cliente'
```

### Script de Migração de Status (Opcional)

Se quiser migrar projetos existentes para os novos status:

```sql
-- Exemplo: Migrar status de captação
UPDATE projects 
SET "statusCaptacao" = 'em-execucao' 
WHERE "statusCaptacao" = 'em-gravacao';

-- Migrar status de edição
UPDATE projects 
SET "statusEdicao" = 'em-revisao' 
WHERE "statusEdicao" = 'revisao-cliente';
```

## 🔍 Testes de Validação

### 1. Testar Bootstrap Automático
- Limpar tabela `kanban_columns`
- Acessar `/` (página principal)
- Verificar se colunas são criadas automaticamente

### 2. Testar Regras de Bloqueio

#### Coluna "Entregue"

```bash
# ❌ Deve falhar - Tentar renomear
curl -X POST http://localhost:3000/api/kanban/columns \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId":"default",
    "phase":"CAPTACAO",
    "title":"Finalizado",
    "columnId":"<id-da-coluna-entregue>"
  }'
# Esperado: {"success":false,"error":"A coluna \"Entregue\" não pode ser renomeada"}

# ❌ Deve falhar - Tentar remover
curl -X DELETE "http://localhost:3000/api/kanban/columns?columnId=<id-entregue>"
# Esperado: {"success":false,"error":"A coluna \"Entregue\" não pode ser removida"}

# ❌ Deve falhar - Criar coluna após "Entregue"
curl -X POST http://localhost:3000/api/kanban/columns \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId":"default",
    "phase":"CAPTACAO",
    "title":"Nova Coluna",
    "position":99
  }'
# Esperado: {"success":false,"error":"Não é possível criar colunas após..."}
```

### 3. Testar UI

#### No navegador:
1. Tentar arrastar coluna "Entregue" → Deve mostrar toast de erro
2. Tentar editar nome de "Entregue" → Deve mostrar toast de erro
3. Criar nova coluna → Deve aparecer antes de "Entregue"
4. Reordenar colunas → "Entregue" deve ficar sempre no final
5. Verificar que **NÃO** aparecem as opções:
   - "Mover todos para próximo"
   - "Mover todos para..."
   - "Restaurar colunas"

## 🐛 Troubleshooting

### Erro: "Column already exists"

```bash
# Limpar colunas duplicadas
npx prisma studio
# Deletar manualmente registros duplicados na tabela kanban_columns
```

### Erro: "Cannot find name 'isDeliveredColumn'"

```bash
# Recompilar TypeScript
npm run build
```

### Colunas não aparecem na UI

```bash
# Verificar se bootstrap foi executado
curl http://localhost:3000/api/kanban/columns?phase=CAPTACAO

# Se vazio, executar bootstrap
curl -X POST http://localhost:3000/api/kanban/columns/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"default"}'
```

## 📚 Endpoints da API

### GET /api/kanban/columns
Lista colunas de uma fase

```bash
curl "http://localhost:3000/api/kanban/columns?phase=CAPTACAO&organizationId=default"
```

### POST /api/kanban/columns/bootstrap
Cria colunas padrão

```bash
curl -X POST http://localhost:3000/api/kanban/columns/bootstrap \
  -H "Content-Type: application/json" \
  -d '{"organizationId":"default"}'
```

### POST /api/kanban/columns
Cria ou atualiza coluna

```bash
curl -X POST http://localhost:3000/api/kanban/columns \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId":"default",
    "phase":"CAPTACAO",
    "title":"Nova Coluna",
    "position":2,
    "color":"#3B82F6"
  }'
```

### PUT /api/kanban/columns
Reordena colunas

```bash
curl -X PUT http://localhost:3000/api/kanban/columns \
  -H "Content-Type: application/json" \
  -d '{
    "organizationId":"default",
    "phase":"CAPTACAO",
    "columnIds":["id1","id2","id3","id-entregue"]
  }'
```

### DELETE /api/kanban/columns
Remove coluna (apenas não-bloqueadas)

```bash
curl -X DELETE "http://localhost:3000/api/kanban/columns?columnId=<column-id>"
```

## ✅ Checklist de Deploy

- [ ] Backup do banco de dados
- [ ] Aplicar migração do Prisma (`prisma db push` ou `prisma migrate deploy`)
- [ ] Executar seed para criar colunas padrão (`npm run db:seed`)
- [ ] Rebuild da aplicação (`npm run build`)
- [ ] Testes de smoke (abrir kanban, mover projetos)
- [ ] Validar que coluna "Entregue" está bloqueada
- [ ] Verificar que ações de massa foram removidas
- [ ] Monitorar logs de erro nas primeiras horas

## 🆘 Suporte

Se encontrar problemas, reverta para a branch anterior:

```bash
git checkout main
npm install
npm run build
npm start
```

E reporte o erro com:
- Logs do servidor
- Screenshots da UI (se aplicável)
- Mensagens de erro do browser console
