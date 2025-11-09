import { Project, Client, User, Category } from './types';

// Configuração da API
const API_BASE_URL = '/api';

// Utilitário para fazer requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    // Se response não é OK mas tem mensagem de erro do backend, retorna ela
    if (!response.ok) {
      // Retorna o objeto com success: false para manter compatibilidade
      return data as T;
    }

    return data;
  } catch (error) {
    // Erro de rede ou parsing JSON
    console.error('API Request Error:', error);
    throw error;
  }
}

// 📁 API de Projetos
export const projectsApi = {
  // Listar projetos
  list: async (filters?: {
    phase?: string;
    clientId?: string;
    videoType?: string;
    assignedToMe?: boolean;
    userId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    return apiRequest<{ success: boolean; data: Project[]; total: number }>(
      `/projects${queryString ? `?${queryString}` : ''}`
    );
  },

  // Buscar projeto específico
  get: async (id: string) => {
    return apiRequest<{ success: boolean; data: Project }>(
      `/projects/${id}`
    );
  },

  // Criar projeto
  create: async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'subtasks' | 'margin' | 'checklistItems' | 'checklistProgress'>) => {
    return apiRequest<{ success: boolean; data: Project; message: string }>(
      '/projects',
      {
        method: 'POST',
        body: JSON.stringify(projectData),
      }
    );
  },

  // Atualizar projeto
  update: async (id: string, updates: Partial<Project>) => {
    return apiRequest<{ success: boolean; data: Project; message: string }>(
      `/projects/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  // Deletar projeto
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; data: Project; message: string }>(
      `/projects/${id}`,
      {
        method: 'DELETE',
      }
    );
  },

  // Atualizar status (com automações)
  updateStatus: async (id: string, phase: string, newStatus: string, userId?: string) => {
    return apiRequest<{
      success: boolean;
      data: Project;
      message: string;
      automations: string[]
    }>(
      `/projects/${id}/status`,
      {
        method: 'PUT',
        body: JSON.stringify({ phase, newStatus, userId }),
      }
    );
  },

  // Obter status e transições
  getStatus: async (id: string) => {
    return apiRequest<{
      success: boolean;
      data: {
        currentStatus: { captacao?: string; edicao?: string };
        availableTransitions: { captacao: string[]; edicao: string[] };
        phase: string;
        canComplete: boolean;
      };
    }>(`/projects/${id}/status`);
  },
};

// 👥 API de Clientes
export const clientsApi = {
  // Listar clientes
  list: async (filters?: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    return apiRequest<{ success: boolean; data: Client[]; total: number }>(
      `/clients${queryString ? `?${queryString}` : ''}`
    );
  },

  // Buscar cliente específico
  get: async (id: string) => {
    return apiRequest<{ success: boolean; data: Client & { projects: any[] } }>(
      `/clients/${id}`
    );
  },

  // Criar cliente
  create: async (clientData: Omit<Client, 'id' | 'createdAt' | 'totalRevenue' | 'totalCosts' | 'totalMargin' | 'projectCount'>) => {
    return apiRequest<{ success: boolean; data: Client; message: string }>(
      '/clients',
      {
        method: 'POST',
        body: JSON.stringify(clientData),
      }
    );
  },

  // Atualizar cliente
  update: async (id: string, updates: Partial<Client>) => {
    return apiRequest<{ success: boolean; data: Client; message: string }>(
      `/clients/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  // Deletar cliente
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; data: Client; message: string }>(
      `/clients/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// 🏷️ API de Categorias
export const categoriesApi = {
  // Listar categorias
  list: async (filters?: {
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    return apiRequest<{ success: boolean; data: Category[]; total: number }>(
      `/categories${queryString ? `?${queryString}` : ''}`
    );
  },

  // Buscar categoria específica
  get: async (id: string) => {
    return apiRequest<{ success: boolean; data: Category & { projects: any[] } }>(
      `/categories/${id}`
    );
  },

  // Criar categoria
  create: async (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    return apiRequest<{ success: boolean; data: Category; message: string }>(
      '/categories',
      {
        method: 'POST',
        body: JSON.stringify(categoryData),
      }
    );
  },

  // Atualizar categoria
  update: async (id: string, updates: Partial<Category>) => {
    return apiRequest<{ success: boolean; data: Category; message: string }>(
      `/categories/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  // Deletar categoria
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; data: Category; message: string }>(
      `/categories/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};

// 👤 API de Utilizadores
export const usersApi = {
  // Listar utilizadores
  list: async (filters?: {
    role?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const queryString = params.toString();
    return apiRequest<{ success: boolean; data: User[]; total: number }>(
      `/users${queryString ? `?${queryString}` : ''}`
    );
  },

  // Criar utilizador
  create: async (userData: Omit<User, 'id' | 'canViewFinance' | 'canEditProjects' | 'canViewAllProjects'>) => {
    return apiRequest<{ success: boolean; data: User; message: string }>(
      '/users',
      {
        method: 'POST',
        body: JSON.stringify(userData),
      }
    );
  },

  // Atualizar utilizador
  update: async (id: string, updates: Partial<User>) => {
    return apiRequest<{ success: boolean; data: User; message: string }>(
      `/users/${id}`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );
  },

  // Deletar utilizador
  delete: async (id: string) => {
    return apiRequest<{ success: boolean; data: User; message: string }>(
      `/users/${id}`,
      {
        method: 'DELETE',
      }
    );
  },
};



// 🔧 Utilitários
export const apiUtils = {
  // Test connection
  ping: async () => {
    return apiRequest<{ success: boolean; message: string }>('/ping');
  },

  // Reset storage (desenvolvimento)
  reset: async () => {
    return apiRequest<{ success: boolean; message: string }>('/reset', {
      method: 'POST',
    });
  },
};

// 📊 APIs combinadas para relatórios
export const reportsApi = {
  // Dashboard stats
  getDashboardStats: async (userId?: string) => {
    const [projectsRes, clientsRes] = await Promise.all([
      projectsApi.list({ userId }),
      clientsApi.list(),
    ]);

    const projects = projectsRes.data;
    const clients = clientsRes.data;

    return {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.phase !== 'finalizados').length,
      completedProjects: projects.filter(p => p.phase === 'finalizados').length,
      totalClients: clients.length,
      financialKPIs: {
        totalToReceive: projects.filter(p => p.paymentStatus !== 'recebido').reduce((sum, p) => sum + p.clientPrice, 0),
        totalToPay: projects.filter(p => p.freelancerPaymentStatus === 'a-pagar').reduce((sum, p) => sum + p.captationCost + p.editionCost, 0),
        totalMargin: projects.reduce((sum, p) => sum + p.margin, 0),
        totalReceived: projects.filter(p => p.paymentStatus === 'recebido').reduce((sum, p) => sum + p.clientPrice, 0),
      },
    };
  },
};
