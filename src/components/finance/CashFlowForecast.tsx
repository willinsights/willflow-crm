'use client';

import { useMemo } from 'react';
import { TrendingUp, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Project } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface CashFlowForecastProps {
  projects: Project[];
}

export default function CashFlowForecast({ projects }: CashFlowForecastProps) {

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

      // Saídas (a pagar a freelancers)
      if (project.freelancerPaymentStatus !== 'pago' && project.freelancerDueDate) {
        const dueDate = new Date(project.freelancerDueDate);
        const monthKey = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`;

        if (months[monthKey]) {
          months[monthKey].outgoing += project.captationCost + project.editionCost;
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

  const upcomingPayments = useMemo(() => {
    const today = new Date();
    const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const receivables = projects
      .filter(p => p.paymentStatus !== 'recebido' && p.clientDueDate)
      .map(p => ({
        type: 'receivable' as const,
        projectTitle: p.title,
        amount: p.clientPrice,
        dueDate: new Date(p.clientDueDate!),
        overdue: new Date(p.clientDueDate!) < today,
      }))
      .filter(item => item.dueDate <= next30Days);

    const payables = projects
      .filter(p => p.freelancerPaymentStatus !== 'pago' && p.freelancerDueDate)
      .map(p => ({
        type: 'payable' as const,
        projectTitle: p.title,
        amount: p.captationCost + p.editionCost,
        dueDate: new Date(p.freelancerDueDate!),
        overdue: new Date(p.freelancerDueDate!) < today,
      }))
      .filter(item => item.dueDate <= next30Days);

    return [...receivables, ...payables].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [projects]);

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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Entradas Previstas (6 meses)</p>
            <p className="text-2xl font-bold text-green-400">
              {formatCurrency(summary.totalIncoming)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Saídas Previstas (6 meses)</p>
            <p className="text-2xl font-bold text-red-400">
              {formatCurrency(summary.totalOutgoing)}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Saldo Final Previsto</p>
            <p className={`text-2xl font-bold ${summary.finalBalance >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
              {formatCurrency(summary.finalBalance)}
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
                tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`}
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
            <div className="space-y-3">
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
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    ) : (
                      <Calendar className="w-5 h-5 text-blue-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{payment.projectTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        {payment.dueDate.toLocaleDateString('pt-PT')}
                        {payment.overdue && (
                          <span className="text-red-400 ml-2">• Atrasado</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        payment.type === 'receivable'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-red-500/20 text-red-400'
                      }
                    >
                      {payment.type === 'receivable' ? 'A Receber' : 'A Pagar'}
                    </Badge>
                    <p className={`text-sm font-bold mt-1 ${
                      payment.type === 'receivable' ? 'text-green-400' : 'text-red-400'
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
    </div>
  );
}
