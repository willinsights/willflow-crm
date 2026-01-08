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
  FolderKanban,
  Package,
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
import { toast as sonnerToast } from 'sonner';
import { InfoTooltip } from '@/components/ui/info-tooltip';
import EditProjectModal from '@/components/projects/EditProjectModal';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import TaskDrawer from '@/components/projects/TaskDrawer';
import { KANBAN_CONSTANTS } from '@/lib/kanban-constants';

interface KanbanBoardProps {
  phase?: ProjectPhase;
}

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

  // Column state - NEW STRUCTURE
  interface KanbanColumnData {
    id: string;
    title: string;
    statusKey: string | null;
    position: number;
    isLocked: boolean;
    systemKey: string | null;
    color: string | null;
    isActive: boolean;
  }

  const [columns, setColumns] = useState<KanbanColumnData[]>([]);
  const [columnsLoading, setColumnsLoading] = useState(true);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editingColumnName, setEditingColumnName] = useState('');

  // New column dialog
  const [showNewColumnDialog, setShowNewColumnDialog] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  const organizationId = 'default'; // TODO: Get from context/auth when multi-tenant

  // Load columns from API (with bootstrap if needed)
  useEffect(() => {
    loadColumns();
  }, [phase]);

  const loadColumns = async () => {
    try {
      setColumnsLoading(true);
      const phaseUpper = phase.toUpperCase();
      console.log(`[KanbanBoard] Loading columns for phase: ${phaseUpper}`);
      
      const res = await fetch(`/api/kanban/columns?phase=${phaseUpper}&organizationId=${organizationId}`);
      
      if (!res.ok) {
        console.error(`[KanbanBoard] API returned error status: ${res.status}`);
        const errorData = await res.json().catch(() => ({ error: 'Failed to parse error response' }));
        console.error('[KanbanBoard] Error details:', errorData);
        
        // If it's a server error, try to bootstrap
        if (res.status === 500 || res.status === 503) {
          console.log('[KanbanBoard] Server error detected, attempting to bootstrap...');
          const bootstrapRes = await fetch('/api/kanban/columns/bootstrap', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organizationId }),
          });
          
          if (bootstrapRes.ok) {
            console.log('[KanbanBoard] Bootstrap successful, reloading columns...');
            const reloadRes = await fetch(`/api/kanban/columns?phase=${phaseUpper}&organizationId=${organizationId}`);
            const reloadData = await reloadRes.json();
            if (reloadData.success && reloadData.data) {
              setColumns(reloadData.data);
              console.log(`[KanbanBoard] Loaded ${reloadData.data.length} columns after bootstrap`);
              return;
            }
          } else {
            const bootstrapError = await bootstrapRes.json().catch(() => ({ error: 'Bootstrap failed' }));
            console.error('[KanbanBoard] Bootstrap failed:', bootstrapError);
          }
        }
        
        toast({
          title: 'Erro ao carregar colunas',
          description: errorData.details || errorData.error || 'Erro desconhecido ao comunicar com o servidor',
          variant: 'error'
        });
        return;
      }
      
      const data = await res.json();
      console.log(`[KanbanBoard] API response:`, data);
      
      if (data.success && data.data && data.data.length > 0) {
        setColumns(data.data);
        console.log(`[KanbanBoard] Loaded ${data.data.length} columns`);
      } else {
        // No columns found - bootstrap them
        console.log('[KanbanBoard] No columns found, bootstrapping...');
        const bootstrapRes = await fetch('/api/kanban/columns/bootstrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId }),
        });
        
        const bootstrapData = await bootstrapRes.json();
        console.log('[KanbanBoard] Bootstrap response:', bootstrapData);
        
        if (bootstrapData.success) {
          // Reload columns after bootstrap
          const reloadRes = await fetch(`/api/kanban/columns?phase=${phaseUpper}&organizationId=${organizationId}`);
          const reloadData = await reloadRes.json();
          if (reloadData.success && reloadData.data) {
            setColumns(reloadData.data);
            console.log(`[KanbanBoard] Loaded ${reloadData.data.length} columns after bootstrap`);
            toast({
              title: 'Colunas inicializadas ✅',
              description: 'As colunas padrão do Kanban foram criadas com sucesso',
              variant: 'success'
            });
          }
        } else {
          console.error('[KanbanBoard] Bootstrap failed:', bootstrapData);
          toast({
            title: 'Erro ao inicializar colunas',
            description: bootstrapData.details || bootstrapData.error || 'Não foi possível criar as colunas padrão',
            variant: 'error'
          });
        }
      }
    } catch (error) {
      console.error('[KanbanBoard] Error loading columns:', error);
      toast({
        title: 'Erro ao carregar colunas',
        description: error instanceof Error ? error.message : 'Ocorreu um erro inesperado ao carregar as colunas do Kanban',
        variant: 'error'
      });
    } finally {
      setColumnsLoading(false);
    }
  };

  const getColumnName = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    return column?.title || columnId;
  };

  const isColumnLocked = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    return column?.isLocked || column?.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY || false;
  };

  const handleSaveColumnName = async (columnId: string, newName: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return;

    // Block renaming of locked/DELIVERED columns
    if (column.isLocked || column.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY) {
      toast({
        title: 'Operação não permitida',
        description: 'A coluna "Entregue" não pode ser renomeada',
        variant: 'error'
      });
      setEditingColumn(null);
      return;
    }

    try {
      const res = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          phase: phase.toUpperCase(),
          title: newName.trim(),
          columnId: column.id,
          position: column.position,
          color: column.color,
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          // Update local state
          setColumns(prev => prev.map(c => 
            c.id === columnId ? { ...c, title: newName.trim() } : c
          ));
          toast({
            title: 'Nome atualizado ✅',
            description: `A coluna foi renomeada para "${newName.trim()}"`,
            variant: 'success'
          });
        }
      } else {
        const errorData = await res.json();
        toast({
          title: 'Erro ao salvar',
          description: errorData.error || 'Não foi possível atualizar o nome da coluna',
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
      const res = await fetch('/api/kanban/columns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          phase: phase.toUpperCase(),
          columnIds: newOrder,
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast({
          title: 'Erro ao reordenar',
          description: errorData.error || 'Não foi possível reordenar as colunas',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error saving column order:', error);
      toast({
        title: 'Erro ao reordenar',
        description: 'Ocorreu um erro ao salvar a ordem das colunas',
        variant: 'error'
      });
    }
  }, [phase, organizationId, toast]);

  // Create a new custom column
  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;

    // Find DELIVERED column to insert before it
    const deliveredColumn = columns.find(c => c.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY);
    const newPosition = deliveredColumn ? deliveredColumn.position : columns.length;

    try {
      const res = await fetch('/api/kanban/columns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          phase: phase.toUpperCase(),
          title: newColumnName.trim(),
          position: newPosition,
          isActive: true,
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Reload columns to get updated list
        await loadColumns();
        
        setShowNewColumnDialog(false);
        setNewColumnName('');
        
        toast({
          title: 'Coluna criada ✅',
          description: `A coluna "${newColumnName.trim()}" foi adicionada com sucesso`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Erro ao criar coluna',
          description: data.error || 'Não foi possível criar a coluna',
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
  const handleDeleteColumn = async (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return;

    // Block deletion of locked columns
    if (column.isLocked || column.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY) {
      toast({
        title: 'Operação não permitida',
        description: 'A coluna "Entregue" não pode ser removida',
        variant: 'error'
      });
      return;
    }

    // Check if there are projects in this column
    const projectsInColumn = getProjectsByColumnId(columnId);

    if (projectsInColumn.length > 0) {
      toast({
        title: 'Não é possível apagar',
        description: `Existem ${projectsInColumn.length} projetos nesta coluna. Mova os projetos primeiro.`,
        variant: 'error'
      });
      return;
    }

    if (!confirm(`Tem certeza que deseja apagar a coluna "${column.title}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/kanban/columns?columnId=${columnId}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Remove from local state
        setColumns(prev => prev.filter(c => c.id !== columnId));
        toast({
          title: 'Coluna removida ✅',
          description: `A coluna "${column.title}" foi removida`,
          variant: 'success'
        });
      } else {
        toast({
          title: 'Erro ao remover coluna',
          description: data.error || 'Ocorreu um erro ao remover a coluna',
          variant: 'error'
        });
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

  // Get reorderable columns (exclude locked columns)
  const reorderableColumns = columns.filter(c => !c.isLocked && c.systemKey !== KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY);
  const lockedColumns = columns.filter(c => c.isLocked || c.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY);

  const getProjectsByColumnId = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) {
      console.warn(`[KanbanBoard] Column not found: ${columnId}`);
      return [];
    }
    
    // Use statusKey if available, otherwise fall back to normalized title
    // Normalize by removing accents and converting to ASCII
    const statusToMatch = column.statusKey || 
      column.title
        .toLowerCase()
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/[^a-z0-9-]/g, ''); // Remove special characters
    
    const matchedProjects = projects.filter(project => {
      const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
      return currentStatus === statusToMatch;
    });
    
    // Log for debugging (only in development)
    if (matchedProjects.length === 0 && projects.length > 0 && process.env.NODE_ENV === 'development') {
      console.log(`[KanbanBoard] No projects matched for column "${column.title}" (statusKey: ${statusToMatch})`);
      console.log(`[KanbanBoard] Available statuses in projects:`, 
        Array.from(new Set(projects.map(p => phase === 'captacao' ? p.statusCaptacao : p.statusEdicao)))
      );
    }
    
    return matchedProjects;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;

    // Check if dragging a column or a card
    const column = columns.find(c => c.id === id);
    if (column) {
      if (column.isLocked || column.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY) {
        // Block dragging locked columns
        toast({
          title: 'Operação não permitida',
          description: 'A coluna "Entregue" está bloqueada e não pode ser movida',
          variant: 'error'
        });
        return;
      }
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
      const activeColumn = reorderableColumns.find(c => c.id === active.id as string);
      const overColumn = reorderableColumns.find(c => c.id === over.id as string);

      if (activeColumn && overColumn) {
        const activeIndex = reorderableColumns.findIndex(c => c.id === active.id);
        const overIndex = reorderableColumns.findIndex(c => c.id === over.id);

        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          const newReorderableOrder = arrayMove(reorderableColumns, activeIndex, overIndex);
          const newColumnIds = [...newReorderableOrder.map(c => c.id), ...lockedColumns.map(c => c.id)];

          // Update local state optimistically
          const reorderedColumns = [...newReorderableOrder, ...lockedColumns];
          setColumns(reorderedColumns);
          
          // Save to backend
          await saveColumnOrder(newColumnIds);
        }
      }

      resetDragState();
      return;
    }

    // Handle card dragging
    const projectId = active.id as string;
    const targetColumnId = over.id as string;
    
    const targetColumn = columns.find(c => c.id === targetColumnId);
    if (!targetColumn) {
      resetDragState();
      return;
    }

    const project = projects.find(p => p.id === projectId);
    if (!project) {
      resetDragState();
      return;
    }

    // Use statusKey if available, otherwise fall back to title-based matching
    const newStatus = targetColumn.statusKey || targetColumn.title.toLowerCase().replace(/\s+/g, '-');
    const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;

    if (currentStatus === newStatus) {
      resetDragState();
      return;
    }

    // Show loading toast
    const loadingToast = sonnerToast.loading('A mover projeto...');
    
    try {
      await updateProjectStatus(projectId, phase, newStatus);
      
      // Dismiss loading and show success
      sonnerToast.dismiss(loadingToast);
      toast({
        title: 'Projeto movido ✅',
        description: `"${project.title}" foi movido para ${targetColumn.title}`,
        variant: 'success'
      });

      // If moving to "Entregue", handle automatic phase transition
      if (targetColumn.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY) {
        const needsEditing = project.responsavelEdicaoId ||
          ['hotel', 'experiencia', 'reels'].includes(project.videoType);

        if (phase === 'captacao' && needsEditing) {
          console.log('Project will continue to Edição phase');
        } else {
          console.log('Project marked as delivered');
        }
      }
    } catch (error) {
      // Dismiss loading and show error
      sonnerToast.dismiss(loadingToast);
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
        newStatusCaptacao = 'a-agendar'; // Updated to new status
      } else if (targetPhase === 'edicao') {
        newStatusEdicao = 'a-iniciar'; // Updated to new status
        if (phase === 'captacao') {
          newStatusCaptacao = 'entregue'; // Mark captacao as delivered
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
        
        await loadColumns();
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

  if (loading || columnsLoading) {
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

  // Check if there are NO columns (Kanban not initialized)
  if (columns.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex justify-center">
            <FolderKanban className="w-20 h-20 text-muted-foreground opacity-40" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              Kanban não inicializado
            </h3>
            <p className="text-muted-foreground">
              As colunas do Kanban ainda não foram criadas para {phaseLabels[phase].toLowerCase()}.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground">
              Recarregue a página ou entre em contato com o administrador do sistema.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if there are NO projects in any column
  // Note: columns.length > 0 ensures Kanban columns have been initialized
  const hasNoProjects = projects.length === 0 && columns.length > 0;

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

        {/* Empty State - Show when no projects exist */}
        {hasNoProjects ? (
          <div className="glass-card p-12 text-center">
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex justify-center">
                <div className="relative">
                  <FolderKanban className="w-20 h-20 text-muted-foreground opacity-40" />
                  <Package className="w-8 h-8 text-purple-400 absolute -bottom-1 -right-1 opacity-60" />
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">
                  Ainda não há projetos aqui
                </h3>
                <p className="text-muted-foreground">
                  Comece criando o seu primeiro projeto em {phaseLabels[phase].toLowerCase()}
                </p>
              </div>

              <div className="flex justify-center gap-3">
                <CreateProjectModal>
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Criar Primeiro Projeto
                  </Button>
                </CreateProjectModal>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-muted-foreground">
                  As colunas do Kanban foram inicializadas. Crie projetos para organizar o seu fluxo de trabalho.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Kanban Board with Projects */
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:gap-4 xl:gap-6 lg:overflow-x-auto pb-4 gap-4 items-start">
              <SortableContext
                items={reorderableColumns.map(c => c.id)}
                strategy={horizontalListSortingStrategy}
              >
              {columns.map((column, index) => {
                const columnProjects = getProjectsByColumnId(column.id);
                const isDeliveredColumn = column.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY;
                const isLocked = column.isLocked || isDeliveredColumn;

                return (
                  <DroppableColumn
                    key={column.id}
                    id={column.id}
                    title={column.title}
                    count={columnProjects.length}
                    phase={phase}
                    isEditing={editingColumn === column.id}
                    editingName={editingColumnName}
                    onStartEdit={() => {
                      if (isLocked) {
                        toast({
                          title: 'Operação não permitida',
                          description: 'A coluna "Entregue" não pode ser renomeada',
                          variant: 'error'
                        });
                        return;
                      }
                      setEditingColumn(column.id);
                      setEditingColumnName(column.title);
                    }}
                    onEditChange={setEditingColumnName}
                    onSaveEdit={() => handleSaveColumnName(column.id, editingColumnName)}
                    onCancelEdit={() => setEditingColumn(null)}
                    isDeliveredColumn={isDeliveredColumn}
                    isLocked={isLocked}
                    canDelete={!isLocked && columnProjects.length === 0}
                    onDelete={() => handleDeleteColumn(column.id)}
                    isDraggable={!isLocked}
                  >
                    <SortableContext
                      items={columnProjects.map(p => p.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {columnProjects.map((project) => (
                          <DraggableProjectCard
                            key={project.id}
                            project={project}
                            phase={phase}
                            onCardClick={setSelectedProject}
                            onMoveToPhase={handleMoveToPhase}
                            columns={columns}
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
        )}

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
  count,
  children,
  phase,
  isEditing,
  editingName,
  onStartEdit,
  onEditChange,
  onSaveEdit,
  onCancelEdit,
  isDeliveredColumn,
  isLocked,
  canDelete,
  onDelete,
  isDraggable = true,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
  phase?: ProjectPhase;
  isEditing: boolean;
  editingName: string;
  onStartEdit: () => void;
  onEditChange: (name: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  isDeliveredColumn?: boolean;
  isLocked?: boolean;
  canDelete?: boolean;
  onDelete?: () => void;
  isDraggable?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  // Special styles for delivered column
  const deliveredColumnStyles = isDeliveredColumn
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
      <div className={`glass-card h-full flex flex-col ${deliveredColumnStyles}`}>
        <div className={`p-3 md:p-4 border-b flex-shrink-0 ${
          isDeliveredColumn
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
                  {isDeliveredColumn && (
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  )}
                  <h3 className={`font-semibold text-sm md:text-base truncate ${
                    isDeliveredColumn ? 'text-green-400' : 'text-foreground'
                  }`}>
                    {title}
                  </h3>
                  <Badge
                    variant="outline"
                    className={`text-xs flex-shrink-0 ${
                      isDeliveredColumn ? 'border-green-500/50 text-green-400' : ''
                    }`}
                  >
                    {count}
                  </Badge>

                  {/* Info tooltip for delivered column */}
                  {isDeliveredColumn && (
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
                  {/* Edit column name - only for non-locked columns */}
                  {!isLocked && (
                    <DropdownMenuItem onClick={onStartEdit} className="cursor-pointer">
                      <Edit2 className="w-4 h-4 mr-2" />
                      Editar nome da coluna
                    </DropdownMenuItem>
                  )}

                  {/* Info about locked column */}
                  {isLocked && (
                    <DropdownMenuItem disabled className="cursor-not-allowed text-muted-foreground">
                      <Lock className="w-4 h-4 mr-2" />
                      Coluna bloqueada
                    </DropdownMenuItem>
                  )}

                  {/* Delete column - only for non-locked columns */}
                  {canDelete && !isLocked && (
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

        {/* Delivered column info banner */}
        {isDeliveredColumn && (
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
  columns,
  isCompact = false,
}: {
  project: Project;
  phase: ProjectPhase;
  onCardClick: (project: Project) => void;
  onMoveToPhase: (projectId: string, phase: ProjectPhase) => void;
  columns: Array<{ id: string; title: string; systemKey: string | null }>;
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
        columns={columns}
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
  columns,
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
  columns?: Array<{ id: string; title: string; systemKey: string | null }>;
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

  const handleQuickStatusChange = async (columnId: string) => {
    const column = columns?.find(c => c.id === columnId);
    if (!column) return;
    
    // Convert column title to status key (temporary until projects use column IDs)
    const newStatus = column.title.toLowerCase().replace(/\s+/g, '-');
    
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
                {columns && columns.length > 0 && (
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Mover para coluna...
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="glass-strong border-white/20">
                      {columns.filter(col => {
                        // Filter out current column
                        const colStatusKey = col.title.toLowerCase().replace(/\s+/g, '-');
                        return colStatusKey !== currentStatus;
                      }).map(col => (
                        <DropdownMenuItem
                          key={col.id}
                          onClick={() => handleQuickStatusChange(col.id)}
                          className="cursor-pointer"
                        >
                          {col.title}
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
