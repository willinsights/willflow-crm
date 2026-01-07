'use client';

import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardRouter from '@/components/dashboard/DashboardRouter';
import OnboardingModal, { useOnboarding } from '@/components/onboarding/OnboardingModal';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import FinishedProjectsList from '@/components/projects/FinishedProjectsList';
import FinancePage from '@/components/finance/FinancePage';
import ClientsPage from '@/components/clients/ClientsPage';
import UsersPage from '@/components/users/UsersPage';
import CategoriesPage from '@/components/categories/CategoriesPage';
import ReportsPage from '@/components/reports/ReportsPage';
import UploadsPage from '@/components/uploads/UploadsPage';
import CalendarPage from '@/components/calendar/CalendarPage';
import SettingsPage from '@/components/settings/SettingsPage';
import RoleTestPanel from '@/components/debug/RoleTestPanel';
import LoginPage from '@/components/auth/LoginPage';
import ChangePasswordModal from '@/components/auth/ChangePasswordModal';
import { useAuth } from '@/lib/useAuth';

export default function Home() {
  const [activeView, setActiveView] = useState<string>('dashboard');
  const { isAuthenticated, isLoading, mustChangePassword, login, logout, changePassword } = useAuth();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  // Listen for custom navigation events from dashboard
  useEffect(() => {
    const handleNavigate = (event: CustomEvent<{ view: string }>) => {
      if (event.detail?.view) {
        setActiveView(event.detail.view);
      }
    };

    window.addEventListener('navigate-to-view', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate-to-view', handleNavigate as EventListener);
    };
  }, []);

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
          <p className="text-muted-foreground">A carregar...</p>
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
        return <DashboardRouter />;
      case 'captacao':
        return <KanbanBoard phase="captacao" />;
      case 'edicao':
        return <KanbanBoard phase="edicao" />;
      case 'finalizados':
        return <FinishedProjectsList />;
      case 'financeiro':
        return <FinancePage />;
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
        return <CalendarPage />;
      case 'configuracoes':
        return <SettingsPage />;
      case 'role-test':
        return <RoleTestPanel />;
      default:
        return <DashboardRouter />;
    }
  };

  return (
    <>
      <OnboardingModal open={showOnboarding} onComplete={completeOnboarding} />
      <ChangePasswordModal
        isOpen={isAuthenticated && mustChangePassword}
        isMandatory={true}
        onChangePassword={async (currentPassword, newPassword) => {
          return await changePassword(currentPassword, newPassword);
        }}
        onClose={() => {
          // Modal is mandatory, so this should not close it
        }}
      />
      <AppLayout activeView={activeView} onViewChange={setActiveView} onLogout={logout}>
      {renderContent()}
    </AppLayout>
    </>
  );
}
