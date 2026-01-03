'use client';

import { User, UserRole, Project } from './types';

// Permission types
export interface PermissionConfig {
  // Financial visibility
  canViewClientPrices: boolean;
  canViewCosts: boolean;
  canViewMargins: boolean;
  canViewAllFinancials: boolean;

  // Project access
  canViewAllProjects: boolean;
  canViewOwnProjects: boolean;
  canEditAllProjects: boolean;
  canEditOwnProjects: boolean;
  canCreateProjects: boolean;
  canDeleteProjects: boolean;

  // Client access
  canViewClients: boolean;
  canViewClientContacts: boolean;
  canEditClients: boolean;
  canCreateClients: boolean;

  // User/Collaborator access
  canViewUsers: boolean;
  canEditUsers: boolean;
  canCreateUsers: boolean;

  // Content access
  canViewChecklist: boolean;
  canEditChecklist: boolean;
  canViewComments: boolean;
  canAddComments: boolean;
  canViewMedia: boolean;
  canAddMedia: boolean;

  // Reports
  canViewReports: boolean;
  canExportData: boolean;

  // System
  canManageCategories: boolean;
  canManageKanbanColumns: boolean;
}

// Default permissions by role
export const ROLE_PERMISSIONS: Record<UserRole, PermissionConfig> = {
  admin: {
    canViewClientPrices: true,
    canViewCosts: true,
    canViewMargins: true,
    canViewAllFinancials: true,
    canViewAllProjects: true,
    canViewOwnProjects: true,
    canEditAllProjects: true,
    canEditOwnProjects: true,
    canCreateProjects: true,
    canDeleteProjects: true,
    canViewClients: true,
    canViewClientContacts: true,
    canEditClients: true,
    canCreateClients: true,
    canViewUsers: true,
    canEditUsers: true,
    canCreateUsers: true,
    canViewChecklist: true,
    canEditChecklist: true,
    canViewComments: true,
    canAddComments: true,
    canViewMedia: true,
    canAddMedia: true,
    canViewReports: true,
    canExportData: true,
    canManageCategories: true,
    canManageKanbanColumns: true,
  },

  editor_edicao: {
    canViewClientPrices: false, // Can't see client prices
    canViewCosts: true, // Can see own costs
    canViewMargins: false, // Can't see margins
    canViewAllFinancials: false,
    canViewAllProjects: true,
    canViewOwnProjects: true,
    canEditAllProjects: false,
    canEditOwnProjects: true,
    canCreateProjects: false,
    canDeleteProjects: false,
    canViewClients: true,
    canViewClientContacts: false, // Can't see client contact details
    canEditClients: false,
    canCreateClients: false,
    canViewUsers: true,
    canEditUsers: false,
    canCreateUsers: false,
    canViewChecklist: true,
    canEditChecklist: true,
    canViewComments: true,
    canAddComments: true,
    canViewMedia: true,
    canAddMedia: true,
    canViewReports: false,
    canExportData: false,
    canManageCategories: false,
    canManageKanbanColumns: false,
  },

  freelancer_captacao: {
    canViewClientPrices: false, // Can't see client prices
    canViewCosts: true, // Can see own costs only
    canViewMargins: false, // Can't see margins
    canViewAllFinancials: false,
    canViewAllProjects: false, // Can only see own projects
    canViewOwnProjects: true,
    canEditAllProjects: false,
    canEditOwnProjects: true,
    canCreateProjects: false,
    canDeleteProjects: false,
    canViewClients: true,
    canViewClientContacts: false, // Can't see client contact details
    canEditClients: false,
    canCreateClients: false,
    canViewUsers: false,
    canEditUsers: false,
    canCreateUsers: false,
    canViewChecklist: true,
    canEditChecklist: true,
    canViewComments: true,
    canAddComments: true,
    canViewMedia: true,
    canAddMedia: true,
    canViewReports: false,
    canExportData: false,
    canManageCategories: false,
    canManageKanbanColumns: false,
  },

  visualizer: {
    canViewClientPrices: false,
    canViewCosts: false,
    canViewMargins: false,
    canViewAllFinancials: false,
    canViewAllProjects: true,
    canViewOwnProjects: true,
    canEditAllProjects: false,
    canEditOwnProjects: false,
    canCreateProjects: false,
    canDeleteProjects: false,
    canViewClients: true,
    canViewClientContacts: false,
    canEditClients: false,
    canCreateClients: false,
    canViewUsers: false,
    canEditUsers: false,
    canCreateUsers: false,
    canViewChecklist: true,
    canEditChecklist: false,
    canViewComments: true,
    canAddComments: false,
    canViewMedia: true,
    canAddMedia: false,
    canViewReports: false,
    canExportData: false,
    canManageCategories: false,
    canManageKanbanColumns: false,
  },
};

// Visualizer role (read-only) - Legacy export for compatibility
export const VISUALIZER_PERMISSIONS: PermissionConfig = {
  canViewClientPrices: false,
  canViewCosts: false,
  canViewMargins: false,
  canViewAllFinancials: false,
  canViewAllProjects: true,
  canViewOwnProjects: true,
  canEditAllProjects: false,
  canEditOwnProjects: false,
  canCreateProjects: false,
  canDeleteProjects: false,
  canViewClients: true,
  canViewClientContacts: false,
  canEditClients: false,
  canCreateClients: false,
  canViewUsers: false,
  canEditUsers: false,
  canCreateUsers: false,
  canViewChecklist: true,
  canEditChecklist: false,
  canViewComments: true,
  canAddComments: false,
  canViewMedia: true,
  canAddMedia: false,
  canViewReports: false,
  canExportData: false,
  canManageCategories: false,
  canManageKanbanColumns: false,
};

// Storage key for custom permissions
const CUSTOM_PERMISSIONS_KEY = 'willflow-custom-permissions';

// Get custom permissions from localStorage
function getCustomPermissions(): Partial<Record<UserRole, PermissionConfig>> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(CUSTOM_PERMISSIONS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Erro ao carregar permissões personalizadas:', error);
  }
  return {};
}

// Get permissions for a user
export function getUserPermissions(user: User | null): PermissionConfig {
  if (!user) {
    return VISUALIZER_PERMISSIONS;
  }

  // Admin always uses default permissions
  if (user.role === 'admin') {
    return ROLE_PERMISSIONS.admin;
  }

  // Check for custom permissions
  const customPermissions = getCustomPermissions();
  if (customPermissions[user.role]) {
    return customPermissions[user.role]!;
  }

  return ROLE_PERMISSIONS[user.role] || VISUALIZER_PERMISSIONS;
}

// Check if user can access a project
export function canAccessProject(user: User | null, project: Project): boolean {
  if (!user) return false;

  const permissions = getUserPermissions(user);

  if (permissions.canViewAllProjects) return true;

  if (permissions.canViewOwnProjects) {
    return (
      project.responsavelCaptacaoId === user.id ||
      project.responsavelEdicaoId === user.id
    );
  }

  return false;
}

// Check if user can edit a project
export function canEditProject(user: User | null, project: Project): boolean {
  if (!user) return false;

  const permissions = getUserPermissions(user);

  if (permissions.canEditAllProjects) return true;

  if (permissions.canEditOwnProjects) {
    return (
      project.responsavelCaptacaoId === user.id ||
      project.responsavelEdicaoId === user.id
    );
  }

  return false;
}

// Filter projects based on user permissions
export function filterProjectsByPermission(
  projects: Project[],
  user: User | null
): Project[] {
  if (!user) return [];

  const permissions = getUserPermissions(user);

  if (permissions.canViewAllProjects) {
    return projects;
  }

  if (permissions.canViewOwnProjects) {
    return projects.filter(
      p =>
        p.responsavelCaptacaoId === user.id ||
        p.responsavelEdicaoId === user.id
    );
  }

  return [];
}

// Sanitize project for display based on permissions
export function sanitizeProjectForUser(
  project: Project,
  user: User | null
): Project {
  if (!user) return sanitizeProjectForViewer(project);

  const permissions = getUserPermissions(user);

  const sanitized = { ...project };

  // Hide client prices if no permission
  if (!permissions.canViewClientPrices) {
    sanitized.clientPrice = 0;
  }

  // Hide margins if no permission
  if (!permissions.canViewMargins) {
    sanitized.margin = 0;
  }

  // For non-admin, show only own costs
  if (!permissions.canViewAllFinancials && permissions.canViewCosts) {
    if (project.responsavelCaptacaoId !== user.id) {
      sanitized.captationCost = 0;
    }
    if (project.responsavelEdicaoId !== user.id) {
      sanitized.editionCost = 0;
    }
  }

  // Hide all costs if no permission
  if (!permissions.canViewCosts) {
    sanitized.captationCost = 0;
    sanitized.editionCost = 0;
  }

  return sanitized;
}

// Sanitize project for viewer (no financial data)
function sanitizeProjectForViewer(project: Project): Project {
  return {
    ...project,
    clientPrice: 0,
    captationCost: 0,
    editionCost: 0,
    margin: 0,
  };
}

// Sanitize client for display based on permissions
export function sanitizeClientForUser(
  client: any,
  user: User | null
): any {
  if (!user) {
    // Remove contact details for non-users
    const { email, phone, ...rest } = client;
    return rest;
  }

  const permissions = getUserPermissions(user);

  if (!permissions.canViewClientContacts) {
    const { email, phone, ...rest } = client;
    return rest;
  }

  return client;
}

// Helper to check specific permission
export function hasPermission(
  user: User | null,
  permission: keyof PermissionConfig
): boolean {
  const permissions = getUserPermissions(user);
  return permissions[permission];
}
