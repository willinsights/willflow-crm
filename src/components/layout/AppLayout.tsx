'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Euro,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Home,
  Briefcase,
  Wallet,
  MoreHorizontal,
  ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import UserSelector from '@/components/user/UserSelector';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import ToastNotifications, { useToastNotifications } from '@/components/notifications/ToastNotifications';
// PWA Install Prompt removido - sistema roda apenas como website
import SearchResults from '@/components/layout/SearchResults';
import TaskDrawer from '@/components/projects/TaskDrawer';
import OfflineIndicator from '@/components/layout/OfflineIndicator';
import { useAppStore } from '@/lib/useAppStore';
import { useTheme } from '@/lib/ThemeContext';
import { useCreateProject } from '@/contexts/CreateProjectContext';
import { Project, Client } from '@/lib/types';

interface AppLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout?: () => void;
}

const SIDEBAR_COLLAPSED_KEY = 'willflow-sidebar-collapsed';

export default function AppLayout({ children, activeView, onViewChange, onLogout }: AppLayoutProps) {
  const { currentUser, switchUser, projectsByPhase, searchQuery, setSearchQuery, projects, clients, users } = useAppStore();
  const { toasts, removeToast, showSuccess, showInfo, showDeadlineAlert } = useToastNotifications();
  const { theme, toggleTheme, cycleTheme, isOLED } = useTheme();
  const { isCreateProjectOpen, setCreateProjectOpen, openCreateProject } = useCreateProject();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Bottom Navigation items for mobile (5 items max)
  const bottomNavItems = [
    { id: 'dashboard', label: 'Início', icon: Home },
    { id: 'captacao', label: 'Captação', icon: Video },
    { id: 'edicao', label: 'Edição', icon: Edit3 },
    { id: 'financeiro', label: 'Finanças', icon: Wallet },
    { id: 'more', label: 'Mais', icon: MoreHorizontal },
  ];

  // Additional menu items for "More" sheet on mobile
  const moreMenuItems = [
    { id: 'finalizados', label: 'Finalizados', icon: CheckCircle },
    { id: 'clientes', label: 'Clientes', icon: Briefcase },
    { id: 'colaboradores', label: 'Colaboradores', icon: Users },
    { id: 'calendario', label: 'Calendário', icon: Calendar },
    { id: 'uploads', label: 'Uploads', icon: Upload },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
  ];

  // Handle mobile nav item click
  const handleMobileNavClick = (id: string) => {
    if (id === 'more') {
      setIsMobileMenuOpen(true);
    } else {
      onViewChange(id);
      setIsMobileMenuOpen(false);
    }
  };

  // Load collapsed state from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === 'true') {
      setIsSidebarCollapsed(true);
    }
  }, []);

  // Toggle sidebar collapsed state
  const toggleSidebarCollapsed = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newState));
  };

  // Search results dropdown state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Calculate monthly progress in real-time
  const monthlyProgress = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Filter projects created this month
    const monthlyProjects = projects.filter(project => {
      const createdDate = new Date(project.createdAt);
      return createdDate.getMonth() === currentMonth &&
             createdDate.getFullYear() === currentYear;
    });

    // Count completed projects (phase === 'finalizados' or status entregue)
    const completedProjects = monthlyProjects.filter(project =>
      project.phase === 'finalizados' ||
      project.statusEdicao === 'entregue' ||
      project.statusCaptacao === 'concluido'
    );

    const totalMonthly = monthlyProjects.length;
    const completedMonthly = completedProjects.length;

    // Calculate percentage (avoid division by zero)
    const percentage = totalMonthly > 0
      ? Math.round((completedMonthly / totalMonthly) * 100)
      : 0;

    return {
      completed: completedMonthly,
      total: totalMonthly,
      percentage,
      // Also calculate all-time stats
      totalActive: projects.filter(p => p.phase !== 'finalizados').length,
      totalCompleted: projects.filter(p => p.phase === 'finalizados').length,
    };
  }, [projects]);

  // Open search dropdown when typing
  useEffect(() => {
    if (searchQuery && searchQuery.length > 0) {
      setIsSearchOpen(true);
    } else {
      setIsSearchOpen(false);
    }
  }, [searchQuery]);

  // Handle project selection from search
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
    setSearchQuery('');
    setIsSearchOpen(false);
    // Optionally, navigate to project details or open a modal
    onViewChange('edicao');
    // TODO: Open project details modal if needed
  };

  // Handle client selection from search
  const handleSelectClient = (client: Client) => {
    onViewChange('clientes');
    setSearchQuery('');
    setIsSearchOpen(false);
    // TODO: Open client details modal
  };

  // Handle view all projects
  const handleViewAllProjects = () => {
    onViewChange('edicao');
    setIsSearchOpen(false);
  };

  // Handle view all clients
  const handleViewAllClients = () => {
    onViewChange('clientes');
    setSearchQuery('');
    setIsSearchOpen(false);
  };

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

  // Close sidebar when clicking outside on mobile
  const handleViewChange = (view: string) => {
    onViewChange(view);
    setIsSidebarOpen(false);
  };

  // Navigation with visual hierarchy - Reorganized by frequency of use
  const navigationSections = [
    {
      title: 'Visão Geral',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Home, count: 0 },
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
      title: 'Finanças',
      items: [
        { id: 'financeiro', label: 'Finanças & Analytics', icon: Wallet, count: 0 },
      ]
    },
    {
      title: 'Gestão',
      items: [
        { id: 'clientes', label: 'Clientes', icon: Briefcase, count: 0 },
        { id: 'colaboradores', label: 'Colaboradores', icon: Users, count: 0 },
      ]
    },
    {
      title: 'Ferramentas',
      items: [
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
      <header className="glass-strong border-b border-white/10 px-3 md:px-6 py-2 md:py-4 sticky top-0 z-50 safe-area-top">
        <div className="flex items-center justify-between gap-2 md:gap-0">
          {/* Mobile Menu Button - Hidden on mobile (using bottom nav instead) */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="hidden lg:hidden p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo - Centered on mobile */}
          <div className="flex flex-col items-start lg:items-start flex-1 lg:flex-none">
            <img
              src="/logo-willflow-sistema.png"
              alt="WillFlow"
              className="h-7 md:h-10 w-auto object-contain flex-shrink-0"
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
                  setSearchQuery(e.target.value);
                }}
                onFocus={() => {
                  if (searchQuery && searchQuery.length > 0) setIsSearchOpen(true);
                }}
                onBlur={() => {
                  // Delay closing to allow click on dropdown
                  setTimeout(() => setIsSearchOpen(false), 150);
                }}
                placeholder="Pesquisar projetos, clientes..."
                className="pl-10 glass border-white/20 focus:border-purple-500/50"
                autoComplete="off"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-purple-400">
                  🔍 "{searchQuery}"
                </div>
              )}
              <SearchResults
                open={isSearchOpen}
                query={searchQuery}
                onSelectProject={handleSelectProject}
                onSelectClient={handleSelectClient}
                onViewAllProjects={handleViewAllProjects}
                onViewAllClients={handleViewAllClients}
                onClose={() => setIsSearchOpen(false)}
                className="absolute left-0 top-full mt-1 w-full z-50"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 md:space-x-2 lg:space-x-4">
            {/* Theme Toggle - Cycles through dark -> light -> oled */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/30"
              title={
                theme === 'dark' ? 'Mudar para tema claro' :
                theme === 'light' ? 'Mudar para tema OLED' :
                'Mudar para tema escuro'
              }
            >
              {theme === 'dark' && (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
              )}
              {theme === 'light' && (
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-black border border-white/50" />
              )}
              {theme === 'oled' && (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
              )}
            </button>

            <div className="hidden sm:block">
              <CreateProjectModal 
                isOpen={isCreateProjectOpen} 
                onOpenChange={setCreateProjectOpen} 
              />
            </div>

            <NotificationCenter
              projects={projects}
              clients={clients}
              users={users}
              onViewProject={(projectId) => {
                const project = projects.find(p => p.id === projectId);
                if (project) {
                  setSelectedProject(project);
                  onViewChange(project.phase);
                }
              }}
            />

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
              onFocus={() => {
                if (searchQuery && searchQuery.length > 0) setIsSearchOpen(true);
              }}
              onBlur={() => {
                setTimeout(() => setIsSearchOpen(false), 150);
              }}
              placeholder="Pesquisar..."
              className="pl-10 glass border-white/20 focus:border-purple-500/50 text-sm"
              autoComplete="off"
            />
            <SearchResults
              open={isSearchOpen}
              query={searchQuery}
              onSelectProject={handleSelectProject}
              onSelectClient={handleSelectClient}
              onViewAllProjects={handleViewAllProjects}
              onViewAllClients={handleViewAllClients}
              onClose={() => setIsSearchOpen(false)}
              className="absolute left-0 top-full mt-1 w-full z-50"
            />
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Mobile Overlay - Hidden on mobile (using bottom nav instead) */}
        <div
          className={`
            fixed inset-0 bg-black/50 z-30 hidden
            transition-opacity duration-300 ease-in-out
            ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
          `}
          onClick={() => setIsSidebarOpen(false)}
        />

        {/* Sidebar - Desktop only, hidden on mobile */}
        <aside
          className={`
            hidden lg:block lg:sticky top-0 left-0 z-40
            ${isSidebarCollapsed ? 'w-16' : 'w-64'}
            min-h-screen lg:min-h-[calc(100vh-73px)]
            glass-strong border-r border-white/10
            ${isSidebarCollapsed ? 'p-2' : 'p-4 md:p-6'}
            transform transition-all duration-300 ease-out
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

          <ScrollArea className={`${isSidebarCollapsed ? 'h-[calc(100vh-200px)]' : 'h-[calc(100vh-350px)]'} lg:h-auto`}>
            <TooltipProvider delayDuration={0}>
              <nav className="space-y-6">
                {navigationSections.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    {!isSidebarCollapsed && (
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
                        {section.title}
                      </h3>
                    )}
                    <div className="space-y-1">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeView === item.id;

                        const buttonContent = (
                          <button
                            key={item.id}
                            onClick={() => handleViewChange(item.id)}
                            className={`nav-item w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 text-left'} ${
                              isActive ? 'active' : ''
                            }`}
                          >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!isSidebarCollapsed && (
                              <>
                                <span className="font-medium">{item.label}</span>
                                {item.count > 0 && (
                                  <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-300">
                                    {item.count}
                                  </Badge>
                                )}
                              </>
                            )}
                          </button>
                        );

                        if (isSidebarCollapsed) {
                          return (
                            <Tooltip key={item.id}>
                              <TooltipTrigger asChild>
                                {buttonContent}
                              </TooltipTrigger>
                              <TooltipContent side="right" className="glass-strong border-white/20">
                                <p>{item.label}</p>
                                {item.count > 0 && (
                                  <span className="text-purple-400 ml-1">({item.count})</span>
                                )}
                              </TooltipContent>
                            </Tooltip>
                          );
                        }

                        return buttonContent;
                      })}
                    </div>
                  </div>
                ))}
              </nav>
            </TooltipProvider>
          </ScrollArea>

          {/* Bottom Section - Monthly Progress (Real-time) - Hidden when collapsed */}
          {!isSidebarCollapsed && (
            <div className="mt-8 md:mt-12 space-y-4">
              <div className="glass rounded-lg p-3 md:p-4">
                <h3 className="text-xs md:text-sm font-medium text-muted-foreground mb-2">Progresso do Mês</h3>
                <div className="space-y-3">
                  {/* Projects this month */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs md:text-sm">
                      <span>Projetos do Mês</span>
                      <span className="font-medium">
                        {monthlyProgress.completed}/{monthlyProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="gradient-purple h-2 rounded-full transition-all duration-500"
                        style={{ width: `${monthlyProgress.percentage}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      {monthlyProgress.percentage}% concluído
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground">
                      <span>Em andamento</span>
                      <span className="text-yellow-400">{monthlyProgress.totalActive}</span>
                    </div>
                    <div className="flex justify-between text-[10px] md:text-xs text-muted-foreground">
                      <span>Finalizados (total)</span>
                      <span className="text-green-400">{monthlyProgress.totalCompleted}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Create Project Button */}
          {!isSidebarCollapsed && (
            <div className="sm:hidden mt-4">
              <CreateProjectModal 
                isOpen={isCreateProjectOpen} 
                onOpenChange={setCreateProjectOpen} 
              />
            </div>
          )}

          {/* Collapse Toggle Button - Desktop only */}
          <div className="hidden lg:block mt-4 pt-4 border-t border-white/10">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={toggleSidebarCollapsed}
                    className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center' : 'justify-between'} p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-purple-500/30`}
                  >
                    {!isSidebarCollapsed && (
                      <span className="text-xs text-muted-foreground">Recolher menu</span>
                    )}
                    {isSidebarCollapsed ? (
                      <PanelLeft className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <PanelLeftClose className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </TooltipTrigger>
                {isSidebarCollapsed && (
                  <TooltipContent side="right" className="glass-strong border-white/20">
                    <p>Expandir menu</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className="flex-1 p-3 md:p-4 lg:p-6 w-full min-w-0 pb-24 lg:pb-6"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {children}
        </main>
      </div>

      {/* ===== MOBILE ONLY COMPONENTS ===== */}

      {/* Mobile Bottom Navigation Bar */}
      <nav className="bottom-nav lg:hidden">
        <div className="flex items-center justify-around">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'more' ? isMobileMenuOpen : activeView === item.id;
            const isMoreActive = item.id !== 'more' && ['finalizados', 'clientes', 'colaboradores', 'categorias', 'relatorios', 'calendario', 'uploads', 'configuracoes'].includes(activeView);

            return (
              <button
                key={item.id}
                onClick={() => handleMobileNavClick(item.id)}
                className={`bottom-nav-item ${isActive || (item.id === 'more' && isMoreActive) ? 'active' : 'text-muted-foreground'}`}
              >
                <Icon className="bottom-nav-icon" />
                <span className="bottom-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile FAB - Create Project */}
      <button
        onClick={() => openCreateProject()}
        className="fab lg:hidden"
        aria-label="Criar projeto"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Mobile "More" Menu Sheet */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="sheet-overlay lg:hidden animate-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sheet Content */}
          <div className="sheet-content lg:hidden animate-slide-up">
            <div className="sheet-handle" />

            {/* Sheet Header */}
            <div className="px-6 pb-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="touch-target rounded-full glass"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="gradient-purple text-white">
                    {currentUser?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{currentUser?.name || 'Usuário'}</p>
                  <p className="text-sm text-muted-foreground">{currentUser?.role || 'admin'}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-2 py-2">
              {moreMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onViewChange(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`mobile-list-item w-full rounded-xl ${isActive ? 'bg-purple-500/20' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-purple-500/30' : 'glass'}`}>
                      <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-muted-foreground'}`} />
                    </div>
                    <span className={`font-medium ${isActive ? 'text-purple-400' : ''}`}>{item.label}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-purple-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Theme Toggle & Logout */}
            <div className="px-6 py-4 mt-2 border-t border-white/10">
              {/* Theme Selector */}
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Tema</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => cycleTheme()}
                    className={`flex-1 touch-target rounded-xl flex flex-col items-center justify-center gap-1 py-2 ${
                      theme === 'dark' ? 'bg-purple-500/20 border border-purple-500/50' : 'glass'
                    }`}
                  >
                    <Moon className="w-5 h-5 text-purple-400" />
                    <span className="text-xs">Escuro</span>
                  </button>
                  <button
                    onClick={() => cycleTheme()}
                    className={`flex-1 touch-target rounded-xl flex flex-col items-center justify-center gap-1 py-2 ${
                      theme === 'light' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'glass'
                    }`}
                  >
                    <Sun className="w-5 h-5 text-yellow-400" />
                    <span className="text-xs">Claro</span>
                  </button>
                  <button
                    onClick={() => cycleTheme()}
                    className={`flex-1 touch-target rounded-xl flex flex-col items-center justify-center gap-1 py-2 ${
                      theme === 'oled' ? 'bg-gray-800 border border-white/30' : 'glass'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-full bg-black border border-white/50" />
                    <span className="text-xs">OLED</span>
                  </button>
                </div>
                {theme === 'oled' && (
                  <p className="text-xs text-green-400 mt-2 text-center">
                    ⚡ Modo OLED ativo - economia de bateria
                  </p>
                )}
              </div>

              {/* Logout */}
              {onLogout && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full touch-target glass rounded-xl px-4 flex items-center justify-center gap-2 text-red-400"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Sair</span>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* Toast Notifications */}
      <ToastNotifications notifications={toasts} onDismiss={removeToast} />

      {/* Offline Indicator */}
      <OfflineIndicator />

      {/* PWA Install Prompt removido */}

      {/* Task Drawer - Opens when project is selected from search */}
      <TaskDrawer
        open={!!selectedProject}
        taskId={selectedProject?.id || null}
        onClose={() => setSelectedProject(null)}
        onTaskUpdate={(taskId, updates) => {
          console.log('Project updated from search:', taskId, updates);
        }}
      />
    </div>
  );
}
