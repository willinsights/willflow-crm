'use client';

import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Euro, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Project, Client } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ProjectProfitabilityProps {
  projects: Project[];
  clients: Client[];
  onViewProject?: (projectId: string) => void;
}

export default function ProjectProfitability({
  projects,
  clients,
  onViewProject,
}: ProjectProfitabilityProps) {

  const profitabilityData = useMemo(() => {
    return projects.map(project => {
      const client = clients.find(c => c.id === project.clientId);
      const totalCost = project.captationCost + project.editionCost;
      const revenue = project.clientPrice;
      const margin = project.margin;
      const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

      // Status financeiro consolidado
      const isPaid = project.paymentStatus === 'recebido';
      const isFreelancerPaid = project.freelancerPaymentStatus === 'pago';

      return {
        id: project.id,
        title: project.title,
        clientName: client?.name || 'N/A',
        phase: project.phase,
        revenue,
        totalCost,
        margin,
        marginPercent,
        isPaid,
        isFreelancerPaid,
        status: project.paymentStatus,
        freelancerStatus: project.freelancerPaymentStatus,
        dueDate: project.clientDueDate,
      };
    }).sort((a, b) => b.margin - a.margin); // Ordenar por margem (maior primeiro)
  }, [projects, clients]);

  const totals = useMemo(() => {
    return profitabilityData.reduce(
      (acc, item) => ({
        revenue: acc.revenue + item.revenue,
        cost: acc.cost + item.totalCost,
        margin: acc.margin + item.margin,
      }),
      { revenue: 0, cost: 0, margin: 0 }
    );
  }, [profitabilityData]);

  const getMarginColor = (percent: number) => {
    if (percent >= 50) return 'text-green-400';
    if (percent >= 30) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getMarginBadge = (percent: number) => {
    if (percent >= 50) return 'bg-green-500/20 text-green-400';
    if (percent >= 30) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-red-500/20 text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Receita Total</p>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(totals.revenue)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Custo Total</p>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(totals.cost)}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-400 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Lucro Total</p>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(totals.margin)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.revenue > 0 ? ((totals.margin / totals.revenue) * 100).toFixed(1) : '0'}% margem
                </p>
              </div>
              <Euro className="w-8 h-8 text-purple-400 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profitability Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Rentabilidade por Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fase</TableHead>
                  <TableHead className="text-right">Receita</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-right">% Margem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitabilityData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Nenhum projeto encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  profitabilityData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-muted-foreground">{item.clientName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {item.phase}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-green-400">
                        {formatCurrency(item.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-orange-400">
                        {formatCurrency(item.totalCost)}
                      </TableCell>
                      <TableCell className={`text-right font-semibold ${getMarginColor(item.marginPercent)}`}>
                        {formatCurrency(item.margin)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={getMarginBadge(item.marginPercent)}>
                          {item.marginPercent.toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant="outline"
                            className={
                              item.isPaid
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }
                          >
                            {item.isPaid ? '✓ Recebido' : '⏱ Pendente'}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              item.isFreelancerPaid
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-orange-500/20 text-orange-400'
                            }
                          >
                            {item.isFreelancerPaid ? '✓ Pago' : '⏱ A Pagar'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {onViewProject && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewProject(item.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Top 5 Most Profitable */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Top 5 Projetos Mais Lucrativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profitabilityData.slice(0, 5).map((item, index) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-purple-400">
                    {formatCurrency(item.margin)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.marginPercent.toFixed(1)}% margem
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
