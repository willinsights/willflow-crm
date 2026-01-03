'use client';

import { useState } from 'react';
import { Euro, TrendingUp, FileOutput, Calendar, BarChart3, Download, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/lib/useAppStore';
import { exportFinancialCSV, exportFinancialPDF } from '@/lib/export-utils';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import ProjectProfitability from './ProjectProfitability';
import CashFlowForecast from './CashFlowForecast';
import PaymentControl from './PaymentControl';
import InvoicesReceipts from './InvoicesReceipts';
import ReportsPage from '@/components/reports/ReportsPage';

export default function FinancePage() {
  const { projects, clients, users } = useAppStore();
  const [activeTab, setActiveTab] = useState('payments');

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
      <Breadcrumbs items={[{ label: 'Finanças & Analytics' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Finanças & Analytics</h1>
          <p className="text-muted-foreground">
            Gestão de pagamentos, rentabilidade e análise de dados
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

      {/* Tabs - No redundant KPI cards */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass grid w-full grid-cols-5">
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <FileOutput className="w-4 h-4" />
            <span className="hidden sm:inline">Pagamentos</span>
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Rentabilidade</span>
          </TabsTrigger>
          <TabsTrigger value="forecast" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Previsão</span>
          </TabsTrigger>
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Euro className="w-4 h-4" />
            <span className="hidden sm:inline">Faturas</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <PieChart className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-6">
          <PaymentControl
            projects={projects}
            clients={clients}
            users={users}
            onMarkAsPaid={handleMarkAsPaid}
          />
        </TabsContent>

        <TabsContent value="overview" className="mt-6">
          <ProjectProfitability projects={projects} clients={clients} />
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

        <TabsContent value="analytics" className="mt-6">
          <ReportsPage embedded={true} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
