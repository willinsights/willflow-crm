'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Calendar,
  User,
  Euro,
  ExternalLink,
  MoreVertical,
  Clock,
  MapPin,
  UserPlus,
  GripVertical,
  ArrowRight,
  CheckCircle,
  RotateCcw,
  ListChecks,
  MessageSquare,
  Paperclip,
  Settings,
  Send,
  Video,
  Film,
  Edit2,
  Check,
  X,
  Bell,
  Plus,
  Trash2,
  Info,
  Sparkles,
  ArrowRightCircle,
  GripHorizontal,
  Lock,
  LayoutGrid,
  LayoutList,
} from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAppStore } from '@/lib/useAppStore';
import { Project, ProjectPhase } from '@/lib/types';
import { statusLabels, videoTypeLabels } from '@/lib/data';
import { useLocale } from '@/lib/LocaleContext';
import { useView } from '@/lib/ViewContext';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import EditProjectModal from '@/components/projects/EditProjectModal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import TaskDrawer from '@/components/projects/TaskDrawer';

interface KanbanBoardProps {
  phase?: ProjectPhase;
}

// Default statuses for each phase
const DEFAULT_STATUSES: Record<string, string[]> = {
  captacao: ['agendado', 'em-gravacao', 'upload-nas', 'concluido'],
  edicao: ['receber-ficheiros', 'decupagem', 'em-edicao', 'feedback', 'revisao-cliente', 'entregue'],
  finalizados: ['entregue'],
};

// Fixed columns that cannot be reordered (always last)
const FIXED_LAST_COLUMNS: Record<string, string> = {
  captacao: 'concluido',
  edicao: 'entregue',
  finalizados: 'entregue',
};

export default function KanbanBoard({ phase = 'edicao' }: KanbanBoardProps) {
  const { formatCurrency } = useLocale();
  const { toast } = useToast();
  const { isCompact, toggleViewMode } = useView();
  const {
    projectsByPhase,
    filteredProjects,
    searchQuery,
    updateProjectStatus,
    currentUser,
    userPermissions,
    loading
  } = useAppStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Drag type tracking
  const [dragType, setDragType] = useState<'card' | 'column' | null>(null);
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null);

  // Column customization state
  const [customColumnNames, setCustomColumnNames] = useState<Record<string, string>>({});
  const [customColumns, setCustomColumns] = useState<string[]>([]);
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);
  const [columnOrder, setColumnOrder] = useState<string[]>([]);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');

  // New column dialog
  const [showNewColumnDialog, setShowNewColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnKey, setNewColumnKey] = useState('');

  // Load custom column names and order on mount
  useEffect(() => {
    loadCustomColumnNames();
  }, [phase]);

  const loadCustomColumnNames = async () => {
    try {
      const res = await fetch(`/api/kanban/columns?phase=${phase}`);
      const data = await res.json();
      if (data.success && data.customColumns) {
        const names: Record<string, string> = {};
        const custom: string[] = [];
        const hidden: string[] = [];
        const orderMap: Record<string, number> = {};

        data.customColumns.forEach((col: any) => {
          if (col.customName) {
            names[col.statusKey] = col.customName;
          }
          // Check for custom-created columns (not in defaults)
          if (!DEFAULT_STATUSES[phase]?.includes(col.statusKey)) {
            custom.push(col.statusKey);
          }
          // Check for hidden/deleted columns
          if (col.isActive === false) {
            hidden.push(col.statusKey);
          }
          // Store order
          if (col.order !== undefined && col.order !== null) {
            orderMap[col.statusKey] = col.order;
          }
        });

        setCustomColumnNames(names);
        setCustomColumns(custom);
        setHiddenColumns(hidden);

        // Build ordered list
        const defaults = DEFAULT_STATUSES[phase] || [];
        const allCols = [...defaults, ...custom].filter(s => !hidden.includes(s));

        // Sort by saved order if available
        const sortedCols = allCols.sort((a, b) => {
          const orderA = orderMap[a] ?? 999;
          const orderB = orderMap[b] ?? 999;
          return orderA - orderB;
        });

        // Ensure fixed column is always last
        const fixedCol = FIXED_LAST_COLUMNS[phase];
        if (fixedCol && sortedCols.includes(fixedCol)) {
          const filtered = sortedCols.filter(c => c !== fixedCol);
          setColumnOrder([...filtered, fixedCol]);
        } else {
          setColumnOrder(sortedCols);
        }
      }
    } catch (error) {
      console.error('Error loading custom column names:', error);
      // Fallback to default order
      const defaults = DEFAULT_STATUSES[phase] || [];
      setColumnOrder(defaults);
    }
  };

  const getColumnName = (statusKey: string) => {
    return customColumnNames[statusKey] || statusLabels[statusKey] || statusKey;
  };

  const handleSaveColumnName = async (statusKey: string, newName: string) => {
    try {
      const res = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase,
          statusKey,
          customName: newName.trim() || null
        })
      });

      if (res.ok) {
        if (newName.trim()) {
          setCustomColumnNames(prev => ({ ...prev, [statusKey]: newName.trim() }));
          toast({
            title: 'Nome atualizado ✅',
            description: `A coluna foi renomeada para "${newName.trim()}"`,
            variant: 'success'
          });
        } else {
          setCustomColumnNames(prev => {
            const copy = { ...prev };
            delete copy[statusKey];
            return copy;
          });
          toast({
            title: 'Nome restaurado ✅',
            description: 'O nome original da coluna foi restaurado',
            variant: 'success'
          });
        }
      } else {
        toast({
          title: 'Erro ao salvar',
          description: 'Não foi possível atualizar o nome da coluna',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving column name:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro inesperado',
        variant: 'error'
      });
    }
    setEditingColumn(null);
  };

  // Save column order to database
  const saveColumnOrder = useCallback(async (newOrder: string[]) => {
    try {
      // Save order for each column
      await Promise.all(
        newOrder.map((statusKey, index) =>
          fetch('/api/kanban/columns', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              phase,
              statusKey,
              order: index
            })
          })
        )
      );
    } catch (error) {
      console.error('Error saving column order:', error);
    }
  }, [phase]);

  // Create a new custom column
  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;

    // Generate a key from the name
    const key = newColumnKey.trim() || newColumnName.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    try {
      const res = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase,
          statusKey: key,
          customName: newColumnName.trim(),
          isActive: true,
          order: columnOrder.length
        })
      });

      if (res.ok) {
        setCustomColumns(prev => [...prev, key]);
        setCustomColumnNames(prev => ({ ...prev, [key]: newColumnName.trim() }));
        setShowNewColumnDialog(false);
        setNewColumnName('');
        setNewColumnKey('');
        setColumnOrder(prev => {
          // Insert before fixed column if exists
          const fixedCol = FIXED_LAST_COLUMNS[phase];
          if (fixedCol && prev.includes(fixedCol)) {
            const idx = prev.indexOf(fixedCol);
            return [...prev.slice(0, idx), key, ...prev.slice(idx)];
          }
          return [...prev, key];
        });
        toast({
          title: 'Coluna criada ✅',
          description: `A coluna "${newColumnName.trim()}" foi adicionada com sucesso`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Erro ao criar coluna',
          description: 'Não foi possível criar a coluna',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error creating column:', error);
      toast({
        title: 'Erro ao criar coluna',
        description: 'Ocorreu um erro inesperado',
        variant: 'error'
      });
    }
  };

  // Delete/hide a column
  const handleDeleteColumn = async (statusKey: string) => {
    const projectsInColumn = getProjectsByStatus(statusKey);

    if (projectsInColumn.length > 0) {
      alert(`Não é possível apagar esta coluna. Existem ${projectsInColumn.length} projetos nela. Mova os projetos primeiro.`);
      return;
    }

    if (!confirm(`Tem certeza que deseja apagar a coluna "${getColumnName(statusKey)}"?`)) {
      return;
    }

    try {
      // If it's a custom column, delete it completely
      if (customColumns.includes(statusKey)) {
        const res = await fetch(`/api/kanban/columns?phase=${phase}&statusKey=${statusKey}`, {
          method: 'DELETE'
        });

        if (res.ok) {
          setCustomColumns(prev => prev.filter(c => c !== statusKey));
          setCustomColumnNames(prev => {
            const copy = { ...prev };
            delete copy[statusKey];
            return copy;
          });
          setColumnOrder(prev => prev.filter(c => c !== statusKey));
          toast({
            title: 'Coluna removida ✅',
            description: `A coluna "${getColumnName(statusKey)}" foi removida`,
            variant: 'success'
          });
        }
      } else {
        // For default columns, just hide them
        const res = await fetch('/api/kanban/columns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phase,
            statusKey,
            isActive: false
          })
        });

        if (res.ok) {
          setHiddenColumns(prev => [...prev, statusKey]);
          setColumnOrder(prev => prev.filter(c => c !== statusKey));
          toast({
            title: 'Coluna ocultada ✅',
            description: `A coluna "${getColumnName(statusKey)}" foi ocultada`,
            variant: 'success'
          });
        }
      }
    } catch (error) {
      console.error('Error deleting column:', error);
      toast({
        title: 'Erro ao remover coluna',
        description: 'Ocorreu um erro ao remover a coluna',
        variant: 'error'
      });
    }
  };

  // Restore a hidden column
  const handleRestoreColumn = async (statusKey: string) => {
    try {
      const res = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase,
          statusKey,
          isActive: true
        })
      });

      if (res.ok) {
        setHiddenColumns(prev => prev.filter(c => c !== statusKey));
        setColumnOrder(prev => {
          // Insert before fixed column if exists
          const fixedCol = FIXED_LAST_COLUMNS[phase];
          if (fixedCol && prev.includes(fixedCol)) {
            const idx = prev.indexOf(fixedCol);
            return [...prev.slice(0, idx), statusKey, ...prev.slice(idx)];
          }
          return [...prev, statusKey];
        });
        toast({
          title: 'Coluna restaurada ✅',
          description: `A coluna "${statusLabels[statusKey] || statusKey}" foi restaurada`,
          variant: 'success'
        });
      }
    } catch (error) {
      console.error('Error restoring column:', error);
      toast({
        title: 'Erro ao restaurar coluna',
        description: 'Ocorreu um erro ao restaurar a coluna',
        variant: 'error'
      });
    }
  };

  // Create notification when moving project
  const createMoveNotification = async (project: Project, fromPhase: string, toPhase: string) => {
    try {
      const phaseLabels: Record<string, string> = {
        captacao: 'Captação',
        edicao: 'Edição',
        finalizados: 'Finalizados'
      };

      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'admin-1',
          type: 'project',
          priority: 'medium',
          title: `Projeto movido para ${phaseLabels[toPhase]}`,
          message: `O projeto "${project.title}" foi movido de ${phaseLabels[fromPhase]} para ${phaseLabels[toPhase]}.`,
          projectId: project.id,
          actionUrl: `/?taskId=${project.id}`
        })
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const projects = searchQuery
    ? filteredProjects.filter(p => p.phase === phase)
    : (projectsByPhase[phase] || []);

  // Use columnOrder state instead of computing statuses
  const statuses = columnOrder.length > 0 ? columnOrder : (DEFAULT_STATUSES[phase] || []);

  // Get reorderable columns (exclude fixed last column)
  const fixedLastColumn = FIXED_LAST_COLUMNS[phase];
  const reorderableColumns = statuses.filter(s => s !== fixedLastColumn);
  const fixedColumns = fixedLastColumn && statuses.includes(fixedLastColumn) ? [fixedLastColumn] : [];

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => {
      const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
      return currentStatus === status;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;

    // Check if dragging a column or a card
    if (statuses.includes(id) && !fixedColumns.includes(id)) {
      setDragType('column');
      setDraggedColumnId(id);
    } else {
      setDragType('card');
      setActiveId(id);
      const project = projects.find(p => p.id === id);
      setDraggedProject(project || null);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      resetDragState();
      return;
    }

    // Handle column reordering
    if (dragType === 'column') {
      const activeIndex = reorderableColumns.indexOf(active.id as string);
      const overIndex = reorderableColumns.indexOf(over.id as string);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        const newReorderableOrder = arrayMove(reorderableColumns, activeIndex, overIndex);
        const newFullOrder = [...newReorderableOrder, ...fixedColumns];

        setColumnOrder(newFullOrder);
        await saveColumnOrder(newFullOrder);
      }

      resetDragState();
      return;
    }

    // Handle card dragging (existing logic)
    const projectId = active.id as string;
    const newStatus = over.id as string;

    if (!statuses.includes(newStatus)) {
      resetDragState();
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      resetDragState();
      return;
    }

    const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;

    if (currentStatus === newStatus) {
      resetDragState();
      return;
    }

    try {
      await updateProjectStatus(projectId, phase, newStatus);
      
      toast({
        title: 'Projeto movido ✅',
        description: `"${project.title}" foi movido para ${statusLabels[newStatus] || newStatus}`,
        variant: 'success'
      });

      // If moving to "concluido" in captacao, handle automatic phase transition
      if (phase === 'captacao' && newStatus === 'concluido') {
        const needsEditing = project.responsavelEdicaoId ||
          ['hotel', 'experiencia', 'reels'].includes(project.videoType);

        if (needsEditing) {
          console.log('Project will continue to Edição phase');
        } else {
          console.log('Project is captacao-only');
        }
      }
    } catch (error) {
      toast({
        title: 'Erro ao mover projeto',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao alterar o status',
        variant: 'error'
      });
    }

    resetDragState();
  };

  const resetDragState = () => {
    setActiveId(null);
    setDraggedProject(null);
    setDragType(null);
    setDraggedColumnId(null);
  };

  // Move project to another phase
  const handleMoveToPhase = async (projectId: string, targetPhase: ProjectPhase) => {
    try {
      const project = projects.find(p => p.id === projectId);
      if (!project) return;

      let newStatusCaptacao = project.statusCaptacao;
      let newStatusEdicao = project.statusEdicao;

      if (targetPhase === 'captacao') {
        newStatusCaptacao = 'agendado';
      } else if (targetPhase === 'edicao') {
        newStatusEdicao = 'receber-ficheiros';
        if (phase === 'captacao') {
          newStatusCaptacao = 'concluido';
        }
      } else if (targetPhase === 'finalizados') {
        newStatusEdicao = 'entregue';
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phase: targetPhase,
          statusCaptacao: newStatusCaptacao,
          statusEdicao: newStatusEdicao,
        }),
      });

      if (response.ok) {
        // Create notification for phase change
        await createMoveNotification(project, phase, targetPhase);
        
        const phaseLabels: Record<string, string> = {
          captacao: 'Captação',
          edicao: 'Edição',
          finalizados: 'Finalizados'
        };
        
        toast({
          title: 'Projeto alterado ✅',
          description: `"${project.title}" foi movido para ${phaseLabels[targetPhase]}`,
          variant: 'success'
        });
        
        window.location.reload();
      } else {
        const data = await response.json();
        toast({
          title: 'Erro ao mover projeto',
          description: data.error || 'Ocorreu um erro ao mover o projeto',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error moving project:', error);
      toast({
        title: 'Erro ao mover projeto',
        description: 'Ocorreu um erro inesperado',
        variant: 'error'
      });
    }
  };

  // Move all cards in a column to another status
  const handleMoveAllCards = async (fromStatus: string, toStatus: string) => {
    const cardsToMove = getProjectsByStatus(fromStatus);
    if (cardsToMove.length === 0) return;

    if (!confirm(`Mover ${cardsToMove.length} projetos de "${getColumnName(fromStatus)}" para "${getColumnName(toStatus)}"?`)) {
      return;
    }

    try {
      for (const project of cardsToMove) {
        await updateProjectStatus(project.id, phase, toStatus);
      }
      toast({
        title: 'Projetos movidos ✅',
        description: `${cardsToMove.length} projetos foram movidos para ${statusLabels[toStatus] || toStatus}`,
        variant: 'success'
      });
    } catch (error) {
      toast({
        title: 'Erro ao mover projetos',
        description: 'Ocorreu um erro ao mover os projetos',
        variant: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando projetos...</p>
      </div>
    );
  }

  const phaseLabels = {
    captacao: 'Captação',
    edicao: 'Edição',
    finalizados: 'Finalizados'
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <Breadcrumbs items={[{ label: 'Projetos' }, { label: phaseLabels[phase] }]} />

          <div className="flex items-center gap-2">
            {/* Vista Detalhada button - Only for captacao and edicao */}
            {(phase === 'captacao' || phase === 'edicao') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleViewMode}
                    className="glass border-white/20 hover:bg-white/10"
                  >
                    {isCompact ? (
                      <>
                        <LayoutList className="h-4 w-4 mr-2 text-purple-400" />
                        Vista Detalhada
                      </>
                    ) : (
                      <>
                        <LayoutGrid className="h-4 w-4 mr-2 text-green-400" />
                        Vista Compacta
                      </>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="glass-strong border-white/20">
                  <p>{isCompact ? 'Mostrar mais informações' : 'Mostrar menos informações'}</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Show hidden columns button */}
            {hiddenColumns.length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="glass">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Restaurar colunas ({hiddenColumns.length})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-strong border-white/20">
                  {hiddenColumns.map(col => (
                    <DropdownMenuItem
                      key={col}
                      onClick={() => handleRestoreColumn(col)}
                      className="cursor-pointer"
                    >
                      {statusLabels[col] || col}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Add new column button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewColumnDialog(true)}
              className="glass"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Coluna
            </Button>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:gap-4 xl:gap-6 lg:overflow-x-auto pb-4 gap-4 items-start">
            <SortableContext
              items={reorderableColumns}
              strategy={horizontalListSortingStrategy}
            >
              {statuses.map((status, index) => {
                const statusProjects = getProjectsByStatus(status);
                const isCompletedColumn = phase === 'captacao' && status === 'concluido';
                const isCustomColumn = customColumns.includes(status);
                const canDelete = isCustomColumn || (!DEFAULT_STATUSES[phase]?.includes(status));

                // Fixed columns (last) are not draggable
                const isFixed = fixedColumns.includes(status);

                return (
                  <DroppableColumn
                    key={status}
                    id={status}
                    title={getColumnName(status)}
                    defaultTitle={statusLabels[status] || status}
                    count={statusProjects.length}
                    phase={phase}
                    allStatuses={statuses}
                    currentIndex={index}
                    onMoveAllCards={handleMoveAllCards}
                    isEditing={editingColumn === status}
                    editingName={editingColumnName}
                    onStartEdit={() => {
                      setEditingColumn(status);
                      setEditingColumnName(getColumnName(status));
                    }}
                    onEditChange={setEditingColumnName}
                    onSaveEdit={() => handleSaveColumnName(status, editingColumnName)}
                    onCancelEdit={() => setEditingColumn(null)}
                    isCustomName={!!customColumnNames[status]}
                    onResetName={() => handleSaveColumnName(status, '')}
                    isCompletedColumn={isCompletedColumn}
                    canDelete={canDelete || statusProjects.length === 0}
                    onDelete={() => handleDeleteColumn(status)}
                    isDraggable={!isFixed}
                  >
                    <SortableContext
                      items={statusProjects.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {statusProjects.map((project) => (
                          <DraggableProjectCard
                            key={project.id}
                            project={project}
                            phase={phase}
                            onCardClick={setSelectedProject}
                            onMoveToPhase={handleMoveToPhase}
                            allStatuses={statuses}
                            isCompact={isCompact}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DroppableColumn>
                );
              })}
            </SortableContext>
          </div>

          <DragOverlay>
            {dragType === 'card' && activeId && draggedProject ? (
              <ProjectCard project={draggedProject} phase={phase} isDragging />
            ) : dragType === 'column' && draggedColumnId ? (
              <div className="kanban-column glass-card h-full flex flex-col opacity-80 min-w-[280px] max-w-[360px]">
                <div className="p-3 md:p-4 border-b flex-shrink-0 border-white/10 flex items-center gap-2">
                  <GripHorizontal className="w-4 h-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm md:text-base truncate">
                    {getColumnName(draggedColumnId)}
                  </h3>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        <TaskDrawer
          open={!!selectedProject}
          taskId={selectedProject?.id || null}
          onClose={() => setSelectedProject(null)}
          onTaskUpdate={(taskId, updates) => {
            if (selectedProject && updates.status) {
              updateProjectStatus(selectedProject.id, phase, updates.status);
            }
          }}
        />

        {/* New Column Dialog */}
        <Dialog open={showNewColumnDialog} onOpenChange={setShowNewColumnDialog}>
          <DialogContent className="glass-strong border-white/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Criar Nova Coluna
              </DialogTitle>
              <DialogDescription>
                Adicione uma nova coluna personalizada ao Kanban de {phaseLabels[phase]}.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da Coluna</label>
                <Input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="Ex: Em Aprovação, Pendente Cliente..."
                  className="glass"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  Identificador (opcional)
                </label>
                <Input
                  value={newColumnKey}
                  onChange={(e) => setNewColumnKey(e.target.value)}
                  placeholder="Gerado automaticamente se vazio"
                  className="glass"
                />
                <p className="text-xs text-muted-foreground">
                  Usado internamente. Deixe vazio para gerar automaticamente.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setShowNewColumnDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateColumn} disabled={!newColumnName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Coluna
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Droppable Column Component with Actions and Editable Name
function DroppableColumn({
  id,
  title,
  defaultTitle,
  count,
  children,
  phase,
  allStatuses,
  currentIndex,
  onMoveAllCards,
  isEditing,
  editingName,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  isCustomName,
  onResetName,
  isCompletedColumn,
  canDelete,
  onDelete,
  isDraggable = true,
}: {
  id: string;
  title: string;
  defaultTitle: string;
  count: number;
  children: React.ReactNode;
  phase: ProjectPhase;
  allStatuses: string[];
  currentIndex: number;
  onMoveAllCards: (from: string, to: string) => void;
  isEditing: boolean;
  editingName: string;
  onStartEdit: () => void;
  onEditChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isCustomName: boolean;
  onResetName: () => void;
  isCompletedColumn?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  isDraggable?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Special styles for completed column in captacao
  const completedColumnStyles = isCompletedColumn
    ? 'ring-2 ring-green-500/30 bg-gradient-to-b from-green-500/10 to-transparent'
    : '';

  // Drag handle for columns
  const {
    attributes: colAttributes,
    listeners: colListeners,
    setNodeRef: setSortableNodeRef,
    isDragging: isColDragging,
    transform: colTransform,
    transition: colTransition,
  } = useSortable({
    id,
    disabled: !isDraggable,
  });

  const style = isDraggable
    ? {
        transform: CSS.Transform.toString(colTransform),
        transition: colTransition,
        opacity: isColDragging ? 0.5 : 1,
      }
    : {};

  return (
    <div
      ref={node => {
        setNodeRef(node);
        if (isDraggable) setSortableNodeRef(node);
      }}
      style={style}
      className={`kanban-column transition-all duration-200 self-start w-full lg:min-w-[280px] lg:max-w-[320px] xl:min-w-[320px] xl:max-w-[360px] ${
        isOver ? 'ring-2 ring-purple-500/50 scale-105' : ''
      }`}
    >
      <div className={`glass-card h-full flex flex-col ${completedColumnStyles}`}>
        <div className={`p-3 md:p-4 border-b flex-shrink-0 ${
          isCompletedColumn
            ? 'border-green-500/30 bg-gradient-to-r from-green-500/20 to-emerald-500/10'
            : 'border-white/10'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isDraggable && (
                <span
                  {...colAttributes}
                  {...colListeners}
                  className="cursor-grab select-none flex items-center"
                  tabIndex={-1}
                >
                  <GripHorizontal className="w-4 h-4 text-muted-foreground mr-1" />
                </span>
              )}
              {!isDraggable && (
                <Lock className="w-4 h-4 text-muted-foreground mr-1" />
              )}
              {isEditing ? (
                <div className="flex items-center gap-1 flex-1">
                  <Input
                    value={editingName}
                    onChange={(e) => onEditChange(e.target.value)}
                    className="h-7 text-sm glass"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onSaveEdit();
                      if (e.key === 'Escape') onCancelEdit();
                    }}
                  />
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-green-400" onClick={onSaveEdit}>
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-400" onClick={onCancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  {isCompletedColumn && (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  )}
                  <h3 className={`font-semibold text-sm md:text-base truncate ${
                    isCompletedColumn ? 'text-green-400' : 'text-foreground'
                  }`}>
                    {title}
                    {isCustomName && <span className="text-primary ml-1">*</span>}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 ${
                      isCompletedColumn ? 'border-green-500/50 text-green-400' : ''
                    }`}
                  >
                    {count}
                  </Badge>

                  {/* Info tooltip for completed column */}
                  {isCompletedColumn && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-green-400/70 hover:text-green-400">
                          <Info className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="max-w-[280px] p-3 glass-strong border-green-500/30">
                        <div className="space-y-2">
                          <p className="font-semibold text-green-400 flex items-center gap-1">
                            <Sparkles className="w-4 h-4" />
                            Fluxo Automático
                          </p>
                          <div className="text-xs space-y-1.5">
                            <div className="flex items-start gap-2">
                              <ArrowRightCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong className="text-purple-400">Com edição:</strong> O projeto segue automaticamente para a aba <strong>Edição</strong>.
                              </span>
                            </div>
                            <div className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                              <span>
                                <strong className="text-green-400">Só captação:</strong> O projeto vai diretamente para <strong>Finalizados</strong>.
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </>
              )}
            </div>

            {/* Column Actions Menu */}
            {!isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong border-white/20 w-56">
                  {/* Edit column name */}
                  <DropdownMenuItem onClick={onStartEdit} className="cursor-pointer">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Editar nome da coluna
                  </DropdownMenuItem>

                  {/* Reset to default name */}
                  {isCustomName && (
                    <DropdownMenuItem onClick={onResetName} className="cursor-pointer text-muted-foreground">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Restaurar nome original ({defaultTitle})
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  {/* Move all to next status */}
                  {currentIndex < allStatuses.length - 1 && count > 0 && (
                    <DropdownMenuItem
                      onClick={() => onMoveAllCards(id, allStatuses[currentIndex + 1])}
                      className="cursor-pointer"
                    >
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Mover todos para próximo
                    </DropdownMenuItem>
                  )}

                  {/* Move all to any status */}
                  {count > 0 && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>
                        <Send className="w-4 h-4 mr-2" />
                        Mover todos para...
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent className="glass-strong border-white/20">
                        {allStatuses.filter(s => s !== id).map(status => (
                          <DropdownMenuItem
                            key={status}
                            onClick={() => onMoveAllCards(id, status)}
                            className="cursor-pointer"
                          >
                            {statusLabels[status] || status}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  {/* Delete column */}
                  {canDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Apagar coluna
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Completed column info banner */}
        {isCompletedColumn && (
          <div className="px-3 py-2 bg-gradient-to-r from-green-500/10 to-transparent border-b border-green-500/20">
            <p className="text-[10px] text-green-400/80 flex items-center gap-1.5">
              <ArrowRightCircle className="w-3 h-3" />
              Ao concluir, projetos seguem para Edição ou Finalizados
            </p>
          </div>
        )}

        <div className="p-3 md:p-4 space-y-3 min-h-[200px] flex-1">{children}</div>
      </div>
    </div>
  );
}

// Draggable Project Card Component
function DraggableProjectCard({
  project,
  phase,
  onCardClick,
  onMoveToPhase,
  allStatuses,
  isCompact = false,
}: {
  project: Project;
  phase: ProjectPhase;
  onCardClick: (project: Project) => void;
  onMoveToPhase: (projectId: string, phase: ProjectPhase) => void;
  allStatuses: string[];
  isCompact?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <ProjectCard
        project={project}
        phase={phase}
        onCardClick={onCardClick}
        onMoveToPhase={onMoveToPhase}
        allStatuses={allStatuses}
        isCompact={isCompact}
        dragAttributes={attributes}
        dragListeners={listeners}
      />
    </div>
  );
}

// Project Card Component with Move Actions
function ProjectCard({
  project,
  phase,
  isDragging = false,
  onCardClick,
  onMoveToPhase,
  allStatuses,
  isCompact = false,
  dragAttributes,
  dragListeners,
}: {
  project: Project;
  phase: ProjectPhase;
  isDragging?: boolean;
  isCompact?: boolean;
  onCardClick?: (project: Project) => void;
  onMoveToPhase?: (projectId: string, phase: ProjectPhase) => void;
  allStatuses?: string[];
  dragAttributes?: any;
  dragListeners?: any;
}) {
  const { userPermissions, updateProjectStatus } = useAppStore();
  const { formatCurrency } = useLocale();

  const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    onCardClick?.(project);
  };

  const handleQuickStatusChange = async (newStatus: string) => {
    try {
      await updateProjectStatus(project.id, phase, newStatus);
    } catch (error) {
      alert('Erro ao alterar status');
    }
  };

  // Check if project has editing work
  const hasEditingWork = project.responsavelEdicaoId ||
    ['hotel', 'experiencia', 'reels'].includes(project.videoType);

  return (
    <Card
      onClick={handleCardClick}
      className={`glass cursor-pointer transition-all duration-200 hover:scale-105 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <CardHeader className="pb-2 md:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 flex-1 min-w-0">
            <CardTitle className="text-xs md:text-sm font-medium text-foreground line-clamp-2">
              {project.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
              {project.category && (
                <Badge variant="outline" className="text-[10px] md:text-xs flex items-center gap-1">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.category.color }}
                  />
                  {project.category.name}
                </Badge>
              )}
              {project.client && (
                <span className="text-[10px] md:text-xs text-muted-foreground truncate">
                  {project.client.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span {...dragAttributes} {...dragListeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="w-3 h-3 text-muted-foreground" />
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong border border-white/20 w-56">
                <EditProjectModal project={project} />

                <DropdownMenuSeparator />

                {/* Quick status change */}
                {allStatuses && allStatuses.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Mover para status...
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="glass-strong border-white/20">
                      {allStatuses.filter(s => s !== currentStatus).map(status => (
                        <DropdownMenuItem
                          key={status}
                          onClick={() => handleQuickStatusChange(status)}
                          className="cursor-pointer"
                        >
                          {statusLabels[status] || status}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                )}

                <DropdownMenuSeparator />

                {/* Move to another phase */}
                {phase === 'captacao' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onMoveToPhase?.(project.id, 'edicao')}
                      className="cursor-pointer text-primary"
                    >
                      <Film className="w-4 h-4 mr-2" />
                      Enviar para Edição
                    </DropdownMenuItem>
                    {!hasEditingWork && (
                      <DropdownMenuItem
                        onClick={() => onMoveToPhase?.(project.id, 'finalizados')}
                        className="cursor-pointer text-green-400"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Finalizar (só captação)
                      </DropdownMenuItem>
                    )}
                  </>
                )}

                {phase === 'edicao' && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onMoveToPhase?.(project.id, 'captacao')}
                      className="cursor-pointer"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      Voltar para Captação
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onMoveToPhase?.(project.id, 'finalizados')}
                      className="cursor-pointer text-green-400"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Marcar como Finalizado
                    </DropdownMenuItem>
                  </>
                )}

                {phase === 'finalizados' && (
                  <DropdownMenuItem
                    onClick={() => onMoveToPhase?.(project.id, 'edicao')}
                    className="cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reabrir em Edição
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className={`pt-0 ${isCompact ? 'space-y-1' : 'space-y-2 md:space-y-3'}`}>
        {/* Compact view: Show only essential info */}
        {isCompact ? (
          <div className="flex items-center justify-between gap-2">
            {project.clientDueDate && (
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{new Date(project.clientDueDate).toLocaleDateString('pt-PT')}</span>
              </div>
            )}
            {userPermissions.canViewFinance && (
              <span className={`text-[10px] font-medium ${project.margin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(project.margin)}
              </span>
            )}
          </div>
        ) : (
          <>
            {/* Detailed view: Show all info */}
            {project.location && (
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{project.location}</span>
              </div>
            )}

            {userPermissions.canViewFinance && (
              <div className="space-y-1.5 md:space-y-2">
                <div className="flex justify-between text-[10px] md:text-xs gap-2">
                  <span className="text-muted-foreground">Cliente:</span>
                  <span className="font-medium truncate">{formatCurrency(project.clientPrice)}</span>
                </div>
                <div className="flex justify-between text-[10px] md:text-xs gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Margem:</span>
                    <InfoTooltip 
                      content="Diferença entre o valor cobrado ao cliente e os custos de captação e edição" 
                      iconClassName="w-3 h-3"
                    />
                  </div>
                  <span className={`font-medium truncate ${project.margin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(project.margin)}
                  </span>
                </div>
              </div>
            )}

            {project.captacaoDate && (
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                <Calendar className="w-3 h-3 flex-shrink-0 text-purple-400" />
                <span>
                  Captação: {new Date(project.captacaoDate).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}

            {project.clientDueDate && (
              <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
                <Clock className="w-3 h-3 flex-shrink-0" />
                <span>
                  {new Date(project.clientDueDate).toLocaleDateString('pt-PT')}
                </span>
              </div>
            )}

            <div className="flex gap-1.5 md:gap-2 flex-wrap">
              {project.nasLink && (
                <Button variant="outline" size="sm" className="h-6 md:h-7 text-[10px] md:text-xs glass border-white/20" asChild>
                  <a href={project.nasLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                    NAS
                  </a>
                </Button>
              )}
              {project.frameIoLink && (
                <Button variant="outline" size="sm" className="h-6 md:h-7 text-[10px] md:text-xs glass border-white/20" asChild>
                  <a href={project.frameIoLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-2.5 h-2.5 md:w-3 md:h-3 mr-1" />
                    Frame.io
                  </a>
                </Button>
              )}
            </div>

            {((phase === 'captacao' && project.responsavelCaptacao) ||
              (phase === 'edicao' && project.responsavelEdicao)) && (
              <div className="flex items-center gap-1.5 md:gap-2">
                <Avatar className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0">
                  <AvatarFallback className="text-[10px] md:text-xs">
                    {phase === 'captacao'
                      ? project.responsavelCaptacao?.name?.[0]
                      : project.responsavelEdicao?.name?.[0]
                    }
                  </AvatarFallback>
                </Avatar>
                <span className="text-[10px] md:text-xs text-muted-foreground truncate">
                  {phase === 'captacao'
                    ? project.responsavelCaptacao?.name
                    : project.responsavelEdicao?.name
                  }
                </span>
              </div>
            )}

            {project.subtasks && project.subtasks.length > 0 && (
              <div className="pt-2 mt-2 border-t border-white/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
                    Tarefas
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {project.subtasks.filter(s => s.completed).length}/{project.subtasks.length}
                  </Badge>
                </div>
                <div className="space-y-1">
                  {project.subtasks.slice(0, 3).map((subtask) => (
                    <div key={subtask.id} className="flex items-center gap-1.5 text-[10px]">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${subtask.completed ? 'bg-green-500' : 'bg-gray-500'}`} />
                      <span className={`truncate ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                  {project.subtasks.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{project.subtasks.length - 3} mais...
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
