'use client';

import {
  TrendingUp,
  TrendingDown,
  Euro,
  Users,
  Video,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/lib/useAppStore';
import { formatCurrency } from '@/lib/utils';

export default function Dashboard() {
  const { dashboardStats, projectsByPhase, clients, users } = useAppStore();

  const kpiCards = [
    {
      title: 'Total a Receber',
      value: formatCurrency(dashboardStats.financialKPIs.totalToReceive),
      icon: Euro,
      color: 'text-green-400'
    },
    {
      title: 'Total a Pagar',
      value: formatCurrency(dashboardStats.financialKPIs.totalToPay),
      icon: AlertCircle,
      color: 'text-orange-400'
    },
    {
      title: 'Margem Total',
      value: formatCurrency(dashboardStats.financialKPIs.totalMargin),
      icon: TrendingUp,
      color: 'text-purple-400'
    },
    {
      title: 'Total Recebido',
      value: formatCurrency(dashboardStats.financialKPIs.totalReceived),
      icon: CheckCircle,
      color: 'text-blue-400'
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
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gradient mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visão geral dos seus projetos e finanças
        </p>
      </div>

      {/* KPI Cards - Responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
        {kpiCards.map((kpi, index) => {
          const Icon = kpi.icon;

          return (
            <Card key={index} className="stat-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  {kpi.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color} flex-shrink-0`} />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold truncate">{kpi.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                    value={(projectsByPhase.captacao.length / dashboardStats.totalProjects) * 100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span>Edição</span>
                    <span>{projectsByPhase.edicao.length} projetos</span>
                  </div>
                  <Progress
                    value={(projectsByPhase.edicao.length / dashboardStats.totalProjects) * 100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs md:text-sm mb-2">
                    <span>Finalizados</span>
                    <span>{projectsByPhase.finalizados.length} projetos</span>
                  </div>
                  <Progress
                    value={(projectsByPhase.finalizados.length / dashboardStats.totalProjects) * 100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Projects */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base md:text-lg">Projetos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {projectsByPhase.edicao.slice(0, 5).map((project) => (
              <div key={project.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 md:p-4 glass rounded-lg gap-3">
                <div className="flex items-center space-x-3 md:space-x-4 flex-1 min-w-0">
                  <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-sm md:text-base truncate">{project.title}</h3>
                    <p className="text-xs md:text-sm text-muted-foreground truncate">
                      {project.client?.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end space-x-3 flex-shrink-0">
                  <Badge className={`status-badge status-${project.statusEdicao || project.statusCaptacao} text-xs`}>
                    {(project.statusEdicao || project.statusCaptacao || '').replace('-', ' ')}
                  </Badge>
                  <span className="text-xs md:text-sm font-medium whitespace-nowrap">
                    {formatCurrency(project.clientPrice)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
