'use client';

import { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Video,
  Edit3,
  User,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/useAppStore';
import TaskDrawer from '@/components/projects/TaskDrawer';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import { Project } from '@/lib/types';

interface CalendarEvent {
  id: string;
  projectId: string;
  title: string;
  date: Date;
  type: 'captacao' | 'edicao' | 'entrega-cliente' | 'entrega-freelancer';
  phase: string;
  project: Project;
}

export default function CalendarPage() {
  const { projects } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<string>('');

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Create events from all project dates
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = [];

    projects.forEach(project => {
      // Client due date - main deadline
      if (project.clientDueDate) {
        allEvents.push({
          id: `${project.id}-client-due`,
          projectId: project.id,
          title: project.title,
          date: new Date(project.clientDueDate),
          type: 'entrega-cliente',
          phase: project.phase,
          project
        });
      }

      // Freelancer due date - editing deadline
      if (project.freelancerDueDate) {
        allEvents.push({
          id: `${project.id}-freelancer-due`,
          projectId: project.id,
          title: project.title,
          date: new Date(project.freelancerDueDate),
          type: 'entrega-freelancer',
          phase: project.phase,
          project
        });
      }

      // For captação projects, show them on their phase
      if (project.phase === 'captacao' && project.clientDueDate) {
        // Already added above as entrega-cliente
      }

      // For edição projects without specific dates, use clientDueDate
      if (project.phase === 'edicao' && !project.freelancerDueDate && project.clientDueDate) {
        allEvents.push({
          id: `${project.id}-edicao`,
          projectId: project.id,
          title: `[Edição] ${project.title}`,
          date: new Date(project.clientDueDate),
          type: 'edicao',
          phase: project.phase,
          project
        });
      }
    });

    return allEvents;
  }, [projects]);

  const getEventsForDay = (day: number) => {
    return events.filter(event => {
      return (
        event.date.getDate() === day &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedProject(event.project);
  };

  const handleDayClick = (day: number) => {
    // Format date as YYYY-MM-DD
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${month}-${dayStr}`;

    setSelectedDateForCreate(dateStr);
    setCreateModalOpen(true);
  };

  const getEventColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'captacao':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'edicao':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'entrega-cliente':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'entrega-freelancer':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getEventIcon = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'captacao':
        return <Video className="w-3 h-3" />;
      case 'edicao':
        return <Edit3 className="w-3 h-3" />;
      case 'entrega-cliente':
        return <User className="w-3 h-3" />;
      case 'entrega-freelancer':
        return <Clock className="w-3 h-3" />;
      default:
        return null;
    }
  };

  const getEventLabel = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'captacao':
        return 'Captação';
      case 'edicao':
        return 'Edição';
      case 'entrega-cliente':
        return 'Entrega Cliente';
      case 'entrega-freelancer':
        return 'Entrega Freelancer';
      default:
        return '';
    }
  };

  const today = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);

  // Count events by type for the current month
  const eventCounts = useMemo(() => {
    const counts = {
      captacao: 0,
      edicao: 0,
      'entrega-cliente': 0,
      'entrega-freelancer': 0
    };

    events.forEach(event => {
      if (
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      ) {
        counts[event.type]++;
      }
    });

    return counts;
  }, [events, currentDate]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Calendário</h1>
        <p className="text-muted-foreground">
          Visualize prazos e entregas dos projetos
        </p>
      </div>

      {/* Month Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Video className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eventCounts.captacao}</p>
                <p className="text-xs text-muted-foreground">Captações</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Edit3 className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eventCounts.edicao}</p>
                <p className="text-xs text-muted-foreground">Edições</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <User className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eventCounts['entrega-cliente']}</p>
                <p className="text-xs text-muted-foreground">Entregas Cliente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <Clock className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{eventCounts['entrega-freelancer']}</p>
                <p className="text-xs text-muted-foreground">Entregas Freelancer</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={previousMonth}
                className="glass border-white/20"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="glass border-white/20"
              >
                Hoje
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextMonth}
                className="glass border-white/20"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground p-2"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2" />
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const dayEvents = getEventsForDay(day);
              const isToday =
                day === today.getDate() &&
                currentDate.getMonth() === today.getMonth() &&
                currentDate.getFullYear() === today.getFullYear();

              return (
                <div
                  key={day}
                  className={`
                    min-h-[100px] p-2 rounded-lg glass border group relative
                    ${isToday ? 'border-purple-500 bg-purple-500/10' : 'border-white/10'}
                    hover:bg-white/5 transition-colors
                  `}
                >
                  {/* Day header with add button */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'text-purple-400' : ''}`}>
                      {day}
                    </span>
                    <button
                      onClick={() => handleDayClick(day)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-purple-500/20 text-purple-400"
                      title={`Criar projeto em ${day}/${currentDate.getMonth() + 1}`}
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map(event => (
                      <button
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEventClick(event);
                        }}
                        className={`
                          w-full text-left text-[10px] p-1.5 rounded border truncate
                          ${getEventColor(event.type)}
                          hover:scale-105 transition-transform cursor-pointer
                        `}
                        title={`${getEventLabel(event.type)}: ${event.title}`}
                      >
                        <div className="flex items-center gap-1">
                          {getEventIcon(event.type)}
                          <span className="truncate">{event.project.title}</span>
                        </div>
                      </button>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-[10px] text-muted-foreground text-center">
                        +{dayEvents.length - 3} mais
                      </div>
                    )}

                    {/* Empty state - click to add */}
                    {dayEvents.length === 0 && (
                      <button
                        onClick={() => handleDayClick(day)}
                        className="w-full h-12 flex items-center justify-center text-[10px] text-muted-foreground/50
                                   hover:text-purple-400 hover:bg-purple-500/10 rounded transition-all
                                   opacity-0 group-hover:opacity-100"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Criar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded border-2 border-purple-500 bg-purple-500/10" />
              <span className="text-sm">Hoje</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/30" />
              <span className="text-sm">Captação</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500/20 border border-purple-500/30" />
              <span className="text-sm">Edição</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
              <span className="text-sm">Entrega Cliente</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />
              <span className="text-sm">Entrega Freelancer</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Drawer - Opens when clicking on an event */}
      <TaskDrawer
        open={!!selectedProject}
        taskId={selectedProject?.id || null}
        onClose={() => setSelectedProject(null)}
        onTaskUpdate={(taskId, updates) => {
          console.log('Project updated from calendar:', taskId, updates);
        }}
      />

      {/* Create Project Modal - Opens when clicking "+" on a day */}
      <CreateProjectModal
        isOpen={createModalOpen}
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) {
            setSelectedDateForCreate('');
          }
        }}
        defaultDate={selectedDateForCreate}
      />
    </div>
  );
}
