'use client';

import { useState } from 'react';
import { Euro, TrendingUp, FileOutput, Calendar, BarChart3, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/lib/useAppStore';
import { exportFinancialCSV, exportFinancialPDF } from '@/lib/export-utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProjectProfitability from './ProjectProfitability';
import CashFlowForecast from './CashFlowForecast';
import PaymentControl from './PaymentControl';
import InvoicesReceipts from './InvoicesReceipts';
import { useLocale } from '@/lib/LocaleContext';

export default function FinancePage() {
  const { projects, clients, users, dashboardStats } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const { formatCurrency } = useLocale();

  const handleMarkAsPaid = async (projectId: string, type: 'client' | 'freelancer') => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [type === 'client' ? 'paymentStatus' : 'freelancerPaymentStatus']:
            type === 'client' ? 'recebido' : 'pago'
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Pagamento marcado como ${type === 'client' ? 'recebido' : 'pago'}!`);
        console.log('✅ Status de pagamento atualizado');
        // Recarregar dados
        window.location.reload();
      } else {
        alert(`❌ Erro ao atualizar status de pagamento`);
      }
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      alert('❌ Erro ao atualizar status de pagamento');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Financeiro' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">💰 Módulo Financeiro</h1>
          <p className="text-muted-foreground">
            Gestão completa de finanças, pagamentos e previsões
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportFinancialCSV(projects, clients, users)}
            className="glass border-white/20 hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportFinancialPDF(projects, clients)}
            className="glass border-white/20 hover:bg-white/10"
          >
            <FileOutput className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* KPIs Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              A Receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(dashboardStats.financialKPIs.totalToReceive)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">De clientes</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              Recebido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">
              {formatCurrency(dashboardStats.financialKPIs.totalReceived)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Já em caixa</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Euro className="w-4 h-4 text-orange-400" />
              A Pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">
              {formatCurrency(dashboardStats.financialKPIs.totalToPay)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">A colaboradores</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              Margem Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {formatCurrency(dashboardStats.financialKPIs.totalMargin)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lucro líquido</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Rentabilidade
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <FileOutput className="w-4 h-4" />
            Pagamentos
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Previsão
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            Faturas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProjectProfitability projects={projects} clients={clients} />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <PaymentControl
            projects={projects}
            clients={clients}
            users={users}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </TabsContent>

        <TabsContent value="forecast" className="mt-6">
          <CashFlowForecast projects={projects} users={users} />
        </TabsContent>

        <TabsContent value="invoices" className="mt-6">
          <InvoicesReceipts
            projects={projects}
            clients={clients}
            users={users}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
