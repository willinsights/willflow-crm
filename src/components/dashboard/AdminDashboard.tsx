'use client';

import { useMemo } from 'react';
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
import { Project, Client, User, DashboardStats } from '@/lib/types';

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

  // Project status distribution
  const statusDistribution = useMemo(() => {
    return [
      { name: 'Captação', value: projectsByPhase.captacao.length, color: '#f59e0b' },
      { name: 'Edição', value: projectsByPhase.edicao.length, color: '#9139e4' },
      { name: 'Finalizados', value: projectsByPhase.finalizados.length, color: '#14b8a6' }
    ].filter(item => item.value > 0);
  }, [projectsByPhase]);

  // Top clients by revenue
  const topClients = useMemo(() => {
    return clients
      .filter(c => c.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(c => ({
        name: c.name.split(' ')[0],
        receita: c.totalRevenue,
        margem: c.totalMargin
      }));
  }, [clients]);

  // Payment status overview
  const paymentData = useMemo(() => {
    const toReceive = projects.filter(p => p.paymentStatus !== 'recebido').length;
    const received = projects.filter(p => p.paymentStatus === 'recebido').length;
    const toPay = projects.filter(p => p.freelancerPaymentStatus === 'a-pagar').length;
    const paid = projects.filter(p => p.freelancerPaymentStatus === 'pago').length;

    return [
      { name: 'A Receber', value: toReceive, color: '#f59e0b' },
      { name: 'Recebido', value: received, color: '#14b8a6' },
      { name: 'A Pagar', value: toPay, color: '#ec4899' },
      { name: 'Pago', value: paid, color: '#9139e4' }
    ].filter(item => item.value > 0);
  }, [projects]);

  // Top collaborators by profit
  const topCollaborators = useMemo(() => {
    const collaboratorStats = new Map<string, {
      id: string;
      name: string;
      role: string;
      projectCount: number;
      totalProfit: number;
    }>();

    projects.forEach(project => {
      if (project.responsavelCaptacaoId) {
        const user = users.find(u => u.id === project.responsavelCaptacaoId);
        if (user) {
          const key = `${project.responsavelCaptacaoId}-captacao`;
          const existing = collaboratorStats.get(key) || {
            id: user.id,
            name: user.name,
            role: 'Captação',
            projectCount: 0,
            totalProfit: 0
          };
          existing.projectCount++;
          existing.totalProfit += project.margin;
          collaboratorStats.set(key, existing);
        }
      }

      if (project.responsavelEdicaoId) {
        const user = users.find(u => u.id === project.responsavelEdicaoId);
        if (user) {
          const key = `${project.responsavelEdicaoId}-edicao`;
          const existing = collaboratorStats.get(key) || {
            id: user.id,
            name: user.name,
            role: 'Edição',
            projectCount: 0,
            totalProfit: 0
          };
          existing.projectCount++;
          existing.totalProfit += project.margin;
          collaboratorStats.set(key, existing);
        }
      }
    });

    return Array.from(collaboratorStats.values())
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);
  }, [projects, users]);

  // Upcoming deadlines
  const upcomingDeadlines = useMemo(() => {
    const now = new Date();
    return projects
      .filter(p => {
        if (!p.clientDueDate) return false;
        const due = new Date(p.clientDueDate);
        const daysUntil = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil > 0 && daysUntil <= 7;
      })
      .map(p => {
        const due = new Date(p.clientDueDate!);
        const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { ...p, daysUntil: days };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
  }, [projects]);

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
    },
    {
      title: 'Total a Pagar',
      value: formatCurrency(dashboardStats.financialKPIs.totalToPay),
      icon: AlertCircle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      trend: '-8%',
      trendUp: false,
    },
    {
      title: 'Margem Total',
      value: formatCurrency(dashboardStats.financialKPIs.totalMargin),
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      trend: '+22%',
      trendUp: true,
    },
    {
      title: 'Total Recebido',
      value: formatCurrency(dashboardStats.financialKPIs.totalReceived),
      icon: CheckCircle,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: '+18%',
      trendUp: true,
    }
  ];

  // Quick Stats
  const quickStats = [
    {
      label: 'Projetos Ativos',
      value: dashboardStats.activeProjects,
      total: dashboardStats.totalProjects,
      icon: Video,
      color: 'bg-purple-500/20 text-purple-300'
    },
    {
      label: 'Clientes',
      value: dashboardStats.totalClients,
      icon: Users,
      color: 'bg-blue-500/20 text-blue-300'
    },
    {
      label: 'Em Captação',
      value: projectsByPhase.captacao.length,
      icon: Camera,
      color: 'bg-orange-500/20 text-orange-300'
    },
    {
      label: 'Em Edição',
      value: projectsByPhase.edicao.length,
      icon: Edit3,
      color: 'bg-yellow-500/20 text-yellow-300'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">Dashboard Admin</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visão geral completa dos projetos e finanças
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <Card key={index} className="stat-card hover:scale-105 transition-transform">
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
                  {kpi.trend} vs mês anterior
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Trend */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-400" />
              Evolução Financeira (Últimos 6 Meses)
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

        {/* Project Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-400" />
              Distribuição de Projetos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(145, 57, 228, 0.3)', borderRadius: '8px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-purple-400" />
              Status de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={paymentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(20, 20, 30, 0.95)', border: '1px solid rgba(145, 57, 228, 0.3)', borderRadius: '8px' }} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Stats */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-base md:text-lg">Estatísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${stat.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{stat.label}</span>
                  </div>
                  <span className="text-lg font-bold">
                    {stat.value}
                    {stat.total !== undefined && <span className="text-xs text-muted-foreground ml-1">/{stat.total}</span>}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Clock className="w-5 h-5 text-orange-400" />
              Próximos Prazos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum prazo próximo</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingDeadlines.map((project, index) => (
                  <div
                    key={project.id}
                    className={`p-3 rounded-lg border ${
                      project.daysUntil <= 3
                        ? 'border-red-500/30 bg-red-500/5'
                        : project.daysUntil <= 5
                        ? 'border-yellow-500/30 bg-yellow-500/5'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium truncate">{project.title}</p>
                      <Badge
                        variant="outline"
                        className={
                          project.daysUntil <= 3
                            ? 'border-red-500/30 text-red-400'
                            : project.daysUntil <= 5
                            ? 'border-yellow-500/30 text-yellow-400'
                            : 'border-blue-500/30 text-blue-400'
                        }
                      >
                        {project.daysUntil === 1 ? 'Amanhã' : `${project.daysUntil} dias`}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(new Date(project.clientDueDate!))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Collaborators */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="w-5 h-5 text-purple-400" />
              Top Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCollaborators.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum colaborador</p>
              </div>
            ) : (
              <div className="space-y-3">
                {topCollaborators.map((collab, index) => (
                  <div key={`${collab.id}-${collab.role}`} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-500/20 text-yellow-300' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300' :
                        index === 2 ? 'bg-orange-500/20 text-orange-300' :
                        'bg-purple-500/20 text-purple-300'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{collab.name}</p>
                        <p className="text-xs text-muted-foreground">{collab.role}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-400">{formatCurrency(collab.totalProfit)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
