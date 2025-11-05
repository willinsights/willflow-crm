import { UserRole, ProjectPhase, UserPermissions, ProjectPermissions, Project, User } from './types';

// Definir permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    canViewFinance: true,
    canEditAllProjects: true,
    canViewAllProjects: true,
    canManageUsers: true,
    canManageClients: true,
    canManageCategories: true,
    canViewReports: true,
    phases: ['captacao', 'edicao', 'finalizados']
  },
  freelancer_captacao: {
    canViewFinance: false,
    canEditAllProjects: false,
    canViewAllProjects: false,
    canManageUsers: false,
    canManageClients: false,
    canManageCategories: false,
    canViewReports: false,
    phases: ['captacao']
  },
  editor_edicao: {
    canViewFinance: false,
    canEditAllProjects: false,
    canViewAllProjects: true, // Pode ver todos para se auto-atribuir
    canManageUsers: false,
    canManageClients: false,
    canManageCategories: false,
    canViewReports: false,
    phases: ['edicao']
  }
};

// Função para obter permissões do usuário
export function getUserPermissions(role: UserRole): UserPermissions {
  return ROLE_PERMISSIONS[role];
}

// Função para verificar se usuário pode ver/editar projeto específico
export function getProjectPermissions(
  user: User,
  project: Project,
  currentUserId: string
): ProjectPermissions {
  const userPerms = getUserPermissions(user.role);

  // Admin pode tudo
  if (user.role === 'admin') {
    return {
      canView: true,
      canEdit: true,
      canViewFinance: true,
      canAssignToSelf: true,
      canChangeStatus: true,
      canManageChecklist: true
    };
  }

  // Freelancer de captação
  if (user.role === 'freelancer_captacao') {
    const isAssigned = project.responsavelCaptacaoId === currentUserId;
    const isCaptacaoPhase = project.phase === 'captacao';

    return {
      canView: isAssigned && isCaptacaoPhase,
      canEdit: isAssigned && isCaptacaoPhase,
      canViewFinance: false,
      canAssignToSelf: false, // Apenas admin atribui
      canChangeStatus: isAssigned && isCaptacaoPhase,
      canManageChecklist: false
    };
  }

  // Editor de edição
  if (user.role === 'editor_edicao') {
    const isAssigned = project.responsavelEdicaoId === currentUserId;
    const isEdicaoPhase = project.phase === 'edicao';
    const canSelfAssign = !project.responsavelEdicaoId && isEdicaoPhase;

    return {
      canView: isEdicaoPhase || isAssigned,
      canEdit: isEdicaoPhase,
      canViewFinance: false,
      canAssignToSelf: canSelfAssign,
      canChangeStatus: isAssigned && isEdicaoPhase,
      canManageChecklist: isAssigned && isEdicaoPhase
    };
  }

  // Fallback - sem permissões
  return {
    canView: false,
    canEdit: false,
    canViewFinance: false,
    canAssignToSelf: false,
    canChangeStatus: false,
    canManageChecklist: false
  };
}

// Função para filtrar projetos baseado nas permissões
export function filterProjectsForUser(
  projects: Project[],
  user: User,
  currentUserId: string
): Project[] {
  const userPerms = getUserPermissions(user.role);

  // Admin vê tudo
  if (user.role === 'admin') {
    return projects;
  }

  // Freelancer de captação - apenas projetos atribuídos na fase de captação
  if (user.role === 'freelancer_captacao') {
    return projects.filter(project =>
      project.responsavelCaptacaoId === currentUserId &&
      project.phase === 'captacao'
    );
  }

  // Editor de edição - projetos na fase de edição
  if (user.role === 'editor_edicao') {
    return projects.filter(project =>
      project.phase === 'edicao' ||
      project.responsavelEdicaoId === currentUserId
    );
  }

  return [];
}

// Função para sanitizar dados do projeto (remover campos financeiros)
export function sanitizeProjectForUser(project: Project, user: User): Partial<Project> {
  const userPerms = getUserPermissions(user.role);

  if (!userPerms.canViewFinance) {
    // Remover campos financeiros para não-admins
    const {
      clientPrice,
      captationCost,
      editionCost,
      margin,
      paymentStatus,
      freelancerPaymentStatus,
      clientDueDate,
      clientReceivedDate,
      freelancerDueDate,
      freelancerPaidDate,
      ...sanitizedProject
    } = project;

    return sanitizedProject;
  }

  return project;
}

// Função para verificar se usuário pode acessar uma fase específica
export function canAccessPhase(user: User, phase: ProjectPhase): boolean {
  const userPerms = getUserPermissions(user.role);
  return userPerms.phases.includes(phase);
}

// Função para verificar permissões de rota
export function canAccessRoute(user: User, route: string): boolean {
  const userPerms = getUserPermissions(user.role);

  switch (route) {
    case '/dashboard':
      return true; // Todos podem ver dashboard (dados filtrados)
    case '/captacao':
      return userPerms.phases.includes('captacao');
    case '/edicao':
      return userPerms.phases.includes('edicao');
    case '/finalizados':
      return userPerms.phases.includes('finalizados');
    case '/clientes':
      return userPerms.canViewReports || userPerms.canManageClients;
    case '/relatorios':
      return userPerms.canViewReports;
    case '/configuracoes':
      return userPerms.canManageUsers || userPerms.canManageClients || userPerms.canManageCategories;
    case '/usuarios':
      return userPerms.canManageUsers;
    default:
      return false;
  }
}

// Função para validar se usuário pode executar ação
export function canPerformAction(
  user: User,
  action: string,
  resource?: any
): boolean {
  const userPerms = getUserPermissions(user.role);

  switch (action) {
    case 'create_project':
      return userPerms.canEditAllProjects;
    case 'edit_project':
      return userPerms.canEditAllProjects || (resource && getProjectPermissions(user, resource, user.id).canEdit);
    case 'view_finance':
      return userPerms.canViewFinance;
    case 'manage_users':
      return userPerms.canManageUsers;
    case 'manage_clients':
      return userPerms.canManageClients;
    case 'assign_project':
      return user.role === 'admin';
    case 'self_assign':
      return resource && getProjectPermissions(user, resource, user.id).canAssignToSelf;
    case 'change_status':
      return resource && getProjectPermissions(user, resource, user.id).canChangeStatus;
    case 'manage_checklist':
      return resource && getProjectPermissions(user, resource, user.id).canManageChecklist;
    default:
      return false;
  }
}

// Hook para verificar se checklist está completo
export function canCompleteProject(project: Project, user: User): {
  canComplete: boolean;
  reason?: string;
} {
  // Apenas admin e editor podem completar projetos na edição
  if (!canPerformAction(user, 'manage_checklist', project)) {
    return {
      canComplete: false,
      reason: 'Sem permissão para completar projetos'
    };
  }

  // Checklist feature removed - project can be completed
  return { canComplete: true };
}

// Função para logs de auditoria
export function createAuditLog(
  user: User,
  action: string,
  resource: string,
  resourceId: string,
  details?: any
) {
  const logEntry = {
    userId: user.id,
    userRole: user.role,
    action,
    resource,
    resourceId,
    details,
    timestamp: new Date().toISOString(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
  };

  // Em produção, isso seria enviado para o backend
  console.log('[AUDIT]', logEntry);

  return logEntry;
}
