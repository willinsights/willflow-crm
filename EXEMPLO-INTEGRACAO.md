# 📝 Exemplo de Integração - TaskDetailsModal

## Como Integrar o Modal no Kanban

### 1. Imports

```typescript
import { useState } from 'react';
import TaskDetailsModal from '@/components/projects/TaskDetailsModal';
```

### 2. State

```typescript
const [selectedSubtask, setSelectedSubtask] = useState<any>(null);
```

### 3. Renderizar Subtasks com Click

```typescript
{project.subtasks?.map(subtask => (
  <div
    key={subtask.id}
    onClick={() => setSelectedSubtask(subtask)}
    className="cursor-pointer hover:bg-white/5"
  >
    {subtask.title}
  </div>
))}
```

### 4. Modal no Final do Componente

```typescript
{selectedSubtask && (
  <TaskDetailsModal
    open={!!selectedSubtask}
    onClose={() => setSelectedSubtask(null)}
    subtask={selectedSubtask}
    projectId={selectedSubtask.projectId}
    onUpdate={(updated) => {
      // Atualizar lista
      setSelectedSubtask(null);
    }}
    onDelete={() => {
      // Remover da lista
      setSelectedSubtask(null);
    }}
  />
)}
```

## Props do TaskDetailsModal

```typescript
interface TaskDetailsModalProps {
  open: boolean;           // ⚠️ Nota: é 'open', não 'isOpen'
  onClose: () => void;
  subtask: SubtaskDetailed | null;
  projectId?: string;
  onUpdate?: (subtask: SubtaskDetailed) => void;
  onDelete?: () => void;
}
```

## Exemplo Completo

Ver arquivo: `src/components/kanban/KanbanBoard.tsx`

Linhas relevantes:
- Import: linha ~14
- State: linha ~45
- Click handler: função `onSubtaskClick`
- Modal render: final do componente
