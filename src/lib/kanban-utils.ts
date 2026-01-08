import { KANBAN_CONSTANTS } from './kanban-constants';

/**
 * Interface for Kanban column data
 */
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
 * Gets the status key from a Kanban column.
 * Prioritizes explicit statusKey, falls back to title transformation.
 * 
 * @param column - The Kanban column data
 * @returns The status key string
 */
export function getStatusKeyFromColumn(column: KanbanColumnData): string {
  if (column.statusKey) {
    return column.statusKey;
  }
  return column.title.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Checks if a project status matches a column.
 * 
 * @param projectStatus - The project's current status
 * @param column - The Kanban column to match against
 * @returns True if the project belongs to this column
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
 * Checks if a column is the locked "Delivered" column.
 * 
 * @param column - The Kanban column data
 * @returns True if this is the delivered/locked column
 */
export function isDeliveredColumn(column: KanbanColumnData): boolean {
  return column.isLocked || column.systemKey === KANBAN_CONSTANTS.DELIVERED_SYSTEM_KEY;
}
