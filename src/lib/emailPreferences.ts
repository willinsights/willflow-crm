/**
 * Email Preferences for WillFlow CRM
 * Permite ao utilizador escolher quais emails quer receber
 */

const EMAIL_PREFS_KEY = 'willflow_email_preferences';

export interface EmailPreferences {
  // Conta e Segurança
  welcomeEmail: boolean;
  passwordChanged: boolean;
  passwordReset: boolean;

  // Projetos
  projectCreated: boolean;
  projectCompleted: boolean;
  statusChanged: boolean;

  // Prazos
  deadlineReminder: boolean;
  deadlineUrgent: boolean;

  // Financeiro
  paymentReceived: boolean;
  freelancerPayment: boolean;
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  // Conta e Segurança - sempre ativado por padrão
  welcomeEmail: true,
  passwordChanged: true,
  passwordReset: true,

  // Projetos
  projectCreated: true,
  projectCompleted: true,
  statusChanged: true,

  // Prazos
  deadlineReminder: true,
  deadlineUrgent: true,

  // Financeiro
  paymentReceived: true,
  freelancerPayment: true,
};

export const EMAIL_PREFERENCE_LABELS: Record<keyof EmailPreferences, { label: string; description: string; category: string }> = {
  welcomeEmail: {
    label: 'Email de Boas-Vindas',
    description: 'Receber email quando a conta for criada',
    category: 'Conta e Segurança',
  },
  passwordChanged: {
    label: 'Alteração de Senha',
    description: 'Receber confirmação quando a senha for alterada',
    category: 'Conta e Segurança',
  },
  passwordReset: {
    label: 'Redefinição de Senha',
    description: 'Receber nova senha quando for redefinida',
    category: 'Conta e Segurança',
  },
  projectCreated: {
    label: 'Novo Projeto',
    description: 'Receber aviso quando um projeto for atribuído',
    category: 'Projetos',
  },
  projectCompleted: {
    label: 'Projeto Finalizado',
    description: 'Receber aviso quando um projeto for concluído',
    category: 'Projetos',
  },
  statusChanged: {
    label: 'Alteração de Status',
    description: 'Receber aviso quando o status de um projeto mudar',
    category: 'Projetos',
  },
  deadlineReminder: {
    label: 'Lembrete de Prazo',
    description: 'Receber lembrete quando um prazo estiver próximo',
    category: 'Prazos',
  },
  deadlineUrgent: {
    label: 'Prazo Urgente',
    description: 'Receber aviso quando um prazo vencer hoje ou amanhã',
    category: 'Prazos',
  },
  paymentReceived: {
    label: 'Pagamento Recebido',
    description: 'Receber aviso quando um pagamento for registado',
    category: 'Financeiro',
  },
  freelancerPayment: {
    label: 'Pagamento Pendente',
    description: 'Receber aviso sobre pagamentos a receber',
    category: 'Financeiro',
  },
};

export function getEmailPreferences(): EmailPreferences {
  if (typeof window === 'undefined') return DEFAULT_EMAIL_PREFERENCES;

  try {
    const stored = localStorage.getItem(EMAIL_PREFS_KEY);
    if (stored) {
      return { ...DEFAULT_EMAIL_PREFERENCES, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading email preferences:', error);
  }

  return DEFAULT_EMAIL_PREFERENCES;
}

export function saveEmailPreferences(prefs: Partial<EmailPreferences>): void {
  if (typeof window === 'undefined') return;

  try {
    const current = getEmailPreferences();
    const updated = { ...current, ...prefs };
    localStorage.setItem(EMAIL_PREFS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving email preferences:', error);
  }
}

export function shouldSendEmail(type: keyof EmailPreferences): boolean {
  const prefs = getEmailPreferences();
  return prefs[type] ?? true;
}

// Group preferences by category
export function getPreferencesByCategory(): Record<string, Array<{ key: keyof EmailPreferences; label: string; description: string }>> {
  const categories: Record<string, Array<{ key: keyof EmailPreferences; label: string; description: string }>> = {};

  for (const [key, value] of Object.entries(EMAIL_PREFERENCE_LABELS)) {
    const prefKey = key as keyof EmailPreferences;
    if (!categories[value.category]) {
      categories[value.category] = [];
    }
    categories[value.category].push({
      key: prefKey,
      label: value.label,
      description: value.description,
    });
  }

  return categories;
}

export default {
  get: getEmailPreferences,
  save: saveEmailPreferences,
  shouldSend: shouldSendEmail,
  getByCategory: getPreferencesByCategory,
  defaults: DEFAULT_EMAIL_PREFERENCES,
  labels: EMAIL_PREFERENCE_LABELS,
};
