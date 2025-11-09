'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  BellRing,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Calendar,
  Euro,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/lib/useAppStore';
import { Project } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'deadline' | 'payment' | 'checklist' | 'project' | 'system';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  message: string;
  project?: Project;
  actionUrl?: string;
  createdAt: Date;
  isRead: boolean;
  daysUntilDue?: number;
}

interface NotificationCenterProps {
  onNotificationClick?: (notification: Notification) => void;
}

export default function NotificationCenter({ onNotificationClick }: NotificationCenterProps) {
  const { projects, currentUser, userPermissions } = useAppStore();
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Load read status from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`notifications-read-${currentUser.id}`);
    if (stored) {
      try {
        setReadIds(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load read notifications', e);
      }
    }
  }, [currentUser.id]);

  // Generate notifications based on projects and deadlines
  const notifications = useMemo((): Notification[] => {
    const now = new Date();
    const notifications: Notification[] = [];

    // Get visible projects for current user
    const userProjects = projects.filter(project => {
      // Apply RBAC filtering
      if (currentUser.role === 'admin') return true;
      if (currentUser.role === 'freelancer_captacao') {
        return project.responsavelCaptacaoId === currentUser.id && project.phase === 'captacao';
      }
      if (currentUser.role === 'editor_edicao') {
        return project.phase === 'edicao' || project.responsavelEdicaoId === currentUser.id;
      }
      return false;
    });

    userProjects.forEach(project => {
      // Client deadline notifications
      if (project.clientDueDate) {
        const dueDate = new Date(project.clientDueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 14 && daysUntilDue >= 0) {
          let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
          let title = '';

          if (daysUntilDue <= 1) {
            priority = 'urgent';
            title = daysUntilDue === 0 ? '🚨 Entrega HOJE!' : '⚡ Entrega AMANHÃ!';
          } else if (daysUntilDue <= 3) {
            priority = 'high';
            title = `📅 Entrega em ${daysUntilDue} dias`;
          } else if (daysUntilDue <= 7) {
            priority = 'medium';
            title = `⏰ Entrega em ${daysUntilDue} dias`;
          } else {
            priority = 'low';
            title = `📝 Entrega em ${daysUntilDue} dias`;
          }

          notifications.push({
            id: `deadline-${project.id}`,
            type: 'deadline',
            priority,
            title,
            message: `${project.title} - ${project.client?.name}`,
            project,
            createdAt: now,
            isRead: false,
            daysUntilDue
          });
        }
      }

      // Freelancer payment notifications
      if (userPermissions.canViewFinance && project.freelancerDueDate) {
        const dueDate = new Date(project.freelancerDueDate);
        const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilDue <= 7 && daysUntilDue >= 0 && project.freelancerPaymentStatus === 'a-pagar') {
          notifications.push({
            id: `payment-${project.id}`,
            type: 'payment',
            priority: daysUntilDue <= 1 ? 'urgent' : daysUntilDue <= 3 ? 'high' : 'medium',
            title: `💰 Pagamento em ${daysUntilDue} ${daysUntilDue === 1 ? 'dia' : 'dias'}`,
            message: `${formatCurrency(project.captationCost + project.editionCost)} - ${project.title}`,
            project,
            createdAt: now,
            isRead: false,
            daysUntilDue
          });
        }
      }

      // Checklist feature removed - keeping for future implementation

      // Project assignment notifications
      if (project.phase === 'edicao' && !project.responsavelEdicaoId && currentUser.role === 'editor_edicao') {
        notifications.push({
          id: `assignment-${project.id}`,
          type: 'project',
          priority: 'low',
          title: `🎯 Projeto disponível`,
          message: `${project.title} - Pode auto-atribuir`,
          project,
          createdAt: now,
          isRead: false
        });
      }
    });

    // Sort by priority and date
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    return notifications.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    }).map(notif => ({
      ...notif,
      isRead: readIds.includes(notif.id)
    }));
  }, [projects, currentUser, userPermissions, readIds]);

  // Save read status to localStorage
  const markAsRead = (notificationId: string) => {
    setReadIds(prev => {
      const updated = [...prev, notificationId];
      localStorage.setItem(`notifications-read-${currentUser.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(allIds);
    localStorage.setItem(`notifications-read-${currentUser.id}`, JSON.stringify(allIds));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.isRead).length;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getPriorityIcon = (type: string) => {
    switch (type) {
      case 'deadline': return <Calendar className="h-4 w-4" />;
      case 'payment': return <Euro className="h-4 w-4" />;
      case 'checklist': return <CheckCircle className="h-4 w-4" />;
      case 'project': return <User className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="glass-card relative">
          {urgentCount > 0 ? (
            <BellRing className="w-4 h-4 text-red-400 animate-pulse" />
          ) : (
            <Bell className="w-4 h-4" />
          )}
          {unreadCount > 0 && (
            <Badge
              className={`absolute -top-1 -right-1 h-5 w-5 text-xs flex items-center justify-center ${
                urgentCount > 0 ? 'bg-red-500 text-white animate-pulse' : 'bg-purple-500 text-white'
              }`}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="glass-strong border border-white/20 w-96 max-h-[80vh] overflow-hidden"
        sideOffset={8}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notificações</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-7"
                >
                  Marcar como lidas
                </Button>
              )}
              <Badge variant="secondary" className="bg-white/10">
                {unreadCount} novas
              </Badge>
            </div>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-white/5 ${
                    notification.isRead
                      ? 'border-white/10 opacity-70'
                      : `border-l-4 ${getPriorityColor(notification.priority)}`
                  }`}
                  onClick={() => {
                    markAsRead(notification.id);
                    onNotificationClick?.(notification);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-1 rounded ${getPriorityColor(notification.priority)}`}>
                      {getPriorityIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      {notification.daysUntilDue !== undefined && (
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {notification.daysUntilDue === 0
                              ? 'Hoje'
                              : notification.daysUntilDue === 1
                                ? 'Amanhã'
                                : `${notification.daysUntilDue} dias`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="p-3 border-t border-white/10">
            <p className="text-xs text-center text-muted-foreground">
              {notifications.length} notificação{notifications.length !== 1 ? 'ões' : ''} total
            </p>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
