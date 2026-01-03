'use client';

import { useMemo, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Euro,
  Eye,
  Download,
  ExternalLink,
  Filter,
  Calendar,
} from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Project, Client } from '@/lib/types';
import { useLocale } from '@/lib/LocaleContext';

interface ProjectProfitabilityProps {
  projects: Project[];
  clients: Client[];
  onViewProject?: (projectId: string) => void;
}

type PeriodFilter =
  | 'all'
  | 'today'
  | 'week'
  | 'month'
  | 'quarter'
  | 'semester'
  | 'custom';
type StatusFilter =
  | 'all'
  | 'received'
  | 'pending'
  | 'overdue'
  | 'paid'
  | 'to-pay';

export default function ProjectProfitability({
  projects,
  clients = [],
  onViewProject,
}: ProjectProfitabilityProps) {
  const { formatCurrency } = useLocale();
  // Filtros
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Função para filtrar por período
  const filterByPeriod = (project: Project) => {
    if (periodFilter === 'all') return true;

    const projectDate = project.createdAt ? new Date(project.createdAt) : new Date();
    const now = new Date();

    switch (periodFilter) {
      case 'today':
        return projectDate.toDateString() === now.toDateString();
      case 'week': {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return projectDate >= weekAgo;
      }
      case 'month':
        return (
          projectDate.getMonth() === now.getMonth() &&
          projectDate.getFullYear() === now.getFullYear()
        );
      case 'quarter': {
        const quarterStart = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1
        );
        return projectDate >= quarterStart;
      }
      case 'semester': {
        const semesterStart = new Date(
          now.getFullYear(),
          now.getMonth() >= 6 ? 6 : 0,
          1
        );
        return projectDate >= semesterStart;
      }
      case 'custom': {
        if (!customStartDate || !customEndDate) return true;
        const start = new Date(customStartDate);
        const end = new Date(customEndDate);
        return projectDate >= start && projectDate <= end;
      }
      default:
        return true;
    }
  };

  // Função para filtrar por status
  const filterByStatus = (project: Project) => {
    if (statusFilter === 'all') return true;

    const isPaid = project.paymentStatus === 'recebido';
    const isFreelancerPaid = project.freelancerPaymentStatus === 'pago';
    const dueDate = project.clientDueDate ? new Date(project.clientDueDate) : null;
    const isOverdue = dueDate && dueDate < new Date() && !isPaid;

    switch (statusFilter) {
      case 'received':
        return isPaid;
      case 'pending':
        return !isPaid && !isOverdue;
      case 'overdue':
        return isOverdue;
      case 'paid':
        return isFreelancerPaid;
      case 'to-pay':
        return !isFreelancerPaid;
      default:
        return true;
    }
  };

  const profitabilityData = useMemo(() => {
    return projects
      .filter(filterByPeriod)
      .filter(filterByStatus)
      .map((project) => {
        const client = clients.find((c) => c.id === project.clientId);
        const totalCost = project.captationCost + project.editionCost;
        const revenue = project.clientPrice;
        const margin = project.margin;
        const marginPercent = revenue > 0 ? (margin / revenue) * 100 : 0;

        const isPaid = project.paymentStatus === 'recebido';
        const isFreelancerPaid = project.freelancerPaymentStatus === 'pago';
        const dueDate = project.clientDueDate ? new Date(project.clientDueDate) : null;
        const isOverdue = dueDate && dueDate < new Date() && !isPaid;

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
          isOverdue,
          status: project.paymentStatus,
          freelancerStatus: project.freelancerPaymentStatus,
          dueDate: project.clientDueDate,
          createdAt: project.createdAt,
        };
      })
      .sort((a, b) => b.margin - a.margin);
  }, [projects, clients, periodFilter, statusFilter, customStartDate, customEndDate]);

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

  const handleExportProject = (projectId: string) => {
    const project = profitabilityData.find((p) => p.id === projectId);
    if (!project) return;

    const csvContent = [
      [
        'Projeto',
        'Cliente',
        'Receita',
        'Custo',
        'Lucro',
        'Margem %',
        'Status',
      ],
      [
        project.title,
        project.clientName,
        project.revenue,
        project.totalCost,
        project.margin,
        project.marginPercent.toFixed(1),
        project.isPaid ? 'Recebido' : 'Pendente',
      ],
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projeto-${project.title.replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  const periodLabels: Record<PeriodFilter, string> = {
    all: 'Todo o período',
    today: 'Hoje',
    week: 'Esta semana',
    month: 'Este mês',
    quarter: 'Este trimestre',
    semester: 'Este semestre',
    custom: 'Personalizado',
  };

  const statusLabels: Record<StatusFilter, string> = {
    all: 'Todos os estados',
    received: 'Recebidos',
    pending: 'Por receber',
    overdue: 'Em atraso',
    paid: 'Pagos (freelancer)',
    'to-pay': 'Por pagar',
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <Select
                value={periodFilter}
                onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}
              >
                <SelectTrigger className="w-[180px] glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/20">
                  <SelectItem value="all">Todo o período</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta semana</SelectItem>
                  <SelectItem value="month">Este mês</SelectItem>
                  <SelectItem value="quarter">Este trimestre</SelectItem>
                  <SelectItem value="semester">Este semestre</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {periodFilter === 'custom' && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-[140px] glass border-white/20"
                />
                <span className="text-muted-foreground">até</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-[140px] glass border-white/20"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="w-[180px] glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/20">
                  <SelectItem value="all">Todos os estados</SelectItem>
                  <SelectItem value="received">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Recebidos
                    </span>
                  </SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-yellow-400" />
                      Por receber
                    </span>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Em atraso
                    </span>
                  </SelectItem>
                  <SelectItem value="paid">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      Pagos
                    </span>
                  </SelectItem>
                  <SelectItem value="to-pay">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-400" />
                      Por pagar
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto text-sm text-muted-foreground">
              {profitabilityData.length} projetos encontrados
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  Receita ({periodLabels[periodFilter]})
                </p>
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
                <p className="text-xs text-muted-foreground mb-1">
                  Custo ({periodLabels[periodFilter]})
                </p>
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
                <p className="text-xs text-muted-foreground mb-1">
                  Lucro ({periodLabels[periodFilter]})
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(totals.margin)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.revenue > 0
                    ? ((totals.margin / totals.revenue) * 100).toFixed(1)
                    : '0'}
                  % margem
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
                    <TableCell
                      colSpan={9}
                      className="text-center text-muted-foreground py-8"
                    >
                      Nenhum projeto encontrado para os filtros selecionados
                    </TableCell>
                  </TableRow>
                ) : (
                  profitabilityData.map((item) => (
                    <TableRow
                      key={item.id}
                      className={item.isOverdue ? 'bg-red-500/10' : ''}
                    >
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.clientName}
                      </TableCell>
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
                      <TableCell
                        className={`text-right font-semibold ${getMarginColor(
                          item.marginPercent
                        )}`}
                      >
                        {formatCurrency(item.margin)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="outline"
                          className={getMarginBadge(item.marginPercent)}
                        >
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
                                : item.isOverdue
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-yellow-500/20 text-yellow-400'
                            }
                          >
                            {item.isPaid
                              ? '✓ Recebido'
                              : item.isOverdue
                              ? '⚠ Atrasado'
                              : '⏱ Pendente'}
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
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <span className="sr-only">Abrir menu</span>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="glass-strong border-white/20"
                          >
                            {onViewProject && (
                              <DropdownMenuItem
                                onClick={() => onViewProject(item.id)}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver Projeto
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleExportProject(item.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Exportar CSV
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
