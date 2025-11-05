'use client';

import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/components/dashboard/Dashboard';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import FinishedProjectsList from '@/components/projects/FinishedProjectsList';
import ClientsPage from '@/components/clients/ClientsPage';
import UsersPage from '@/components/users/UsersPage';
import CategoriesPage from '@/components/categories/CategoriesPage';
import ReportsPage from '@/components/reports/ReportsPage';
import UploadsPage from '@/components/uploads/UploadsPage';
import RoleTestPanel from '@/components/debug/RoleTestPanel';
import LoginPage from '@/components/auth/LoginPage';
import { ProjectPhase } from '@/lib/types';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const { isAuthenticated, isLoading, login, logout } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 gradient-purple rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-glow-sm animate-pulse">
            <div className="w-8 h-8 text-white">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage onLogin={login} />;
  }

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'captacao':
        return <KanbanBoard phase="captacao" />;
      case 'edicao':
        return <KanbanBoard phase="edicao" />;
      case 'finalizados':
        return <FinishedProjectsList />;
      case 'clientes':
        return <ClientsPage />;
      case 'colaboradores':
        return <UsersPage />;
      case 'categorias':
        return <CategoriesPage />;
      case 'relatorios':
        return <ReportsPage />;
      case 'uploads':
        return <UploadsPage />;
      case 'calendario':
        return <div className="p-6"><h1 className="text-2xl font-bold">Calendário (Em desenvolvimento)</h1></div>;
      case 'role-test':
        return <RoleTestPanel />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppLayout activeView={activeView} onViewChange={setActiveView} onLogout={logout}>
      {renderContent()}
    </AppLayout>
  );
}
