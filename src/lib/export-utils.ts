import { Project, Client, User } from './types';
import { formatCurrency } from './utils';

// ====== CSV EXPORT ======

export function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function arrayToCSV(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(escapeCSV).join(',');
  const dataLines = rows.map(row => row.map(escapeCSV).join(','));
  return [headerLine, ...dataLines].join('\n');
}

// ====== PROJECTS EXPORT ======

export function exportProjectsCSV(projects: Project[], clients: Client[]) {
  const headers = [
    'Título',
    'Cliente',
    'Fase',
    'Status',
    'Tipo de Vídeo',
    'Categoria',
    'Preço Cliente (€)',
    'Custo Captação (€)',
    'Custo Edição (€)',
    'Margem (€)',
    'Status Pagamento Cliente',
    'Status Pagamento Freelancer',
    'Data Criação',
    'Descrição'
  ];

  const rows = projects.map(project => {
    const client = clients.find(c => c.id === project.clientId);
    return [
      project.title,
      client?.name || '',
      project.phase,
      project.statusCaptacao || project.statusEdicao || '',
      project.videoType || '',
      project.category?.name || '',
      project.clientPrice,
      project.captationCost,
      project.editionCost,
      project.margin,
      project.paymentStatus,
      project.freelancerPaymentStatus,
      new Date(project.createdAt).toLocaleDateString('pt-PT'),
      project.description || ''
    ];
  });

  const csv = arrayToCSV(headers, rows);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`WillFlow_Projetos_${timestamp}.csv`, csv);
}

// ====== FINANCIAL EXPORT ======

export function exportFinancialCSV(projects: Project[], clients: Client[], users: User[]) {
  const headers = [
    'Projeto',
    'Cliente',
    'Fase',
    'Preço Cliente (€)',
    'Custo Total (€)',
    'Margem (€)',
    '%  Margem',
    'A Receber (€)',
    'A Pagar (€)',
    'Status Pag. Cliente',
    'Status Pag. Freelancer',
    'Data Vencimento Cliente',
    'Data Vencimento Freelancer'
  ];

  const rows = projects.map(project => {
    const client = clients.find(c => c.id === project.clientId);
    const totalCost = project.captationCost + project.editionCost;
    const marginPercent = project.clientPrice > 0
      ? ((project.margin / project.clientPrice) * 100).toFixed(1)
      : '0';

    const toReceive = project.paymentStatus === 'recebido' ? 0 : project.clientPrice;
    const toPay = project.freelancerPaymentStatus === 'pago' ? 0 : totalCost;

    return [
      project.title,
      client?.name || '',
      project.phase,
      project.clientPrice,
      totalCost,
      project.margin,
      marginPercent + '%',
      toReceive,
      toPay,
      project.paymentStatus,
      project.freelancerPaymentStatus,
      project.clientDueDate || '',
      project.freelancerDueDate || ''
    ];
  });

  const csv = arrayToCSV(headers, rows);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`WillFlow_Financeiro_${timestamp}.csv`, csv);
}

// ====== CLIENTS EXPORT ======

export function exportClientsCSV(clients: Client[]) {
  const headers = [
    'Nome',
    'Email',
    'Telefone',
    'Empresa',
    'Total Projetos',
    'Receita Total (€)',
    'Margem Total (€)',
    'Data Criação'
  ];

  const rows = clients.map(client => [
    client.name,
    client.email || '',
    client.phone || '',
    client.company || '',
    client.projectCount,
    client.totalRevenue,
    client.totalMargin,
    new Date(client.createdAt).toLocaleDateString('pt-PT')
  ]);

  const csv = arrayToCSV(headers, rows);
  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`WillFlow_Clientes_${timestamp}.csv`, csv);
}

// ====== DASHBOARD EXPORT ======

export function exportDashboardCSV(
  projects: Project[],
  clients: Client[],
  stats: any
) {
  // KPIs Summary
  const kpiHeaders = ['Métrica', 'Valor'];
  const kpiRows = [
    ['Total Projetos', stats.totalProjects],
    ['Projetos Ativos', stats.activeProjects],
    ['Projetos Finalizados', stats.completedProjects],
    ['Total Clientes', stats.totalClients],
    ['Total a Receber', formatCurrency(stats.financialKPIs.totalToReceive)],
    ['Total a Pagar', formatCurrency(stats.financialKPIs.totalToPay)],
    ['Margem Total', formatCurrency(stats.financialKPIs.totalMargin)],
    ['Total Recebido', formatCurrency(stats.financialKPIs.totalReceived)]
  ];

  const kpiCSV = arrayToCSV(kpiHeaders, kpiRows);

  // Projects by phase
  const phaseHeaders = ['Fase', 'Quantidade'];
  const phaseRows = [
    ['Captação', projects.filter(p => p.phase === 'captacao').length],
    ['Edição', projects.filter(p => p.phase === 'edicao').length],
    ['Finalizados', projects.filter(p => p.phase === 'finalizados').length]
  ];
  const phaseCSV = arrayToCSV(phaseHeaders, phaseRows);

  // Top clients
  const topClients = clients
    .filter(c => c.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 10);

  const clientHeaders = ['Cliente', 'Receita Total (€)', 'Margem Total (€)', 'Nº Projetos'];
  const clientRows = topClients.map(c => [
    c.name,
    c.totalRevenue,
    c.totalMargin,
    c.projectCount
  ]);
  const clientCSV = arrayToCSV(clientHeaders, clientRows);

  // Combine all sections
  const fullCSV = [
    '=== KPIS GERAIS ===',
    kpiCSV,
    '',
    '=== PROJETOS POR FASE ===',
    phaseCSV,
    '',
    '=== TOP 10 CLIENTES ===',
    clientCSV
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  downloadCSV(`WillFlow_Dashboard_${timestamp}.csv`, fullCSV);
}

// ====== PDF PLACEHOLDER (Future Implementation) ======

export function exportProjectsPDF(projects: Project[], clients: Client[]) {
  // TODO: Implement with jsPDF or similar
  alert('⚠️ Exportação PDF em desenvolvimento. Use CSV por enquanto.');
  console.log('PDF Export:', projects.length, 'projects');
}

export function exportFinancialPDF(projects: Project[], clients: Client[]) {
  alert('⚠️ Exportação PDF em desenvolvimento. Use CSV por enquanto.');
  console.log('PDF Export:', projects.length, 'projects');
}
