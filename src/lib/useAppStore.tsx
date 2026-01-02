'use client';

import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { Project, Client, User, ProjectPhase, ProjectFilters, DashboardStats } from './types';
import { mockProjects, mockClients } from './data';
import { projectsApi, clientsApi } from './api';
import {
  cacheProjects,
  getCachedProjects,
  cacheClients,
  getCachedClients,
  getLastSyncTime,
  isDataStale,
  savePreferences,
  getPreferences,
  type CachedProject,
  type CachedClient
} from './localStorage';

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

// Type for the store context
interface AppStoreContextType {
  // User context
  currentUser: User;
  userPermissions: {
    canViewFinance: boolean;
    canEditAllProjects: boolean;
    canViewAllProjects: boolean;
    canManageUsers: boolean;
    canManageClients: boolean;
    canManageCategories: boolean;
    canViewReports: boolean;
    phases: ProjectPhase[];
  };

  // Data
  projects: Project[];
  clients: Client[];
  users: User[];

  // Filtered/computed data
  filteredProjects: Project[];
  filteredClients: Client[];
  projectsByPhase: {
    captacao: Project[];
    edicao: Project[];
    finalizados: Project[];
  };
  dashboardStats: DashboardStats;

  // State
  filters: ProjectFilters;
  selectedPhase: ProjectPhase;
  searchQuery: string;
  loading: boolean;
  error: string | null;
  mounted: boolean;
  lastRefresh: Date | null;

  // Actions
  setFilters: (filters: ProjectFilters) => void;
  setSelectedPhase: (phase: ProjectPhase) => void;
  setSearchQuery: (query: string) => void;
  refreshData: () => Promise<void>;
  createProject: (data: any) => Promise<any>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  updateProjectStatus: (id: string, phase: ProjectPhase, status: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  createClient: (data: any) => Promise<any>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<void>;

  // Helpers
  canPerformAction: () => boolean;
  getProjectPermissions: () => any;
  canCompleteProject: () => { canComplete: boolean };
  switchUser: () => void;
  assignProjectToSelf: () => Promise<void>;
}

// Create the context
const AppStoreContext = createContext<AppStoreContextType | null>(null);

// Provider component
export function AppStoreProvider({ children }: { children: ReactNode }) {
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

      // 1. Primeiro, tentar carregar do localStorage (resposta instantânea)
      const cachedProjectsData = getCachedProjects();
      const cachedClientsData = getCachedClients();
      const hasCache = cachedProjectsData.length > 0 || cachedClientsData.length > 0;

      if (hasCache) {
        console.log('💾 Carregando dados do cache local...');
        // Mostrar dados do cache imediatamente
        if (cachedProjectsData.length > 0) {
          setProjects(cachedProjectsData as unknown as Project[]);
        }
        if (cachedClientsData.length > 0) {
          setClients(cachedClientsData as unknown as Client[]);
        }
        setLoading(false);
      }

      try {
        // 2. Carregar projetos e clientes da API (atualização em background)
        const [projectsRes, clientsRes] = await Promise.all([
          projectsApi.list(),
          clientsApi.list()
        ]);

        if (isMounted) {
          // Usar dados da API ou fallback para mock
          if (projectsRes.success && projectsRes.data) {
            setProjects(projectsRes.data);
            // Salvar no cache para próxima vez
            cacheProjects(projectsRes.data as unknown as CachedProject[]);
            console.log('✅ Projetos sincronizados e cacheados');
          } else if (!hasCache) {
            console.log('📦 Usando dados mock para projetos (API indisponível)');
            setProjects(mockProjects);
          }

          if (clientsRes.success && clientsRes.data) {
            setClients(clientsRes.data);
            // Salvar no cache para próxima vez
            cacheClients(clientsRes.data as unknown as CachedClient[]);
            console.log('✅ Clientes sincronizados e cacheados');
          } else if (!hasCache) {
            console.log('📦 Usando dados mock para clientes (API indisponível)');
            setClients(mockClients);
          }

          setLastRefresh(new Date());
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Fallback para dados mock se API falhar E não temos cache
        if (isMounted && !hasCache) {
          console.log('📦 Usando dados mock (erro de conexão, sem cache)');
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
  const reloadData = useCallback(async () => {
    try {
      const [projectsRes, clientsRes] = await Promise.all([
        projectsApi.list(),
        clientsApi.list()
      ]);
      if (projectsRes.success) {
        setProjects(projectsRes.data);
        // Atualizar cache
        cacheProjects(projectsRes.data as unknown as CachedProject[]);
      }
      if (clientsRes.success) {
        setClients(clientsRes.data);
        // Atualizar cache
        cacheClients(clientsRes.data as unknown as CachedClient[]);
      }
      setLastRefresh(new Date());
      console.log('🔄 Dados recarregados e cache atualizado');
    } catch (error) {
      console.error('Erro ao recarregar dados:', error);
    }
  }, []);

  // Função pública para refresh manual
  const refreshData = useCallback(async () => {
    await reloadData();
  }, [reloadData]);

  const createProject = useCallback(async (projectData: any) => {
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
  }, [reloadData]);

  const updateProject = useCallback(async (id: string, updates: Partial<Project>) => {
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
  }, [reloadData]);

  const updateProjectStatus = useCallback(async (id: string, phase: ProjectPhase, newStatus: string) => {
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
  }, [reloadData]);

  const deleteProject = useCallback(async (id: string) => {
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
  }, []);

  const createClient = useCallback(async (clientData: any) => {
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
  }, [reloadData]);

  const updateClient = useCallback(async (id: string, updates: Partial<Client>) => {
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
  }, [reloadData]);

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
      const matchesLocation = project.location?.toLowerCase().includes(query);
      const matchesDescription = project.description?.toLowerCase().includes(query);

      if (!matchesTitle && !matchesClient && !matchesCategory && !matchesLocation && !matchesDescription) {
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

  const value: AppStoreContextType = {
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

  return (
    <AppStoreContext.Provider value={value}>
      {children}
    </AppStoreContext.Provider>
  );
}

// Hook to use the store - now uses context
export function useAppStore(): AppStoreContextType {
  const context = useContext(AppStoreContext);

  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }

  return context;
}
