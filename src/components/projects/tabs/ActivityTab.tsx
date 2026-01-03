'use client';

import { useState, useEffect } from 'react';
import { Loader2, Check, Edit, Trash, UserPlus, Tag, Calendar, FileText, Euro, MessageSquare, ListChecks } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useLocale } from '@/lib/LocaleContext';

interface Activity {
  id: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  createdAt: Date;
}

interface ActivityTabProps {
  taskId: string | null;
  canViewFinancial: boolean;
}

function getActivityIcon(action: string) {
  switch (action) {
    case 'created':
      return <Check className="h-4 w-4 text-green-400" />;
    case 'updated':
    case 'status_changed':
      return <Edit className="h-4 w-4 text-blue-400" />;
    case 'deleted':
      return <Trash className="h-4 w-4 text-red-400" />;
    case 'assigned':
      return <UserPlus className="h-4 w-4 text-purple-400" />;
    case 'tagged':
      return <Tag className="h-4 w-4 text-yellow-400" />;
    case 'completed':
    case 'checklist_completed':
      return <Check className="h-4 w-4 text-green-400" />;
    case 'checklist_added':
    case 'checklist_deleted':
    case 'checklist_uncompleted':
      return <ListChecks className="h-4 w-4 text-orange-400" />;
    case 'comment_added':
    case 'comment_edited':
    case 'comment_deleted':
      return <MessageSquare className="h-4 w-4 text-cyan-400" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
}

function getFieldLabel(field: string): string {
  const labels: Record<string, string> = {
    title: 'título',
    description: 'descrição',
    status: 'status',
    statusCaptacao: 'status de captação',
    statusEdicao: 'status de edição',
    phase: 'fase',
    priority: 'prioridade',
    assignedTo: 'responsável',
    responsavelCaptacaoId: 'responsável captação',
    responsavelEdicaoId: 'responsável edição',
    dueDate: 'data de entrega',
    clientDueDate: 'prazo cliente',
    freelancerDueDate: 'prazo freelancer',
    tags: 'tags',
    completed: 'conclusão',
    estimatedHours: 'horas estimadas',
    actualHours: 'horas reais',
    clientPrice: 'preço cliente',
    captationCost: 'custo captação',
    editionCost: 'custo edição',
    margin: 'margem',
    paymentStatus: 'status pagamento',
    freelancerPaymentStatus: 'pagamento freelancer',
    location: 'localização',
  };
  return labels[field] || field;
}

function useFormatValue(formatCurrency: (value: number) => string) {
  return function formatValue(field: string, value: any): string {
    if (value === null || value === undefined || value === '') return '—';

    if (field === 'dueDate' || field === 'clientDueDate' || field === 'freelancerDueDate') {
      return new Date(value).toLocaleDateString('pt-PT');
    }

    if (field === 'completed') {
      return value ? 'Sim' : 'Não';
    }

    if (field === 'clientPrice' || field === 'margin' || field === 'captationCost' || field === 'editionCost') {
      return formatCurrency(parseFloat(value) || 0);
    }

    if (field === 'priority') {
      const priorities: Record<string, string> = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        urgent: 'Urgente',
      };
      return priorities[value] || value;
    }

    if (field === 'status' || field === 'statusCaptacao' || field === 'statusEdicao') {
      const statuses: Record<string, string> = {
        todo: 'A Fazer',
        in_progress: 'Em Andamento',
        review: 'Em Revisão',
        done: 'Concluído',
        agendado: 'Agendado',
        'em-gravacao': 'Em Gravação',
        'upload-nas': 'Upload NAS',
        concluido: 'Concluído',
        'receber-ficheiros': 'Receber Ficheiros',
        decupagem: 'Decupagem',
        'em-edicao': 'Em Edição',
        feedback: 'Feedback',
        'revisao-cliente': 'Revisão Cliente',
        entregue: 'Entregue',
      };
      return statuses[value] || value;
    }

    return String(value);
  };
}

function getActivityMessage(activity: Activity, canViewFinancial: boolean, formatValue: (field: string, value: any) => string): string {
  const { action, field, oldValue, newValue, userName } = activity;

  // Hide financial fields for non-admins
  if (!canViewFinancial && field && ['clientPrice', 'margin', 'captationCost', 'editionCost'].includes(field)) {
    return `${userName} atualizou informações financeiras`;
  }

  switch (action) {
    case 'created':
      return `${userName} criou o projeto`;

    case 'completed':
      return `${userName} marcou como concluído`;

    case 'assigned':
      return `${userName} atribuiu para ${newValue}`;

    case 'status_changed':
      return `${userName} alterou o status para "${formatValue('status', newValue)}"`;

    case 'checklist_added':
      return `${userName} adicionou item à checklist: "${newValue}"`;

    case 'checklist_completed':
      return `${userName} completou item da checklist: "${newValue}"`;

    case 'checklist_uncompleted':
      return `${userName} desmarcou item da checklist: "${newValue}"`;

    case 'checklist_deleted':
      return `${userName} removeu item da checklist: "${oldValue}"`;

    case 'comment_added':
      return `${userName} adicionou um comentário`;

    case 'comment_edited':
      return `${userName} editou um comentário`;

    case 'comment_deleted':
      return `${userName} removeu um comentário`;

    case 'updated':
      if (field) {
        const fieldLabel = getFieldLabel(field);
        const oldVal = formatValue(field, oldValue);
        const newVal = formatValue(field, newValue);

        if (oldVal === '—') {
          return `${userName} definiu ${fieldLabel} como "${newVal}"`;
        }

        return `${userName} alterou ${fieldLabel} de "${oldVal}" para "${newVal}"`;
      }
      return `${userName} atualizou o projeto`;

    default:
      return `${userName} ${action.replace(/_/g, ' ')}`;
  }
}

export default function ActivityTab({ taskId, canViewFinancial }: ActivityTabProps) {
  const { formatCurrency } = useLocale();
  const formatValue = useFormatValue(formatCurrency);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  // Load activity log from API
  useEffect(() => {
    if (!taskId) return;

    const loadActivities = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/projects/${taskId}/activity`);
        const result = await response.json();

        if (result.success && result.data) {
          setActivities(result.data.map((activity: any) => ({
            id: activity.id,
            action: activity.action,
            field: activity.field,
            oldValue: activity.oldValue,
            newValue: activity.newValue,
            userId: activity.userId,
            userName: activity.userName || 'Sistema',
            userAvatar: activity.userAvatar,
            createdAt: new Date(activity.createdAt),
          })));
        } else {
          setActivities([]);
        }
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [taskId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Nenhuma atividade registrada</p>
        <p className="text-xs mt-1">As atividades aparecerão aqui quando houver alterações</p>
      </div>
    );
  }

  // Group activities by date
  const groupedActivities = activities.reduce((acc, activity) => {
    const date = activity.createdAt.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date} className="space-y-3">
          {/* Date header */}
          <div className="sticky top-0 bg-background py-2 border-b">
            <h3 className="text-sm font-medium text-muted-foreground">{date}</h3>
          </div>

          {/* Activities for this date */}
          <div className="space-y-3 pl-2">
            {dateActivities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                {/* Avatar */}
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarImage src={activity.userAvatar} />
                  <AvatarFallback className="text-xs">
                    {activity.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Activity content */}
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    {getActivityMessage(activity, canViewFinancial, formatValue)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.createdAt.toLocaleTimeString('pt-PT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Activity icon */}
                <div className="shrink-0 text-muted-foreground">
                  {getActivityIcon(activity.action)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
