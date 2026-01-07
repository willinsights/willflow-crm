/**
 * Kanban Utility Functions
 * 
 * This file contains utility functions for Kanban board operations,
 * centralizing logic for status transformations and column matching.
 */

import { KANBAN_CONSTANTS } from './kanban-constants';

export interface KanbanColumnData {
  id: string;
  title: string;
  statusKey: string | null;
  position: number;
  isLocked: boolean;
  systemKey: string | null;
  color: string | null;
  isActive: boolean;
}

/**
 * Obtém a chave de status de uma coluna do Kanban
 * Prioriza statusKey explícito, com fallback para transformação do título
 */
export function getStatusKeyFromColumn(column: KanbanColumnData): string {
  if (column.statusKey) {
    return column.statusKey;
  }
  return column.title.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Verifica se um projeto pertence a uma coluna específica
 * 
 * @param projectStatus - The current status of the project
 * @param column - The kanban column to check against
 * @returns true if the project status matches the column's status key
 * 
 * @example
 * ```typescript
 * const project = { statusCaptacao: 'agendado' };
 * const column = { title: 'Agendado', statusKey: 'agendado', ... };
 * const matches = matchProjectToColumn(project.statusCaptacao, column); // true
 * ```
 */
export function matchProjectToColumn(
  projectStatus: string | null | undefined,
  column: KanbanColumnData
): boolean {
  if (!projectStatus) return false;
  const columnStatus = getStatusKeyFromColumn(column);
  return projectStatus === columnStatus;
}

/**
 * Verifica se uma coluna é a coluna "Entregue" (bloqueada)
 */
export function isDeliveredColumn(column: KanbanColumnData): boolean {
  return column.isLocked || column.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY;
}
