/**
 * Centralized Kanban Constants
 * 
 * This file contains all constants related to the Kanban board to avoid magic strings
 * and ensure consistency across the application.
 */

export const KANBAN_CONSTANTS = {
  DELIVERED_COLUMN_TITLE: 'Entregue',
  DELIVERED_SYSTEM_KEY: 'DELIVERED',
  DEFAULT_ORGANIZATION: 'default',
} as const;

/**
 * Default status keys for each phase
 * These define the standard workflow statuses that should be used when creating
 * new projects or initializing columns.
 * 
 * @example
 * ```typescript
 * // Use when creating a new project in captacao phase
 * const initialStatus = DEFAULT_STATUSES.CAPTACAO.initial; // 'a-agendar'
 * ```
 */
export const DEFAULT_STATUSES = {
  CAPTACAO: {
    initial: 'a-agendar',
    scheduled: 'agendado',
    executing: 'em-execucao',
    delivered: 'entregue',
  },
  EDICAO: {
    initial: 'a-iniciar',
    editing: 'em-edicao',
    review: 'em-revisao',
    delivered: 'entregue',
  },
} as const;

export const PHASE_LABELS = {
  captacao: 'Captação',
  edicao: 'Edição',
  finalizados: 'Finalizados',
} as const;
