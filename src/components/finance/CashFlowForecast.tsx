'use client';

import { useMemo } from 'react';
import { TrendingUp, Calendar, AlertTriangle, CheckCircle, User, Users, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Project, User as UserType } from '@/lib/types';
import { useLocale } from '@/lib/LocaleContext';

interface CashFlowForecastProps {
  projects: Project[];
  users?: UserType[];
}

export default function CashFlowForecast({ projects, users = [] }: CashFlowForecastProps) {
  const { formatCurrency, config } = useLocale();

  const forecastData = useMemo(() => {
    const today = new Date();
    const months: { [key: string]: { month: string, incoming: number, outgoing: number, net: number } } = {};

    // Próximos 6 meses
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-PT', { month: 'short', year: 'numeric' });

      months[monthKey] = {
        month: monthName,
        incoming: 0,
        outgoing: 0,
        net: 0,
      };
    }

    // Calcular entradas e saídas por mês
    projects.forEach(project => {
      // Entradas (a receber de clientes)
      if (project.paymentStatus !== 'recebido' && project.clientDueDate) {
        const dueDate = new Date(project.clientDueDate);
        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;

        if (months[monthKey]) {
          months[monthKey].incoming += project.clientPrice;
        }
      }

      // Saídas (a pagar a freelancers) - usa freelancerDueDate, clientDueDate ou createdAt
      if (project.freelancerPaymentStatus !== 'pago') {
        const totalCost = project.captationCost + project.editionCost;
        if (totalCost > 0) {
          // Determinar data de vencimento
          let paymentDate: Date;
          if (project.freelancerDueDate) {
            paymentDate = new Date(project.freelancerDueDate);
          } else if (project.clientDueDate) {
            // Se não tem data de pagamento freelancer, usa data do cliente
            paymentDate = new Date(project.clientDueDate);
          } else {
            // Fallback: usa 30 dias a partir de hoje
            paymentDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
          }

          const monthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;

          if (months[monthKey]) {
            months[monthKey].outgoing += totalCost;
          }
        }
      }
    });

    // Calcular net e acumular
    let accumulated = 0;
    return Object.values(months).map(month => {
      month.net = month.incoming - month.outgoing;
      accumulated += month.net;
      return {
        ...month,
        accumulated,
      };
    });
  }, [projects]);

  // Previsão de pagamentos a colaboradores
  const collaboratorPayments = useMemo(() => {
    const payments: {
      collaboratorId: string;
      collaboratorName: string;
      projectTitle: string;
      amount: number;
      type: 'captacao' | 'edicao';
      dueDate: Date;
      overdue: boolean;
    }[] = [];

    const today = new Date();

    projects.forEach(project => {
      if (project.freelancerPaymentStatus !== 'pago') {
        // Determinar data base
        let baseDate: Date;
        if (project.freelancerDueDate) {
          baseDate = new Date(project.freelancerDueDate);
        } else if (project.clientDueDate) {
          baseDate = new Date(project.clientDueDate);
        } else {
          baseDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        }

        // Captação
        if (project.captationCost > 0 && project.responsavelCaptacaoId) {
          const user = users.find(u => u.id === project.responsavelCaptacaoId);
          payments.push({
            collaboratorId: project.responsavelCaptacaoId,
            collaboratorName: user?.name || project.responsavelCaptacao?.name || 'Colaborador',
            projectTitle: project.title,
            amount: project.captationCost,
            type: 'captacao',
            dueDate: baseDate,
            overdue: baseDate < today,
          });
        }

        // Edição
        if (project.editionCost > 0 && project.responsavelEdicaoId) {
          const user = users.find(u => u.id === project.responsavelEdicaoId);
          payments.push({
            collaboratorId: project.responsavelEdicaoId,
            collaboratorName: user?.name || project.responsavelEdicao?.name || 'Editor',
            projectTitle: project.title,
            amount: project.editionCost,
            type: 'edicao',
            dueDate: baseDate,
            overdue: baseDate < today,
          });
        }
      }
    });

    return payments.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [projects, users]);

  // Resumo por colaborador
  const collaboratorSummary = useMemo(() => {
    const summary: Record<string, { name: string; total: number; count: number }> = {};

    collaboratorPayments.forEach(payment => {
      if (!summary[payment.collaboratorId]) {
        summary[payment.collaboratorId] = {
          name: payment.collaboratorName,
          total: 0,
          count: 0,
        };
      }
      summary[payment.collaboratorId].total += payment.amount;
      summary[payment.collaboratorId].count += 1;
    });

    return Object.entries(summary)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [collaboratorPayments]);

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const receivables = projects
      .filter(p => p.paymentStatus !== 'recebido' && p.clientDueDate)
      .map(p => ({
        type: 'receivable' as const,
        projectTitle: p.title,
        clientName: p.client?.name,
        amount: p.clientPrice,
        dueDate: new Date(p.clientDueDate!),
        overdue: new Date(p.clientDueDate!) < today,
      }))
      .filter(item => item.dueDate <= next30Days);

    const payables = collaboratorPayments
      .filter(p => p.dueDate <= next30Days)
      .map(p => ({
        type: 'payable' as const,
        projectTitle: p.projectTitle,
        collaboratorName: p.collaboratorName,
        paymentType: p.type,
        amount: p.amount,
        dueDate: p.dueDate,
        overdue: p.overdue,
      }));

    return [...receivables, ...payables].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [projects, collaboratorPayments]);

  const summary = useMemo(() => {
    return forecastData.reduce(
      (acc, month) => ({
        totalIncoming: acc.totalIncoming + month.incoming,
        totalOutgoing: acc.totalOutgoing + month.outgoing,
        finalBalance: month.accumulated, // Último valor acumulado
      }),
      { totalIncoming: 0, totalOutgoing: 0, finalBalance: 0 }
    );
  }, [forecastData]);

  const totalPendingToCollaborators = collaboratorPayments.reduce((sum, p) => sum + p.amount, 0);
  const maxCollaboratorTotal = Math.max(...collaboratorSummary.map(c => c.total), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="w-4 h-4 text-green-400" />
              <p className="text-xs text-muted-foreground">Entradas Previstas (6 meses)</p>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(summary.totalIncoming)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="w-4 h-4 text-red-400" />
              <p className="text-xs text-muted-foreground">Saídas Previstas (6 meses)</p>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(summary.totalOutgoing)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-muted-foreground">Saldo Final Previsto</p>
            </div>
            <p className={`text-2xl font-bold ${summary.finalBalance >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {formatCurrency(summary.finalBalance)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-orange-400" />
              <p className="text-xs text-muted-foreground">A Pagar Colaboradores</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">
              {formatCurrency(totalPendingToCollaborators)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {collaboratorPayments.length} pagamentos pendentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cash Flow Chart */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Previsão de Fluxo de Caixa (6 Meses)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="month"
                stroke="#888"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke="#888"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${config.currencySymbol}${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a1a1a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="incoming"
                stroke="#10b981"
                name="Entradas"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="outgoing"
                stroke="#ef4444"
                name="Saídas"
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#8b5cf6"
                name="Líquido"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Payments (Next 30 Days) */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Pagamentos Próximos (30 Dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingPayments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum pagamento nos próximos 30 dias</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {upcomingPayments.map((payment, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg glass border ${
                      payment.overdue
                        ? 'border-red-500/30 bg-red-500/5'
                        : 'border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {payment.overdue ? (
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      ) : payment.type === 'receivable' ? (
                        <ArrowUpCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{payment.projectTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.dueDate.toLocaleDateString('pt-PT')}
                          {payment.overdue && (
                            <span className="text-red-400 ml-2">• Atrasado</span>
                          )}
                        </p>
                        {payment.type === 'payable' && 'collaboratorName' in payment && (
                          <p className="text-xs text-blue-400 mt-0.5">
                            {payment.collaboratorName}
                            {' - '}
                            {payment.paymentType === 'captacao' ? 'Captação' : 'Edição'}
                          </p>
                        )}
                        {payment.type === 'receivable' && 'clientName' in payment && (
                          <p className="text-xs text-green-400 mt-0.5">
                            {payment.clientName}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <Badge
                        variant="outline"
                        className={
                          payment.type === 'receivable'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }
                      >
                        {payment.type === 'receivable' ? 'Entrada' : 'Saída'}
                      </Badge>
                      <p className={`text-sm font-bold mt-1 ${
                        payment.type === 'receivable' ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Collaborator Summary */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Saídas por Colaborador
            </CardTitle>
          </CardHeader>
          <CardContent>
            {collaboratorSummary.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum pagamento pendente</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {collaboratorSummary.map((collab) => (
                  <div key={collab.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                          <User className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{collab.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {collab.count} {collab.count === 1 ? 'projeto' : 'projetos'}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-orange-400">
                        {formatCurrency(collab.total)}
                      </p>
                    </div>
                    <Progress
                      value={(collab.total / maxCollaboratorTotal) * 100}
                      className="h-2"
                    />
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
