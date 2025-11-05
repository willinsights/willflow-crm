'use client';

import { useState, useMemo } from 'react';
import {
  Euro,
  TrendingUp,
  TrendingDown,
  Calendar,
  User,
  Building2,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAppStore } from '@/lib/useAppStore';
import { formatCurrency } from '@/lib/utils';
import { PaymentStatus, FreelancerPaymentStatus } from '@/lib/types';

export default function FinancePage() {
  const { projects, clients, users } = useAppStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterClient, setFilterClient] = useState<string>('all');
  const [filterCollaborator, setFilterCollaborator] = useState<string>('all');

  // === A RECEBER DE CLIENTES ===
  const clientReceivables = useMemo(() => {
    return projects.map(project => {
      const client = clients.find(c => c.id === project.clientId);
      const isPaid = project.paymentStatus === 'recebido';
      const receivedAmount = isPaid ? project.clientPrice : 0;
      const pendingAmount = isPaid ? 0 : project.clientPrice;

      return {
        projectId: project.id,
        projectTitle: project.title,
        clientName: client?.name || 'Cliente Desconhecido',
        clientId: project.clientId,
        totalAmount: project.clientPrice,
        receivedAmount,
        pendingAmount,
        status: project.paymentStatus,
        dueDate: project.clientDueDate,
        receivedDate: project.clientReceivedDate,
        phase: project.phase
      };
    }).filter(item => {
      // Filtro por status
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending' && item.status === 'recebido') return false;
        if (filterStatus === 'paid' && item.status !== 'recebido') return false;
      }

      // Filtro por cliente
      if (filterClient !== 'all' && item.clientId !== filterClient) return false;

      return true;
    });
  }, [projects, clients, filterStatus, filterClient]);

  // === A PAGAR A COLABORADORES ===
  const collaboratorPayables = useMemo(() => {
    const payables: any[] = [];

    projects.forEach(project => {
      // Pagamento de captação
      if (project.responsavelCaptacaoId && project.captationCost > 0) {
        const collaborator = users.find(u => u.id === project.responsavelCaptacaoId);
        payables.push({
          projectId: project.id,
          projectTitle: project.title,
          collaboratorId: project.responsavelCaptacaoId,
          collaboratorName: collaborator?.name || 'Colaborador Desconhecido',
          type: 'Captação',
          amount: project.captationCost,
          status: project.freelancerPaymentStatus,
          paidDate: project.freelancerPaidDate,
          dueDate: project.freelancerDueDate,
          phase: project.phase
        });
      }

      // Pagamento de edição
      if (project.responsavelEdicaoId && project.editionCost > 0) {
        const collaborator = users.find(u => u.id === project.responsavelEdicaoId);
        payables.push({
          projectId: project.id,
          projectTitle: project.title,
          collaboratorId: project.responsavelEdicaoId,
          collaboratorName: collaborator?.name || 'Colaborador Desconhecido',
          type: 'Edição',
          amount: project.editionCost,
          status: project.freelancerPaymentStatus,
          paidDate: project.freelancerPaidDate,
          dueDate: project.freelancerDueDate,
          phase: project.phase
        });
      }
    });

    return payables.filter(item => {
      // Filtro por status
      if (filterStatus !== 'all') {
        if (filterStatus === 'pending' && item.status === 'pago') return false;
        if (filterStatus === 'paid' && item.status !== 'pago') return false;
      }

      // Filtro por colaborador
      if (filterCollaborator !== 'all' && item.collaboratorId !== filterCollaborator) return false;

      return true;
    });
  }, [projects, users, filterStatus, filterCollaborator]);

  // === TOTAIS ===
  const totals = useMemo(() => {
    const totalToReceive = clientReceivables.reduce((sum, item) => sum + item.pendingAmount, 0);
    const totalReceived = clientReceivables.reduce((sum, item) => sum + item.receivedAmount, 0);
    const totalToPay = collaboratorPayables
      .filter(p => p.status !== 'pago')
      .reduce((sum, item) => sum + item.amount, 0);
    const totalPaid = collaboratorPayables
      .filter(p => p.status === 'pago')
      .reduce((sum, item) => sum + item.amount, 0);
    const netProfit = totalReceived - totalPaid - totalToPay;

    return {
      totalToReceive,
      totalReceived,
      totalToPay,
      totalPaid,
      netProfit
    };
  }, [clientReceivables, collaboratorPayables]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recebido':
      case 'pago':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pago</Badge>;
      case 'a-faturar':
      case 'a-pagar':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendente</Badge>;
      case 'faturado':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Faturado</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Financeiro</h1>
          <p className="text-muted-foreground">
            Gestão de recebimentos e pagamentos
          </p>
        </div>
        <Button className="gradient-purple hover:gradient-purple-hover text-white">
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Receber
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(totals.totalToReceive)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              De clientes
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recebido
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(totals.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Já em caixa
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              A Pagar
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {formatCurrency(totals.totalToPay)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              A colaboradores
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pago
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(totals.totalPaid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Já liquidado
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Líquido
            </CardTitle>
            <Euro className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(totals.netProfit)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Receita - Custos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border border-white/20">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select value={filterClient} onValueChange={setFilterClient}>
                <SelectTrigger className="glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border border-white/20">
                  <SelectItem value="all">Todos</SelectItem>
                  {clients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Colaborador</label>
              <Select value={filterCollaborator} onValueChange={setFilterCollaborator}>
                <SelectTrigger className="glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border border-white/20">
                  <SelectItem value="all">Todos</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* A Receber de Clientes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            A Receber de Clientes ({clientReceivables.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead className="text-right">Recebido</TableHead>
                  <TableHead className="text-right">Pendente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientReceivables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum recebimento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  clientReceivables.map((item, index) => (
                    <TableRow key={`${item.projectId}-${index}`}>
                      <TableCell className="font-medium">{item.projectTitle}</TableCell>
                      <TableCell>{item.clientName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.totalAmount)}</TableCell>
                      <TableCell className="text-right text-blue-400">{formatCurrency(item.receivedAmount)}</TableCell>
                      <TableCell className="text-right text-yellow-400">{formatCurrency(item.pendingAmount)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString('pt-PT') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* A Pagar a Colaboradores */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-400" />
            A Pagar a Colaboradores ({collaboratorPayables.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Colaborador</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collaboratorPayables.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  collaboratorPayables.map((item, index) => (
                    <TableRow key={`${item.projectId}-${item.type}-${index}`}>
                      <TableCell className="font-medium">{item.projectTitle}</TableCell>
                      <TableCell>{item.collaboratorName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-orange-400">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{getStatusBadge(item.status)}</TableCell>
                      <TableCell>
                        {item.dueDate ? new Date(item.dueDate).toLocaleDateString('pt-PT') : '-'}
                      </TableCell>
                      <TableCell>
                        {item.paidDate ? new Date(item.paidDate).toLocaleDateString('pt-PT') : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
