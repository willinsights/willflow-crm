'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
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
import { useCreateProject } from '@/contexts/CreateProjectContext';
import { Project, Client, User, DashboardStats } from '@/lib/types';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
}

export default function AdminDashboard({
  projects,
  clients,
  users,
  dashboardStats,
  projectsByPhase,
}: AdminDashboardProps) {
  const { formatCurrency, formatDate } = useLocale();
  const router = useRouter();
  const { openCreateProject } = useCreateProject();

  // Calculate monthly revenue trend
  const revenueData = useMemo(() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-PT', { month: 'short' });

      const monthProjects = projects.filter(p => {
        const createdDate = new Date(p.createdAt);
        return createdDate.getMonth() === month.getMonth() &&
          createdDate.getFullYear() === month.getFullYear();
      });

      const revenue = monthProjects.reduce((sum, p) => sum + p.clientPrice, 0);
      const costs = monthProjects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);

      months.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        receita: revenue,
        custos: costs,
        margem: revenue - costs
      });
    }

    return months;
  }, [projects]);

  // Urgent projects: deadlines this week + pending payments
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
    }> = [];

    // Projects with deadline this week
    projects.forEach(p => {
      if (!p.clientDueDate) return;
      const due = new Date(p.clientDueDate);
      const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 0 && days <= 7 && p.phase !== 'finalizados') {
        items.push({
          type: 'deadline',
          title: p.title,
          subtitle: days === 1 ? 'Entrega amanha' : `Entrega em ${days} dias`,
          daysLeft: days,
          icon: Clock,
          color: days <= 2 ? 'text-red-400' : days <= 4 ? 'text-orange-400' : 'text-yellow-400',
          bgColor: days <= 2 ? 'bg-red-500/10' : days <= 4 ? 'bg-orange-500/10' : 'bg-yellow-500/10',
        });
      }
    });

    // Client payments pending (due in 3 days)
    projects.forEach(p => {
      if (p.paymentStatus !== 'recebido' && p.clientPrice > 0) {
        items.push({
          type: 'payment_client',
          title: `${p.client?.name || 'Cliente'}`,
          subtitle: `${formatCurrency(p.clientPrice)} - ${p.title}`,
          amount: p.clientPrice,
          icon: CreditCard,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
        });
      }
    });

    // Captacoes scheduled
    projects.forEach(p => {
      if (p.phase === 'captacao' && p.clientDueDate) {
        const captDate = new Date(p.clientDueDate);
        const days = Math.ceil((captDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (days >= 0 && days <= 3) {
          items.push({
            type: 'captacao',
            title: p.title,
            subtitle: days === 0 ? 'Captacao HOJE' : days === 1 ? 'Captacao amanha' : `Captacao em ${days} dias`,
            daysLeft: days,
            icon: Camera,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
          });
        }
      }
    });

    // Sort by urgency
    return items.sort((a, b) => {
      if (a.daysLeft !== undefined && b.daysLeft !== undefined) {
        return a.daysLeft - b.daysLeft;
      }
      return 0;
    }).slice(0, 5);
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
                       diffHours < 24 ? `Ha ${diffHours}h` :
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
        });
      } else if (p.phase === 'edicao') {
        activities.push({
          id: `${p.id}-editing`,
          action: 'esta em edicao',
          target: p.title,
          user: users.find(u => u.id === p.responsavelEdicaoId)?.name || 'Editor',
          time: timeLabel,
          icon: Edit3,
          color: 'text-purple-400',
        });
      }
    });

    return activities.slice(0, 5);
  }, [projects, users, formatCurrency, formatDate]);

  // KPI Cards
  const kpiCards = [
    {
      title: 'Total a Receber',
      value: formatCurrency(dashboardStats.financialKPIs.totalToReceive),
      icon: Euro,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      trend: '+15%',
      trendUp: true,
      tooltip: 'Soma de todos os pagamentos pendentes de clientes',
    },
    {
      title: 'Total a Pagar',
      value: formatCurrency(dashboardStats.financialKPIs.totalToPay),
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      trend: '-8%',
      trendUp: false,
      tooltip: 'Soma de todos os pagamentos pendentes a freelancers',
    },
    {
      title: 'Margem Total',
      value: formatCurrency(dashboardStats.financialKPIs.totalMargin),
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: '+22%',
      trendUp: true,
      tooltip: 'Lucro total: Receita menos custos de captacao e edicao',
    },
    {
      title: 'Total Recebido',
      value: formatCurrency(dashboardStats.financialKPIs.totalReceived),
      icon: CheckCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: '+18%',
      trendUp: true,
      tooltip: 'Soma de todos os pagamentos ja recebidos de clientes',
    }
  ];

  // Quick Actions
  const quickActions = [
    { label: 'Novo Projeto', icon: Plus, href: '#', color: 'gradient-purple', action: 'create-project' },
    { label: 'Ver Pagamentos', icon: Wallet, href: 'financeiro', color: 'bg-green-500/20 hover:bg-green-500/30 text-green-400' },
    { label: 'Calendario', icon: CalendarDays, href: 'calendario', color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' },
    { label: 'Relatorios', icon: FileText, href: 'financeiro', color: 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-400' },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-4 md:space-y-6">
        <Breadcrumbs items={[{ label: 'Dashboard' }]} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Visao geral completa dos projetos e financas
            </p>
          </div>

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

        {/* Secao 1: KPI Cards with Tooltips */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
          {kpiCards.map((kpi, index) => {
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
          })}
        </div>

        {/* Secao 2: Acoes Rapidas */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Acoes Rapidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`h-auto py-4 flex flex-col gap-2 ${action.color} ${action.color.includes('gradient') ? 'text-white shadow-glow-sm' : ''}`}
                    onClick={() => {
                      if (action.action === 'create-project') {
                        openCreateProject();
                      } else if (action.href && action.href !== '#') {
                        router.push(`/${action.href}`);
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{action.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Secao 3: Projetos Urgentes + Atividade Recente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Projetos Urgentes */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Atencao Necessaria
                {urgentItems.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{urgentItems.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {urgentItems.length === 0 ? (
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
                        className={`p-3 rounded-lg border border-white/10 ${item.bgColor} flex items-center gap-3`}
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
              {recentActivity.length === 0 ? (
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
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
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
              Evolucao Financeira (Ultimos 6 Meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Secao 5: Stats Rapidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="glass-card text-center p-4">
            <div className="text-3xl font-bold text-purple-400">{dashboardStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground mt-1">Projetos Ativos</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <div className="text-3xl font-bold text-orange-400">{projectsByPhase.captacao.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Em Captacao</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <div className="text-3xl font-bold text-yellow-400">{projectsByPhase.edicao.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Em Edicao</p>
          </Card>
          <Card className="glass-card text-center p-4">
            <div className="text-3xl font-bold text-green-400">{projectsByPhase.finalizados.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Finalizados</p>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
