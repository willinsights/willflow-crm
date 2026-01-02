'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Info, Clock, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'deadline';
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 = no auto-dismiss
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastNotificationsProps {
  notifications: ToastNotification[];
  onDismiss: (id: string) => void;
}

export default function ToastNotifications({ notifications, onDismiss }: ToastNotificationsProps) {
  const [visibleNotifications, setVisibleNotifications] = useState<ToastNotification[]>([]);

  useEffect(() => {
    setVisibleNotifications(notifications);

    // Auto-dismiss notifications with duration
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          onDismiss(notification.id);
        }, notification.duration);
      }
    });
  }, [notifications, onDismiss]);

  const getToastIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />;
      case 'deadline':
        return <Clock className="h-5 w-5 text-orange-400" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-green-500/50 bg-green-500/10';
      case 'error':
        return 'border-red-500/50 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'deadline':
        return 'border-orange-500/50 bg-orange-500/10';
      case 'info':
      default:
        return 'border-blue-500/50 bg-blue-500/10';
    }
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {visibleNotifications.map((notification, index) => (
        <div
          key={notification.id}
          className={`glass-strong border p-4 rounded-lg shadow-2xl transform transition-all duration-300 ease-out ${
            getToastStyles(notification.type)
          }`}
          style={{
            animation: `slideInRight 0.3s ease-out ${index * 0.1}s both`,
          }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getToastIcon(notification.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-foreground">
                  {notification.title}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-white/10"
                  onClick={() => onDismiss(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {notification.message && (
                <p className="text-sm text-muted-foreground mt-1">
                  {notification.message}
                </p>
              )}

              {notification.action && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs glass border-white/20 hover:bg-white/10"
                    onClick={() => {
                      notification.action?.onClick();
                      onDismiss(notification.id);
                    }}
                  >
                    {notification.action.label}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for managing toast notifications
export function useToastNotifications() {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastNotification = {
      id,
      duration: 5000, // default 5 seconds
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'success', title, message, action });
  }, [addToast]);

  const showError = useCallback((title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'error', title, message, action, duration: 7000 });
  }, [addToast]);

  const showWarning = useCallback((title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'warning', title, message, action, duration: 6000 });
  }, [addToast]);

  const showInfo = useCallback((title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'info', title, message, action });
  }, [addToast]);

  const showDeadlineAlert = useCallback((title: string, message?: string, action?: ToastNotification['action']) => {
    return addToast({ type: 'deadline', title, message, action, duration: 8000 });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showDeadlineAlert,
  };
}
