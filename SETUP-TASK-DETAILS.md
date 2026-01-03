# 🎯 Setup - Sistema de Detalhes de Tarefas

## ✅ Arquivos Já Configurados

- ✅ Schema do Prisma expandido (`prisma/schema.prisma`)
- ✅ Componente Modal (`src/components/projects/TaskDetailsModal.tsx`)
- ✅ APIs REST (`src/app/api/subtasks/`)
- ✅ Documentação completa

---

## 🚀 Passos para Ativar

### 1️⃣ Configurar Database URL

Edite o arquivo `.env` (ou crie se não existir):

```bash
DATABASE_URL="postgresql://seu_usuario:sua_senha@seu_host:5432/willflow_crm"
```

**No Railway**, esta variável é fornecida automaticamente.

---

### 2️⃣ Aplicar Migrations

```bash
bunx prisma migrate deploy
```

Ou para desenvolvimento local:

```bash
bunx prisma migrate dev
```

Isso irá criar as novas tabelas:
- `subtask_checklist` - Items de checklist
- `subtask_comments` - Comentários
- `subtask_attachments` - Anexos
- `subtask_activity` - Histórico de atividades

E adicionar novos campos à tabela `subtasks`:
- `description` - Descrição detalhada
- `priority` - Prioridade (low, medium, high, urgent)
- `status` - Status (todo, in_progress, review, done)
- `dueDate` - Data de vencimento
- `assignedTo` - Responsável
- `estimatedHours` - Horas estimadas
- `actualHours` - Horas reais
- `tags` - Tags JSON
- `order` - Ordem para drag & drop

---

### 3️⃣ Gerar Prisma Client

```bash
bunx prisma generate
```

---

### 4️⃣ Integrar no Kanban

Abra o arquivo onde você renderiza as subtasks (provavelmente algo como `src/components/kanban/KanbanBoard.tsx` ou `src/app/projetos/page.tsx`).

Adicione o import:

```typescript
import { useState } from 'react';
import TaskDetailsModal from '@/components/projects/TaskDetailsModal';
```

Adicione o state:

```typescript
const [selectedSubtask, setSelectedSubtask] = useState<any>(null);
```

Adicione onClick nos cards de subtasks:

```typescript
<div
  onClick={() => setSelectedSubtask(subtask)}
  className="cursor-pointer"
>
  {subtask.title}
</div>
```

Adicione o modal no final do componente:

```typescript
{selectedSubtask && (
  <TaskDetailsModal
    isOpen={!!selectedSubtask}
    onClose={() => setSelectedSubtask(null)}
    subtask={selectedSubtask}
    projectId={selectedSubtask.projectId}
    onUpdate={(updated) => {
      // Atualizar lista de subtasks
      setSubtasks(prev =>
        prev.map(s => s.id === updated.id ? updated : s)
      );
      setSelectedSubtask(null);
    }}
    onDelete={() => {
      // Remover subtask da lista
      setSubtasks(prev =>
        prev.filter(s => s.id !== selectedSubtask.id)
      );
      setSelectedSubtask(null);
    }}
  />
)}
```

---

### 5️⃣ Testar

1. Inicie o servidor de desenvolvimento:
   ```bash
   bun run dev
   ```

2. Abra um projeto
3. Clique em uma subtask
4. O modal deve abrir com 4 tabs:
   - Detalhes
   - Checklist
   - Comentários
   - Histórico

---

## 📊 Estrutura de Dados

### Subtask Expandida

```typescript
{
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'todo' | 'in_progress' | 'review' | 'done'
  dueDate?: Date
  assignedTo?: string
  estimatedHours?: number
  actualHours?: number
  tags?: string[]
  order: number

  // Relações
  checklistItems: ChecklistItem[]
  comments: Comment[]
  attachments: Attachment[]
  activityLog: Activity[]
}
```

---

## 🔧 APIs Disponíveis

### Subtask CRUD

```typescript
GET    /api/subtasks/[id]              // Buscar detalhes
PUT    /api/subtasks/[id]              // Atualizar
DELETE /api/subtasks/[id]              // Deletar
```

### Checklist

```typescript
GET    /api/subtasks/[id]/checklist    // Listar items
POST   /api/subtasks/[id]/checklist    // Adicionar item
PUT    /api/subtasks/[id]/checklist/[itemId]  // Atualizar item
DELETE /api/subtasks/[id]/checklist/[itemId]  // Deletar item
```

### Comentários

```typescript
GET    /api/subtasks/[id]/comments     // Listar comentários
POST   /api/subtasks/[id]/comments     // Adicionar comentário
PUT    /api/subtasks/[id]/comments/[commentId]  // Editar
DELETE /api/subtasks/[id]/comments/[commentId]  // Deletar
```

### Anexos

```typescript
GET    /api/subtasks/[id]/attachments  // Listar anexos
POST   /api/subtasks/[id]/attachments  // Upload anexo
DELETE /api/subtasks/[id]/attachments/[attachmentId]  // Deletar
```

---

## 🎨 Customização

### Mudar Cores das Prioridades

Em `src/components/projects/TaskDetailsModal.tsx`, edite:

```typescript
const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800',
};
```

### Adicionar Novos Campos

1. Adicionar no schema:
   ```prisma
   model Subtask {
     // ... campos existentes
     customField String?
   }
   ```

2. Migrar:
   ```bash
   bunx prisma migrate dev
   ```

3. Adicionar no modal:
   ```tsx
   <Input
     value={subtask.customField}
     onChange={(e) => setSubtask({
       ...subtask,
       customField: e.target.value
     })}
   />
   ```

---

## 🐛 Troubleshooting

### Modal não abre

Verifique se:
1. O state `selectedSubtask` está sendo setado corretamente
2. O componente `Tabs` está instalado: `bunx shadcn@latest add tabs`
3. O modal está sendo renderizado condicionalmente

### Dados não salvam

1. Verifique se as APIs estão respondendo:
   ```bash
   curl http://localhost:3000/api/subtasks/ID_DA_SUBTASK
   ```

2. Verifique logs do console no navegador

3. Verifique se o Prisma Client foi gerado:
   ```bash
   bunx prisma generate
   ```

### TypeScript errors

1. Gere o Prisma Client novamente:
   ```bash
   bunx prisma generate
   ```

2. Restart do TypeScript server (VS Code):
   `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"

---

## 📚 Documentação Adicional

- Ver `INTEGRACAO-TASK-DETAILS.md` para guia completo
- Ver `RESUMO-TASK-DETAILS-SYSTEM.md` para visão geral

---

## ✅ Checklist de Verificação

- [ ] DATABASE_URL configurada
- [ ] Migrations aplicadas
- [ ] Prisma Client gerado
- [ ] Modal integrado no Kanban
- [ ] Tabs component instalado
- [ ] APIs testadas
- [ ] Modal abre ao clicar
- [ ] Todas as 4 tabs funcionam
- [ ] Checklist funciona
- [ ] Comentários funcionam
- [ ] Histórico aparece

---

**Status:** ✅ Pronto para uso (após configurar banco de dados)

**Próximo passo:** Configurar DATABASE_URL e rodar migrations
