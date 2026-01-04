'use client';

import { useState, useEffect } from 'react';
import { Plus, Check, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useAppStore } from '@/lib/useAppStore';

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  completedAt?: Date;
  completedBy?: string;
}

interface ChecklistTabProps {
  taskId: string | null;
  canEdit: boolean;
}

function SortableChecklistItem({
  item,
  onToggle,
  onDelete,
  canEdit,
}: {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  canEdit: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 group p-2 rounded-md hover:bg-muted/50"
    >
      {canEdit && (
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <Checkbox
        checked={item.completed}
        onCheckedChange={() => onToggle(item.id)}
        disabled={!canEdit}
      />

      <span className={`flex-1 ${item.completed ? 'line-through text-muted-foreground' : ''}`}>
        {item.title}
      </span>

      {item.completedBy && item.completed && (
        <span className="text-xs text-muted-foreground">
          {item.completedBy}
        </span>
      )}

      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

export default function ChecklistTab({ taskId, canEdit }: ChecklistTabProps) {
  const { currentUser } = useAppStore();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [adding, setAdding] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load checklist items from API
  useEffect(() => {
    if (!taskId) return;

    const loadChecklist = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${taskId}/checklist`);
        const result = await response.json();

        if (result.success && result.data) {
          setItems(result.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            completed: item.completed,
            order: item.order,
            completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
            completedBy: item.completedBy,
          })));
        } else {
          // Se não há dados, lista vazia
          setItems([]);
        }
      } catch (error) {
        console.error('Erro ao carregar checklist:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadChecklist();
  }, [taskId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((prevItems) => {
        const oldIndex = prevItems.findIndex((i) => i.id === active.id);
        const newIndex = prevItems.findIndex((i) => i.id === over.id);

        const newItems = arrayMove(prevItems, oldIndex, newIndex);

        // Update order in backend for each moved item
        newItems.forEach(async (item, index) => {
          try {
            await fetch(`/api/projects/${taskId}/checklist`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                itemId: item.id,
                order: index,
                userId: currentUser?.id,
                userName: currentUser?.name,
              }),
            });
          } catch (error) {
            console.error('Erro ao reordenar item:', error);
          }
        });

        return newItems;
      });
    }
  };

  const handleAdd = async () => {
    if (!newItemTitle.trim() || !taskId) return;

    setAdding(true);

    try {
      const response = await fetch(`/api/projects/${taskId}/checklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newItemTitle,
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const newItem: ChecklistItem = {
          id: result.data.id,
          title: result.data.title,
          completed: result.data.completed,
          order: result.data.order,
        };

        setItems([...items, newItem]);
        setNewItemTitle('');
      } else {
        console.error('Erro ao criar item:', result.error);
      }
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item || !taskId) return;

    const newCompleted = !item.completed;

    // Optimistic update
    setItems(items.map(i =>
      i.id === id
        ? {
            ...i,
            completed: newCompleted,
            completedAt: newCompleted ? new Date() : undefined,
            completedBy: newCompleted ? currentUser?.name : undefined,
          }
        : i
    ));

    try {
      await fetch(`/api/projects/${taskId}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: id,
          completed: newCompleted,
          userId: currentUser?.id,
          userName: currentUser?.name,
        }),
      });
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      // Revert on error
      setItems(items.map(i =>
        i.id === id ? { ...i, completed: !newCompleted } : i
      ));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Eliminar este item?') || !taskId) return;

    // Optimistic update
    const previousItems = [...items];
    setItems(items.filter(item => item.id !== id));

    try {
      const response = await fetch(`/api/projects/${taskId}/checklist?itemId=${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (!result.success) {
        // Revert on error
        setItems(previousItems);
        console.error('Erro ao eliminar item:', result.error);
      }
    } catch (error) {
      console.error('Erro ao eliminar item:', error);
      setItems(previousItems);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Progresso</span>
          <span className="font-medium">{completedCount}/{items.length} ({progress}%)</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Checklist items */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(i => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {items.map((item) => (
              <SortableChecklistItem
                key={item.id}
                item={item}
                onToggle={handleToggle}
                onDelete={handleDelete}
                canEdit={canEdit}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add new item */}
      {canEdit && (
        <div className="flex gap-2 pt-2">
          <Input
            value={newItemTitle}
            onChange={(e) => setNewItemTitle(e.target.value)}
            placeholder="Adicionar item..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
            disabled={adding}
          />
          <Button
            onClick={handleAdd}
            disabled={!newItemTitle.trim() || adding}
            size="sm"
          >
            {adding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {items.length === 0 && !loading && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum item na checklist
        </div>
      )}
    </div>
  );
}
