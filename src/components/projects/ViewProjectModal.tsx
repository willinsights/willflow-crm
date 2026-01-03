'use client';

import { useState } from 'react';
import {
  Eye,
  Calendar,
  User,
  Euro,
  MapPin,
  Tag,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Building2,
  Edit3,
  Video,
  Plus,
  ListTodo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/lib/useAppStore';
import { Project } from '@/lib/types';
import { statusLabels } from '@/lib/data';
import TaskDetailsModal from '@/components/projects/TaskDetailsModal';
import { useLocale } from '@/lib/LocaleContext';

interface ViewProjectModalProps {
  project: Project;
  trigger?: React.ReactNode;
}

export default function ViewProjectModal({ project, trigger }: ViewProjectModalProps) {
  const { formatCurrency } = useLocale();
  const { clients, users } = useAppStore();
  const [open, setOpen] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState<any>(null);
  const [localSubtasks, setLocalSubtasks] = useState<any[]>(project.subtasks || []);

  const client = clients.find(c => c.id === project.clientId);
  const responsavelCaptacao = users.find(u => u.id === project.responsavelCaptacaoId);
  const responsavelEdicao = users.find(u => u.id === project.responsavelEdicaoId);

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask = {
      id: Math.random().toString(36).substring(7),
      title: newSubtaskTitle,
      projectId: project.id,
      completed: false,
      priority: 'medium' as const,
      status: 'todo' as const,
      description: '',
      order: localSubtasks.length + 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      checklistItems: [],
      comments: [],
      attachments: [],
      activityLog: [
        {
          id: Math.random().toString(36).substring(7),
          action: 'created',
          newValue: newSubtaskTitle,
          userId: 'admin@willflow.pt',
          createdAt: new Date(),
        }
      ]
    };

    setLocalSubtasks([...localSubtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const getStatusBadge = (status: string) => {
    const label = statusLabels[status] || status;
    return <Badge className={`status-badge status-${status}`}>{label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <Eye className="h-4 w-4 mr-2" />
            Visualizar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-strong border border-white/20 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gradient flex items-center gap-2">
            <Video className="w-6 h-6" />
            {project.title}
          </DialogTitle>
          <DialogDescription className="sr-only">Visualização do projeto</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Gerais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Tag className="w-5 h-5 text-purple-400" />
              Informações Gerais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Building2 className="w-4 h-4" />
                  Cliente
                </div>
                <p className="font-medium text-lg">{client?.name || 'Não definido'}</p>
                {client?.email && (
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                )}
              </div>

              {project.category && (
                <div className="glass rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Tag className="w-4 h-4" />
                    Categoria
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.category.color }}
                    />
                    <p className="font-medium text-lg">{project.category.name}</p>
                  </div>
                </div>
              )}

              {project.location && (
                <div className="glass rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    Localização
                  </div>
                  <p className="font-medium">{project.location}</p>
                </div>
              )}

              {project.captacaoDate && (
                <div className="glass rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Calendar className="w-4 h-4" />
                    Data de Captação
                  </div>
                  <p className="font-medium">
                    {new Date(project.captacaoDate).toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )}

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Video className="w-4 h-4" />
                  Fase
                </div>
                <p className="font-medium capitalize">{project.phase}</p>
              </div>
            </div>

            {project.description && (
              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  Descrição
                </div>
                <p className="text-sm">{project.description}</p>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              Status
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  Status Captação
                </div>
                {project.statusCaptacao && getStatusBadge(project.statusCaptacao)}
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  Status Edição
                </div>
                {project.statusEdicao && getStatusBadge(project.statusEdicao)}
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Responsáveis
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Video className="w-4 h-4" />
                  Responsável Captação
                </div>
                <p className="font-medium">
                  {responsavelCaptacao?.name || 'Não atribuído'}
                </p>
                {responsavelCaptacao?.email && (
                  <p className="text-xs text-muted-foreground">{responsavelCaptacao.email}</p>
                )}
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Edit3 className="w-4 h-4" />
                  Responsável Edição
                </div>
                <p className="font-medium">
                  {responsavelEdicao?.name || 'Não atribuído'}
                </p>
                {responsavelEdicao?.email && (
                  <p className="text-xs text-muted-foreground">{responsavelEdicao.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Euro className="w-5 h-5 text-purple-400" />
              Valores Financeiros
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass rounded-lg p-4 space-y-2">
                <div className="text-muted-foreground text-sm">Preço Cliente</div>
                <p className="font-bold text-xl text-green-400">
                  {formatCurrency(project.clientPrice)}
                </p>
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="text-muted-foreground text-sm">Custo Captação</div>
                <p className="font-bold text-xl text-orange-400">
                  {formatCurrency(project.captationCost)}
                </p>
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="text-muted-foreground text-sm">Custo Edição</div>
                <p className="font-bold text-xl text-orange-400">
                  {formatCurrency(project.editionCost)}
                </p>
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="text-muted-foreground text-sm">Margem</div>
                <p className={`font-bold text-xl ${project.margin >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                  {formatCurrency(project.margin)}
                </p>
              </div>
            </div>
          </div>

          {/* Status de Pagamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              Status de Pagamento
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  Pagamento do Cliente
                </div>
                {getPaymentStatusBadge(project.paymentStatus)}
                {project.clientReceivedDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Recebido em: {new Date(project.clientReceivedDate).toLocaleDateString('pt-PT')}
                  </p>
                )}
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  Pagamento Colaboradores
                </div>
                {getPaymentStatusBadge(project.freelancerPaymentStatus)}
                {project.freelancerPaidDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Pago em: {new Date(project.freelancerPaidDate).toLocaleDateString('pt-PT')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Datas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Datas
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  Data de Criação
                </div>
                <p className="font-medium">
                  {new Date(project.createdAt).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(project.createdAt).toLocaleTimeString('pt-PT')}
                </p>
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="w-4 h-4" />
                  Prazo do Cliente
                </div>
                <p className="font-medium">
                  {project.clientDueDate
                    ? new Date(project.clientDueDate).toLocaleDateString('pt-PT')
                    : 'Não definido'}
                </p>
              </div>

              <div className="glass rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  Última Atualização
                </div>
                <p className="font-medium">
                  {new Date(project.updatedAt).toLocaleDateString('pt-PT')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(project.updatedAt).toLocaleTimeString('pt-PT')}
                </p>
              </div>
            </div>
          </div>

          {/* Links */}
          {(project.nasLink || project.frameIoLink) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ExternalLink className="w-5 h-5 text-purple-400" />
                Links
              </h3>

              <div className="flex gap-3 flex-wrap">
                {project.nasLink && (
                  <Button
                    variant="outline"
                    className="glass border-white/20 hover:bg-white/10"
                    asChild
                  >
                    <a href={project.nasLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir NAS
                    </a>
                  </Button>
                )}
                {project.frameIoLink && (
                  <Button
                    variant="outline"
                    className="glass border-white/20 hover:bg-white/10"
                    asChild
                  >
                    <a href={project.frameIoLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Abrir Frame.io
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* NOVA SEÇÃO: Subtasks */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-purple-400" />
              Subtasks ({localSubtasks.length})
            </h3>

            {/* Campo para adicionar nova subtask */}
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar nova subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSubtask();
                  }
                }}
                className="glass border-white/20 bg-white/5"
              />
              <Button
                onClick={handleAddSubtask}
                className="glass-button shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Lista de subtasks */}
            <div className="space-y-2">
              {localSubtasks.length === 0 ? (
                <div className="glass rounded-lg p-8 text-center text-muted-foreground">
                  <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma subtask ainda.</p>
                  <p className="text-sm mt-1">Adicione a primeira acima! ↑</p>
                </div>
              ) : (
                localSubtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    onClick={() => setSelectedSubtask(subtask)}
                    className="glass rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-5 h-5 shrink-0 ${subtask.completed ? 'text-green-400' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <p className={`font-medium ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                            {subtask.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {subtask.priority && (
                          <Badge className={`
                            ${subtask.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''}
                            ${subtask.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                            ${subtask.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                            ${subtask.priority === 'low' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                          `}>
                            {subtask.priority}
                          </Badge>
                        )}
                        <span className="text-sm text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          Clique para detalhes →
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Detalhes da Subtask */}
      {selectedSubtask && (
        <TaskDetailsModal
          open={!!selectedSubtask}
          onClose={() => setSelectedSubtask(null)}
          subtask={selectedSubtask}
          projectId={project.id}
          onUpdate={(updated) => {
            setLocalSubtasks(localSubtasks.map(s => s.id === updated.id ? updated : s));
            setSelectedSubtask(null);
          }}
          onDelete={() => {
            setLocalSubtasks(localSubtasks.filter(s => s.id !== selectedSubtask.id));
            setSelectedSubtask(null);
          }}
        />
      )}
    </Dialog>
  );
}
