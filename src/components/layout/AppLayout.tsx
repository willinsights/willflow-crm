'use client';

import { useState, useEffect } from 'react';
import {
  Video,
  Users,
  BarChart3,
  Calendar,
  Settings,
  Play,
  Edit3,
  CheckCircle,
  Bell,
  Search,
  Plus,
  Tag,
  TrendingUp,
  Upload,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Euro
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import UserSelector from '@/components/user/UserSelector';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import ToastNotifications, { useToastNotifications } from '@/components/notifications/ToastNotifications';
import PWAInstallPrompt from '@/components/layout/PWAInstallPrompt';
import { useAppStore } from '@/lib/useAppStore';
import { useTheme } from '@/lib/ThemeContext';

interface AppLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout?: () => void;
}

export default function AppLayout({ children, activeView, onViewChange, onLogout }: AppLayoutProps) {
  const { currentUser, switchUser, projectsByPhase, searchQuery, setSearchQuery } = useAppStore();
  const { toasts, removeToast, showSuccess, showInfo, showDeadlineAlert } = useToastNotifications();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger the sidebar
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Swipe from left edge to open
    if (isRightSwipe && touchStart < 50 && !isSidebarOpen) {
      setIsSidebarOpen(true);
    }

    // Swipe right to close
    if (isLeftSwipe && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  // Removed auto-notification to prevent infinite loop
  // User can see their info in the header

  // Close sidebar when clicking outside on mobile
  const handleViewChange = (view: string) => {
    onViewChange(view);
    setIsSidebarOpen(false);
  };

  // Navigation with visual hierarchy
  const navigationSections = [
    {
      title: 'Visão Geral',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, count: 0 },
      ]
    },
    {
      title: 'Projetos',
      items: [
        { id: 'captacao', label: 'Captação', icon: Video, count: projectsByPhase?.captacao?.length || 0 },
        { id: 'edicao', label: 'Edição', icon: Edit3, count: projectsByPhase?.edicao?.length || 0 },
        { id: 'finalizados', label: 'Finalizados', icon: CheckCircle, count: 0 },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { id: 'clientes', label: 'Clientes', icon: Users, count: 0 },
        { id: 'colaboradores', label: 'Colaboradores', icon: Users, count: 0 },
        { id: 'categorias', label: 'Categorias', icon: Tag, count: 0 },
      ]
    },
    {
      title: 'Ferramentas',
      items: [
        { id: 'financeiro', label: 'Financeiro', icon: Euro, count: 0 },
        { id: 'relatorios', label: 'Relatórios', icon: TrendingUp, count: 0 },
        { id: 'calendario', label: 'Calendário', icon: Calendar, count: 0 },
        { id: 'uploads', label: 'Uploads', icon: Upload, count: 0 },
      ]
    },
    {
      title: 'Sistema',
      items: [
        { id: 'configuracoes', label: 'Configurações', icon: Settings, count: 0 },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass-strong border-b border-white/10 px-3 md:px-6 py-3 md:py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between gap-2 md:gap-0">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <div className="flex flex-col items-start">
            <img
              src="/logo-willflow-sistema.png"
              alt="WillFlow"
              className="h-8 md:h-10 w-auto object-contain flex-shrink-0"
            />
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 hidden sm:block">Porque criar deve ser simples.</p>
          </div>

          {/* Search - Hidden on small mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  console.log('🔍 Pesquisa digitada:', e.target.value);
                  setSearchQuery(e.target.value);
                }}
                placeholder="Pesquisar projetos, clientes..."
                className="pl-10 glass border-white/20 focus:border-purple-500/50"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-purple-400">
                  🔍 "{searchQuery}"
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/30"
              title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              ) : (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              )}
            </button>

            <div className="hidden sm:block">
              <CreateProjectModal />
            </div>

            <NotificationCenter />

            <div className="hidden md:block">
              <UserSelector currentUser={currentUser} onUserChange={switchUser} />
            </div>

            {/* Logout Button */}
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 rounded-lg glass hover:bg-red-500/10 transition-all duration-300 border border-white/10 hover:border-red-500/30"
                title="Sair"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5 text-red-400" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar..."
              className="pl-10 glass border-white/20 focus:border-purple-500/50 text-sm"
            />
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Overlay - with fade animation */}
        <div
          className={`
            fixed inset-0 bg-black/50 z-30 lg:hidden
            transition-opacity duration-300 ease-in-out
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar - with slide animation */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 z-40
            w-64 min-h-screen lg:min-h-[calc(100vh-73px)]
            glass-strong border-r border-white/10 p-4 md:p-6
            transform transition-all duration-300 ease-out
            ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          {/* Mobile header in sidebar */}
          <div className="lg:hidden mb-6 pb-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src="/logo-willflow-sistema.png"
                  alt="WillFlow"
                  className="h-10 w-auto object-contain"
                />
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-lg glass hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User selector on mobile */}
            <div className="mt-4 md:hidden">
              <UserSelector currentUser={currentUser} onUserChange={switchUser} />
            </div>
          </div>

          <nav className="space-y-6">
            {navigationSections.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeView === item.id;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleViewChange(item.id)}
                        className={`nav-item w-full flex items-center space-x-3 text-left ${
                          isActive ? 'active' : ''
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{item.label}</span>
                        {item.count > 0 && (
                          <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-300">
                            {item.count}
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="mt-8 md:mt-12 space-y-4">
            <div className="glass rounded-lg p-3 md:p-4">
              <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Progresso do Mês</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm">
                  <span>Projetos</span>
                  <span>12/15</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="gradient-purple h-2 rounded-full" style={{ width: '80%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Create Project Button */}
          <div className="sm:hidden mt-4">
            <CreateProjectModal />
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 p-3 md:p-4 lg:p-6 w-full min-w-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {children}
        </main>
      </div>

      {/* Toast Notifications */}
      <ToastNotifications notifications={toasts} onDismiss={removeToast} />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
