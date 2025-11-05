import { useState, useEffect } from 'react';
import type { User, UserRole } from './types';

// Credenciais padrão do sistema
const DEFAULT_CREDENTIALS = [
  {
    email: 'admin@in-sights.pt',
    password: 'admin123',
    user: {
      id: '1',
      name: 'Admin IN-SIGHTS',
      email: 'admin@in-sights.pt',
      role: 'admin' as UserRole,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      canViewFinance: true,
      canEditProjects: true,
      canViewAllProjects: true,
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
    }
  }
];

const AUTH_STORAGE_KEY = 'audiovisual-crm-auth';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se já existe sessão ao carregar
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const { user } = JSON.parse(storedAuth);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Erro ao restaurar sessão:', error);
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    // Encontrar credenciais correspondentes
    const credential = DEFAULT_CREDENTIALS.find(
      cred => cred.email === email && cred.password === password
    );

    if (!credential) {
      return {
        success: false,
        error: 'Email ou senha incorretos'
      };
    }

    // Salvar autenticação
    const authData = {
      user: credential.user,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setCurrentUser(credential.user);
    setIsAuthenticated(true);

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return {
    isAuthenticated,
    currentUser,
    isLoading,
    login,
    logout
  };
}
