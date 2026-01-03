'use client';

import { useState, useEffect } from 'react';
import { Edit, Plus, ListTodo, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAppStore } from '@/lib/useAppStore';
import { Project, Category } from '@/lib/types';
import { categoriesApi } from '@/lib/api';
import TaskDetailsModal from '@/components/projects/TaskDetailsModal';
import { useLocale } from '@/lib/LocaleContext';

interface EditProjectModalProps {
  project: Project;
}

export default function EditProjectModal({ project }: EditProjectModalProps) {
  const { clients, updateProject } = useAppStore();
  const { config } = useLocale();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [selectedSubtask, setSelectedSubtask] = useState<any>(null);
  const [localSubtasks, setLocalSubtasks] = useState<any[]>(project.subtasks || []);
  const [formData, setFormData] = useState({
    title: project.title,
    clientId: project.clientId,
    categoryId: project.categoryId || '',
    clientPrice: project.clientPrice.toString(),
    captationCost: project.captationCost.toString(),
    editionCost: project.editionCost.toString(),
  });

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

  useEffect(() => {
    if (open) {
      categoriesApi.list().then(res => {
        if (res.success) setCategories(res.data);
      });
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProject(project.id, {
        title: formData.title,
        clientId: formData.clientId,
        categoryId: formData.categoryId || undefined,
        clientPrice: parseFloat(formData.clientPrice) || 0,
        captationCost: parseFloat(formData.captationCost) || 0,
        editionCost: parseFloat(formData.editionCost) || 0,
      });
      setOpen(false);
    } catch (error) {
      alert('Erro ao atualizar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-strong border border-white/20">
        <DialogHeader>
          <DialogTitle className="text-gradient">Editar Projeto</DialogTitle>
        <DialogDescription className="sr-only">Edição do projeto</DialogDescription></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label>Título</Label>
            <Input value={formData.title} onChange={(e) => setFormData(p => ({...p, title: e.target.value}))} className="glass border-white/20" />
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={formData.clientId} onValueChange={(v) => setFormData(p => ({...p, clientId: v}))}>
              <SelectTrigger className="glass border-white/20"><SelectValue /></SelectTrigger>
              <SelectContent className="glass-strong">{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={formData.categoryId} onValueChange={(v) => setFormData(p => ({...p, categoryId: v}))}>
              <SelectTrigger className="glass border-white/20"><SelectValue placeholder="Selecionar" /></SelectTrigger>
              <SelectContent className="glass-strong">{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label>Preço ({config.currencySymbol})</Label>
              <Input type="number" step="0.01" value={formData.clientPrice} onChange={(e) => setFormData(p => ({...p, clientPrice: e.target.value}))} className="glass border-white/20" />
            </div>
            <div className="space-y-2">
              <Label>Captação ({config.currencySymbol})</Label>
              <Input type="number" step="0.01" value={formData.captationCost} onChange={(e) => setFormData(p => ({...p, captationCost: e.target.value}))} className="glass border-white/20" />
            </div>
            <div className="space-y-2">
              <Label>Edição ({config.currencySymbol})</Label>
              <Input type="number" step="0.01" value={formData.editionCost} onChange={(e) => setFormData(p => ({...p, editionCost: e.target.value}))} className="glass border-white/20" />
            </div>
          </div>

          {/* NOVA SEÇÃO: Subtasks */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <Label className="text-lg flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-purple-400" />
                Subtasks ({localSubtasks.length})
              </Label>
            </div>

            {/* Campo para adicionar nova subtask */}
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar nova subtask..."
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                className="glass border-white/20 bg-white/5"
              />
              <Button
                type="button"
                onClick={handleAddSubtask}
                className="gradient-purple text-white shrink-0"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            {/* Lista de subtasks */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {localSubtasks.length === 0 ? (
                <div className="glass rounded-lg p-6 text-center text-muted-foreground">
                  <ListTodo className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma subtask ainda.</p>
                  <p className="text-xs mt-1">Adicione a primeira acima! ↑</p>
                </div>
              ) : (
                localSubtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    onClick={() => setSelectedSubtask(subtask)}
                    className="glass rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle className={`w-4 h-4 shrink-0 ${subtask.completed ? 'text-green-400' : 'text-gray-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium text-sm truncate ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                          {subtask.title}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {subtask.priority && (
                          <Badge className={`text-xs ${
                            subtask.priority === 'urgent' ? 'bg-red-500/20 text-red-400 border-red-500/30' : ''
                          }${subtask.priority === 'high' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                          ${subtask.priority === 'medium' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : ''}
                          ${subtask.priority === 'low' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}`}>
                            {subtask.priority}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                          Clique para detalhes →
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="glass">Cancelar</Button>
            <EnhancedButton
              type="submit"
              loading={loading}
              loadingText="Salvando..."
              className="gradient-purple text-white"
            >
              Atualizar Projeto
            </EnhancedButton>
          </DialogFooter>
        </form>
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
