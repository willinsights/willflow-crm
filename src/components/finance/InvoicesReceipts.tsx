'use client';

import { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Filter,
  User,
  Users,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckSquare,
  Square,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Project, Client, User as UserType } from '@/lib/types';
import { exportPaymentsCSV, exportPaymentsPDF } from '@/lib/export-utils';
import { useLocale } from '@/lib/LocaleContext';

interface InvoicesReceiptsProps {
  projects: Project[];
  clients: Client[];
  users: UserType[];
}

type MovementType = 'all' | 'receivable' | 'payable';

interface PaymentItem {
  id: string;
  type: 'receivable' | 'payable';
  projectId: string;
  projectTitle: string;
  entityName: string;
  entityType: string;
  amount: number;
  status: string;
  dueDate?: Date;
  iban?: string;
  bankName?: string;
  nif?: string;
}

export default function InvoicesReceipts({
  projects,
  clients = [],
  users,
}: InvoicesReceiptsProps) {
  const { formatCurrency } = useLocale();
  const [movementFilter, setMovementFilter] = useState<MovementType>('all');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [selectedCollaborators, setSelectedCollaborators] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Build payment items list
  const paymentItems = useMemo(() => {
    const items: PaymentItem[] = [];

    projects.forEach(project => {
      const client = clients.find(c => c.id === project.clientId);

      // Receivables (from clients)
      items.push({
        id: `recv-${project.id}`,
        type: 'receivable',
        projectId: project.id,
        projectTitle: project.title,
        entityName: client?.name || 'Cliente',
        entityType: client?.company || 'Cliente',
        amount: project.clientPrice,
        status: project.paymentStatus,
        dueDate: project.clientDueDate ? new Date(project.clientDueDate) : undefined,
      });

      // Payables (to collaborators)
      if (project.captationCost > 0 && project.responsavelCaptacaoId) {
        const user = users.find(u => u.id === project.responsavelCaptacaoId);
        items.push({
          id: `pay-cap-${project.id}`,
          type: 'payable',
          projectId: project.id,
          projectTitle: project.title,
          entityName: user?.name || 'Colaborador',
          entityType: 'Captação',
          amount: project.captationCost,
          status: project.freelancerPaymentStatus,
          dueDate: project.freelancerDueDate ? new Date(project.freelancerDueDate) : undefined,
          iban: (user as any)?.iban,
          bankName: (user as any)?.bankName,
          nif: (user as any)?.nif,
        });
      }

      if (project.editionCost > 0 && project.responsavelEdicaoId) {
        const user = users.find(u => u.id === project.responsavelEdicaoId);
        items.push({
          id: `pay-edi-${project.id}`,
          type: 'payable',
          projectId: project.id,
          projectTitle: project.title,
          entityName: user?.name || 'Editor',
          entityType: 'Edição',
          amount: project.editionCost,
          status: project.freelancerPaymentStatus,
          dueDate: project.freelancerDueDate ? new Date(project.freelancerDueDate) : undefined,
          iban: (user as any)?.iban,
          bankName: (user as any)?.bankName,
          nif: (user as any)?.nif,
        });
      }
    });

    return items;
  }, [projects, clients, users]);

  // Unique collaborators for filter
  const uniqueCollaborators = useMemo(() => {
    const ids = new Set<string>();
    projects.forEach(p => {
      if (p.responsavelCaptacaoId) ids.add(p.responsavelCaptacaoId);
      if (p.responsavelEdicaoId) ids.add(p.responsavelEdicaoId);
    });
    return users.filter(u => ids.has(u.id));
  }, [projects, users]);

  // Filter items
  const filteredItems = useMemo(() => {
    return paymentItems.filter(item => {
      // Movement type filter
      if (movementFilter !== 'all' && item.type !== movementFilter) return false;

      // Client filter (only for receivables)
      if (selectedClients.length > 0 && item.type === 'receivable') {
        const project = projects.find(p => p.id === item.projectId);
        if (!project || !selectedClients.includes(project.clientId)) return false;
      }

      // Collaborator filter (only for payables)
      if (selectedCollaborators.length > 0 && item.type === 'payable') {
        const project = projects.find(p => p.id === item.projectId);
        if (!project) return false;
        const hasCollaborator =
          (project.responsavelCaptacaoId && selectedCollaborators.includes(project.responsavelCaptacaoId)) ||
          (project.responsavelEdicaoId && selectedCollaborators.includes(project.responsavelEdicaoId));
        if (!hasCollaborator) return false;
      }

      return true;
    });
  }, [paymentItems, movementFilter, selectedClients, selectedCollaborators, projects]);

  // Toggle item selection
  const toggleItem = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
  };

  // Select all
  const selectAll = () => {
    if (selectedItems.size === filteredItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredItems.map(i => i.id)));
    }
  };

  // Calculate totals
  const totals = useMemo(() => {
    const selected = filteredItems.filter(i => selectedItems.has(i.id));
    return {
      receivable: selected.filter(i => i.type === 'receivable').reduce((sum, i) => sum + i.amount, 0),
      payable: selected.filter(i => i.type === 'payable').reduce((sum, i) => sum + i.amount, 0),
      count: selected.length,
    };
  }, [filteredItems, selectedItems]);

  // Export handlers
  const handleExportCSV = (type: 'all' | 'receivable' | 'payable') => {
    exportPaymentsCSV(projects, clients, users, type);
  };

  const handleExportPDF = (type: 'all' | 'receivable' | 'payable') => {
    exportPaymentsPDF(projects, clients, users, type);
  };

  const handleExportSelectedCSV = () => {
    // Filter projects that have selected items
    const selectedProjectIds = new Set(
      filteredItems
        .filter(i => selectedItems.has(i.id))
        .map(i => i.projectId)
    );
    const selectedProjects = projects.filter(p => selectedProjectIds.has(p.id));
    exportPaymentsCSV(selectedProjects, clients, users, 'all');
  };

  const handleExportSelectedPDF = () => {
    // Filter projects that have selected items
    const selectedProjectIds = new Set(
      filteredItems
        .filter(i => selectedItems.has(i.id))
        .map(i => i.projectId)
    );
    const selectedProjects = projects.filter(p => selectedProjectIds.has(p.id));
    exportPaymentsPDF(selectedProjects, clients, users, 'all');
  };

  const toggleClientFilter = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const toggleCollaboratorFilter = (userId: string) => {
    setSelectedCollaborators(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start gap-4">
            {/* Movement Type */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium">Tipo de Movimento</label>
              <Select value={movementFilter} onValueChange={(v) => setMovementFilter(v as MovementType)}>
                <SelectTrigger className="w-[180px] glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border-white/20">
                  <SelectItem value="all">Todos os movimentos</SelectItem>
                  <SelectItem value="receivable">
                    <span className="flex items-center gap-2">
                      <ArrowUpCircle className="w-4 h-4 text-green-400" />
                      A Receber
                    </span>
                  </SelectItem>
                  <SelectItem value="payable">
                    <span className="flex items-center gap-2">
                      <ArrowDownCircle className="w-4 h-4 text-orange-400" />
                      A Pagar
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Client Filter (Multi-select) */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <User className="w-3 h-3" />
                Clientes ({selectedClients.length})
              </label>
              <div className="flex flex-wrap gap-1 max-w-[300px]">
                {clients.slice(0, 5).map(client => (
                  <Badge
                    key={client.id}
                    variant={selectedClients.includes(client.id) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleClientFilter(client.id)}
                  >
                    {client.name.slice(0, 15)}
                  </Badge>
                ))}
                {clients.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{clients.length - 5} mais
                  </Badge>
                )}
              </div>
            </div>

            {/* Collaborator Filter (Multi-select) */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                <Users className="w-3 h-3" />
                Colaboradores ({selectedCollaborators.length})
              </label>
              <div className="flex flex-wrap gap-1 max-w-[300px]">
                {uniqueCollaborators.map(user => (
                  <Badge
                    key={user.id}
                    variant={selectedCollaborators.includes(user.id) ? 'default' : 'outline'}
                    className="cursor-pointer text-xs"
                    onClick={() => toggleCollaboratorFilter(user.id)}
                  >
                    {user.name.slice(0, 15)}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground font-medium opacity-0">Clear</label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMovementFilter('all');
                  setSelectedClients([]);
                  setSelectedCollaborators([]);
                  setSelectedItems(new Set());
                }}
                className="glass border-white/20"
              >
                Limpar filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Exportar Tudo */}
        <Button
          onClick={() => handleExportCSV('all')}
          variant="outline"
          size="sm"
          className="glass border-white/20"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          CSV
        </Button>
        <Button
          onClick={() => handleExportPDF('all')}
          variant="outline"
          size="sm"
          className="glass border-white/20"
        >
          <FileText className="w-4 h-4 mr-2" />
          PDF
        </Button>

        <div className="w-px h-6 bg-white/20" />

        {/* A Receber */}
        <Button
          onClick={() => handleExportPDF('receivable')}
          variant="outline"
          size="sm"
          className="glass border-green-500/30 text-green-400 hover:bg-green-500/10"
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          A Receber (PDF)
        </Button>

        {/* A Pagar */}
        <Button
          onClick={() => handleExportPDF('payable')}
          variant="outline"
          size="sm"
          className="glass border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
        >
          <ArrowDownCircle className="w-4 h-4 mr-2" />
          A Pagar (PDF)
        </Button>

        {/* Selecionados */}
        {selectedItems.size > 0 && (
          <>
            <div className="w-px h-6 bg-white/20" />
            <Button
              onClick={handleExportSelectedCSV}
              size="sm"
              className="gradient-purple"
            >
              <Download className="w-4 h-4 mr-2" />
              Selecionados ({selectedItems.size})
            </Button>
            <Button
              onClick={handleExportSelectedPDF}
              size="sm"
              variant="outline"
              className="glass border-purple-500/30 text-purple-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </>
        )}
      </div>

      {/* Selection Summary */}
      {selectedItems.size > 0 && (
        <Card className="glass-card bg-purple-500/10 border-purple-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {totals.count} itens selecionados
                </span>
                {totals.receivable > 0 && (
                  <Badge className="bg-green-500/20 text-green-400">
                    A Receber: {formatCurrency(totals.receivable)}
                  </Badge>
                )}
                {totals.payable > 0 && (
                  <Badge className="bg-orange-500/20 text-orange-400">
                    A Pagar: {formatCurrency(totals.payable)}
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems(new Set())}
                className="text-muted-foreground"
              >
                Limpar seleção
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Items Table */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Movimentos Financeiros
            </CardTitle>
            <Badge variant="outline">{filteredItems.length} registros</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedItems.size === filteredItems.length && filteredItems.length > 0}
                      onCheckedChange={selectAll}
                    />
                  </TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Dados Bancários</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Nenhum movimento encontrado para os filtros selecionados
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={selectedItems.has(item.id) ? 'bg-purple-500/10' : ''}
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(item.id)}
                          onCheckedChange={() => toggleItem(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {item.type === 'receivable' ? (
                          <Badge className="bg-green-500/20 text-green-400">
                            <ArrowUpCircle className="w-3 h-3 mr-1" />
                            Entrada
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-500/20 text-orange-400">
                            <ArrowDownCircle className="w-3 h-3 mr-1" />
                            Saída
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{item.projectTitle}</TableCell>
                      <TableCell>{item.entityName}</TableCell>
                      <TableCell className="text-muted-foreground">{item.entityType}</TableCell>
                      <TableCell className={`text-right font-semibold ${
                        item.type === 'receivable' ? 'text-green-400' : 'text-orange-400'
                      }`}>
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            item.status === 'recebido' || item.status === 'pago'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-yellow-500/20 text-yellow-400'
                          }
                        >
                          {item.status === 'recebido' || item.status === 'pago' ? '✓ Pago' : '⏱ Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.dueDate ? item.dueDate.toLocaleDateString('pt-PT') : '-'}
                      </TableCell>
                      <TableCell>
                        {item.iban ? (
                          <div className="text-xs">
                            <div className="font-mono">{item.iban.slice(0, 12)}...</div>
                            {item.bankName && (
                              <div className="text-muted-foreground">{item.bankName}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
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
    </div>
  );
}
