'use client';

import { useState } from 'react';
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
  RotateCcw
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
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/useAppStore';
import { Project, ProjectPhase } from '@/lib/types';
import { statusLabels, videoTypeLabels, statusTransitions } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import EditProjectModal from '@/components/projects/EditProjectModal';

interface KanbanBoardProps {
  phase?: ProjectPhase;
}

export default function KanbanBoard({ phase = 'edicao' }: KanbanBoardProps) {
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Use filtered projects if search is active, otherwise use phase projects
  const projects = searchQuery
    ? filteredProjects.filter(p => p.phase === phase)
    : (projectsByPhase[phase] || []);

  const getStatusesByPhase = (phase: ProjectPhase): string[] => {
    switch (phase) {
      case 'captacao':
        return ['agendado', 'em-gravacao', 'upload-nas', 'concluido'];
      case 'edicao':
        return ['receber-ficheiros', 'decupagem', 'em-edicao', 'feedback', 'revisao-cliente', 'entregue'];
      case 'finalizados':
        return ['entregue'];
      default:
        return [];
    }
  };

  const statuses = getStatusesByPhase(phase);

  const getProjectsByStatus = (status: string) => {
    return projects.filter(project => {
      const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
      return currentStatus === status;
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);

    const project = projects.find(p => p.id === active.id);
    setDraggedProject(project || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const projectId = active.id as string;
      const newStatus = over.id as string;

      // Verificar se a transição é válida
      const project = projects.find(p => p.id === projectId);
      if (project) {
        const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
        const allowedTransitions = statusTransitions[currentStatus || ''] || [];

        if (allowedTransitions.includes(newStatus)) {
          handleStatusChange(projectId, newStatus);
        }
      }
    }

    setActiveId(null);
    setDraggedProject(null);
  };

  const handleStatusChange = async (projectId: string, newStatus: string) => {
    try {
      await updateProjectStatus(projectId, phase, newStatus);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao alterar status');
    }
  };

  // Show loading spinner while data is being fetched or component not mounted
  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Carregando projetos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kanban Board with Drag and Drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Responsive grid for mobile/tablet, horizontal scroll for desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:flex lg:gap-4 xl:gap-6 lg:overflow-x-auto pb-4 gap-4 items-start">
          {statuses.map((status) => {
            const statusProjects = getProjectsByStatus(status);

            return (
              <DroppableColumn
                key={status}
                id={status}
                title={statusLabels[status] || status}
                count={statusProjects.length}
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
                        onStatusChange={handleStatusChange}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DroppableColumn>
            );
          })}
        </div>

        <DragOverlay>
          {activeId && draggedProject ? (
            <ProjectCard project={draggedProject} phase={phase} isDragging />
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Droppable Column Component
function DroppableColumn({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useSortable({ id });

  return (
    <div ref={setNodeRef} className="kanban-column transition-all duration-200 self-start w-full lg:min-w-[280px] lg:max-w-[320px] xl:min-w-[320px] xl:max-w-[360px]">
      <div className="glass-card h-full flex flex-col">
        <div className="p-3 md:p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm md:text-base text-foreground truncate">{title}</h3>
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {count}
            </Badge>
          </div>
        </div>
        <div className="p-3 md:p-4 space-y-3 min-h-[200px] flex-1">{children}</div>
      </div>
    </div>
  );
}

// Draggable Project Card Component
function DraggableProjectCard({
  project,
  phase,
  onStatusChange,
}: {
  project: Project;
  phase: ProjectPhase;
  onStatusChange: (projectId: string, newStatus: string) => void;
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
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <ProjectCard project={project} phase={phase} />
    </div>
  );
}

// Project Card Component
function ProjectCard({
  project,
  phase,
  isDragging = false,
}: {
  project: Project;
  phase: ProjectPhase;
  isDragging?: boolean;
}) {
  const { userPermissions } = useAppStore();

  const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
  const availableTransitions = statusTransitions[currentStatus || ''] || [];

  return (
    <Card className={`glass cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-105 ${isDragging ? 'shadow-lg' : ''}`}>
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
            <GripVertical className="w-3 h-3 text-muted-foreground" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-strong border border-white/20">
                <EditProjectModal project={project} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-2 md:space-y-3">
        {/* Location */}
        {project.location && (
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{project.location}</span>
          </div>
        )}

        {/* Financial Info - Only for admins */}
        {userPermissions.canViewFinance && (
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex justify-between text-[10px] md:text-xs gap-2">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-medium truncate">{formatCurrency(project.clientPrice)}</span>
            </div>
            <div className="flex justify-between text-[10px] md:text-xs gap-2">
              <span className="text-muted-foreground">Margem:</span>
              <span className={`font-medium truncate ${project.margin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(project.margin)}
              </span>
            </div>
          </div>
        )}

        {/* Due Date */}
        {project.clientDueDate && (
          <div className="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-xs text-muted-foreground">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>
              {new Date(project.clientDueDate).toLocaleDateString('pt-PT')}
            </span>
          </div>
        )}

        {/* Links */}
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

        {/* Responsible Person */}
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
      </CardContent>
    </Card>
  );
}
