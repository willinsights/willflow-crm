'use client';

import { useState, useEffect } from 'react';
import { Project, Client, User, ProjectPhase, ProjectFilters, DashboardStats } from './types';
import { mockProjects, mockClients } from './data';
import { projectsApi, clientsApi } from './api';

// Apenas 1 usuário admin
const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'Administrador',
  email: 'admin@in-sights.pt',
  role: 'admin',
  canViewFinance: true,
  canEditProjects: true,
  canViewAllProjects: true
};

export function useAppStore() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [filters, setFilters] = useState<ProjectFilters>({});
  const [selectedPhase, setSelectedPhase] = useState<ProjectPhase>('captacao');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  // Usuário fixo admin
  const currentUser = ADMIN_USER;
  const userPermissions = {
    canViewFinance: true,
    canEditAllProjects: true,
    canViewAllProjects: true,
    canManageUsers: true,
    canManageClients: true,
    canManageCategories: true,
    canViewReports: true,
    phases: ['captacao', 'edicao', 'finalizados'] as ProjectPhase[]
  };

  // Carregar dados reais da API apenas uma vez
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) return;

      setMounted(true);
      setLoading(true);

      try {
        // Carregar projetos e clientes da API
        const [projectsRes, clientsRes] = await Promise.all([
          projectsApi.list(),
          clientsApi.list()
        ]);

        if (isMounted) {
          if (projectsRes.success) {
            setProjects(projectsRes.data);
          }
          if (clientsRes.success) {
            setClients(clientsRes.data);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback para dados mock se API falhar
        if (isMounted) {
          setProjects(mockProjects);
          setClients(mockClients);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []); // Array vazio garante execução apenas uma vez

  // Funções CRUD simplificadas
  const reloadData = async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        projectsApi.list(),
        clientsApi.list()
      ]);
      if (projectsRes.success) setProjects(projectsRes.data);
      if (clientsRes.success) setClients(clientsRes.data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  };

  // Função pública para refresh manual
  const refreshData = async () => {
    await reloadData();
  };

  const createProject = async (projectData: any) => {
    console.log('🚀 Iniciando criação de projeto:', projectData);

    try {
      console.log('📡 Chamando API...');
      const response = await projectsApi.create(projectData);
      console.log('✅ Resposta da API:', response);

      if (response.success) {
        // Recarregar todos os dados para garantir sincronização
        await reloadData();
        console.log('✅ Projeto criado e dados recarregados');
        return response.data;
      }
      throw new Error(response.message || 'Erro na API');
    } catch (error) {
      console.error('❌ Erro ao criar projeto:', error);
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    try {
      setLoading(true);

      const response = await projectsApi.update(id, updates);
      if (response.success) {
        // Recarregar todos os dados após atualização
        await reloadData();
        console.log('✅ Projeto atualizado e sincronizado');
        return;
      }
      throw new Error(response.message || 'Erro na API');
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (id: string, phase: ProjectPhase, newStatus: string) => {
    try {
      console.log('📤 Atualizando status:', { id, phase, newStatus });
      const response = await projectsApi.updateStatus(id, phase, newStatus, currentUser.id);
      console.log('📥 Resposta update status:', response);

      if (response.success) {
        // Recarregar todos os dados para pegar automações
        await reloadData();

        // Log das automações executadas
        if (response.automations && response.automations.length > 0) {
          console.log('🤖 Automações executadas:', response.automations);
        }

        console.log('✅ Status atualizado e dados sincronizados');
        return;
      }

      // Se success é false, pega a mensagem de erro
      const errorMsg = (response as any).error || response.message || 'Erro ao atualizar status';
      throw new Error(errorMsg);
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setLoading(true);

      // Deletar localmente
      setProjects(prev => prev.filter(p => p.id !== id));

      // Tentar API
      try {
        await projectsApi.delete(id);
      } catch (apiError) {
        console.log('API offline, usando dados locais');
      }

    } catch (error) {
      console.error('Erro ao deletar projeto:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createClient = async (clientData: any) => {
    console.log('🚀 Iniciando criação de cliente:', clientData);

    try {
      console.log('📡 Chamando API...');
      const response = await clientsApi.create(clientData);
      console.log('✅ Resposta da API:', response);

      if (response.success) {
        // Recarregar dados após criar
        await reloadData();
        console.log('✅ Cliente criado e dados sincronizados');
        return response.data;
      }
      throw new Error(response.message || 'Erro na API');
    } catch (error) {
      console.error('❌ Erro ao criar cliente:', error);
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<Client>) => {
    try {
      setLoading(true);
      const response = await clientsApi.update(id, updates);

      if (response.success) {
        // Recarregar dados após atualizar
        await reloadData();
        console.log('✅ Cliente atualizado e dados sincronizados');
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar cliente:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Dados com relacionamentos (enriquecer ANTES de filtrar)
  const enrichedProjects = projects.map(project => ({
    ...project,
    client: clients.find(c => c.id === project.clientId)
  }));

  // Dados filtrados (usar enrichedProjects para ter dados do cliente)
  const filteredProjects = enrichedProjects.filter(project => {
    // Filter by filters
    if (filters.phase && project.phase !== filters.phase) return false;
    if (filters.clientId && project.clientId !== filters.clientId) return false;
    if (filters.videoType && project.videoType !== filters.videoType) return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = project.title?.toLowerCase().includes(query);
      const matchesClient = project.client?.name?.toLowerCase().includes(query);
      const matchesCategory = project.category?.name?.toLowerCase().includes(query);

      // Debug: log cada projeto testado
      if (matchesTitle || matchesClient || matchesCategory) {
        console.log(`✅ MATCH: "${query}" encontrado em ${project.title}`);
      }

      if (!matchesTitle && !matchesClient && !matchesCategory) {
        return false;
      }
    }

    return true;
  });

  // Debug: log resultado final
  if (searchQuery) {
    console.log(`🔍 Busca "${searchQuery}": ${filteredProjects.length} resultados de ${enrichedProjects.length} projetos`);
  }

  // Filtered clients based on search
  const filteredClients = clients.filter(client => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        client.name?.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.company?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Projetos por fase (usar enrichedProjects para ter dados do cliente)
  const projectsByPhase = {
    captacao: enrichedProjects.filter(p => p.phase === 'captacao'),
    edicao: enrichedProjects.filter(p => p.phase === 'edicao'),
    finalizados: enrichedProjects.filter(p => p.phase === 'finalizados')
  };

  // Estatísticas (usar enrichedProjects)
  const dashboardStats: DashboardStats = {
    totalProjects: enrichedProjects.length,
    activeProjects: enrichedProjects.filter(p => p.phase !== 'finalizados').length,
    completedProjects: enrichedProjects.filter(p => p.phase === 'finalizados').length,
    totalClients: clients.length,
    financialKPIs: {
      totalToReceive: enrichedProjects.filter(p => p.paymentStatus !== 'recebido').reduce((sum, p) => sum + p.clientPrice, 0),
      totalToPay: enrichedProjects.filter(p => p.freelancerPaymentStatus === 'a-pagar').reduce((sum, p) => sum + p.captationCost + p.editionCost, 0),
      totalMargin: enrichedProjects.reduce((sum, p) => sum + p.margin, 0),
      totalReceived: enrichedProjects.filter(p => p.paymentStatus === 'recebido').reduce((sum, p) => sum + p.clientPrice, 0)
    }
  };

  return {
    // User context
    currentUser,
    userPermissions,

    // Data
    projects: enrichedProjects,
    clients,
    users: [ADMIN_USER],

    // Filtered/computed data
    filteredProjects,
    filteredClients,
    projectsByPhase,
    dashboardStats,

    // State
    filters,
    selectedPhase,
    searchQuery,
    loading,
    error,
    mounted,
    lastRefresh,

    // Actions
    setFilters,
    setSelectedPhase,
    setSearchQuery,
    refreshData,
    createProject,
    updateProject,
    updateProjectStatus,
    deleteProject,
    createClient,
    updateClient,

    // Helper functions - todos retornam true para admin
    canPerformAction: () => true,
    getProjectPermissions: () => ({
      canView: true,
      canEdit: true,
      canViewFinance: true,
      canAssignToSelf: true,
      canChangeStatus: true,
      canManageChecklist: true
    }),
    canCompleteProject: () => ({ canComplete: true }),
    switchUser: () => {}, // Não faz nada - só admin
    assignProjectToSelf: async () => {}
  };
}
