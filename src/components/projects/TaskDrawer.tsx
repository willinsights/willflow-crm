'use client';

import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  X,
  Check,
  Archive,
  MoreVertical,
  User,
  Calendar,
  Tag,
  Flag,
  Euro,
  Loader2,
  ChevronDown,
  ListChecks,
  MessageSquare,
  Paperclip,
  History,
  Save,
  CheckCircle2,
  MapPin,
  Film
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/useAppStore';
import { useLocale } from '@/lib/LocaleContext';

// Lazy load heavy components
const ChecklistTab = lazy(() => import('./tabs/ChecklistTab'));
const CommentsTab = lazy(() => import('./tabs/CommentsTab'));
const AttachmentsTab = lazy(() => import('./tabs/AttachmentsTab'));
const ActivityTab = lazy(() => import('./tabs/ActivityTab'));
const MediaTab = lazy(() => import('./tabs/MediaTab'));

interface TaskDrawerProps {
  open: boolean;
  taskId: string | null;
  onClose: () => void;
  onTaskUpdate?: (taskId: string, updates: any) => void;
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

export default function TaskDrawer({ open, taskId, onClose, onTaskUpdate }: TaskDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, userPermissions } = useAppStore();
  const { formatCurrency } = useLocale();

  const [task, setTask] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [lastError, setLastError] = useState<string>('');
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [categories, setCategories] = useState<any[]>([]);

  // Use ref to accumulate pending changes (avoid stale closure)
  const pendingChangesRef = useRef<any>({});

  // Store previous task state for rollback on error (optimistic updates)
  const previousTaskRef = useRef<any>(null);

  // Check permissions
  const canViewFinancial = userPermissions?.canViewFinance || currentUser?.role === 'admin';
  const canEdit = userPermissions?.canEditAllProjects || currentUser?.role === 'admin';

  // Deep linking: Update URL when drawer opens/closes
  useEffect(() => {
    if (open && taskId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('taskId', taskId);
      router.push(`?${params.toString()}`, { scroll: false });
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('taskId');
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
      router.push(newUrl, { scroll: false });
    }
  }, [open, taskId]);

  // Load project data and categories
  useEffect(() => {
    if (!taskId) return;

    setLoading(true);

    // Buscar projeto e categorias em paralelo
    Promise.all([
      fetch(`/api/projects/${taskId}`).then(res => res.json()),
      fetch('/api/categories').then(res => res.json())
    ])
      .then(([projectData, categoriesData]) => {
        // Processar projeto
        if (projectData.success && projectData.data) {
          const project = projectData.data;

          // Formatar data para input[type=date] (YYYY-MM-DD)
          const formatDateForInput = (date: any) => {
            if (!date) return '';
            const d = new Date(date);
            return d.toISOString().split('T')[0];
          };

          setTask({
            id: project.id,
            title: project.title,
            description: project.description || '',
            status: project.phase === 'captacao' ? project.statusCaptacao : project.statusEdicao,
            priority: 'medium',
            assignedTo: project.phase === 'captacao' ? project.responsavelCaptacao?.name : project.responsavelEdicao?.name,
            assignedToId: project.phase === 'captacao' ? project.responsavelCaptacaoId : project.responsavelEdicaoId,
            clientDueDate: formatDateForInput(project.clientDueDate),
            projectId: project.id,
            projectName: project.title,
            categoryId: project.categoryId,
            categoryName: project.category?.name,
            clientName: project.client?.name,
            location: project.location,
            videoType: project.videoType,
            nasLink: project.nasLink,
            frameIoLink: project.frameIoLink,
            customId: project.customId || '', // Campo ID personalizado
            clientPrice: project.clientPrice,
            margin: project.margin,
            captationCost: project.captationCost,
            editionCost: project.editionCost,
            completed: project.statusEdicao === 'entregue',
            createdAt: new Date(project.createdAt),
            updatedAt: new Date(project.updatedAt),
          });
        }

        // Processar categorias
        if (categoriesData.success && categoriesData.data) {
          setCategories(categoriesData.data);
        }

        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      });
  }, [taskId]);

  // Autosave with debounce (800ms) + optimistic updates
  const autosave = useCallback((updates: any, optimisticTask?: any) => {
    console.log('🔵 Autosave chamado com:', updates);

    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Store current state for potential rollback
    if (optimisticTask) {
      previousTaskRef.current = optimisticTask;
    }

    // Accumulate changes in ref (avoid stale closure)
    pendingChangesRef.current = { ...pendingChangesRef.current, ...updates };
    setSaveState('saving');

    const timeout = setTimeout(async () => {
      try {
        const dataToSave = { ...pendingChangesRef.current };

        console.log('🔵 [AUTOSAVE] TaskId:', taskId);
        console.log('🔵 [AUTOSAVE] Dados a salvar:', dataToSave);
        console.log('🔵 [AUTOSAVE] URL completa:', `/api/projects/${taskId}`);

        // SAVE REAL via API
        const response = await fetch(`/api/projects/${taskId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dataToSave)
        });

        console.log('📥 [AUTOSAVE] Response status:', response.status);
        console.log('📥 [AUTOSAVE] Response ok:', response.ok);
        console.log('📥 [AUTOSAVE] Response headers:', Object.fromEntries(response.headers.entries()));

        // Try to get response body
        let result;
        const contentType = response.headers.get('content-type');
        console.log('📥 [AUTOSAVE] Content-Type:', contentType);

        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
          console.log('📥 [AUTOSAVE] Response JSON:', result);
        } else {
          const text = await response.text();
          console.log('📥 [AUTOSAVE] Response Text:', text);
          result = { success: false, error: 'Resposta não é JSON: ' + text };
        }

        if (!response.ok || !result.success) {
          const errorMsg = result.error || `HTTP ${response.status}: ${response.statusText}`;
          console.error('❌ [AUTOSAVE] Erro da API:', errorMsg);
          throw new Error(errorMsg);
        }

        console.log('✅ [AUTOSAVE] Projeto guardado com sucesso!');

        setSaveState('saved');
        pendingChangesRef.current = {}; // Clear after successful save

        if (onTaskUpdate && taskId) {
          onTaskUpdate(taskId, dataToSave);
        }

        // Show "saved" for 2s then hide
        setTimeout(() => setSaveState('idle'), 2000);

      } catch (error: any) {
        console.error('❌ [AUTOSAVE] ERRO CAPTURADO:', {
          message: error.message,
          name: error.name,
          stack: error.stack,
          error: error
        });

        // Rollback: Revert to previous state (optimistic update failed)
        if (previousTaskRef.current) {
          console.log('🔄 [AUTOSAVE] Revertendo para estado anterior...');
          setTask(previousTaskRef.current);
          previousTaskRef.current = null;
        }

        // Save error message for display
        setLastError(error.message || 'Erro desconhecido');
        setSaveState('error');

        // Show error for 5s then hide
        setTimeout(() => {
          setSaveState('idle');
          setLastError('');
        }, 5000);
      }
    }, 800);

    setSaveTimeout(timeout);
  }, [taskId, saveTimeout, onTaskUpdate]);

  // Handle field changes with optimistic updates
  const handleFieldChange = (field: string, value: any) => {
    if (!canEdit) return;

    // Store previous state for potential rollback
    const previousTask = { ...task };

    // Optimistic update: Update UI immediately
    setTask((prev: any) => ({ ...prev, [field]: value }));

    // Save in background with rollback capability
    autosave({ [field]: value }, previousTask);

    // Log activity
    logActivity('updated', field, task?.[field], value);
  };

  // Log activity (simplified)
  const logActivity = (action: string, field?: string, oldValue?: any, newValue?: any) => {
    // TODO: POST to /api/tasks/:id/activity
    console.log('Activity:', { action, field, oldValue, newValue, userId: currentUser?.id });
  };

  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [open]);

  // Handle close (save pending changes first)
  const handleClose = async () => {
    if (Object.keys(pendingChangesRef.current).length > 0) {
      // Force save before closing
      setSaveState('saving');
      // Trigger immediate save by clearing timeout and saving
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }
      // Give it a moment to save
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    onClose();
  };

  const handleMarkComplete = () => {
    handleFieldChange('completed', !task?.completed);
    handleFieldChange('status', task?.completed ? 'in_progress' : 'done');
  };

  const handleArchive = () => {
    handleFieldChange('archived', true);
    handleClose();
  };

  const handleDuplicate = () => {
    // TODO: Duplicate task
    console.log('Duplicating task...');
  };

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja eliminar esta tarefa?')) {
      // TODO: DELETE /api/tasks/:id
      handleClose();
    }
  };

  if (!task && !loading) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            {/* Fixed Header */}
            <DialogHeader className="border-b p-6 space-y-4 shrink-0">
              {/* Top bar: Close, Actions, Save State */}
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>

                <div className="flex items-center gap-2">
                  {/* Save state indicator with smooth animations */}
                  {saveState === 'saving' && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground animate-in fade-in duration-200">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      A guardar...
                    </div>
                  )}
                  {saveState === 'saved' && (
                    <div className="flex items-center gap-1 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                      <CheckCircle2 className="h-4 w-4" />
                      Guardado
                    </div>
                  )}
                  {saveState === 'error' && (
                    <div className="flex items-center gap-1 text-sm text-red-600 font-medium animate-in fade-in shake duration-300">
                      <X className="h-4 w-4" />
                      Erro ao guardar
                    </div>
                  )}

                  {/* Action buttons */}
                  <Button
                    variant={task?.completed ? "outline" : "default"}
                    size="sm"
                    onClick={handleMarkComplete}
                    disabled={!canEdit}
                  >
                    <Check className="h-4 w-4 mr-1" />
                    {task?.completed ? 'Reabrir' : 'Concluir'}
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleArchive}>
                        <Archive className="h-4 w-4 mr-2" />
                        Arquivar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDuplicate}>
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        className="text-red-600"
                      >
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Title (editable) */}
              <div>
                <Input
                  value={task?.title || ''}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  placeholder="Nome da tarefa"
                  disabled={!canEdit}
                  className="text-2xl font-bold border-none px-0 focus-visible:ring-0 h-auto"
                />
              </div>

              {/* Quick info badges */}
              <div className="flex flex-wrap gap-2">
                {/* Status */}
                <Select
                  value={task?.status}
                  onValueChange={(value) => handleFieldChange('status', value)}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-auto h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">A Fazer</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="review">Em Revisão</SelectItem>
                    <SelectItem value="done">Concluído</SelectItem>
                  </SelectContent>
                </Select>

                {/* Priority */}
                <Select
                  value={task?.priority}
                  onValueChange={(value) => handleFieldChange('priority', value)}
                  disabled={!canEdit}
                >
                  <SelectTrigger className="w-auto h-7 text-xs">
                    <Flag className="h-3 w-3 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>

                {/* Assigned to */}
                <Badge variant="outline" className="h-7">
                  <User className="h-3 w-3 mr-1" />
                  {task?.assignedTo || 'Não atribuído'}
                </Badge>

                {/* Due date */}
                {task?.dueDate && (
                  <Badge variant="outline" className="h-7">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </Badge>
                )}

                {/* Tags */}
                {task?.tags?.map((tag: string) => (
                  <Badge key={tag} variant="secondary" className="h-7">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Project/Client info */}
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>Projeto:</span>
                <span className="font-medium">{task?.projectName}</span>
                <span>•</span>
                <span>{task?.category}</span>
              </div>
            </DialogHeader>

            {/* Scrollable content with tabs */}
            <div className="flex-1 overflow-y-auto">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full sticky top-0 z-10 bg-background rounded-none border-b">
                  <TabsTrigger value="description" className="flex-1">
                    Descrição
                  </TabsTrigger>
                  <TabsTrigger value="checklist" className="flex-1">
                    <ListChecks className="h-4 w-4 mr-1" />
                    Checklist
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Comentários
                  </TabsTrigger>
                  <TabsTrigger value="media" className="flex-1">
                    <Film className="h-4 w-4 mr-1" />
                    Media
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="flex-1">
                    <History className="h-4 w-4 mr-1" />
                    Atividade
                  </TabsTrigger>
                </TabsList>

                {/* Description Tab */}
                <TabsContent value="description" className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Descrição</label>
                    <Textarea
                      value={task?.description || ''}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      placeholder="Adicione uma descrição detalhada..."
                      rows={8}
                      disabled={!canEdit}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Data de Entrega Cliente
                      </label>
                      <Input
                        type="date"
                        value={task?.clientDueDate || ''}
                        onChange={(e) => handleFieldChange('clientDueDate', e.target.value)}
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        Categoria
                      </label>
                      <Select
                        value={task?.categoryId || ''}
                        onValueChange={(value) => handleFieldChange('categoryId', value)}
                        disabled={!canEdit}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Localização
                      </label>
                      <Input
                        value={task?.location || ''}
                        onChange={(e) => handleFieldChange('location', e.target.value)}
                        placeholder="Ex: Lisboa, Porto..."
                        disabled={!canEdit}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">ID Personalizado</label>
                      <Input
                        value={task?.customId || ''}
                        onChange={(e) => handleFieldChange('customId', e.target.value)}
                        placeholder="Ex: PROJ-2024-001"
                        disabled={!canEdit}
                      />
                    </div>
                  </div>

                  {/* Financial info (only for admins) */}
                  {canViewFinancial && (
                    <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Euro className="h-3 w-3" />
                          Preço Cliente
                        </label>
                        <div className="text-lg font-bold text-green-600">
                          {formatCurrency(task?.clientPrice || 0)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Margem</label>
                        <div className="text-lg font-bold text-purple-600">
                          {formatCurrency(task?.margin || 0)}
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                {/* Checklist Tab - Lazy loaded */}
                <TabsContent value="checklist" className="p-6">
                  <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
                    <ChecklistTab taskId={taskId} canEdit={canEdit} />
                  </Suspense>
                </TabsContent>

                {/* Comments Tab - Lazy loaded */}
                <TabsContent value="comments" className="p-6">
                  <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
                    <CommentsTab taskId={taskId} canEdit={canEdit} />
                  </Suspense>
                </TabsContent>

                {/* Media Tab - NAS & Frame.io - Lazy loaded */}
                <TabsContent value="media" className="p-6">
                  <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
                    <MediaTab projectId={taskId || ''} />
                  </Suspense>
                </TabsContent>

                {/* Activity Tab - Lazy loaded */}
                <TabsContent value="activity" className="p-6">
                  <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto" />}>
                    <ActivityTab taskId={taskId} canViewFinancial={canViewFinancial} />
                  </Suspense>
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
