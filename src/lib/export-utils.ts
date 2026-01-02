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

// ====== PAYMENTS EXPORT (WITH BANK DETAILS) ======

export function exportPaymentsCSV(projects: Project[], clients: Client[], users: User[], type: 'all' | 'receivable' | 'payable' = 'all') {
  const timestamp = new Date().toISOString().split('T')[0];

  if (type === 'payable' || type === 'all') {
    // Export freelancer payments with bank details
    const headers = [
      'Tipo',
      'Projeto',
      'Colaborador',
      'Função',
      'Valor (€)',
      'Status',
      'Data Vencimento',
      'IBAN',
      'Banco',
      'NIF',
      'Tipo Contribuinte'
    ];

    const rows: any[][] = [];

    projects.forEach(project => {
      // Captação
      if (project.captationCost > 0 && project.responsavelCaptacaoId) {
        const user = users.find(u => u.id === project.responsavelCaptacaoId);
        rows.push([
          'A Pagar',
          project.title,
          user?.name || '',
          'Captação',
          project.captationCost,
          project.freelancerPaymentStatus === 'pago' ? 'Pago' : 'Pendente',
          project.freelancerDueDate ? new Date(project.freelancerDueDate).toLocaleDateString('pt-PT') : '',
          (user as any)?.iban || '',
          (user as any)?.bankName || '',
          (user as any)?.nif || '',
          (user as any)?.contributorType || ''
        ]);
      }

      // Edição
      if (project.editionCost > 0 && project.responsavelEdicaoId) {
        const user = users.find(u => u.id === project.responsavelEdicaoId);
        rows.push([
          'A Pagar',
          project.title,
          user?.name || '',
          'Edição',
          project.editionCost,
          project.freelancerPaymentStatus === 'pago' ? 'Pago' : 'Pendente',
          project.freelancerDueDate ? new Date(project.freelancerDueDate).toLocaleDateString('pt-PT') : '',
          (user as any)?.iban || '',
          (user as any)?.bankName || '',
          (user as any)?.nif || '',
          (user as any)?.contributorType || ''
        ]);
      }
    });

    if (type === 'payable') {
      const csv = arrayToCSV(headers, rows);
      downloadCSV(`WillFlow_Pagamentos_Freelancers_${timestamp}.csv`, csv);
      return;
    }
  }

  if (type === 'receivable' || type === 'all') {
    // Export client receivables
    const headers = [
      'Tipo',
      'Projeto',
      'Cliente',
      'Empresa',
      'Email',
      'Valor (€)',
      'IVA 23% (€)',
      'Total c/ IVA (€)',
      'Status',
      'Data Vencimento',
      'Data Recebimento'
    ];

    const rows = projects.map(project => {
      const client = clients.find(c => c.id === project.clientId);
      return [
        'A Receber',
        project.title,
        client?.name || '',
        client?.company || '',
        client?.email || '',
        project.clientPrice,
        (project.clientPrice * 0.23).toFixed(2),
        (project.clientPrice * 1.23).toFixed(2),
        project.paymentStatus === 'recebido' ? 'Recebido' : 'Pendente',
        project.clientDueDate ? new Date(project.clientDueDate).toLocaleDateString('pt-PT') : '',
        project.clientReceivedDate ? new Date(project.clientReceivedDate).toLocaleDateString('pt-PT') : ''
      ];
    });

    if (type === 'receivable') {
      const csv = arrayToCSV(headers, rows);
      downloadCSV(`WillFlow_Pagamentos_Clientes_${timestamp}.csv`, csv);
      return;
    }
  }

  // Export all (combined)
  const combinedHeaders = [
    'Tipo Movimento',
    'Projeto',
    'Entidade',
    'Função/Empresa',
    'Valor (€)',
    'Status',
    'Data Vencimento',
    'IBAN',
    'Banco',
    'NIF'
  ];

  const combinedRows: any[][] = [];

  projects.forEach(project => {
    const client = clients.find(c => c.id === project.clientId);

    // A Receber do cliente
    combinedRows.push([
      'A Receber',
      project.title,
      client?.name || '',
      client?.company || '',
      project.clientPrice,
      project.paymentStatus === 'recebido' ? 'Recebido' : 'Pendente',
      project.clientDueDate ? new Date(project.clientDueDate).toLocaleDateString('pt-PT') : '',
      '',
      '',
      ''
    ]);

    // A Pagar captação
    if (project.captationCost > 0 && project.responsavelCaptacaoId) {
      const user = users.find(u => u.id === project.responsavelCaptacaoId);
      combinedRows.push([
        'A Pagar',
        project.title,
        user?.name || '',
        'Captação',
        project.captationCost,
        project.freelancerPaymentStatus === 'pago' ? 'Pago' : 'Pendente',
        project.freelancerDueDate ? new Date(project.freelancerDueDate).toLocaleDateString('pt-PT') : '',
        (user as any)?.iban || '',
        (user as any)?.bankName || '',
        (user as any)?.nif || ''
      ]);
    }

    // A Pagar edição
    if (project.editionCost > 0 && project.responsavelEdicaoId) {
      const user = users.find(u => u.id === project.responsavelEdicaoId);
      combinedRows.push([
        'A Pagar',
        project.title,
        user?.name || '',
        'Edição',
        project.editionCost,
        project.freelancerPaymentStatus === 'pago' ? 'Pago' : 'Pendente',
        project.freelancerDueDate ? new Date(project.freelancerDueDate).toLocaleDateString('pt-PT') : '',
        (user as any)?.iban || '',
        (user as any)?.bankName || '',
        (user as any)?.nif || ''
      ]);
    }
  });

  const csv = arrayToCSV(combinedHeaders, combinedRows);
  downloadCSV(`WillFlow_Pagamentos_Completo_${timestamp}.csv`, csv);
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

// ====== PDF EXPORT IMPLEMENTATION ======

function generatePDFContent(title: string, content: string): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Por favor, permita pop-ups para gerar o PDF.');
    return;
  }

  const timestamp = new Date().toLocaleString('pt-PT');

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 40px;
            margin: 0;
            color: #333;
            line-height: 1.5;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #8b5cf6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 28px;
            margin: 0;
            color: #8b5cf6;
          }
          .header .subtitle {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
            color: #8b5cf6;
            margin-bottom: 10px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 12px;
          }
          th, td {
            padding: 10px 8px;
            text-align: left;
            border-bottom: 1px solid #e5e5e5;
          }
          th {
            background: #f8f8f8;
            font-weight: 600;
            color: #555;
            text-transform: uppercase;
            font-size: 11px;
          }
          tr:hover { background: #fafafa; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-green { color: #10b981; }
          .text-red { color: #ef4444; }
          .text-orange { color: #f59e0b; }
          .text-purple { color: #8b5cf6; }
          .font-bold { font-weight: 600; }
          .summary-card {
            background: #f8f8f8;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          .summary-item {
            text-align: center;
          }
          .summary-item .value {
            font-size: 24px;
            font-weight: bold;
          }
          .summary-item .label {
            font-size: 12px;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            text-align: center;
            color: #999;
            font-size: 11px;
          }
          .badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
          }
          .badge-green { background: #d1fae5; color: #059669; }
          .badge-yellow { background: #fef3c7; color: #d97706; }
          .badge-red { background: #fee2e2; color: #dc2626; }
          .badge-blue { background: #dbeafe; color: #2563eb; }
          @media print {
            body { padding: 20px; }
            .no-print { display: none; }
          }
          @page { margin: 20mm; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">WillFlow</div>
          <h1>${title}</h1>
          <p class="subtitle">Gerado em ${timestamp}</p>
        </div>
        ${content}
        <div class="footer">
          <p>WillFlow CRM • Sistema de Gestão de Produção Audiovisual</p>
          <p>Documento gerado automaticamente • ${timestamp}</p>
        </div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}

// ====== PROJECTS PDF EXPORT ======

export function exportProjectsPDF(projects: Project[], clients: Client[]) {
  const rows = projects.map(project => {
    const client = clients.find(c => c.id === project.clientId);
    const margin = project.clientPrice - project.captationCost - project.editionCost;
    const marginPercent = project.clientPrice > 0 ? ((margin / project.clientPrice) * 100).toFixed(1) : '0';
    const isPaid = project.paymentStatus === 'recebido';

    return `
      <tr>
        <td>${project.title}</td>
        <td>${client?.name || 'N/A'}</td>
        <td class="text-center"><span class="badge badge-blue">${project.phase}</span></td>
        <td class="text-right text-green font-bold">€${project.clientPrice.toLocaleString('pt-PT')}</td>
        <td class="text-right text-orange">€${(project.captationCost + project.editionCost).toLocaleString('pt-PT')}</td>
        <td class="text-right ${margin >= 0 ? 'text-purple' : 'text-red'} font-bold">€${margin.toLocaleString('pt-PT')}</td>
        <td class="text-right">${marginPercent}%</td>
        <td class="text-center">
          <span class="badge ${isPaid ? 'badge-green' : 'badge-yellow'}">${isPaid ? 'Recebido' : 'Pendente'}</span>
        </td>
      </tr>
    `;
  }).join('');

  // Calcular totais
  const totalRevenue = projects.reduce((sum, p) => sum + p.clientPrice, 0);
  const totalCosts = projects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);
  const totalMargin = totalRevenue - totalCosts;

  const content = `
    <div class="summary-card">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value">${projects.length}</div>
          <div class="label">Total Projetos</div>
        </div>
        <div class="summary-item">
          <div class="value text-green">€${totalRevenue.toLocaleString('pt-PT')}</div>
          <div class="label">Receita Total</div>
        </div>
        <div class="summary-item">
          <div class="value text-orange">€${totalCosts.toLocaleString('pt-PT')}</div>
          <div class="label">Custos Totais</div>
        </div>
        <div class="summary-item">
          <div class="value text-purple">€${totalMargin.toLocaleString('pt-PT')}</div>
          <div class="label">Margem Total</div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Projeto</th>
          <th>Cliente</th>
          <th class="text-center">Fase</th>
          <th class="text-right">Receita</th>
          <th class="text-right">Custo</th>
          <th class="text-right">Margem</th>
          <th class="text-right">%</th>
          <th class="text-center">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold; background: #f3f3f3;">
          <td colspan="3">TOTAIS</td>
          <td class="text-right text-green">€${totalRevenue.toLocaleString('pt-PT')}</td>
          <td class="text-right text-orange">€${totalCosts.toLocaleString('pt-PT')}</td>
          <td class="text-right text-purple">€${totalMargin.toLocaleString('pt-PT')}</td>
          <td class="text-right">${totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : '0'}%</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
  `;

  generatePDFContent('Relatório de Projetos', content);
}

// ====== FINANCIAL PDF EXPORT ======

export function exportFinancialPDF(projects: Project[], clients: Client[]) {
  const rows = projects.map(project => {
    const client = clients.find(c => c.id === project.clientId);
    const totalCost = project.captationCost + project.editionCost;
    const margin = project.clientPrice - totalCost;
    const marginPercent = project.clientPrice > 0 ? ((margin / project.clientPrice) * 100).toFixed(1) : '0';
    const toReceive = project.paymentStatus === 'recebido' ? 0 : project.clientPrice;
    const toPay = project.freelancerPaymentStatus === 'pago' ? 0 : totalCost;

    return `
      <tr>
        <td>${project.title}</td>
        <td>${client?.name || 'N/A'}</td>
        <td class="text-right">€${project.clientPrice.toLocaleString('pt-PT')}</td>
        <td class="text-right">€${totalCost.toLocaleString('pt-PT')}</td>
        <td class="text-right font-bold ${margin >= 0 ? 'text-purple' : 'text-red'}">€${margin.toLocaleString('pt-PT')}</td>
        <td class="text-right">${marginPercent}%</td>
        <td class="text-right ${toReceive > 0 ? 'text-green' : ''}">€${toReceive.toLocaleString('pt-PT')}</td>
        <td class="text-right ${toPay > 0 ? 'text-orange' : ''}">€${toPay.toLocaleString('pt-PT')}</td>
      </tr>
    `;
  }).join('');

  // Calcular totais
  const totalToReceive = projects.filter(p => p.paymentStatus !== 'recebido').reduce((sum, p) => sum + p.clientPrice, 0);
  const totalToPay = projects.filter(p => p.freelancerPaymentStatus !== 'pago').reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);
  const totalReceived = projects.filter(p => p.paymentStatus === 'recebido').reduce((sum, p) => sum + p.clientPrice, 0);
  const totalMargin = projects.reduce((sum, p) => sum + (p.clientPrice - p.captationCost - p.editionCost), 0);

  const content = `
    <div class="summary-card">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value text-green">€${totalToReceive.toLocaleString('pt-PT')}</div>
          <div class="label">A Receber</div>
        </div>
        <div class="summary-item">
          <div class="value text-blue">€${totalReceived.toLocaleString('pt-PT')}</div>
          <div class="label">Recebido</div>
        </div>
        <div class="summary-item">
          <div class="value text-orange">€${totalToPay.toLocaleString('pt-PT')}</div>
          <div class="label">A Pagar</div>
        </div>
        <div class="summary-item">
          <div class="value text-purple">€${totalMargin.toLocaleString('pt-PT')}</div>
          <div class="label">Margem Total</div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Projeto</th>
          <th>Cliente</th>
          <th class="text-right">Preço Cliente</th>
          <th class="text-right">Custo Total</th>
          <th class="text-right">Margem</th>
          <th class="text-right">%</th>
          <th class="text-right">A Receber</th>
          <th class="text-right">A Pagar</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  generatePDFContent('Relatório Financeiro', content);
}

// ====== PAYMENTS PDF EXPORT ======

export function exportPaymentsPDF(projects: Project[], clients: Client[], users: User[], type: 'all' | 'receivable' | 'payable' = 'all') {
  const items: {
    type: string;
    project: string;
    entity: string;
    role: string;
    value: number;
    status: string;
    dueDate: string;
    iban?: string;
    bank?: string;
    nif?: string;
  }[] = [];

  projects.forEach(project => {
    const client = clients.find(c => c.id === project.clientId);

    // A Receber
    if (type === 'all' || type === 'receivable') {
      items.push({
        type: 'A Receber',
        project: project.title,
        entity: client?.name || 'N/A',
        role: 'Cliente',
        value: project.clientPrice,
        status: project.paymentStatus === 'recebido' ? 'Recebido' : 'Pendente',
        dueDate: project.clientDueDate ? new Date(project.clientDueDate).toLocaleDateString('pt-PT') : '-',
      });
    }

    // A Pagar - Captação
    if ((type === 'all' || type === 'payable') && project.captationCost > 0 && project.responsavelCaptacaoId) {
      const user = users.find(u => u.id === project.responsavelCaptacaoId);
      items.push({
        type: 'A Pagar',
        project: project.title,
        entity: user?.name || 'Colaborador',
        role: 'Captação',
        value: project.captationCost,
        status: project.freelancerPaymentStatus === 'pago' ? 'Pago' : 'Pendente',
        dueDate: project.freelancerDueDate ? new Date(project.freelancerDueDate).toLocaleDateString('pt-PT') : '-',
        iban: (user as any)?.iban,
        bank: (user as any)?.bankName,
        nif: (user as any)?.nif,
      });
    }

    // A Pagar - Edição
    if ((type === 'all' || type === 'payable') && project.editionCost > 0 && project.responsavelEdicaoId) {
      const user = users.find(u => u.id === project.responsavelEdicaoId);
      items.push({
        type: 'A Pagar',
        project: project.title,
        entity: user?.name || 'Editor',
        role: 'Edição',
        value: project.editionCost,
        status: project.freelancerPaymentStatus === 'pago' ? 'Pago' : 'Pendente',
        dueDate: project.freelancerDueDate ? new Date(project.freelancerDueDate).toLocaleDateString('pt-PT') : '-',
        iban: (user as any)?.iban,
        bank: (user as any)?.bankName,
        nif: (user as any)?.nif,
      });
    }
  });

  const rows = items.map(item => `
    <tr>
      <td><span class="badge ${item.type === 'A Receber' ? 'badge-green' : 'badge-yellow'}">${item.type}</span></td>
      <td>${item.project}</td>
      <td>${item.entity}</td>
      <td>${item.role}</td>
      <td class="text-right font-bold ${item.type === 'A Receber' ? 'text-green' : 'text-orange'}">€${item.value.toLocaleString('pt-PT')}</td>
      <td class="text-center"><span class="badge ${item.status === 'Recebido' || item.status === 'Pago' ? 'badge-green' : 'badge-yellow'}">${item.status}</span></td>
      <td class="text-center">${item.dueDate}</td>
      ${item.iban ? `<td style="font-size: 10px;">${item.iban.slice(0, 15)}...</td>` : '<td>-</td>'}
    </tr>
  `).join('');

  // Calcular totais
  const totalReceivable = items.filter(i => i.type === 'A Receber').reduce((sum, i) => sum + i.value, 0);
  const totalPayable = items.filter(i => i.type === 'A Pagar').reduce((sum, i) => sum + i.value, 0);

  const content = `
    <div class="summary-card">
      <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="summary-item">
          <div class="value">${items.length}</div>
          <div class="label">Total Movimentos</div>
        </div>
        <div class="summary-item">
          <div class="value text-green">€${totalReceivable.toLocaleString('pt-PT')}</div>
          <div class="label">Total A Receber</div>
        </div>
        <div class="summary-item">
          <div class="value text-orange">€${totalPayable.toLocaleString('pt-PT')}</div>
          <div class="label">Total A Pagar</div>
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th>Projeto</th>
          <th>Entidade</th>
          <th>Função</th>
          <th class="text-right">Valor</th>
          <th class="text-center">Status</th>
          <th class="text-center">Vencimento</th>
          <th>IBAN</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  const titleMap = {
    'all': 'Relatório de Pagamentos',
    'receivable': 'Relatório de Recebimentos',
    'payable': 'Relatório de Pagamentos a Colaboradores',
  };

  generatePDFContent(titleMap[type], content);
}

// ====== REPORTS PDF EXPORT ======

export function exportReportsPDF(
  projects: Project[],
  clients: Client[],
  currencySymbol: string = '€'
) {
  // Calcular métricas financeiras
  const totalRevenue = projects.reduce((sum, p) => sum + p.clientPrice, 0);
  const totalCosts = projects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);
  const totalMargin = totalRevenue - totalCosts;
  const totalReceived = projects.filter(p => p.paymentStatus === 'recebido').reduce((sum, p) => sum + p.clientPrice, 0);
  const totalPending = projects.filter(p => p.paymentStatus !== 'recebido').reduce((sum, p) => sum + p.clientPrice, 0);
  const marginPercentage = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : '0';

  // Projetos por fase
  const captacao = projects.filter(p => p.phase === 'captacao').length;
  const edicao = projects.filter(p => p.phase === 'edicao').length;
  const finalizados = projects.filter(p => p.phase === 'finalizados').length;

  // Top clientes por receita
  const clientRevenue = clients.map(client => {
    const clientProjects = projects.filter(p => p.clientId === client.id);
    const revenue = clientProjects.reduce((sum, p) => sum + p.clientPrice, 0);
    const margin = clientProjects.reduce((sum, p) => sum + (p.clientPrice - p.captationCost - p.editionCost), 0);
    return {
      name: client.name,
      revenue,
      margin,
      projects: clientProjects.length
    };
  }).filter(c => c.revenue > 0)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Projetos por tipo de vídeo
  const videoTypes: { [key: string]: { count: number; revenue: number } } = {};
  projects.forEach(p => {
    const type = p.videoType || 'outro';
    if (!videoTypes[type]) {
      videoTypes[type] = { count: 0, revenue: 0 };
    }
    videoTypes[type].count++;
    videoTypes[type].revenue += p.clientPrice;
  });

  // Tabela de top clientes
  const clientRows = clientRevenue.map(client => `
    <tr>
      <td>${client.name}</td>
      <td class="text-right text-green font-bold">${currencySymbol}${client.revenue.toLocaleString('pt-PT')}</td>
      <td class="text-right ${client.margin >= 0 ? 'text-purple' : 'text-red'}">${currencySymbol}${client.margin.toLocaleString('pt-PT')}</td>
      <td class="text-center">${client.projects}</td>
      <td class="text-right">${client.revenue > 0 ? ((client.margin / client.revenue) * 100).toFixed(1) : '0'}%</td>
    </tr>
  `).join('');

  // Tabela de tipos de vídeo
  const typeRows = Object.entries(videoTypes)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .map(([type, data]) => `
      <tr>
        <td style="text-transform: capitalize;">${type}</td>
        <td class="text-center">${data.count}</td>
        <td class="text-right text-green font-bold">${currencySymbol}${data.revenue.toLocaleString('pt-PT')}</td>
      </tr>
    `).join('');

  const content = `
    <!-- KPIs Principais -->
    <div class="summary-card">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value text-green">${currencySymbol}${totalRevenue.toLocaleString('pt-PT')}</div>
          <div class="label">Receita Total</div>
        </div>
        <div class="summary-item">
          <div class="value text-orange">${currencySymbol}${totalCosts.toLocaleString('pt-PT')}</div>
          <div class="label">Custos Totais</div>
        </div>
        <div class="summary-item">
          <div class="value text-purple">${currencySymbol}${totalMargin.toLocaleString('pt-PT')}</div>
          <div class="label">Margem Total (${marginPercentage}%)</div>
        </div>
        <div class="summary-item">
          <div class="value">${projects.length}</div>
          <div class="label">Total Projetos</div>
        </div>
      </div>
    </div>

    <!-- Resumo de Pagamentos -->
    <div class="summary-card" style="margin-top: 20px;">
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase;">Situação de Pagamentos</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="summary-item">
          <div class="value text-blue">${currencySymbol}${totalReceived.toLocaleString('pt-PT')}</div>
          <div class="label">Recebido</div>
        </div>
        <div class="summary-item">
          <div class="value text-orange">${currencySymbol}${totalPending.toLocaleString('pt-PT')}</div>
          <div class="label">Pendente</div>
        </div>
        <div class="summary-item">
          <div class="value">${totalRevenue > 0 ? ((totalReceived / totalRevenue) * 100).toFixed(1) : '0'}%</div>
          <div class="label">Taxa de Recebimento</div>
        </div>
      </div>
    </div>

    <!-- Projetos por Fase -->
    <div class="summary-card" style="margin-top: 20px;">
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase;">Projetos por Fase</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(3, 1fr);">
        <div class="summary-item">
          <div class="value" style="color: #3b82f6;">${captacao}</div>
          <div class="label">Captação</div>
        </div>
        <div class="summary-item">
          <div class="value" style="color: #8b5cf6;">${edicao}</div>
          <div class="label">Edição</div>
        </div>
        <div class="summary-item">
          <div class="value text-green">${finalizados}</div>
          <div class="label">Finalizados</div>
        </div>
      </div>
    </div>

    <!-- Top 10 Clientes -->
    <h3 style="margin: 30px 0 15px 0; font-size: 16px; color: #333;">Top 10 Clientes por Receita</h3>
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th class="text-right">Receita</th>
          <th class="text-right">Margem</th>
          <th class="text-center">Projetos</th>
          <th class="text-right">% Margem</th>
        </tr>
      </thead>
      <tbody>
        ${clientRows}
      </tbody>
    </table>

    <!-- Tipos de Vídeo -->
    <h3 style="margin: 30px 0 15px 0; font-size: 16px; color: #333;">Receita por Tipo de Projeto</h3>
    <table>
      <thead>
        <tr>
          <th>Tipo</th>
          <th class="text-center">Quantidade</th>
          <th class="text-right">Receita</th>
        </tr>
      </thead>
      <tbody>
        ${typeRows}
      </tbody>
    </table>
  `;

  generatePDFContent('Relatório Financeiro Completo', content);
}

// ====== DASHBOARD PDF EXPORT ======

export function exportDashboardPDF(
  projects: Project[],
  clients: Client[],
  stats: any,
  currencySymbol: string = '€'
) {
  // Calcular métricas
  const totalRevenue = projects.reduce((sum, p) => sum + p.clientPrice, 0);
  const totalCosts = projects.reduce((sum, p) => sum + p.captationCost + p.editionCost, 0);
  const totalMargin = totalRevenue - totalCosts;

  // Projetos por fase
  const captacao = projects.filter(p => p.phase === 'captacao');
  const edicao = projects.filter(p => p.phase === 'edicao');
  const finalizados = projects.filter(p => p.phase === 'finalizados');

  // Top 5 projetos por margem
  const topProjects = [...projects]
    .sort((a, b) => (b.clientPrice - b.captationCost - b.editionCost) - (a.clientPrice - a.captationCost - a.editionCost))
    .slice(0, 5);

  const projectRows = topProjects.map(p => {
    const margin = p.clientPrice - p.captationCost - p.editionCost;
    const client = clients.find(c => c.id === p.clientId);
    return `
      <tr>
        <td>${p.title}</td>
        <td>${client?.name || 'N/A'}</td>
        <td class="text-right text-green">${currencySymbol}${p.clientPrice.toLocaleString('pt-PT')}</td>
        <td class="text-right text-purple font-bold">${currencySymbol}${margin.toLocaleString('pt-PT')}</td>
        <td class="text-center"><span class="badge badge-blue">${p.phase}</span></td>
      </tr>
    `;
  }).join('');

  // Top clientes
  const topClients = clients
    .filter(c => c.totalRevenue > 0)
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 5);

  const clientRows = topClients.map(c => `
    <tr>
      <td>${c.name}</td>
      <td class="text-center">${c.projectCount}</td>
      <td class="text-right text-green">${currencySymbol}${c.totalRevenue.toLocaleString('pt-PT')}</td>
      <td class="text-right text-purple">${currencySymbol}${c.totalMargin.toLocaleString('pt-PT')}</td>
    </tr>
  `).join('');

  const content = `
    <!-- KPIs Principais -->
    <div class="summary-card">
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value">${stats.totalProjects}</div>
          <div class="label">Total Projetos</div>
        </div>
        <div class="summary-item">
          <div class="value text-green">${currencySymbol}${totalRevenue.toLocaleString('pt-PT')}</div>
          <div class="label">Receita Total</div>
        </div>
        <div class="summary-item">
          <div class="value text-orange">${currencySymbol}${totalCosts.toLocaleString('pt-PT')}</div>
          <div class="label">Custos Totais</div>
        </div>
        <div class="summary-item">
          <div class="value text-purple">${currencySymbol}${totalMargin.toLocaleString('pt-PT')}</div>
          <div class="label">Margem Total</div>
        </div>
      </div>
    </div>

    <!-- Status dos Projetos -->
    <div class="summary-card" style="margin-top: 20px;">
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase;">Projetos por Fase</h3>
      <div class="summary-grid" style="grid-template-columns: repeat(4, 1fr);">
        <div class="summary-item">
          <div class="value" style="color: #3b82f6;">${captacao.length}</div>
          <div class="label">Captação</div>
        </div>
        <div class="summary-item">
          <div class="value" style="color: #8b5cf6;">${edicao.length}</div>
          <div class="label">Edição</div>
        </div>
        <div class="summary-item">
          <div class="value text-green">${finalizados.length}</div>
          <div class="label">Finalizados</div>
        </div>
        <div class="summary-item">
          <div class="value">${stats.totalClients}</div>
          <div class="label">Clientes</div>
        </div>
      </div>
    </div>

    <!-- Top 5 Projetos -->
    <h3 style="margin: 30px 0 15px 0; font-size: 16px; color: #333;">Top 5 Projetos por Margem</h3>
    <table>
      <thead>
        <tr>
          <th>Projeto</th>
          <th>Cliente</th>
          <th class="text-right">Receita</th>
          <th class="text-right">Margem</th>
          <th class="text-center">Fase</th>
        </tr>
      </thead>
      <tbody>
        ${projectRows}
      </tbody>
    </table>

    <!-- Top 5 Clientes -->
    <h3 style="margin: 30px 0 15px 0; font-size: 16px; color: #333;">Top 5 Clientes</h3>
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th class="text-center">Projetos</th>
          <th class="text-right">Receita</th>
          <th class="text-right">Margem</th>
        </tr>
      </thead>
      <tbody>
        ${clientRows}
      </tbody>
    </table>

    <!-- KPIs Financeiros -->
    <div class="summary-card" style="margin-top: 30px;">
      <h3 style="margin: 0 0 15px 0; font-size: 14px; color: #666; text-transform: uppercase;">Situação Financeira</h3>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="value text-green">${currencySymbol}${stats.financialKPIs.totalToReceive.toLocaleString('pt-PT')}</div>
          <div class="label">A Receber</div>
        </div>
        <div class="summary-item">
          <div class="value text-blue">${currencySymbol}${stats.financialKPIs.totalReceived.toLocaleString('pt-PT')}</div>
          <div class="label">Recebido</div>
        </div>
        <div class="summary-item">
          <div class="value text-orange">${currencySymbol}${stats.financialKPIs.totalToPay.toLocaleString('pt-PT')}</div>
          <div class="label">A Pagar</div>
        </div>
        <div class="summary-item">
          <div class="value text-purple">${currencySymbol}${stats.financialKPIs.totalMargin.toLocaleString('pt-PT')}</div>
          <div class="label">Margem Líquida</div>
        </div>
      </div>
    </div>
  `;

  generatePDFContent('Relatório do Dashboard', content);
}
