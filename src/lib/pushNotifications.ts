/**
 * Web Push Notifications Utility for WillFlow CRM
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
}

export type NotificationType =
  | 'project_created'
  | 'project_updated'
  | 'project_deadline'
  | 'payment_received'
  | 'payment_due'
  | 'status_change'
  | 'reminder';

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  onClick?: () => void;
}

export async function showNotification(
  type: NotificationType,
  options: PushNotificationOptions
): Promise<Notification | null> {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/logo-willflow-sistema.png',
      tag: options.tag || 'willflow-' + type + '-' + Date.now(),
      data: options.data,
      requireInteraction: options.requireInteraction || false,
    });

    notification.onclick = () => {
      window.focus();
      options.onClick?.();
      notification.close();
    };

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
}

export const NotificationPresets = {
  projectCreated: (projectTitle: string) => ({
    type: 'project_created' as NotificationType,
    title: 'Novo Projeto Criado',
    body: 'O projeto "' + projectTitle + '" foi criado com sucesso!',
  }),

  projectDeadline: (projectTitle: string, daysLeft: number) => ({
    type: 'project_deadline' as NotificationType,
    title: 'Prazo Proximo',
    body: daysLeft === 0
      ? 'O projeto "' + projectTitle + '" vence hoje!'
      : 'O projeto "' + projectTitle + '" vence em ' + daysLeft + ' dia' + (daysLeft > 1 ? 's' : '') + '!',
    requireInteraction: daysLeft <= 1,
  }),

  paymentReceived: (clientName: string, amount: string) => ({
    type: 'payment_received' as NotificationType,
    title: 'Pagamento Recebido',
    body: 'Pagamento de ' + amount + ' recebido de ' + clientName,
  }),

  statusChange: (projectTitle: string, newStatus: string) => ({
    type: 'status_change' as NotificationType,
    title: 'Status Atualizado',
    body: '"' + projectTitle + '" agora esta em: ' + newStatus,
  }),
};

const NOTIFICATION_PREFS_KEY = 'willflow_notification_prefs';

export interface NotificationPreferences {
  enabled: boolean;
  projectUpdates: boolean;
  deadlineAlerts: boolean;
  paymentAlerts: boolean;
}

const defaultPrefs: NotificationPreferences = {
  enabled: true,
  projectUpdates: true,
  deadlineAlerts: true,
  paymentAlerts: true,
};

export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') return defaultPrefs;
  try {
    const stored = localStorage.getItem(NOTIFICATION_PREFS_KEY);
    if (stored) return { ...defaultPrefs, ...JSON.parse(stored) };
  } catch {}
  return defaultPrefs;
}

export function saveNotificationPreferences(prefs: Partial<NotificationPreferences>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = getNotificationPreferences();
    localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {}
}

const notificationUtils = {
  isSupported: isNotificationSupported,
  getPermission: getNotificationPermission,
  requestPermission: requestNotificationPermission,
  show: showNotification,
  presets: NotificationPresets,
  getPreferences: getNotificationPreferences,
  savePreferences: saveNotificationPreferences,
};

export default notificationUtils;
