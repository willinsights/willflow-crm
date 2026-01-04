'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, Calendar, User, MapPin, Euro, Camera, Film, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EnhancedButton } from '@/components/ui/enhanced-button';
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
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { useAppStore } from '@/lib/useAppStore';
import { VideoType, PaymentStatus, FreelancerPaymentStatus, Category } from '@/lib/types';
import { videoTypeLabels } from '@/lib/data';
import { categoriesApi } from '@/lib/api';
import { useLocale } from '@/lib/LocaleContext';
import { useToast } from '@/components/ui/toast';

interface CreateProjectModalProps {
  children?: React.ReactNode;
  defaultDate?: string; // YYYY-MM-DD format
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CreateProjectModal({
  children,
  defaultDate,
  isOpen,
  onOpenChange
}: CreateProjectModalProps) {
  const { config, formatCurrency } = useLocale();
  const { clients, users, createProject } = useAppStore();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Support both controlled and uncontrolled modes
  const open = isOpen !== undefined ? isOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

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
    dueDate: defaultDate || '',
    captacaoDate: '', // Data e hora de captação
    filmakerIds: [] as string[], // Alterado para array (seleção múltipla)
    editorIds: [] as string[], // Alterado para array (seleção múltipla)
  });

  // Opções para MultiSelect - Captação
  const captacaoOptions = useMemo((): MultiSelectOption[] => {
    return users
      .filter(u => u.role === 'freelancer_captacao' || u.role === 'admin')
      .map(user => {
        const typeLabel = (user as any).collaboratorType === 'photographer' ? 'Fotógrafo' :
                          (user as any).collaboratorType === 'filmmaker' ? 'Filmmaker' :
                          (user as any).collaboratorType === 'both' ? 'Foto+Film' : '';
        return {
          value: user.id,
          label: user.name,
          description: typeLabel || user.role === 'admin' ? 'Admin' : undefined,
          icon: (user as any).collaboratorType === 'photographer' ? <Camera className="w-4 h-4 text-cyan-400" /> :
                (user as any).collaboratorType === 'filmmaker' ? <Film className="w-4 h-4 text-orange-400" /> :
                <Video className="w-4 h-4 text-blue-400" />
        };
      });
  }, [users]);

  // Opções para MultiSelect - Edição
  const edicaoOptions = useMemo((): MultiSelectOption[] => {
    return users
      .filter(u => u.role === 'editor_edicao' || u.role === 'admin')
      .map(user => ({
        value: user.id,
        label: user.name,
        description: user.role === 'admin' ? 'Admin' : 'Editor',
        icon: <User className="w-4 h-4 text-green-400" />
      }));
  }, [users]);

  // Update dueDate when defaultDate changes
  useEffect(() => {
    if (defaultDate) {
      setFormData(prev => ({ ...prev, dueDate: defaultDate }));
    }
  }, [defaultDate]);

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

      // Usar primeiro selecionado como responsável principal (API aceita apenas um)
      const primaryCaptacaoId = formData.filmakerIds[0] || undefined;
      const primaryEdicaoId = formData.editorIds[0] || undefined;

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
        responsavelCaptacaoId: isEditionOnly ? undefined : primaryCaptacaoId,
        responsavelEdicaoId: isCaptationOnly ? undefined : primaryEdicaoId,
        clientPrice: parseFloat(formData.clientPrice) || 0,
        // Se for apenas edição, custo de captação é 0. Se for apenas captação, custo de edição é 0
        captationCost: isEditionOnly ? 0 : (parseFloat(formData.captationCost) || 0),
        editionCost: isCaptationOnly ? 0 : (parseFloat(formData.editionCost) || 0),
        paymentStatus: 'a-faturar' as PaymentStatus,
        freelancerPaymentStatus: 'a-pagar' as FreelancerPaymentStatus,
        clientDueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
        captacaoDate: formData.captacaoDate ? new Date(formData.captacaoDate) : undefined,
      };

      await createProject(projectData);

      toast({
        title: 'Projeto criado ✅',
        description: `"${formData.title}" foi criado com sucesso`,
        variant: 'success'
      });

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
        captacaoDate: '',
        filmakerIds: [],
        editorIds: [],
      });

      setOpen(false);
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      toast({
        title: 'Erro ao criar projeto',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao criar o projeto',
        variant: 'error'
      });
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
          <Button
            data-create-project
            className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
          >
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
                <Label htmlFor="clientPrice" className="text-xs md:text-sm">
                  Preço Cliente ({config.currencySymbol}) *
                </Label>
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
                  <Label htmlFor="captationCost">
                    Custo Captação ({config.currencySymbol})
                  </Label>
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
                  <Label htmlFor="editionCost">
                    Custo Edição ({config.currencySymbol})
                  </Label>
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
                    {formatCurrency(
                      parseFloat(formData.clientPrice || '0') -
                      (formData.projectFlow === 'edition-only' ? 0 : parseFloat(formData.captationCost || '0')) -
                      (formData.projectFlow === 'captation-only' ? 0 : parseFloat(formData.editionCost || '0'))
                    )}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Responsáveis e Prazos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Responsáveis e Prazos</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Responsáveis Captação - Aparece se NÃO for apenas edição */}
              {formData.projectFlow !== 'edition-only' && (
                <div className="space-y-2">
                  <Label htmlFor="filmmaker">
                    Equipa de Captação
                    <span className="text-xs text-muted-foreground ml-2">(seleção múltipla)</span>
                  </Label>
                  <MultiSelect
                    options={captacaoOptions}
                    selected={formData.filmakerIds}
                    onChange={(ids) => setFormData(prev => ({ ...prev, filmakerIds: ids }))}
                    placeholder="Selecionar colaboradores..."
                    emptyMessage="Nenhum colaborador de captação cadastrado"
                  />
                  {formData.filmakerIds.length > 1 && (
                    <p className="text-xs text-blue-400">
                      ℹ️ O primeiro selecionado será o responsável principal
                    </p>
                  )}
                </div>
              )}

              {/* Responsáveis Edição - Aparece se NÃO for apenas captação */}
              {formData.projectFlow !== 'captation-only' && (
                <div className="space-y-2">
                  <Label htmlFor="editor">
                    Equipa de Edição
                    <span className="text-xs text-muted-foreground ml-2">(seleção múltipla)</span>
                  </Label>
                  <MultiSelect
                    options={edicaoOptions}
                    selected={formData.editorIds}
                    onChange={(ids) => setFormData(prev => ({ ...prev, editorIds: ids }))}
                    placeholder="Selecionar editores..."
                    emptyMessage="Nenhum editor cadastrado"
                  />
                  {formData.editorIds.length > 1 && (
                    <p className="text-xs text-green-400">
                      ℹ️ O primeiro selecionado será o responsável principal
                    </p>
                  )}
                </div>
              )}

              {/* Data de Captação - Aparece se NÃO for apenas edição */}
              {formData.projectFlow !== 'edition-only' && (
                <div className="space-y-2">
                  <Label htmlFor="captacaoDate">Data de Captação</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="captacaoDate"
                      type="datetime-local"
                      value={formData.captacaoDate}
                      onChange={(e) => updateField('captacaoDate', e.target.value)}
                      className="pl-10 glass border-white/20 focus:border-purple-500/50"
                    />
                  </div>
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
            <EnhancedButton
              type="submit"
              loading={isLoading}
              loadingText="Criando..."
              disabled={!formData.title || !formData.clientId}
              className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
            >
              Criar Projeto
            </EnhancedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
