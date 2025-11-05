'use client';

import { useState, useEffect } from 'react';
import { Plus, Calendar, User, MapPin, Euro } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/lib/useAppStore';
import { VideoType, PaymentStatus, FreelancerPaymentStatus, Category } from '@/lib/types';
import { videoTypeLabels } from '@/lib/data';
import { categoriesApi } from '@/lib/api';

interface CreateProjectModalProps {
  children?: React.ReactNode;
}

export default function CreateProjectModal({ children }: CreateProjectModalProps) {
  const { clients, users, createProject } = useAppStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    clientId: '',
    categoryId: '',
    projectFlow: 'complete' as 'complete' | 'captation-only' | 'edition-only',
    location: '',
    description: '',
    clientPrice: '',
    captationCost: '',
    editionCost: '',
    dueDate: '',
    filmakerId: '',
  });

  // Carregar categorias imediatamente quando componente montar
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await categoriesApi.list();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Definir fase e status iniciais baseado no tipo de projeto
      const isCaptationOnly = formData.projectFlow === 'captation-only';
      const isEditionOnly = formData.projectFlow === 'edition-only';
      const isComplete = formData.projectFlow === 'complete';

      const projectData = {
        title: formData.title,
        clientId: formData.clientId,
        videoType: 'outro' as VideoType, // Mantém compatibilidade com schema
        categoryId: formData.categoryId || undefined,
        location: formData.location || undefined,
        description: formData.description || undefined,
        // Definir status baseado no fluxo
        statusCaptacao: isEditionOnly ? 'concluido' as const : 'agendado' as const,
        statusEdicao: isEditionOnly ? 'receber-ficheiros' as const : undefined,
        phase: isEditionOnly ? 'edicao' as const : 'captacao' as const,
        responsavelCaptacaoId: isEditionOnly ? undefined : (formData.filmakerId || undefined),
        clientPrice: parseFloat(formData.clientPrice) || 0,
        // Se for apenas edição, custo de captação é 0. Se for apenas captação, custo de edição é 0
        captationCost: isEditionOnly ? 0 : (parseFloat(formData.captationCost) || 0),
        editionCost: isCaptationOnly ? 0 : (parseFloat(formData.editionCost) || 0),
        paymentStatus: 'a-faturar' as PaymentStatus,
        freelancerPaymentStatus: 'a-pagar' as FreelancerPaymentStatus,
        clientDueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      };

      await createProject(projectData);

      // Reset form
      setFormData({
        title: '',
        clientId: '',
        categoryId: '',
        projectFlow: 'complete',
        location: '',
        description: '',
        clientPrice: '',
        captationCost: '',
        editionCost: '',
        dueDate: '',
        filmakerId: '',
      });

      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      alert('Erro ao criar projeto: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-strong border border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-gradient text-lg md:text-xl">Criar Novo Projeto</DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs md:text-sm">
            Preencha os detalhes do novo projeto de produção audiovisual
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-medium text-foreground">Informações Básicas</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="title" className="text-xs md:text-sm">Título do Projeto *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="Ex: Campanha de Verão 2024"
                  className="glass border-white/20 focus:border-purple-500/50 text-sm md:text-base"
                  required
                />
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="client" className="text-xs md:text-sm">Cliente *</Label>
                <Select value={formData.clientId} onValueChange={(value) => updateField('clientId', value)}>
                  <SelectTrigger className="glass border-white/20 focus:border-purple-500/50">
                    <SelectValue placeholder="Selecionar cliente" />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="categoryId" className="text-xs md:text-sm">Categoria *</Label>
                <Select value={formData.categoryId} onValueChange={(value) => updateField('categoryId', value)}>
                  <SelectTrigger className="glass border-white/20 focus:border-purple-500/50 text-sm md:text-base">
                    <SelectValue placeholder={loadingCategories ? "Carregando..." : "Selecionar categoria"} />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    {categories.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-muted-foreground mb-2">Nenhuma categoria criada</p>
                        <p className="text-xs text-muted-foreground">Crie categorias no menu Categorias</p>
                      </div>
                    ) : (
                      categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category.color }}
                            />
                            <span>{category.name}</span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectFlow">Fluxo do Projeto *</Label>
                <Select value={formData.projectFlow} onValueChange={(value) => updateField('projectFlow', value)}>
                  <SelectTrigger className="glass border-white/20 focus:border-purple-500/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    <SelectItem value="complete">
                      <div className="flex flex-col">
                        <span className="font-medium">Completo (Captação + Edição)</span>
                        <span className="text-xs text-muted-foreground">Fluxo completo de produção</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="captation-only">
                      <div className="flex flex-col">
                        <span className="font-medium">Apenas Captação</span>
                        <span className="text-xs text-muted-foreground">Somente gravação, sem edição</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="edition-only">
                      <div className="flex flex-col">
                        <span className="font-medium">Apenas Edição</span>
                        <span className="text-xs text-muted-foreground">Cliente fornece material bruto</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {formData.projectFlow === 'edition-only' && (
                  <p className="text-xs text-purple-400 mt-1">
                    ℹ️ Vai direto para o Kanban de Edição com status "Receber Ficheiros"
                  </p>
                )}
                {formData.projectFlow === 'captation-only' && (
                  <p className="text-xs text-purple-400 mt-1">
                    ℹ️ Projeto ficará apenas no Kanban de Captação
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Localização</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    placeholder="Ex: Lisboa, Portugal"
                    className="pl-10 glass border-white/20 focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Breve descrição do projeto..."
                className="glass border-white/20 focus:border-purple-500/50"
                rows={3}
              />
            </div>
          </div>

          {/* Valores Financeiros */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="text-base md:text-lg font-medium text-foreground">Valores Financeiros</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
              <div className="space-y-1.5 md:space-y-2">
                <Label htmlFor="clientPrice" className="text-xs md:text-sm">Preço Cliente (€) *</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="clientPrice"
                    type="number"
                    step="0.01"
                    value={formData.clientPrice}
                    onChange={(e) => updateField('clientPrice', e.target.value)}
                    placeholder="0.00"
                    className="pl-10 glass border-white/20 focus:border-purple-500/50"
                    required
                  />
                </div>
              </div>

              {/* Custo Captação - Aparece se NÃO for apenas edição */}
              {formData.projectFlow !== 'edition-only' && (
                <div className="space-y-2">
                  <Label htmlFor="captationCost">Custo Captação (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="captationCost"
                      type="number"
                      step="0.01"
                      value={formData.captationCost}
                      onChange={(e) => updateField('captationCost', e.target.value)}
                      placeholder="0.00"
                      className="pl-10 glass border-white/20 focus:border-purple-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Custo Edição - Não aparece se for apenas captação */}
              {formData.projectFlow !== 'captation-only' && (
                <div className="space-y-2">
                  <Label htmlFor="editionCost">Custo Edição (€)</Label>
                  <div className="relative">
                    <Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="editionCost"
                      type="number"
                      step="0.01"
                      value={formData.editionCost}
                      onChange={(e) => updateField('editionCost', e.target.value)}
                      placeholder="0.00"
                      className="pl-10 glass border-white/20 focus:border-purple-500/50"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Margem Preview */}
            {formData.clientPrice && (
              <div className="glass rounded-lg p-4 bg-purple-500/10 border border-purple-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-purple-300">Margem Estimada:</span>
                  <span className="text-lg font-bold text-purple-400">
                    €{(
                      parseFloat(formData.clientPrice || '0') -
                      (formData.projectFlow === 'edition-only' ? 0 : parseFloat(formData.captationCost || '0')) -
                      (formData.projectFlow === 'captation-only' ? 0 : parseFloat(formData.editionCost || '0'))
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Responsáveis e Prazos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Responsáveis e Prazos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Responsável Captação - Aparece se NÃO for apenas edição */}
              {formData.projectFlow !== 'edition-only' && (
                <div className="space-y-2">
                  <Label htmlFor="filmmaker">Responsável Captação</Label>
                  <Select value={formData.filmakerId} onValueChange={(value) => updateField('filmakerId', value)}>
                    <SelectTrigger className="glass border-white/20 focus:border-purple-500/50">
                      <SelectValue placeholder="Selecionar responsável" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border border-white/20">
                      {users.filter(u => u.role === 'freelancer_captacao' || u.role === 'admin').map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="dueDate">Prazo de Entrega</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => updateField('dueDate', e.target.value)}
                    className="pl-10 glass border-white/20 focus:border-purple-500/50"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="glass border border-white/20"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.title || !formData.clientId}
              className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
            >
              {isLoading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
