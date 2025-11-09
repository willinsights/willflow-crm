'use client';

import { useMemo } from 'react';
import { Calendar, Euro, TrendingUp, Video, Clock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Project, Client } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ClientProjectHistoryProps {
  client: Client;
  projects: Project[];
}

export default function ClientProjectHistory({ client, projects }: ClientProjectHistoryProps) {
  const clientProjects = useMemo(() => {
    return projects
      .filter(p => p.clientId === client.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects, client.id]);

  const stats = useMemo(() => {
    return {
      total: clientProjects.length,
      active: clientProjects.filter(p => p.phase !== 'finalizados').length,
      completed: clientProjects.filter(p => p.phase === 'finalizados').length,
      totalRevenue: clientProjects.reduce((sum, p) => sum + p.clientPrice, 0),
      totalCosts: clientProjects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0),
      totalMargin: clientProjects.reduce((sum, p) => sum + p.margin, 0),
    };
  }, [clientProjects]);

  const getPhaseLabel = (phase: string) => {
    const labels: Record<string, string> = {
      captacao: 'Captação',
      edicao: 'Edição',
      finalizados: 'Finalizados',
    };
    return labels[phase] || phase;
  };

  const getStatusBadge = (project: Project) => {
    if (project.phase === 'finalizados') {
      return <Badge className="bg-green-500/20 text-green-400">Finalizado</Badge>;
    }
    if (project.phase === 'edicao') {
      return <Badge className="bg-blue-500/20 text-blue-400">Em Edição</Badge>;
    }
    return <Badge className="bg-orange-500/20 text-orange-400">Em Captação</Badge>;
  };

  if (clientProjects.length === 0) {
    return (
      <Card className="glass-card">
        <CardContent className="p-12 text-center">
          <Video className="w-16 h-16 text-muted-foreground opacity-50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum Projeto</h3>
          <p className="text-muted-foreground">
            Este cliente ainda não tem projetos registrados
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total de Projetos</p>
                <p className="text-2xl font-bold">{stats.total}</p>
                <div className="flex items-center gap-2 mt-2 text-xs">
                  <span className="text-orange-400">{stats.active} ativos</span>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-green-400">{stats.completed} finalizados</span>
                </div>
              </div>
              <Video className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(stats.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Custos: {formatCurrency(stats.totalCosts)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Margem Total</p>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(stats.totalMargin)}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {stats.totalRevenue > 0
                    ? `${((stats.totalMargin / stats.totalRevenue) * 100).toFixed(1)}% margem`
                    : '0% margem'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Timeline */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Histórico de Projetos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                  <TableHead>Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(project.createdAt).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          {project.category && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: project.category.color }}
                              />
                              {project.category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {getPhaseLabel(project.phase)}
                      </Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(project)}</TableCell>
                    <TableCell className="text-right font-medium text-green-400">
                      {formatCurrency(project.clientPrice)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-purple-400">
                      {formatCurrency(project.margin)}
                    </TableCell>
                    <TableCell>
                      {project.paymentStatus === 'recebido' ? (
                        <Badge className="bg-green-500/20 text-green-400">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Pago
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-500/20 text-yellow-400">
                          <Clock className="w-3 h-3 mr-1" />
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Timeline Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Evolução Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            // Group projects by month
            const monthlyData = clientProjects.reduce((acc, project) => {
              const date = new Date(project.createdAt);
              const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

              if (!acc[monthKey]) {
                acc[monthKey] = {
                  month: date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' }),
                  count: 0,
                  revenue: 0,
                  margin: 0,
                };
              }

              acc[monthKey].count++;
              acc[monthKey].revenue += project.clientPrice;
              acc[monthKey].margin += project.margin;

              return acc;
            }, {} as Record<string, { month: string; count: number; revenue: number; margin: number }>);

            const months = Object.values(monthlyData).reverse().slice(0, 6);

            return (
              <div className="space-y-4">
                {months.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">{data.count} projetos</span>
                        <span className="text-green-400">{formatCurrency(data.revenue)}</span>
                      </div>
                    </div>
                    <Progress
                      value={stats.totalRevenue > 0 ? (data.revenue / stats.totalRevenue) * 100 : 0}
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
}
