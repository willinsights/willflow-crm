'use client';

import { useMemo } from 'react';
import { useAppStore } from './useAppStore';
import {
  getUserPermissions,
  canAccessProject,
  canEditProject,
  filterProjectsByPermission,
  sanitizeProjectForUser,
  sanitizeClientForUser,
  hasPermission,
  PermissionConfig,
} from './permissions';
import { Project, Client } from './types';

export function usePermissions() {
  const { currentUser } = useAppStore();

  const permissions = useMemo(() => {
    return getUserPermissions(currentUser);
  }, [currentUser]);

  const can = useMemo(() => {
    return (permission: keyof PermissionConfig): boolean => {
      return hasPermission(currentUser, permission);
    };
  }, [currentUser]);

  const canAccess = useMemo(() => {
    return (project: Project): boolean => {
      return canAccessProject(currentUser, project);
    };
  }, [currentUser]);

  const canEdit = useMemo(() => {
    return (project: Project): boolean => {
      return canEditProject(currentUser, project);
    };
  }, [currentUser]);

  const filterProjects = useMemo(() => {
    return (projects: Project[]): Project[] => {
      return filterProjectsByPermission(projects, currentUser);
    };
  }, [currentUser]);

  const sanitizeProject = useMemo(() => {
    return (project: Project): Project => {
      return sanitizeProjectForUser(project, currentUser);
    };
  }, [currentUser]);

  const sanitizeProjects = useMemo(() => {
    return (projects: Project[]): Project[] => {
      return projects.map(p => sanitizeProjectForUser(p, currentUser));
    };
  }, [currentUser]);

  const sanitizeClient = useMemo(() => {
    return (client: Client): Client => {
      return sanitizeClientForUser(client, currentUser) as Client;
    };
  }, [currentUser]);

  const sanitizeClients = useMemo(() => {
    return (clients: Client[]): Client[] => {
      return clients.map(c => sanitizeClientForUser(c, currentUser) as Client);
    };
  }, [currentUser]);

  const isAdmin = currentUser?.role === "admin";
  const isEditor = currentUser?.role === "editor_edicao";
  const isFreelancer = currentUser?.role === "freelancer_captacao";

  return {
    permissions,
    currentUser,
    isAdmin,
    isEditor,
    isFreelancer,
    can,
    canAccess,
    canEdit,
    filterProjects,
    sanitizeProject,
    sanitizeProjects,
    sanitizeClient,
    sanitizeClients,
    canViewFinance: permissions.canViewAllFinancials,
    canViewClientPrices: permissions.canViewClientPrices,
    canViewMargins: permissions.canViewMargins,
    canViewCosts: permissions.canViewCosts,
    canViewAllProjects: permissions.canViewAllProjects,
    canEditProjects: permissions.canEditAllProjects || permissions.canEditOwnProjects,
    canCreateProjects: permissions.canCreateProjects,
    canViewReports: permissions.canViewReports,
    canExportData: permissions.canExportData,
    canManageUsers: permissions.canEditUsers || permissions.canCreateUsers,
    canManageClients: permissions.canEditClients || permissions.canCreateClients,
  };
}
