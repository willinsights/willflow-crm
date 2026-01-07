import { useState, useEffect } from 'react';
import type { User, UserRole } from './types';

// Check if we're in development environment
const isDevelopment = process.env.NODE_ENV === 'development';

// Credenciais de demonstração (fallback quando API não está disponível)
const DEMO_CREDENTIALS = [
  {
    email: 'geral@in-sights.pt',
    password: 'Insights26@',
    user: {
      id: '1',
      name: 'Admin IN-SIGHTS',
      email: 'geral@in-sights.pt',
      role: 'admin' as UserRole,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      canViewFinance: true,
      canEditProjects: true,
      canViewAllProjects: true,
      isActive: true,
    }
  },
  {
    email: 'editor@in-sights.pt',
    password: 'editor123',
    user: {
      id: '2',
      name: 'Editor Principal',
      email: 'editor@in-sights.pt',
      role: 'editor_edicao' as UserRole,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=editor',
      canViewFinance: false,
      canEditProjects: true,
      canViewAllProjects: false,
      isActive: true,
    }
  },
  {
    email: 'freelancer@in-sights.pt',
    password: 'freelancer123',
    user: {
      id: '3',
      name: 'Freelancer Captação',
      email: 'freelancer@in-sights.pt',
      role: 'freelancer_captacao' as UserRole,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=freelancer',
      canViewFinance: false,
      canEditProjects: false,
      canViewAllProjects: false,
      isActive: true,
    }
  }
];

const AUTH_STORAGE_KEY = 'audiovisual-crm-auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);

  // Verificar se já existe sessão ao carregar
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const { user, mustChangePassword: mustChange } = JSON.parse(storedAuth);
        setCurrentUser(user);
        setIsAuthenticated(true);
        setMustChangePassword(mustChange || false);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; mustChangePassword?: boolean }> => {
    try {
      // Tentar autenticação via API primeiro
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Login via API bem sucedido
        const authData = {
          user: data.data.user,
          mustChangePassword: data.data.mustChangePassword,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setCurrentUser(data.data.user);
        setIsAuthenticated(true);
        setMustChangePassword(data.data.mustChangePassword || false);

        return {
          success: true,
          mustChangePassword: data.data.mustChangePassword
        };
      }

      // Se a API retornou erro específico, usar esse erro
      if (response.status !== 500) {
        return { success: false, error: data.error || 'Email ou senha incorretos' };
      }

      // Fallback para credenciais demo apenas em desenvolvimento
      if (isDevelopment) {
        console.log('API indisponível, usando credenciais demo (apenas em desenvolvimento)...');
      } else {
        // Em produção, retornar erro de conexão
        return { success: false, error: 'Erro de conexão com o servidor. Tente novamente.' };
      }

    } catch (error) {
      if (isDevelopment) {
        console.log('Erro ao conectar com API, usando credenciais demo (apenas em desenvolvimento)...');
      } else {
        // Em produção, retornar erro de conexão
        return { success: false, error: 'Erro de conexão com o servidor. Tente novamente.' };
      }
    }

    // Fallback: verificar credenciais demo (apenas em desenvolvimento)
    if (isDevelopment) {
      const demoCredential = DEMO_CREDENTIALS.find(
        cred => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
      );

      if (demoCredential) {
        const authData = {
          user: demoCredential.user,
          mustChangePassword: false,
          timestamp: new Date().toISOString()
        };

        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        setCurrentUser(demoCredential.user);
        setIsAuthenticated(true);
        setMustChangePassword(false);

        return { success: true };
      }
    }

    return { success: false, error: 'Email ou senha incorretos' };
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Utilizador não autenticado' };
    }

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Atualizar estado local
        setMustChangePassword(false);

        // Atualizar localStorage
        const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
        if (storedAuth) {
          const authData = JSON.parse(storedAuth);
          authData.mustChangePassword = false;
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
        }

        return { success: true };
      }

      return { success: false, error: data.error || 'Erro ao alterar senha' };
    } catch (error) {
      return { success: false, error: 'Erro ao conectar com o servidor' };
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setMustChangePassword(false);
  };

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    mustChangePassword,
    login,
    logout,
    changePassword,
  };
}
