'use client';

import { useState } from 'react';
import { FileText, Download, Eye, CheckCircle, Clock, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Project, Client } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface PaymentControlProps {
  projects: Project[];
  clients: Client[];
  onMarkAsPaid?: (projectId: string, type: 'client' | 'freelancer') => void;
}

export default function PaymentControl({
  projects,
  clients,
  onMarkAsPaid,
}: PaymentControlProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<Project | null>(null);

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

  const generateInvoice = (project: Project) => {
    // Simular geração de fatura
    const client = clients.find(c => c.id === project.clientId);

    const invoiceData = {
      invoiceNumber: `FAT-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      date: new Date().toLocaleDateString('pt-PT'),
      client: {
        name: client?.name || 'N/A',
        email: client?.email || '',
        company: client?.company || '',
      },
      project: {
        title: project.title,
        description: project.description,
      },
      items: [
        {
          description: `Produção Audiovisual - ${project.title}`,
          quantity: 1,
          unitPrice: project.clientPrice,
          total: project.clientPrice,
        },
      ],
      subtotal: project.clientPrice,
      tax: project.clientPrice * 0.23, // IVA 23%
      total: project.clientPrice * 1.23,
    };

    // Em produção, gerar PDF com biblioteca como jsPDF
    console.log('Invoice Data:', invoiceData);
    alert(`📄 Fatura ${invoiceData.invoiceNumber} gerada!\n\nEm produção, será gerado PDF para download.`);
  };

  const generateReceipt = (project: Project) => {
    const client = clients.find(c => c.id === project.clientId);

    const receiptData = {
      receiptNumber: `REC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
      date: new Date().toLocaleDateString('pt-PT'),
      client: client?.name || 'N/A',
      amount: project.clientPrice,
      project: project.title,
    };

    console.log('Receipt Data:', receiptData);
    alert(`📋 Recibo ${receiptData.receiptNumber} gerado!\n\nEm produção, será gerado PDF para download.`);
  };

  return (
    <div className="space-y-6">
      {/* Client Payments */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Controle de Pagamentos - Clientes
          </CardTitle>
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
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.filter(p => p.phase !== 'finalizados' || p.paymentStatus !== 'recebido').map((project) => {
                  const client = clients.find(c => c.id === project.clientId);
                  const dueDate = project.clientDueDate ? new Date(project.clientDueDate) : null;
                  const isOverdue = dueDate && dueDate < new Date() && project.paymentStatus !== 'recebido';

                  return (
                    <TableRow key={project.id} className={isOverdue ? 'bg-red-500/5' : ''}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{client?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right text-green-400 font-semibold">
                        {formatCurrency(project.clientPrice)}
                      </TableCell>
                      <TableCell>{getStatusBadge(project.paymentStatus)}</TableCell>
                      <TableCell>
                        {dueDate ? (
                          <div className="flex items-center gap-1">
                            {isOverdue && <AlertCircle className="w-4 h-4 text-red-400" />}
                            <span className={isOverdue ? 'text-red-400' : ''}>
                              {dueDate.toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {project.clientReceivedDate
                          ? new Date(project.clientReceivedDate).toLocaleDateString('pt-PT')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedInvoice(project)}
                            className="h-8 px-2"
                            title="Ver Fatura"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => generateInvoice(project)}
                            className="h-8 px-2"
                            title="Gerar Fatura"
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          {project.paymentStatus === 'recebido' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => generateReceipt(project)}
                              className="h-8 px-2"
                              title="Gerar Recibo"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {project.paymentStatus !== 'recebido' && onMarkAsPaid && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onMarkAsPaid(project.id, 'client')}
                              className="h-8 px-2 text-green-400"
                              title="Marcar como Pago"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Freelancer Payments */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Controle de Pagamentos - Freelancers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Freelancer</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Data Pagamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.filter(p => p.freelancerPaymentStatus !== 'pago').map((project) => {
                  const totalCost = project.captationCost + project.editionCost;
                  const dueDate = project.freelancerDueDate ? new Date(project.freelancerDueDate) : null;
                  const isOverdue = dueDate && dueDate < new Date() && project.freelancerPaymentStatus !== 'pago';
                  const freelancer = project.responsavelCaptacao || project.responsavelEdicao;

                  return (
                    <TableRow key={project.id} className={isOverdue ? 'bg-red-500/5' : ''}>
                      <TableCell className="font-medium">{project.title}</TableCell>
                      <TableCell>{freelancer?.name || 'N/A'}</TableCell>
                      <TableCell className="text-right text-orange-400 font-semibold">
                        {formatCurrency(totalCost)}
                      </TableCell>
                      <TableCell>{getStatusBadge(project.freelancerPaymentStatus)}</TableCell>
                      <TableCell>
                        {dueDate ? (
                          <div className="flex items-center gap-1">
                            {isOverdue && <AlertCircle className="w-4 h-4 text-red-400" />}
                            <span className={isOverdue ? 'text-red-400' : ''}>
                              {dueDate.toLocaleDateString('pt-PT')}
                            </span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {project.freelancerPaidDate
                          ? new Date(project.freelancerPaidDate).toLocaleDateString('pt-PT')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {onMarkAsPaid && project.freelancerPaymentStatus !== 'pago' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMarkAsPaid(project.id, 'freelancer')}
                            className="h-8 px-2 text-green-400"
                            title="Marcar como Pago"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Preview Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="glass-strong border border-white/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle>Pré-visualização da Fatura</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-6 bg-white text-black rounded-lg">
              <div className="text-center border-b pb-4">
                <h1 className="text-3xl font-bold">FATURA</h1>
                <p className="text-sm text-gray-600">
                  #{new Date().getFullYear()}-{String(Math.floor(Math.random() * 9999)).padStart(4, '0')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">De:</p>
                  <p>WillFlow Audiovisual</p>
                  <p className="text-sm text-gray-600">Lisboa, Portugal</p>
                </div>
                <div>
                  <p className="font-semibold">Para:</p>
                  <p>{clients.find(c => c.id === selectedInvoice.clientId)?.name}</p>
                  <p className="text-sm text-gray-600">
                    {clients.find(c => c.id === selectedInvoice.clientId)?.company}
                  </p>
                </div>
              </div>

              <div>
                <p className="font-semibold">Projeto:</p>
                <p>{selectedInvoice.title}</p>
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
                  <tr>
                    <td className="py-2 font-bold text-lg">TOTAL</td>
                    <td className="text-right font-bold text-lg">
                      {formatCurrency(selectedInvoice.clientPrice * 1.23)}
                    </td>
                  </tr>
                </tfoot>
              </table>

              <div className="pt-4 text-center">
                <Button onClick={() => generateInvoice(selectedInvoice)} className="gradient-purple">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
