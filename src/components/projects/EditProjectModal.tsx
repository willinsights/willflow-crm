'use client';

import { useState, useEffect } from 'react';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/useAppStore';
import { Project, Category } from '@/lib/types';
import { categoriesApi } from '@/lib/api';

interface EditProjectModalProps {
  project: Project;
}

export default function EditProjectModal({ project }: EditProjectModalProps) {
  const { clients, updateProject } = useAppStore();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: project.title,
    clientId: project.clientId,
    categoryId: project.categoryId || '',
    clientPrice: project.clientPrice.toString(),
    captationCost: project.captationCost.toString(),
    editionCost: project.editionCost.toString(),
  });

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
        </DialogHeader>
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
              <Label>Preço (€)</Label>
              <Input type="number" step="0.01" value={formData.clientPrice} onChange={(e) => setFormData(p => ({...p, clientPrice: e.target.value}))} className="glass border-white/20" />
            </div>
            <div className="space-y-2">
              <Label>Captação (€)</Label>
              <Input type="number" step="0.01" value={formData.captationCost} onChange={(e) => setFormData(p => ({...p, captationCost: e.target.value}))} className="glass border-white/20" />
            </div>
            <div className="space-y-2">
              <Label>Edição (€)</Label>
              <Input type="number" step="0.01" value={formData.editionCost} onChange={(e) => setFormData(p => ({...p, editionCost: e.target.value}))} className="glass border-white/20" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="glass">Cancelar</Button>
            <Button type="submit" disabled={loading} className="gradient-purple text-white">{loading ? 'Salvando...' : 'Atualizar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
