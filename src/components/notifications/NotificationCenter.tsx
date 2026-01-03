'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  BellRing,
  AlertTriangle,
  Clock,
  CheckCircle,
  Euro,
  Calendar,
  X,
  ChevronRight,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Project, Client, User } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useLocale } from '@/lib/LocaleContext';

interface Notification {
  id: string;
  type: 'overdue' | 'upcoming' | 'paid' | 'received' | 'warning';
  title: string;
  message: string;
  amount?: number;
  projectId?: string;
  projectTitle?: string;
  entityName?: string;
  dueDate?: Date;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: Date;
}

interface NotificationCenterProps {
  projects: Project[];
  clients: Client[];
  users: User[];
  onViewProject?: (projectId: string) => void;
}

export default function NotificationCenter({
  projects,
  clients,
  users,
  onViewProject,
}: NotificationCenterProps) {
  const { formatCurrency } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<string>>(new Set());
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);

  // Generate notifications based on project data
  const notifications = useMemo(() => {
    const notifs: Notification[] = [];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    projects.forEach((project) => {
      const client = clients.find((c) => c.id === project.clientId);

      // Client payment overdue
      if (project.clientDueDate && project.paymentStatus !== 'recebido') {
        const dueDate = new Date(project.clientDueDate);
        const daysOverdue = Math.floor(
          (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysOverdue > 0) {
          notifs.push({
            id: `overdue-client-${project.id}`,
            type: 'overdue',
            title: 'Pagamento em Atraso',
            message: `${client?.name || 'Cliente'} - ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''} de atraso`,
            amount: project.clientPrice,
            projectId: project.id,
            projectTitle: project.title,
            entityName: client?.name,
            dueDate,
            priority: daysOverdue > 30 ? 'urgent' : daysOverdue > 14 ? 'high' : 'medium',
            isRead: readNotifications.has(`overdue-client-${project.id}`),
            createdAt: dueDate,
          });
        } else if (dueDate <= threeDaysFromNow) {
          // Upcoming in 3 days
          const daysUntil = Math.ceil(
            (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
          );
          notifs.push({
            id: `upcoming-client-${project.id}`,
            type: 'upcoming',
            title: 'Pagamento Próximo',
            message: `${client?.name || 'Cliente'} - vence em ${daysUntil} dia${daysUntil > 1 ? 's' : ''}`,
            amount: project.clientPrice,
            projectId: project.id,
            projectTitle: project.title,
            entityName: client?.name,
            dueDate,
            priority: daysUntil <= 1 ? 'high' : 'medium',
            isRead: readNotifications.has(`upcoming-client-${project.id}`),
            createdAt: now,
          });
        }
      }

      // Freelancer payment overdue
      if (project.freelancerDueDate && project.freelancerPaymentStatus !== 'pago') {
        const totalCost = project.captationCost + project.editionCost;
        if (totalCost > 0) {
          const dueDate = new Date(project.freelancerDueDate);
          const daysOverdue = Math.floor(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const captacaoUser = users.find((u) => u.id === project.responsavelCaptacaoId);
          const edicaoUser = users.find((u) => u.id === project.responsavelEdicaoId);
          const freelancerName = captacaoUser?.name || edicaoUser?.name || 'Freelancer';

          if (daysOverdue > 0) {
            notifs.push({
              id: `overdue-freelancer-${project.id}`,
              type: 'overdue',
              title: 'Pagamento a Freelancer Atrasado',
              message: `${freelancerName} - ${daysOverdue} dia${daysOverdue > 1 ? 's' : ''} de atraso`,
              amount: totalCost,
              projectId: project.id,
              projectTitle: project.title,
              entityName: freelancerName,
              dueDate,
              priority: daysOverdue > 14 ? 'urgent' : daysOverdue > 7 ? 'high' : 'medium',
              isRead: readNotifications.has(`overdue-freelancer-${project.id}`),
              createdAt: dueDate,
            });
          } else if (dueDate <= sevenDaysFromNow) {
            const daysUntil = Math.ceil(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            notifs.push({
              id: `upcoming-freelancer-${project.id}`,
              type: 'upcoming',
              title: 'Pagamento a Freelancer',
              message: `${freelancerName} - vence em ${daysUntil} dia${daysUntil > 1 ? 's' : ''}`,
              amount: totalCost,
              projectId: project.id,
              projectTitle: project.title,
              entityName: freelancerName,
              dueDate,
              priority: daysUntil <= 3 ? 'high' : 'low',
              isRead: readNotifications.has(`upcoming-freelancer-${project.id}`),
              createdAt: now,
            });
          }
        }
      }
    });

    // Sort by priority and date
    return notifs.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }, [projects, clients, users, readNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const overdueCount = notifications.filter((n) => n.type === 'overdue').length;

  const displayedNotifications = showOnlyUnread
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const markAsRead = (id: string) => {
    setReadNotifications((prev) => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    setReadNotifications(new Set(notifications.map((n) => n.id)));
  };

  const getNotificationIcon = (type: string, priority: string) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className={cn('w-4 h-4', priority === 'urgent' ? 'text-red-500' : 'text-orange-400')} />;
      case 'upcoming':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'paid':
      case 'received':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Bell className="w-4 h-4 text-purple-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-red-500 bg-red-500/5';
      case 'high':
        return 'border-l-orange-500 bg-orange-500/5';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-500/5';
      default:
        return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative glass hover:bg-white/10"
        >
          {unreadCount > 0 ? (
            <BellRing className="w-5 h-5 text-yellow-400 animate-pulse" />
          ) : (
            <Bell className="w-5 h-5" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-96 p-0 glass-strong border-white/20"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold">Notificações</h3>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overdueCount} atrasado{overdueCount > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOnlyUnread(!showOnlyUnread)}
              className={cn(
                'text-xs',
                showOnlyUnread && 'bg-purple-500/20 text-purple-400'
              )}
            >
              Não lidas
            </Button>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-muted-foreground"
              >
                Ler todas
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <CheckCircle className="w-12 h-12 text-green-400 mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground text-center">
                {showOnlyUnread
                  ? 'Todas as notificações foram lidas'
                  : 'Nenhuma notificação no momento'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 hover:bg-white/5 transition-colors cursor-pointer border-l-4',
                    getPriorityColor(notification.priority),
                    !notification.isRead && 'bg-purple-500/5'
                  )}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.projectId && onViewProject) {
                      onViewProject(notification.projectId);
                      setIsOpen(false);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type, notification.priority)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={cn(
                          'text-sm font-medium truncate',
                          !notification.isRead && 'text-foreground',
                          notification.isRead && 'text-muted-foreground'
                        )}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="flex-shrink-0 w-2 h-2 rounded-full bg-purple-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {notification.message}
                      </p>
                      {notification.projectTitle && (
                        <p className="text-xs text-purple-400 mt-1 truncate">
                          {notification.projectTitle}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        {notification.amount && (
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              notification.type === 'overdue'
                                ? 'border-red-500/30 text-red-400'
                                : 'border-green-500/30 text-green-400'
                            )}
                          >
                            <Euro className="w-3 h-3 mr-1" />
                            {formatCurrency(notification.amount)}
                          </Badge>
                        )}
                        {notification.dueDate && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {notification.dueDate.toLocaleDateString('pt-PT')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {notifications.length} notificação{notifications.length !== 1 ? 'ões' : ''}
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-purple-400 hover:text-purple-300"
          >
            <Settings className="w-3 h-3 mr-1" />
            Configurações
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
