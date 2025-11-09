'use client';

import { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Users,
  Video,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Download,
  FileText
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
import { useAppStore } from '@/lib/useAppStore';
import { formatCurrency } from '@/lib/utils';
import { exportDashboardCSV } from '@/lib/export-utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

const COLORS = ['#9139e4', '#c084fc', '#f59e0b', '#14b8a6', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const { dashboardStats, projectsByPhase, clients, projects, users } = useAppStore();

  // Calculate monthly revenue trend (last 6 months)
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
      { name: 'Captação', value: projectsByPhase.captacao.length },
      { name: 'Edição', value: projectsByPhase.edicao.length },
      { name: 'Finalizados', value: projectsByPhase.finalizados.length }
    ].filter(item => item.value > 0);
  }, [projectsByPhase]);

  // Top 5 clients by revenue
  const topClients = useMemo(() => {
    return clients
      .filter(c => c.totalRevenue > 0)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5)
      .map(c => ({
        name: c.name.split(' ')[0], // First name only for chart
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

  // Top 5 Collaborators by profit
  const topCollaborators = useMemo(() => {
    const collaboratorStats = new Map<string, {
      id: string;
      name: string;
      role: string;
      projectCount: number;
      totalProfit: number;
    }>();

    projects.forEach(project => {
      // Captação
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

      // Edição
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

  const kpiCards = [
    {
      title: 'Total a Receber',
      value: formatCurrency(dashboardStats.financialKPIs.totalToReceive),
      icon: Euro,
      color: 'text-green-400',
      trend: '+15%'
    },
    {
      title: 'Total a Pagar',
      value: formatCurrency(dashboardStats.financialKPIs.totalToPay),
      icon: AlertCircle,
      color: 'text-orange-400',
      trend: '-8%'
    },
    {
      title: 'Margem Total',
      value: formatCurrency(dashboardStats.financialKPIs.totalMargin),
      icon: TrendingUp,
      color: 'text-purple-400',
      trend: '+22%'
    },
    {
      title: 'Total Recebido',
      value: formatCurrency(dashboardStats.financialKPIs.totalReceived),
      icon: CheckCircle,
      color: 'text-blue-400',
      trend: '+18%'
    }
  ];

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
      icon: Video,
      color: 'bg-orange-500/20 text-orange-300'
    },
    {
      label: 'Em Edição',
      value: projectsByPhase.edicao.length,
      icon: Clock,
      color: 'bg-yellow-500/20 text-yellow-300'
    }
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Visão geral dos seus projetos e finanças
          </p>
        </div>

        {/* Export Button */}
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

      {/* KPI Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <Card key={index} className="stat-card hover:scale-105 transition-transform">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color} flex-shrink-0`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold truncate">{kpi.value}</div>
                <p className="text-xs text-green-400 mt-1">{kpi.trend} vs mês anterior</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue Trend Chart */}
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
                <XAxis
                  dataKey="month"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    border: '1px solid rgba(145, 57, 228, 0.3)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="receita"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  name="Receita"
                  dot={{ fill: '#14b8a6', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="custos"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  name="Custos"
                  dot={{ fill: '#f59e0b', r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="margem"
                  stroke="#9139e4"
                  strokeWidth={2}
                  name="Margem"
                  dot={{ fill: '#9139e4', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Project Distribution Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-400" />
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
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    border: '1px solid rgba(145, 57, 228, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Status Chart */}
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
                  label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    border: '1px solid rgba(145, 57, 228, 0.3)',
                    borderRadius: '8px'
                  }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Clients Bar Chart */}
      {topClients.length > 0 && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Top 5 Clientes por Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topClients}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="name"
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => `€${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(20, 20, 30, 0.95)',
                    border: '1px solid rgba(145, 57, 228, 0.3)',
                    borderRadius: '8px'
                  }}
                  formatter={(value: any) => formatCurrency(value)}
                />
                <Legend />
                <Bar dataKey="receita" fill="#9139e4" name="Receita" radius={[8, 8, 0, 0]} />
                <Bar dataKey="margem" fill="#14b8a6" name="Margem" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Content Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Quick Stats */}
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Estatísticas Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              {quickStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                      <div className={`p-2 rounded-lg ${stat.color} flex-shrink-0`}>
                        <Icon className="h-3 w-3 md:h-4 md:w-4" />
                      </div>
                      <span className="text-xs md:text-sm font-medium truncate">{stat.label}</span>
                    </div>
                    <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0">
                      {stat.total ? (
                        <>
                          <span className="text-base md:text-lg font-bold">{stat.value}</span>
                          <span className="text-xs text-muted-foreground">/{stat.total}</span>
                        </>
                      ) : (
                        <span className="text-base md:text-lg font-bold">{stat.value}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <div className="lg:col-span-2">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">Progresso por Fase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span>Captação</span>
                    <span>{projectsByPhase.captacao.length} projetos</span>
                  </div>
                  <Progress
                    value={dashboardStats.totalProjects > 0 ? (projectsByPhase.captacao.length / dashboardStats.totalProjects) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span>Edição</span>
                    <span>{projectsByPhase.edicao.length} projetos</span>
                  </div>
                  <Progress
                    value={dashboardStats.totalProjects > 0 ? (projectsByPhase.edicao.length / dashboardStats.totalProjects) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span>Finalizados</span>
                    <span>{projectsByPhase.finalizados.length} projetos</span>
                  </div>
                  <Progress
                    value={dashboardStats.totalProjects > 0 ? (projectsByPhase.finalizados.length / dashboardStats.totalProjects) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top 5 Collaborators by Profit */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Users className="w-5 h-5 text-purple-400" />
            Top 5 Colaboradores - Lucro Gerado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {topCollaborators.length > 0 ? (
              topCollaborators.map((collab, index) => (
                <div
                  key={`${collab.id}-${collab.role}`}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 glass rounded-lg gap-3 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                    {/* Ranking Badge */}
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                      ${index === 0 ? 'bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500/40' :
                        index === 1 ? 'bg-gray-400/20 text-gray-300 border-2 border-gray-400/40' :
                        index === 2 ? 'bg-orange-500/20 text-orange-300 border-2 border-orange-500/40' :
                        'bg-purple-500/20 text-purple-300 border border-purple-500/30'}
                    `}>
                      {index + 1}
                    </div>

                    {/* Name and Role */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium text-sm md:text-base truncate">{collab.name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {collab.role} • {collab.projectCount} {collab.projectCount === 1 ? 'projeto' : 'projetos'}
                      </p>
                    </div>
                  </div>

                  {/* Profit */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-sm md:text-base font-bold text-green-400">
                        {formatCurrency(collab.totalProfit)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Lucro Total
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-green-400 flex-shrink-0" />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Nenhum colaborador com projetos ainda
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
