'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  TrendingUp,
  Euro,
  Users,
  Video,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Camera,
  Edit3,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Wallet,
  CalendarDays,
  FileText,
  AlertTriangle,
  Activity,
  CreditCard,
  Eye,
  Upload,
  Briefcase
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CardSkeleton, ListItemSkeleton, TimelineItemSkeleton, ChartSkeleton } from '@/components/ui/skeleton';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useLocale } from '@/lib/LocaleContext';
import { exportDashboardCSV } from '@/lib/export-utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { Project, Client, User, DashboardStats } from '@/lib/types';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import TaskDrawer from '@/components/projects/TaskDrawer';

const COLORS = ['#9139e4', '#c084fc', '#f59e0b', '#14b8a6', '#ec4899', '#8b5cf6'];

interface AdminDashboardProps {
  projects: Project[];
  clients: Client[];
  users: User[];
  dashboardStats: DashboardStats;
  projectsByPhase: {
    captacao: Project[];
    edicao: Project[];
    finalizados: Project[];
  };
  onViewChange?: (view: string) => void;
}

export default function AdminDashboard({
  projects,
  clients,
  users,
  dashboardStats,
  projectsByPhase,
  onViewChange,
}: AdminDashboardProps) {
  const { formatCurrency, formatDate } = useLocale();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<'current' | 'previous' | 'last3' | 'quarter'>('current');

  // Simulate loading state for initial render
  useEffect(() => {
    if (projects.length >= 0) {
      // Small delay to show skeleton
      const timer = setTimeout(() => setIsLoading(false), 300);
      return () => clearTimeout(timer);
    }
  }, [projects]);

  // Helper function to get date range based on filter
  const getDateRange = (filter: 'current' | 'previous' | 'last3' | 'quarter') => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    switch (filter) {
      case 'current':
        // Current month (from 1st to today)
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: now,
        };
      
      case 'previous':
        // Previous month (full month)
        return {
          start: new Date(currentYear, currentMonth - 1, 1),
          end: new Date(currentYear, currentMonth, 0),
        };
      
      case 'last3':
        // Last 3 months (including current)
        return {
          start: new Date(currentYear, currentMonth - 2, 1),
          end: now,
        };
      
      case 'quarter':
        // Current quarter
        const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
        return {
          start: new Date(currentYear, quarterStartMonth, 1),
          end: now,
        };
      
      default:
        return {
          start: new Date(currentYear, currentMonth, 1),
          end: now,
        };
    }
  };

  // Calculate KPIs based on selected date filter
  const currentKPIs = useMemo(() => {
    const { start, end } = getDateRange(dateFilter);

    const filteredProjects = projects.filter(p => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= start && createdDate <= end;
    });

    const totalToReceive = filteredProjects
      .filter(p => p.paymentStatus !== 'recebido')
      .reduce((sum, p) => sum + p.clientPrice, 0);

    const totalToPay = filteredProjects
      .filter(p => p.freelancerPaymentStatus !== 'pago')
      .reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);

    const totalReceived = filteredProjects
      .filter(p => p.paymentStatus === 'recebido')
      .reduce((sum, p) => sum + p.clientPrice, 0);

    const totalMargin = filteredProjects.reduce(
      (sum, p) => sum + p.margin,
      0
    );

    return { totalToReceive, totalToPay, totalMargin, totalReceived };
  }, [projects, dateFilter]);

  // Calculate monthly revenue trend based on filter
  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();

    let numMonths = 3; // Default for quarter
    if (dateFilter === 'current' || dateFilter === 'previous') {
      numMonths = 1;
    } else if (dateFilter === 'last3') {
      numMonths = 3;
    } else if (dateFilter === 'quarter') {
      numMonths = 3;
    }

    for (let i = numMonths - 1; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-PT', { month: 'short' });

      const monthProjects = projects.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate.getMonth() === month.getMonth() &&
          createdDate.getFullYear() === month.getFullYear();
      });

      const revenue = monthProjects.reduce((sum, p) => sum + (p.clientPrice || 0), 0);
      const costs = monthProjects.reduce((sum, p) => sum + (p.captationCost || 0) + (p.editionCost || 0), 0);

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        receita: revenue,
        custos: costs,
        margem: revenue - costs
      });
    }

    return months;
  }, [projects, dateFilter]);

  // Calculate previous month KPIs for comparison
  const previousMonthKPIs = useMemo(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const lastMonthProjects = projects.filter(p => {
      const createdDate = new Date(p.createdAt);
      return createdDate >= lastMonth && createdDate <= lastMonthEnd;
    });

    const totalToReceive = lastMonthProjects
      .filter(p => p.paymentStatus !== 'recebido')
      .reduce((sum, p) => sum + p.clientPrice, 0);

    const totalToPay = lastMonthProjects
      .filter(p => p.freelancerPaymentStatus !== 'pago')
      .reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);

    const totalReceived = lastMonthProjects
      .filter(p => p.paymentStatus === 'recebido')
      .reduce((sum, p) => sum + p.clientPrice, 0);

    const totalMargin = lastMonthProjects.reduce(
      (sum, p) => sum + p.margin,
      0
    );

    return { totalToReceive, totalToPay, totalMargin, totalReceived };
  }, [projects]);

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number): { value: string; isUp: boolean } => {
    if (previous === 0) {
      return { value: current > 0 ? 'Novo' : '0%', isUp: current > 0 };
    }
    const change = ((current - previous) / previous) * 100;
    const isUp = change >= 0;
    return {
      value: `${isUp ? '+' : ''}${change.toFixed(1)}%`,
      isUp
    };
  };

  // Urgent projects: specific filters for requirements
  const urgentItems = useMemo(() => {
    const now = new Date();
    const items: Array<{
      type: 'deadline' | 'payment_client' | 'payment_freelancer' | 'captacao';
      title: string;
      subtitle: string;
      daysLeft?: number;
      amount?: number;
      icon: any;
      color: string;
      bgColor: string;
      projectId?: string;
    }> = [];

    // 3 Projects with deadline this week (clickable)
    const projectsThisWeek = projects
      .filter(p => {
        if (!p.clientDueDate || p.phase === 'finalizados') return false;
        const due = new Date(p.clientDueDate);
        const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return days > 0 && days <= 7;
      })
      .sort((a, b) => {
        const daysA = Math.ceil((new Date(a.clientDueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        const daysB = Math.ceil((new Date(b.clientDueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysA - daysB;
      })
      .slice(0, 3);

    projectsThisWeek.forEach(p => {
      const due = new Date(p.clientDueDate!);
      const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      items.push({
        type: 'deadline',
        title: p.title,
        subtitle: days === 1 ? 'Entrega amanhã' : `Entrega em ${days} dias`,
        daysLeft: days,
        icon: Clock,
        color: days <= 2 ? 'text-red-400' : days <= 4 ? 'text-orange-400' : 'text-yellow-400',
        bgColor: days <= 2 ? 'bg-red-500/10' : days <= 4 ? 'bg-orange-500/10' : 'bg-yellow-500/10',
        projectId: p.id,
      });
    });

    // 2 Most urgent pending payments (clickable)
    const paymentsDueIn3Days = projects
      .filter(p => p.paymentStatus !== 'recebido' && p.clientPrice > 0)
      .slice(0, 2);

    paymentsDueIn3Days.forEach(p => {
      items.push({
        type: 'payment_client',
        title: `Pagamento pendente: ${p.client?.name || 'Cliente'}`,
        subtitle: `${formatCurrency(p.clientPrice)} - ${p.title}`,
        amount: p.clientPrice,
        icon: CreditCard,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        projectId: p.id,
      });
    });

    // 1 Captação scheduled for tomorrow (clickable)
    const captacaoTomorrow = projects.find(p => {
      if (p.phase !== 'captacao' || !p.clientDueDate) return false;
      const captDate = new Date(p.clientDueDate);
      const days = Math.ceil((captDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days === 1;
    });

    if (captacaoTomorrow) {
      items.push({
        type: 'captacao',
        title: captacaoTomorrow.title,
        subtitle: 'Captação amanhã',
        daysLeft: 1,
        icon: Camera,
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/10',
        projectId: captacaoTomorrow.id,
      });
    }

    return items;
  }, [projects, formatCurrency]);

  // Recent activity log (simulated based on project data)
  const recentActivity = useMemo(() => {
    const activities: Array<{
      id: string;
      action: string;
      target: string;
      user: string;
      time: string;
      icon: any;
      color: string;
      projectId: string;
    }> = [];

    // Get recent projects sorted by updatedAt
    const recentProjects = [...projects]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10);

    recentProjects.forEach(p => {
      const updatedDate = new Date(p.updatedAt);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60));
      const timeLabel = diffHours < 1 ? 'Agora' :
                       diffHours < 24 ? `Há ${diffHours}h` :
                       diffHours < 48 ? 'Ontem' :
                       formatDate(updatedDate);

      if (p.phase === 'finalizados') {
        activities.push({
          id: `${p.id}-finished`,
          action: 'marcou como Entregue',
          target: p.title,
          user: users.find(u => u.id === p.responsavelEdicaoId)?.name || 'Sistema',
          time: timeLabel,
          icon: CheckCircle,
          color: 'text-green-400',
          projectId: p.id,
        });
      } else if (p.paymentStatus === 'recebido') {
        activities.push({
          id: `${p.id}-paid`,
          action: `pagou ${formatCurrency(p.clientPrice)}`,
          target: p.title,
          user: p.client?.name || 'Cliente',
          time: timeLabel,
          icon: Euro,
          color: 'text-green-400',
          projectId: p.id,
        });
      } else if (p.phase === 'edicao') {
        activities.push({
          id: `${p.id}-editing`,
          action: 'está em edição',
          target: p.title,
          user: users.find(u => u.id === p.responsavelEdicaoId)?.name || 'Editor',
          time: timeLabel,
          icon: Edit3,
          color: 'text-purple-400',
          projectId: p.id,
        });
      }
    });

    return activities.slice(0, 5);
  }, [projects, users, formatCurrency, formatDate]);

  // KPI Cards with real percentage calculations
  const kpiCards = [
    {
      title: 'Total a Receber',
      value: formatCurrency(currentKPIs.totalToReceive),
      icon: Euro,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: calculatePercentageChange(currentKPIs.totalToReceive, previousMonthKPIs.totalToReceive).value,
      trendUp: calculatePercentageChange(currentKPIs.totalToReceive, previousMonthKPIs.totalToReceive).isUp,
      tooltip: 'Soma de todos os pagamentos pendentes de clientes',
    },
    {
      title: 'Total a Pagar',
      value: formatCurrency(currentKPIs.totalToPay),
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      trend: calculatePercentageChange(currentKPIs.totalToPay, previousMonthKPIs.totalToPay).value,
      trendUp: calculatePercentageChange(currentKPIs.totalToPay, previousMonthKPIs.totalToPay).isUp,
      tooltip: 'Soma de todos os pagamentos pendentes a freelancers',
    },
    {
      title: 'Margem Total',
      value: formatCurrency(currentKPIs.totalMargin),
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: calculatePercentageChange(currentKPIs.totalMargin, previousMonthKPIs.totalMargin).value,
      trendUp: calculatePercentageChange(currentKPIs.totalMargin, previousMonthKPIs.totalMargin).isUp,
      tooltip: 'Lucro total: Receita menos custos de captação e edição',
    },
    {
      title: 'Total Recebido',
      value: formatCurrency(currentKPIs.totalReceived),
      icon: CheckCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: calculatePercentageChange(currentKPIs.totalReceived, previousMonthKPIs.totalReceived).value,
      trendUp: calculatePercentageChange(currentKPIs.totalReceived, previousMonthKPIs.totalReceived).isUp,
      tooltip: 'Soma de todos os pagamentos já recebidos de clientes',
    }
  ];

  // Quick Actions - Focused on most frequent dashboard actions
  const quickActions = [
    { label: 'Novo Projeto', icon: Plus, color: 'gradient-purple', action: 'create-project', description: 'Criar novo projeto audiovisual' },
    { label: 'Pagamentos Pendentes', icon: Wallet, color: 'bg-green-500/20 hover:bg-green-500/30 text-green-400', action: 'payments', description: 'Ver pagamentos a receber' },
    { label: 'Ver Calendário', icon: CalendarDays, color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400', action: 'calendar', description: 'Visualizar agenda e prazos' },
    { label: 'Ver Relatórios', icon: FileText, color: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400', action: 'reports', description: 'Acessar relatórios financeiros' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">Dashboard Principal</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Visão Rápida • Ações Rápidas • Projetos Urgentes • Evolução Financeira • Atividade Recente
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDashboardCSV(projects, clients, dashboardStats)}
              className="glass border-white/20 hover:bg-white/10 w-fit"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>
        </div>

        {/* Secao 1: Visao Rapida - KPI Cards with Tooltips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              Visão Rápida
            </h2>
            
            {/* Date Filter */}
            <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
              <SelectTrigger className="w-[180px] glass border-white/20">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="glass-strong border-white/20">
                <SelectItem value="current">Mês atual</SelectItem>
                <SelectItem value="previous">Mês anterior</SelectItem>
                <SelectItem value="last3">Últimos 3 meses</SelectItem>
                <SelectItem value="quarter">Trimestre atual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </>
          ) : (
            kpiCards.map((kpi, index) => {
              const Icon = kpi.icon;

              return (
                <UITooltip key={index}>
                  <TooltipTrigger asChild>
                    <Card className="stat-card hover:scale-105 transition-transform cursor-help">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                          {kpi.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                          <Icon className={`h-4 w-4 ${kpi.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xl md:text-2xl font-bold truncate">{kpi.value}</div>
                        <div className={`flex items-center text-xs mt-1 ${kpi.trendUp ? 'text-green-400' : 'text-red-400'}`}>
                          {kpi.trendUp ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                          {kpi.trend} vs mes anterior
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>
                  <TooltipContent className="glass-strong border-white/20">
                    <p className="text-sm">{kpi.tooltip}</p>
                  </TooltipContent>
                </UITooltip>
              );
            })
          )}
        </div>
        </div>

        {/* Secao 2: Acoes Rapidas */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`h-auto py-6 flex flex-col gap-3 ${action.color} ${action.color.includes('gradient') ? 'text-white shadow-glow-sm' : ''}`}
                    onClick={() => {
                      if (action.action === 'create-project') {
                        // Trigger the create project modal
                        const modalTrigger = document.querySelector('[data-create-project]') as HTMLButtonElement;
                        if (modalTrigger) {
                          modalTrigger.click();
                        } else {
                          // Fallback: dispatch custom event
                          window.dispatchEvent(new CustomEvent('open-create-project'));
                        }
                      } else if (action.action === 'payments') {
                        // Navigate to financeiro page
                        window.dispatchEvent(new CustomEvent('navigate-to-view', { detail: { view: 'financeiro' } }));
                      } else if (action.action === 'calendar') {
                        // Navigate to calendar page
                        window.dispatchEvent(new CustomEvent('navigate-to-view', { detail: { view: 'calendario' } }));
                      } else if (action.action === 'reports') {
                        // Navigate to reports page
                        window.dispatchEvent(new CustomEvent('navigate-to-view', { detail: { view: 'relatorios' } }));
                      }
                    }}
                  >
                    <Icon className="w-8 h-8" />
                    <div className="text-center">
                      <span className="text-base font-semibold block">{action.label}</span>
                      <span className="text-xs text-muted-foreground">{action.description}</span>
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Secao 3: Projetos Urgentes + Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6" data-section="urgent">
          {/* 🚀 Projetos Urgentes */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                🚀 Projetos Urgentes
                {urgentItems.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{urgentItems.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <ListItemSkeleton key={i} />
                  ))}
                </div>
              ) : urgentItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-400 opacity-50" />
                  <p className="text-sm">Tudo em dia!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {urgentItems.map((item, index) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border border-white/10 ${item.bgColor} flex items-center gap-3 cursor-pointer hover:scale-[1.02] transition-transform`}
                        onClick={() => {
                          if (item.projectId) {
                            setSelectedProjectId(item.projectId);
                          }
                        }}
                      >
                        <div className={`p-2 rounded-lg bg-white/5`}>
                          <Icon className={`w-4 h-4 ${item.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                        </div>
                        {item.daysLeft !== undefined && item.daysLeft <= 2 && (
                          <Badge variant="destructive" className="text-xs">Urgente</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <TimelineItemSkeleton key={i} />
                  ))}
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma atividade recente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-2 rounded-lg"
                      >
                        <div className="p-1.5 rounded-full bg-white/5 mt-0.5">
                          <Icon className={`w-3 h-3 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm">
                            <span className="font-medium">{activity.user}</span>
                            {' '}<span className="text-muted-foreground">{activity.action}</span>
                            {' '}<span className="font-medium">"{activity.target}"</span>
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Secao 4: Evolucao Financeira */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Evolução Financeira (
                {dateFilter === 'current' && 'Mês Atual'}
                {dateFilter === 'previous' && 'Mês Anterior'}
                {dateFilter === 'last3' && 'Últimos 3 Meses'}
                {dateFilter === 'quarter' && 'Trimestre Atual'}
              )
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <ChartSkeleton />
            ) : revenueData.every(m => m.receita === 0 && m.custos === 0) ? (
              <div className="h-[300px] flex flex-col items-center justify-center text-center text-muted-foreground">
                <BarChart3 className="w-12 h-12 mb-3 opacity-30" />
                <p className="text-sm">Nenhum dado financeiro disponível</p>
                <p className="text-xs mt-1">Adicione projetos com valores financeiros para ver a evolução</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
                  <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} tickFormatter={(value) => formatCurrency(value).split(',')[0]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(20, 20, 30, 0.95)',
                      border: '1px solid rgba(145, 57, 228, 0.3)',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="receita" stroke="#14b8a6" strokeWidth={2} name="Receita" dot={{ fill: '#14b8a6', r: 4 }} />
                  <Line type="monotone" dataKey="custos" stroke="#f59e0b" strokeWidth={2} name="Custos" dot={{ fill: '#f59e0b', r: 4 }} />
                  <Line type="monotone" dataKey="margem" stroke="#9139e4" strokeWidth={2} name="Margem" dot={{ fill: '#9139e4', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Task Drawer - Opens when urgent project is clicked */}
      <TaskDrawer
        open={!!selectedProjectId}
        taskId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
        onTaskUpdate={(taskId, updates) => {
          console.log('Project updated from urgent list:', taskId, updates);
        }}
      />
    </TooltipProvider>
  );
}
