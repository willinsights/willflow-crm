'use client';

import { useState, useMemo } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Download,
  Filter,
  CalendarDays,
  Euro,
  Users,
  Target,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/useAppStore';
import { formatCurrency } from '@/lib/utils';

export default function ReportsPage() {
  const { projects, clients, users, currentUser, userPermissions } = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState('6m');
  const [selectedView, setSelectedView] = useState('overview');

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalRevenue = projects.reduce((sum, p) => sum + p.clientPrice, 0);
    const totalCosts = projects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);
    const totalMargin = totalRevenue - totalCosts;
    const totalReceived = projects.filter(p => p.paymentStatus === 'recebido').reduce((sum, p) => sum + p.clientPrice, 0);
    const totalPending = projects.filter(p => p.paymentStatus !== 'recebido').reduce((sum, p) => sum + p.clientPrice, 0);

    return {
      totalRevenue,
      totalCosts,
      totalMargin,
      totalReceived,
      totalPending,
      marginPercentage: totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100) : 0,
      projectsCount: projects.length,
      activeProjects: projects.filter(p => p.phase !== 'finalizados').length,
      completedProjects: projects.filter(p => p.phase === 'finalizados').length
    };
  }, [projects]);

  // Revenue by client (pie chart data)
  const revenueByClient = useMemo(() => {
    const clientRevenue = clients.map(client => {
      const clientProjects = projects.filter(p => p.clientId === client.id);
      const revenue = clientProjects.reduce((sum, p) => sum + p.clientPrice, 0);
      return {
        name: client.name,
        value: revenue,
        projects: clientProjects.length,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      };
    }).filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return clientRevenue;
  }, [clients, projects]);

  // Monthly revenue evolution (line chart data)
  const monthlyRevenue = useMemo(() => {
    const monthlyData: { [key: string]: { revenue: number, costs: number, margin: number, projects: number } } = {};

    projects.forEach(project => {
      const date = new Date(project.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, costs: 0, margin: 0, projects: 0 };
      }

      monthlyData[monthKey].revenue += project.clientPrice;
      monthlyData[monthKey].costs += project.captationCost + project.editionCost;
      monthlyData[monthKey].margin += project.margin;
      monthlyData[monthKey].projects += 1;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        monthName: new Date(month + '-01').toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' }),
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [projects]);

  // Collaborator costs (bar chart data)
  const collaboratorCosts = useMemo(() => {
    const collaboratorData = users.map(user => {
      const userProjects = projects.filter(p =>
        p.responsavelCaptacaoId === user.id || p.responsavelEdicaoId === user.id
      );

      const captationCosts = projects
        .filter(p => p.responsavelCaptacaoId === user.id)
        .reduce((sum, p) => sum + p.captationCost, 0);

      const editionCosts = projects
        .filter(p => p.responsavelEdicaoId === user.id)
        .reduce((sum, p) => sum + p.editionCost, 0);

      const totalCosts = captationCosts + editionCosts;
      const projectsCount = userProjects.length;

      return {
        name: user.name,
        role: user.role,
        captacao: captationCosts,
        edicao: editionCosts,
        total: totalCosts,
        projects: projectsCount
      };
    }).filter(item => item.total > 0)
      .sort((a, b) => b.total - a.total);

    return collaboratorData;
  }, [users, projects]);

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1'];

  const exportToCSV = () => {
    const csvData = projects.map(project => ({
      'Título': project.title,
      'Cliente': project.client?.name || '',
      'Tipo': project.videoType,
      'Fase': project.phase,
      'Preço Cliente': project.clientPrice,
      'Custo Captação': project.captationCost,
      'Custo Edição': project.editionCost,
      'Margem': project.margin,
      'Status Pagamento': project.paymentStatus,
      'Data Criação': new Date(project.createdAt).toLocaleDateString('pt-PT')
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Check if user can view financial reports
  if (!userPermissions.canViewFinance) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Relatórios</h1>
            <p className="text-muted-foreground">
              Analytics e métricas detalhadas
            </p>
          </div>
        </div>

        <div className="glass-card p-8 text-center">
          <EyeOff className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Acesso Restrito</h3>
          <p className="text-muted-foreground">
            Apenas administradores podem visualizar relatórios financeiros.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-1 md:mb-2">Relatórios Financeiros</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Analytics detalhados de receitas, custos e performance
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="glass border-white/20 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border border-white/20">
              <SelectItem value="3m">3 meses</SelectItem>
              <SelectItem value="6m">6 meses</SelectItem>
              <SelectItem value="12m">1 ano</SelectItem>
              <SelectItem value="all">Tudo</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={exportToCSV}
            variant="outline"
            className="glass border-white/20 hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        <Card className="glass-card">
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Receita Total
              </CardTitle>
              <Euro className="h-4 w-4 text-green-400 flex-shrink-0" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold text-green-400 truncate">
              {formatCurrency(financialMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {financialMetrics.projectsCount} projetos
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Custos Totais
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {formatCurrency(financialMetrics.totalCosts)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Captação + Edição
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Margem Total
              </CardTitle>
              <Target className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(financialMetrics.totalMargin)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {financialMetrics.marginPercentage.toFixed(1)}% margem
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                A Receber
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">
              {formatCurrency(financialMetrics.totalPending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {projects.filter(p => p.paymentStatus !== 'recebido').length} projetos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Client - Pie Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-purple-400" />
              Receita por Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={revenueByClient}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                  >
                    {revenueByClient.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Receita']}
                    labelStyle={{ color: '#fff' }}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Evolution - Line Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Evolução Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="monthName"
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'revenue' ? 'Receita' : name === 'costs' ? 'Custos' : 'Margem'
                    ]}
                    labelStyle={{ color: '#fff' }}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stackId="1"
                    stroke="#10b981"
                    fill="rgba(16, 185, 129, 0.3)"
                  />
                  <Area
                    type="monotone"
                    dataKey="margin"
                    stackId="2"
                    stroke="#8b5cf6"
                    fill="rgba(139, 92, 246, 0.3)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Collaborator Costs - Bar Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              Custos por Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={collaboratorCosts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="name"
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.7)"
                    fontSize={12}
                    tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatCurrency(value),
                      name === 'captacao' ? 'Captação' : name === 'edicao' ? 'Edição' : 'Total'
                    ]}
                    labelStyle={{ color: '#fff' }}
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="captacao" stackId="a" fill="#f59e0b" name="Captação" />
                  <Bar dataKey="edicao" stackId="a" fill="#06b6d4" name="Edição" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients Table */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-400" />
              Top Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {revenueByClient.slice(0, 5).map((client, index) => (
                <div key={client.name} className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-purple-500/20 text-purple-300 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.projects} projetos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-400">{formatCurrency(client.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {((client.value / financialMetrics.totalRevenue) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top 5 Colaboradores */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-yellow-400" />
              Top 5 Colaboradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users
                .map(user => {
                  const userProjects = projects.filter(p =>
                    p.responsavelCaptacaoId === user.id || p.responsavelEdicaoId === user.id
                  );

                  const totalProfit = userProjects.reduce((sum, p) => sum + p.margin, 0);
                  const totalRevenue = userProjects.reduce((sum, p) => sum + p.clientPrice, 0);

                  return {
                    id: user.id,
                    name: user.name,
                    role: user.role,
                    projectCount: userProjects.length,
                    totalProfit,
                    totalRevenue,
                    avgProfit: userProjects.length > 0 ? totalProfit / userProjects.length : 0
                  };
                })
                .filter(item => item.projectCount > 0)
                .sort((a, b) => {
                  // Ordenar primeiro por lucro total, depois por número de projetos
                  if (b.totalProfit !== a.totalProfit) {
                    return b.totalProfit - a.totalProfit;
                  }
                  return b.projectCount - a.projectCount;
                })
                .slice(0, 5)
                .map((collaborator, index) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 glass rounded-lg hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        ${index === 1 ? 'bg-gray-400/20 text-gray-400' : ''}
                        ${index === 2 ? 'bg-orange-600/20 text-orange-400' : ''}
                        ${index > 2 ? 'bg-purple-500/20 text-purple-400' : ''}
                      `}>
                        #{index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{collaborator.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-400">{formatCurrency(collaborator.totalProfit)}</p>
                      <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {collaborator.projectCount} projeto{collaborator.projectCount !== 1 ? 's' : ''}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {financialMetrics.marginPercentage.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground">Margem Média</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {formatCurrency(financialMetrics.totalRevenue / financialMetrics.projectsCount || 0)}
              </div>
              <p className="text-sm text-muted-foreground">Receita Média por Projeto</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {financialMetrics.activeProjects}
              </div>
              <p className="text-sm text-muted-foreground">Projetos Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
