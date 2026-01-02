# 🎯 Guia de Integração - Sistema de Detalhes de Tarefas

## 📋 Índice

1. [Atualizar Schema do Prisma](#1-atualizar-schema-do-prisma)
2. [Migrar Banco de Dados](#2-migrar-banco-de-dados)
3. [Instalar Componente Tabs](#3-instalar-componente-tabs)
4. [Integrar com Kanban](#4-integrar-com-kanban)
5. [Testar Funcionalidades](#5-testar-funcionalidades)
6. [Deploy](#6-deploy)

---

## 1️⃣ Atualizar Schema do Prisma

### Passo 1.1: Abrir `prisma/schema.prisma`

Localize o model `Subtask` (provavelmente linha 102) e **substitua** por:

```prisma
model Subtask {
  id          String    @id @default(uuid())
  projectId   String

  // Básico
  title       String
  description String?   @db.Text // ✨ NOVO
  completed   Boolean   @default(false)

  // Metadados
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  completedAt DateTime?

  // ✨ NOVOS CAMPOS
  priority    String    @default("medium") // low, medium, high, urgent
  status      String    @default("todo")    // todo, in_progress, review, done
  dueDate     DateTime?
  assignedTo  String?

  // Estimativas
  estimatedHours Int?
  actualHours    Int?

  // Tags (JSON array)
  tags        String?   @db.Text

  // Ordem para drag & drop
  order       Int       @default(0)

  // Relações
  project         Project            @relation(fields: [projectId], references: [id], onDelete: Cascade)
  checklistItems  SubtaskChecklist[]
  comments        SubtaskComment[]
  attachments     SubtaskAttachment[]
  activityLog     SubtaskActivity[]

  @@index([projectId])
  @@index([status])
  @@index([priority])
  @@index([assignedTo])
  @@index([dueDate])
  @@map("subtasks")
}

// ✨ NOVO MODEL - Checklist Items
model SubtaskChecklist {
  id          String    @id @default(uuid())
  subtaskId   String
  title       String
  completed   Boolean   @default(false)
  order       Int       @default(0)
  createdAt   DateTime  @default(now())
  completedAt DateTime?
  completedBy String?

  subtask     Subtask   @relation(fields: [subtaskId], references: [id], onDelete: Cascade)

  @@index([subtaskId])
  @@map("subtask_checklist")
}

// ✨ NOVO MODEL - Comentários
model SubtaskComment {
  id        String   @id @default(uuid())
  subtaskId String
  content   String   @db.Text
  createdBy String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isEdited  Boolean  @default(false)
  mentions  String?  @db.Text

  subtask   Subtask  @relation(fields: [subtaskId], references: [id], onDelete: Cascade)

  @@index([subtaskId])
  @@index([createdBy])
  @@map("subtask_comments")
}

// ✨ NOVO MODEL - Anexos
model SubtaskAttachment {
  id         String   @id @default(uuid())
  subtaskId  String
  fileName   String
  fileSize   Int
  fileType   String
  fileUrl    String   @db.Text
  uploadedBy String
  uploadedAt DateTime @default(now())

  subtask    Subtask  @relation(fields: [subtaskId], references: [id], onDelete: Cascade)

  @@index([subtaskId])
  @@map("subtask_attachments")
}

// ✨ NOVO MODEL - Histórico de Atividades
model SubtaskActivity {
  id         String   @id @default(uuid())
  subtaskId  String
  action     String
  field      String?
  oldValue   String?  @db.Text
  newValue   String?  @db.Text
  userId     String
  createdAt  DateTime @default(now())

  subtask    Subtask  @relation(fields: [subtaskId], references: [id], onDelete: Cascade)

  @@index([subtaskId])
  @@index([action])
  @@index([createdAt])
  @@map("subtask_activity")
}
```

---

## 2️⃣ Migrar Banco de Dados

### Passo 2.1: Gerar e Aplicar Migration

```bash
# Gerar migration
bunx prisma migrate dev --name add-subtask-details

# OU se já estiver em produção, use:
bunx prisma db push
```

### Passo 2.2: Gerar Prisma Client

```bash
bunx prisma generate
```

### Passo 2.3: Verificar que as Tabelas Foram Criadas

```bash
bunx prisma studio
```

Verifique se as novas tabelas aparecem:
- `subtask_checklist`
- `subtask_comments`
- `subtask_attachments`
- `subtask_activity`

---

## 3️⃣ Instalar Componente Tabs

O modal usa o componente `Tabs` do shadcn/ui. Se ainda não instalou:

```bash
bunx shadcn@latest add tabs
```

---

## 4️⃣ Integrar com Kanban

### Passo 4.1: Abrir `src/components/kanban/KanbanBoard.tsx`

Localize onde você renderiza os cards de subtasks e adicione o click handler:

```tsx
import { useState } from 'react';
import TaskDetailsModal from '@/components/projects/TaskDetailsModal';

export default function KanbanBoard() {
  const [selectedSubtask, setSelectedSubtask] = useState<any>(null);

  // ... resto do código

  return (
    <>
      {/* Seu código existente do Kanban */}

      {/* Renderizar subtasks com onClick */}
      {subtasks.map(subtask => (
        <div
          key={subtask.id}
          onClick={() => setSelectedSubtask(subtask)}
          className="cursor-pointer hover:bg-gray-50 p-3 border rounded"
        >
          {subtask.title}
        </div>
      ))}

      {/* Modal de Detalhes */}
      {selectedSubtask && (
        <TaskDetailsModal
          isOpen={!!selectedSubtask}
          onClose={() => setSelectedSubtask(null)}
          subtask={selectedSubtask}
          projectId={selectedSubtask.projectId}
          onUpdate={(updated) => {
            // TODO: Atualizar lista de subtasks
            setSelectedSubtask(null);
          }}
          onDelete={() => {
            // TODO: Deletar subtask
            setSelectedSubtask(null);
          }}
        />
      )}
    </>
  );
}
```

### Passo 4.2: Atualizar Fetch de Subtasks

Quando buscar subtasks, inclua os dados relacionados:

```tsx
// Exemplo de fetch
const fetchSubtasks = async (projectId: string) => {
  const response = await fetch(`/api/projects/${projectId}/subtasks`);
  const subtasks = await response.json();
  return subtasks;
};

// Ou se usar Prisma diretamente:
const subtasks = await prisma.subtask.findMany({
  where: { projectId },
  include: {
    checklistItems: true,
    comments: {
      orderBy: { createdAt: 'desc' },
      take: 10, // Últimos 10 comentários
    },
    attachments: true,
  },
  orderBy: { order: 'asc' },
});
```

---

## 5️⃣ Testar Funcionalidades

### Teste 1: Abrir Modal
1. Clique em uma subtask no Kanban
2. Modal deve abrir com as 4 tabs

### Teste 2: Editar Detalhes
1. Clique em "Editar"
2. Altere título, descrição, status, prioridade
3. Clique em "Salvar"
4. Verifique se salvou no banco

### Teste 3: Checklist
1. Vá na tab "Checklist"
2. Adicione alguns itens
3. Marque/desmarque itens
4. Veja o progresso atualizar

### Teste 4: Comentários
1. Vá na tab "Comentários"
2. Escreva um comentário
3. Clique em "Comentar"
4. Veja aparecer na lista

### Teste 5: Histórico
1. Faça algumas mudanças na tarefa
2. Vá na tab "Histórico"
3. Veja as atividades registradas

---

## 6️⃣ Deploy

### Passo 6.1: Commit das Mudanças

```bash
git add .
git commit -m "feat: Add detailed task modal with checklist, comments and activity log"
git push
```

### Passo 6.2: Migration em Produção

Se usar Railway com auto-deploy:

```bash
# Railway executará automaticamente:
# bunx prisma migrate deploy
```

Ou manualmente:

```bash
# Na Railway, execute:
bunx prisma db push
```

---

## 🎨 Customizações Opcionais

### 1. Adicionar Upload de Arquivos

No modal, na seção de anexos, adicione:

```tsx
<input
  type="file"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Upload para seu storage (AWS S3, Cloudinary, etc)
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const { url } = await res.json();

    // Criar attachment no banco
    await fetch(`/api/subtasks/${subtask.id}/attachments`, {
      method: 'POST',
      body: JSON.stringify({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: url,
      }),
    });
  }}
/>
```

### 2. Adicionar Menções (@usuario)

No textarea de comentários:

```tsx
// Detectar @ e mostrar autocomplete
const handleCommentChange = (text: string) => {
  const words = text.split(' ');
  const lastWord = words[words.length - 1];

  if (lastWord.startsWith('@')) {
    // Mostrar lista de usuários
    setShowUserMentions(true);
    setMentionFilter(lastWord.substring(1));
  }
};
```

### 3. Dark Mode

O modal já suporta dark mode através do Tailwind CSS. Para ativar:

```tsx
// Em seu layout.tsx ou ThemeProvider
<html className="dark">
```

### 4. Notificações em Tempo Real

Quando alguém comentar, notifique outros usuários:

```tsx
// Após criar comentário
await fetch('/api/notifications', {
  method: 'POST',
  body: JSON.stringify({
    userId: subtask.assignedTo,
    message: `${currentUser} comentou em "${subtask.title}"`,
    link: `/projects/${subtask.projectId}?subtask=${subtask.id}`,
  }),
});
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'tabs'"

```bash
bunx shadcn@latest add tabs
```

### Erro: Prisma Client desatualizado

```bash
bunx prisma generate
```

### Modal não abre

Verifique se o state está correto:
```tsx
console.log('selectedSubtask:', selectedSubtask);
console.log('isOpen:', !!selectedSubtask);
```

### Dados não salvam

1. Verifique se as APIs estão respondendo:
```bash
curl http://localhost:3000/api/subtasks/123
```

2. Verifique logs do console:
```tsx
console.error('Erro ao salvar:', error);
```

---

## 📚 Próximos Passos

Após integrar com sucesso:

1. ✅ Adicionar testes (Vitest)
2. ✅ Implementar upload de arquivos real
3. ✅ Adicionar notificações push
4. ✅ Implementar menções de usuários
5. ✅ Adicionar filtros e busca
6. ✅ Exportar dados da tarefa (PDF)

---

## 🎉 Pronto!

Seu sistema agora tem:

- ✅ Modal de detalhes rico
- ✅ Checklist com progresso
- ✅ Sistema de comentários
- ✅ Anexos
- ✅ Histórico de atividades
- ✅ Status e prioridades
- ✅ Estimativas de horas
- ✅ Tags
- ✅ Data de vencimento

**Qualquer dúvida, consulte este guia!**
