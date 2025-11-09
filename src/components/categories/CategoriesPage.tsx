'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { categoriesApi } from '@/lib/api';
import { Category } from '@/lib/types';

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#6366f1',
  });
  const [saving, setSaving] = useState(false);

  // Predefined colors
  const colors = [
    '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#ef4444',
    '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
    '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await categoriesApi.list();

      if (response.success) {
        setCategories(response.data);
      } else {
        throw new Error('Erro ao carregar categorias');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    setSaving(true);

    try {
      console.log('📤 Enviando criação de categoria:', formData);
      const response = await categoriesApi.create(formData);
      console.log('📥 Resposta do servidor:', response);

      if (response.success) {
        setCategories(prev => [...prev, response.data]);
        resetForm();
        setShowCreateModal(false);
      } else {
        // Mostra a mensagem de erro do backend
        const errorMsg = (response as any).error || 'Erro ao criar categoria';
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('❌ Erro completo:', err);
      alert(err instanceof Error ? err.message : 'Erro ao criar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory) return;

    setSaving(true);

    try {
      const response = await categoriesApi.update(editingCategory.id, formData);

      if (response.success) {
        setCategories(prev => prev.map(cat =>
          cat.id === editingCategory.id ? response.data : cat
        ));
        resetForm();
        setEditingCategory(null);
      } else {
        throw new Error('Erro ao atualizar categoria');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao atualizar categoria');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Tem certeza que deseja deletar a categoria "${category.name}"?`)) {
      return;
    }

    try {
      const response = await categoriesApi.delete(category.id);

      if (response.success) {
        setCategories(prev => prev.filter(cat => cat.id !== category.id));
      } else {
        throw new Error('Erro ao deletar categoria');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao deletar categoria');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#6366f1',
    });
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#6366f1',
    });
    setEditingCategory(category);
  };

  const updateFormField = (field: keyof CategoryFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gradient mb-2">Categorias</h1>
            <p className="text-muted-foreground">
              Gestão de categorias e tipos de vídeo
            </p>
          </div>
        </div>

        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Categorias</h1>
          <p className="text-muted-foreground">
            Gestão de categorias e tipos de vídeo
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Categoria
        </Button>
      </div>

      {error && (
        <div className="glass p-4 border border-red-500/30 bg-red-500/10 rounded-lg">
          <p className="text-red-300">{error}</p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id} className="glass-card group hover:scale-105 transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <CardTitle className="text-lg">{category.name}</CardTitle>
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(category)}
                    className="hover:bg-white/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category)}
                    className="hover:bg-red-500/20 text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              {category.description && (
                <p className="text-sm text-muted-foreground mb-3">
                  {category.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  ID: {category.id.split('-')[0]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(category.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}

        {categories.length === 0 && (
          <div className="col-span-full glass-card p-8 text-center">
            <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nenhuma categoria criada ainda</p>
            <Button
              onClick={openCreateModal}
              variant="outline"
              className="glass border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeira categoria
            </Button>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="glass-strong border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-gradient">Nova Categoria</DialogTitle>
            <DialogDescription>
              Criar uma nova categoria de vídeo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="Ex: Hotel Luxo, Experiência Gastronómica..."
                className="glass border-white/20 focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Descrição opcional da categoria..."
                className="glass border-white/20 focus:border-purple-500/50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateFormField('color', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowCreateModal(false)}
              className="glass border border-white/20"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={saving || !formData.name.trim()}
              className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
            >
              {saving ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
        <DialogContent className="glass-strong border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-gradient">Editar Categoria</DialogTitle>
            <DialogDescription>
              Modificar informações da categoria
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => updateFormField('name', e.target.value)}
                placeholder="Nome da categoria"
                className="glass border-white/20 focus:border-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => updateFormField('description', e.target.value)}
                placeholder="Descrição opcional da categoria..."
                className="glass border-white/20 focus:border-purple-500/50"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => updateFormField('color', color)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.color === color ? 'border-white scale-110' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setEditingCategory(null)}
              className="glass border border-white/20"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={saving || !formData.name.trim()}
              className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
            >
              {saving ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
