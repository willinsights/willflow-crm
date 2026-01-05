'use client';

import { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Filter,
  User,
  FolderOpen,
  Printer,
  CreditCard,
  Building2,
  Copy,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Project, Client, User as UserType } from '@/lib/types';
import { useLocale } from '@/lib/LocaleContext';
import { useView } from '@/lib/ViewContext';

interface PaymentControlProps {
  projects: Project[];
  clients: Client[];
  users?: UserType[];
  onMarkAsPaid?: (projectId: string, type: 'client' | 'freelancer') => void;
}

type StatusFilter = 'all' | 'pending' | 'received' | 'overdue' | 'to-invoice';
type PeriodFilter = 'all' | 'today' | 'week' | 'month' | 'quarter' | 'custom';

export default function PaymentControl({
  projects,
  clients,
  users = [],
  onMarkAsPaid,
}: PaymentControlProps) {
  const { formatCurrency } = useLocale();
  const { isCompact } = useView();
  const [selectedInvoice, setSelectedInvoice] = useState<Project | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Project | null>(null);
  const [copiedIban, setCopiedIban] = useState<string | null>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Filtros
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [collaboratorFilter, setCollaboratorFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Gerar número sequencial de fatura
  const generateInvoiceNumber = (project: Project) => {
    const year = new Date().getFullYear();
    const hash = project.id.slice(-4).toUpperCase();
    return `FAT-${year}-${hash}`;
  };

  // Gerar número sequencial de recibo
  const generateReceiptNumber = (project: Project) => {
    const year = new Date().getFullYear();
    const hash = project.id.slice(-4).toUpperCase();
    return `REC-${year}-${hash}`;
  };

  // Filtrar por período
  const filterByPeriod = (project: Project) => {
    if (periodFilter === 'all') return true;

    const projectDate = project.clientDueDate ? new Date(project.clientDueDate) : new Date(project.createdAt);
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

  // Filtrar por status
  const filterByStatus = (project: Project, type: 'client' | 'freelancer') => {
    if (statusFilter === 'all') return true;

    const now = new Date();

    if (type === 'client') {
      const isPaid = project.paymentStatus === 'recebido';
      const dueDate = project.clientDueDate ? new Date(project.clientDueDate) : null;
      const isOverdue = dueDate && dueDate < now && !isPaid;
      const isToInvoice = project.paymentStatus === 'a-faturar';

      switch (statusFilter) {
        case 'received':
          return isPaid;
        case 'pending':
          return !isPaid && !isOverdue && !isToInvoice;
        case 'overdue':
          return isOverdue;
        case 'to-invoice':
          return isToInvoice;
        default:
          return true;
      }
    } else {
      const isPaid = project.freelancerPaymentStatus === 'pago';
      const dueDate = project.freelancerDueDate ? new Date(project.freelancerDueDate) : null;
      const isOverdue = dueDate && dueDate < now && !isPaid;

      switch (statusFilter) {
        case 'received':
          return isPaid;
        case 'pending':
          return !isPaid && !isOverdue;
        case 'overdue':
          return isOverdue;
        default:
          return true;
      }
    }
  };

  // Função para ordenar por prioridade (vencidos primeiro)
  const sortByPriority = (a: Project, b: Project) => {
    const now = new Date();
    const aDue = a.clientDueDate ? new Date(a.clientDueDate) : null;
    const bDue = b.clientDueDate ? new Date(b.clientDueDate) : null;
    const aIsOverdue = aDue && aDue < now && a.paymentStatus !== 'recebido';
    const bIsOverdue = bDue && bDue < now && b.paymentStatus !== 'recebido';

    // Vencidos primeiro
    if (aIsOverdue && !bIsOverdue) return -1;
    if (!aIsOverdue && bIsOverdue) return 1;

    // Depois por data de vencimento (mais próximo primeiro)
    if (aDue && bDue) return aDue.getTime() - bDue.getTime();
    if (aDue && !bDue) return -1;
    if (!aDue && bDue) return 1;

    return 0;
  };

  // Filtrar projetos de clientes
  const filteredClientProjects = useMemo(() => {
    return projects
      .filter(p => p.phase !== 'finalizados' || p.paymentStatus !== 'recebido')
      .filter(p => clientFilter === 'all' || p.clientId === clientFilter)
      .filter(p => projectFilter === 'all' || p.id === projectFilter)
      .filter(p => {
        if (collaboratorFilter === 'all') return true;
        return p.responsavelCaptacaoId === collaboratorFilter ||
               p.responsavelEdicaoId === collaboratorFilter;
      })
      .filter(filterByPeriod)
      .filter(p => filterByStatus(p, 'client'))
      .sort(sortByPriority);
  }, [projects, clientFilter, collaboratorFilter, projectFilter, periodFilter, statusFilter, customStartDate, customEndDate]);

  // Filtrar projetos de freelancers
  const filteredFreelancerProjects = useMemo(() => {
    return projects
      .filter(p => p.freelancerPaymentStatus !== 'pago' || statusFilter === 'received')
      .filter(p => clientFilter === 'all' || p.clientId === clientFilter)
      .filter(p => projectFilter === 'all' || p.id === projectFilter)
      .filter(p => {
        if (collaboratorFilter === 'all') return true;
        return p.responsavelCaptacaoId === collaboratorFilter ||
               p.responsavelEdicaoId === collaboratorFilter;
      })
      .filter(filterByPeriod)
      .filter(p => filterByStatus(p, 'freelancer'))
      .sort((a, b) => {
        const now = new Date();
        const aDue = a.freelancerDueDate ? new Date(a.freelancerDueDate) : null;
        const bDue = b.freelancerDueDate ? new Date(b.freelancerDueDate) : null;
        const aIsOverdue = aDue && aDue < now && a.freelancerPaymentStatus !== 'pago';
        const bIsOverdue = bDue && bDue < now && b.freelancerPaymentStatus !== 'pago';

        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;
        if (aDue && bDue) return aDue.getTime() - bDue.getTime();
        if (aDue && !bDue) return -1;
        if (!aDue && bDue) return 1;

        return 0;
      });
  }, [projects, clientFilter, collaboratorFilter, projectFilter, periodFilter, statusFilter, customStartDate, customEndDate]);

  // Lista única de colaboradores dos projetos
  const uniqueCollaborators = useMemo(() => {
    const collaboratorIds = new Set<string>();
    projects.forEach(p => {
      if (p.responsavelCaptacaoId) collaboratorIds.add(p.responsavelCaptacaoId);
      if (p.responsavelEdicaoId) collaboratorIds.add(p.responsavelEdicaoId);
    });
    return users.filter(u => collaboratorIds.has(u.id));
  }, [projects, users]);

  // Obter dados do freelancer
  const getFreelancerData = (project: Project) => {
    const captacaoUser = users.find(u => u.id === project.responsavelCaptacaoId);
    const edicaoUser = users.find(u => u.id === project.responsavelEdicaoId);
    return {
      captacao: captacaoUser,
      edicao: edicaoUser,
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'recebido':
      case 'pago':
        return <Badge className="bg-green-500/20 text-green-400">✓ Pago</Badge>;
      case 'a-receber':
      case 'a-pagar':
        return <Badge className="bg-yellow-500/20 text-yellow-400">⏱ Pendente</Badge>;
      case 'a-faturar':
        return <Badge className="bg-orange-500/20 text-orange-400">📄 A Faturar</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Copiar IBAN para clipboard
  const copyIban = (iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedIban(iban);
    setTimeout(() => setCopiedIban(null), 2000);
  };

  // Função para imprimir documento
  const printDocument = (type: 'invoice' | 'receipt') => {
    const printContent = type === 'invoice' ? invoiceRef.current : receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir o documento.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${type === 'invoice' ? 'Fatura' : 'Recibo'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; margin: 0; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { font-size: 32px; margin: 0; }
            .header p { color: #666; margin: 5px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; margin-bottom: 5px; }
            .section-content { color: #444; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
            .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 12px; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
          <div class="footer">
            <p>WillFlow Audiovisual • Lisboa, Portugal</p>
            <p>Documento gerado em ${new Date().toLocaleDateString('pt-PT')} às ${new Date().toLocaleTimeString('pt-PT')}</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const clearFilters = () => {
    setClientFilter('all');
    setCollaboratorFilter('all');
    setProjectFilter('all');
    setStatusFilter('all');
    setPeriodFilter('month');
    setCustomStartDate('');
    setCustomEndDate('');
  };

  const periodLabels: Record<PeriodFilter, string> = {
    all: 'Todo o período',
    today: 'Hoje',
    week: 'Esta semana',
    month: 'Este mês',
    quarter: 'Este trimestre',
    custom: 'Personalizado',
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Filtros */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Filtro de Período */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={periodFilter} onValueChange={(v) => setPeriodFilter(v as PeriodFilter)}>
                  <SelectTrigger className="w-[160px] glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/20">
                    <SelectItem value="all">Todo o período</SelectItem>
                    <SelectItem value="today">Hoje</SelectItem>
                    <SelectItem value="week">Esta semana</SelectItem>
                    <SelectItem value="month">Este mês</SelectItem>
                    <SelectItem value="quarter">Este trimestre</SelectItem>
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
                    className="w-[130px] glass border-white/20"
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-[130px] glass border-white/20"
                  />
                </div>
              )}

              {/* Filtro de Status */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-[160px] glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/20">
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="received">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        Recebidos/Pagos
                      </span>
                    </SelectItem>
                    <SelectItem value="pending">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-yellow-400" />
                        Pendentes
                      </span>
                    </SelectItem>
                    <SelectItem value="overdue">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-400" />
                        Em atraso
                      </span>
                    </SelectItem>
                    <SelectItem value="to-invoice">
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-400" />
                        A Faturar
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Select value={clientFilter} onValueChange={setClientFilter}>
                  <SelectTrigger className="w-[160px] glass border-white/20">
                    <SelectValue placeholder="Cliente" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/20">
                    <SelectItem value="all">Todos os clientes</SelectItem>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <Select value={collaboratorFilter} onValueChange={setCollaboratorFilter}>
                  <SelectTrigger className="w-[160px] glass border-white/20">
                    <SelectValue placeholder="Colaborador" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/20">
                    <SelectItem value="all">Todos os colaboradores</SelectItem>
                    {uniqueCollaborators.map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-muted-foreground" />
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-[180px] glass border-white/20">
                    <SelectValue placeholder="Projeto" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-white/20">
                    <SelectItem value="all">Todos os projetos</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="glass border-white/20"
              >
                Limpar filtros
              </Button>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredClientProjects.length + filteredFreelancerProjects.length} registros
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Client Payments */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Controle de Pagamentos - Clientes
              </CardTitle>
              <Badge variant="outline">{filteredClientProjects.length} registros</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                    {!isCompact && <TableHead>Vencimento</TableHead>}
                    {!isCompact && <TableHead>Data Pagamento</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClientProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isCompact ? 5 : 7} className="text-center text-muted-foreground py-8">
                        Nenhum pagamento encontrado para os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredClientProjects.map((project) => {
                      const client = clients.find(c => c.id === project.clientId);
                      const dueDate = project.clientDueDate ? new Date(project.clientDueDate) : null;
                      const isOverdue = dueDate && dueDate < new Date() && project.paymentStatus !== 'recebido';

                      return (
                        <TableRow key={project.id} className={isOverdue ? 'bg-red-500/10' : ''}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>{client?.name || 'N/A'}</TableCell>
                          <TableCell className="text-right text-green-400 font-semibold">
                            {formatCurrency(project.clientPrice)}
                          </TableCell>
                          <TableCell>{getStatusBadge(project.paymentStatus)}</TableCell>
                          {!isCompact && (
                            <TableCell>
                              {dueDate ? (
                                <div className="flex items-center gap-1">
                                  {isOverdue && <AlertCircle className="w-4 h-4 text-red-400" />}
                                  <span className={isOverdue ? 'text-red-400 font-semibold' : ''}>
                                    {dueDate.toLocaleDateString('pt-PT')}
                                  </span>
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          )}
                          {!isCompact && (
                            <TableCell>
                              {project.clientReceivedDate
                                ? new Date(project.clientReceivedDate).toLocaleDateString('pt-PT')
                                : '-'}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedInvoice(project)}
                                    className="h-8 px-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Ver Fatura</TooltipContent>
                              </Tooltip>
                              {project.paymentStatus === 'recebido' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setSelectedReceipt(project)}
                                      className="h-8 px-2"
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Ver Recibo</TooltipContent>
                                </Tooltip>
                              )}
                              {project.paymentStatus !== 'recebido' && onMarkAsPaid && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onMarkAsPaid(project.id, 'client')}
                                      className="h-8 px-2 text-green-400"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Marcar como Pago</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Freelancer Payments */}
        <Card className="glass-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Controle de Pagamentos - Freelancers
              </CardTitle>
              <Badge variant="outline">{filteredFreelancerProjects.length} registros</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Projeto</TableHead>
                    <TableHead>Freelancer</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    {!isCompact && <TableHead>Dados Bancários</TableHead>}
                    <TableHead>Status</TableHead>
                    {!isCompact && <TableHead>Vencimento</TableHead>}
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFreelancerProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isCompact ? 5 : 7} className="text-center text-muted-foreground py-8">
                        Nenhum pagamento encontrado para os filtros selecionados
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFreelancerProjects.map((project) => {
                      const totalCost = project.captationCost + project.editionCost;
                      const dueDate = project.freelancerDueDate ? new Date(project.freelancerDueDate) : null;
                      const isOverdue = dueDate && dueDate < new Date() && project.freelancerPaymentStatus !== 'pago';
                      const { captacao, edicao } = getFreelancerData(project);
                      const freelancer = captacao || edicao;

                      return (
                        <TableRow key={project.id} className={isOverdue ? 'bg-red-500/10' : ''}>
                          <TableCell className="font-medium">{project.title}</TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {captacao && project.captationCost > 0 && (
                                <div className="text-sm">
                                  <span className="text-blue-400">Captação:</span> {captacao.name}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({formatCurrency(project.captationCost)})
                                  </span>
                                </div>
                              )}
                              {edicao && project.editionCost > 0 && (
                                <div className="text-sm">
                                  <span className="text-green-400">Edição:</span> {edicao.name}
                                  <span className="text-xs text-muted-foreground ml-2">
                                    ({formatCurrency(project.editionCost)})
                                  </span>
                                </div>
                              )}
                              {!captacao && !edicao && <span className="text-muted-foreground">N/A</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-orange-400 font-semibold">
                            {formatCurrency(totalCost)}
                          </TableCell>
                          {!isCompact && (
                            <TableCell>
                              {freelancer && (freelancer as any).iban ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs">
                                    <CreditCard className="w-3 h-3 text-muted-foreground" />
                                    <span className="font-mono text-xs">
                                      {((freelancer as any).iban as string).slice(0, 12)}...
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-5 w-5 p-0"
                                      onClick={() => copyIban((freelancer as any).iban)}
                                    >
                                      {copiedIban === (freelancer as any).iban ? (
                                        <Check className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </Button>
                                  </div>
                                  {(freelancer as any).bankName && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Building2 className="w-3 h-3" />
                                      {(freelancer as any).bankName}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">Não definido</span>
                              )}
                            </TableCell>
                          )}
                          <TableCell>{getStatusBadge(project.freelancerPaymentStatus)}</TableCell>
                          {!isCompact && (
                            <TableCell>
                              {dueDate ? (
                                <div className="flex items-center gap-1">
                                  {isOverdue && <AlertCircle className="w-4 h-4 text-red-400" />}
                                  <span className={isOverdue ? 'text-red-400 font-semibold' : ''}>
                                    {dueDate.toLocaleDateString('pt-PT')}
                                  </span>
                                </div>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            {onMarkAsPaid && project.freelancerPaymentStatus !== 'pago' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onMarkAsPaid(project.id, 'freelancer')}
                                    className="h-8 px-2 text-green-400"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Marcar como Pago</TooltipContent>
                              </Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Preview Modal */}
        {selectedInvoice && (
          <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
            <DialogContent className="glass-strong border border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Pré-visualização da Fatura</span>
                  <Button
                    onClick={() => printDocument('invoice')}
                    size="sm"
                    className="gradient-purple"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir / PDF
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div ref={invoiceRef} className="space-y-4 p-6 bg-white text-black rounded-lg">
                <div className="header text-center border-b pb-4">
                  <h1 className="text-3xl font-bold">FATURA</h1>
                  <p className="text-sm text-gray-600">
                    #{generateInvoiceNumber(selectedInvoice)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Data: {new Date().toLocaleDateString('pt-PT')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="section">
                    <p className="section-title font-semibold">De:</p>
                    <div className="section-content">
                      <p>WillFlow Audiovisual</p>
                      <p className="text-sm text-gray-600">Lisboa, Portugal</p>
                    </div>
                  </div>
                  <div className="section">
                    <p className="section-title font-semibold">Para:</p>
                    <div className="section-content">
                      <p>{clients.find(c => c.id === selectedInvoice.clientId)?.name}</p>
                      <p className="text-sm text-gray-600">
                        {clients.find(c => c.id === selectedInvoice.clientId)?.company}
                      </p>
                      <p className="text-sm text-gray-600">
                        {clients.find(c => c.id === selectedInvoice.clientId)?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="section">
                  <p className="section-title font-semibold">Projeto:</p>
                  <div className="section-content">
                    <p>{selectedInvoice.title}</p>
                    {selectedInvoice.description && (
                      <p className="text-sm text-gray-600">{selectedInvoice.description}</p>
                    )}
                  </div>
                </div>

                <table className="w-full">
                  <thead className="border-b-2">
                    <tr>
                      <th className="text-left py-2">Descrição</th>
                      <th className="text-right py-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2">Produção Audiovisual - {selectedInvoice.title}</td>
                      <td className="text-right">{formatCurrency(selectedInvoice.clientPrice)}</td>
                    </tr>
                  </tbody>
                  <tfoot className="border-t-2">
                    <tr>
                      <td className="py-2 font-semibold">Subtotal</td>
                      <td className="text-right">{formatCurrency(selectedInvoice.clientPrice)}</td>
                    </tr>
                    <tr>
                      <td className="text-sm text-gray-600">IVA (23%)</td>
                      <td className="text-right text-sm">{formatCurrency(selectedInvoice.clientPrice * 0.23)}</td>
                    </tr>
                    <tr className="total-row">
                      <td className="py-2 font-bold text-lg">TOTAL</td>
                      <td className="text-right font-bold text-lg">
                        {formatCurrency(selectedInvoice.clientPrice * 1.23)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="section mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="section-title font-semibold text-sm">Condições de Pagamento:</p>
                  <p className="text-sm text-gray-600">
                    Pagamento a 30 dias após emissão da fatura.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Receipt Preview Modal */}
        {selectedReceipt && (
          <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
            <DialogContent className="glass-strong border border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Pré-visualização do Recibo</span>
                  <Button
                    onClick={() => printDocument('receipt')}
                    size="sm"
                    className="gradient-purple"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir / PDF
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div ref={receiptRef} className="space-y-4 p-6 bg-white text-black rounded-lg">
                <div className="header text-center border-b pb-4">
                  <h1 className="text-3xl font-bold text-green-600">RECIBO</h1>
                  <p className="text-sm text-gray-600">
                    #{generateReceiptNumber(selectedReceipt)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Data: {selectedReceipt.clientReceivedDate
                      ? new Date(selectedReceipt.clientReceivedDate).toLocaleDateString('pt-PT')
                      : new Date().toLocaleDateString('pt-PT')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="section">
                    <p className="section-title font-semibold">De:</p>
                    <div className="section-content">
                      <p>WillFlow Audiovisual</p>
                      <p className="text-sm text-gray-600">Lisboa, Portugal</p>
                    </div>
                  </div>
                  <div className="section">
                    <p className="section-title font-semibold">Recebido de:</p>
                    <div className="section-content">
                      <p>{clients.find(c => c.id === selectedReceipt.clientId)?.name}</p>
                      <p className="text-sm text-gray-600">
                        {clients.find(c => c.id === selectedReceipt.clientId)?.company}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="section p-6 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">Valor Recebido</p>
                  <p className="text-4xl font-bold text-green-600">
                    {formatCurrency(selectedReceipt.clientPrice * 1.23)}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    (inclui IVA 23%)
                  </p>
                </div>

                <div className="section">
                  <p className="section-title font-semibold">Referente a:</p>
                  <div className="section-content">
                    <p>Produção Audiovisual - {selectedReceipt.title}</p>
                    <p className="text-sm text-gray-600">
                      Fatura #{generateInvoiceNumber(selectedReceipt)}
                    </p>
                  </div>
                </div>

                <div className="section mt-6 p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-green-600 font-semibold">
                    ✓ Pagamento confirmado
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}
