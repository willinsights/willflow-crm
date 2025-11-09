'use client';

import { useState } from 'react';
import { Plus, Trash2, Euro, CheckCircle, Circle, Edit2, Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BudgetItem, BudgetCategory } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

interface ProjectBudgetProps {
  projectId: string;
  items: BudgetItem[];
  captationCost: number;
  editionCost: number;
  clientPrice: number;
  onAddItem?: (item: Omit<BudgetItem, 'id' | 'projectId' | 'createdAt'>) => void;
  onUpdateItem?: (itemId: string, updates: Partial<BudgetItem>) => void;
  onDeleteItem?: (itemId: string) => void;
}

const budgetCategories: { value: BudgetCategory; label: string; icon: string }[] = [
  { value: 'equipamento', label: 'Equipamento', icon: '📹' },
  { value: 'equipe', label: 'Equipe', icon: '👥' },
  { value: 'locacao', label: 'Locação', icon: '📍' },
  { value: 'transporte', label: 'Transporte', icon: '🚗' },
  { value: 'alimentacao', label: 'Alimentação', icon: '🍔' },
  { value: 'pos-producao', label: 'Pós-Produção', icon: '✂️' },
  { value: 'outros', label: 'Outros', icon: '📦' },
];

export default function ProjectBudget({
  projectId,
  items = [],
  captationCost,
  editionCost,
  clientPrice,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
}: ProjectBudgetProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    category: 'equipamento' as BudgetCategory,
    description: '',
    quantity: 1,
    unitPrice: 0,
    phase: 'captacao' as 'captacao' | 'edicao',
    isPaid: false,
  });

  const [editValues, setEditValues] = useState<Partial<BudgetItem>>({});

  // Calculate totals
  const captacaoItems = items.filter(item => item.phase === 'captacao');
  const edicaoItems = items.filter(item => item.phase === 'edicao');

  const captacaoTotal = captacaoItems.reduce((sum, item) => sum + item.total, 0);
  const edicaoTotal = edicaoItems.reduce((sum, item) => sum + item.total, 0);
  const grandTotal = captacaoTotal + edicaoTotal;

  const captacaoPaid = captacaoItems.filter(i => i.isPaid).reduce((sum, item) => sum + item.total, 0);
  const edicaoPaid = edicaoItems.filter(i => i.isPaid).reduce((sum, item) => sum + item.total, 0);
  const totalPaid = captacaoPaid + edicaoPaid;

  const handleAddItem = () => {
    if (!onAddItem || !newItem.description) return;

    const total = newItem.quantity * newItem.unitPrice;
    onAddItem({
      ...newItem,
      total,
    });

    setNewItem({
      category: 'equipamento',
      description: '',
      quantity: 1,
      unitPrice: 0,
      phase: 'captacao',
      isPaid: false,
    });
    setIsAdding(false);
  };

  const handleStartEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setEditValues(item);
  };

  const handleSaveEdit = () => {
    if (!editingId || !onUpdateItem) return;

    const total = (editValues.quantity || 1) * (editValues.unitPrice || 0);
    onUpdateItem(editingId, { ...editValues, total });
    setEditingId(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const getCategoryInfo = (category: BudgetCategory) => {
    return budgetCategories.find(c => c.value === category) || budgetCategories[0];
  };

  const renderBudgetSection = (phase: 'captacao' | 'edicao', phaseitems: BudgetItem[], total: number, paid: number) => (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{phase === 'captacao' ? '🎥 Captação' : '✂️ Edição'}</span>
          <div className="flex items-center gap-4 text-sm">
            <div className="text-muted-foreground">
              Pago: {formatCurrency(paid)} / {formatCurrency(total)}
            </div>
            <Badge variant={paid >= total ? 'default' : 'outline'} className="bg-purple-500/20">
              {formatCurrency(total)}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {phaseitems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum item de orçamento nesta fase
            </p>
          ) : (
            phaseitems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg glass border border-white/10"
              >
                {editingId === item.id ? (
                  // Edit Mode
                  <>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <Input
                        value={editValues.description || ''}
                        onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                        className="glass border-white/20"
                        placeholder="Descrição"
                      />
                      <Input
                        type="number"
                        value={editValues.quantity || 1}
                        onChange={(e) => setEditValues({ ...editValues, quantity: Number(e.target.value) })}
                        className="glass border-white/20"
                        placeholder="Qtd"
                      />
                      <Input
                        type="number"
                        value={editValues.unitPrice || 0}
                        onChange={(e) => setEditValues({ ...editValues, unitPrice: Number(e.target.value) })}
                        className="glass border-white/20"
                        placeholder="Preço Unit."
                      />
                      <div className="text-sm font-medium">
                        {formatCurrency((editValues.quantity || 1) * (editValues.unitPrice || 0))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveEdit}
                      className="text-green-400"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="text-red-400"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => onUpdateItem?.(item.id, { isPaid: !item.isPaid })}>
                      {item.isPaid ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getCategoryInfo(item.category).icon}</span>
                        <div>
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x {formatCurrency(item.unitPrice)} • {getCategoryInfo(item.category).label}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-medium">{formatCurrency(item.total)}</p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStartEdit(item)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>

                    {onDeleteItem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(item.id)}
                        className="h-8 w-8 p-0 text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Preço Cliente</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(clientPrice)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Custo Total</p>
            <p className="text-2xl font-bold text-orange-400">{formatCurrency(grandTotal)}</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Margem</p>
            <p className="text-2xl font-bold text-purple-400">
              {formatCurrency(clientPrice - grandTotal)}
            </p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Total Pago</p>
            <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Add Item Button */}
      {!isAdding && onAddItem && (
        <Button
          onClick={() => setIsAdding(true)}
          className="w-full gradient-purple"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Item de Orçamento
        </Button>
      )}

      {/* Add Item Form */}
      {isAdding && (
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle>Novo Item de Orçamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Fase</Label>
                <Select
                  value={newItem.phase}
                  onValueChange={(value: 'captacao' | 'edicao') =>
                    setNewItem({ ...newItem, phase: value })
                  }
                >
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    <SelectItem value="captacao">🎥 Captação</SelectItem>
                    <SelectItem value="edicao">✂️ Edição</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value: BudgetCategory) =>
                    setNewItem({ ...newItem, category: value })
                  }
                >
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    {budgetCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Ex: Câmera Sony A7S III, Editor Freelance, etc."
                className="glass border-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                  className="glass border-white/20"
                />
              </div>

              <div className="space-y-2">
                <Label>Preço Unitário (€)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.unitPrice}
                  onChange={(e) => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
                  className="glass border-white/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/20">
              <span className="text-sm font-medium">Total:</span>
              <span className="text-xl font-bold text-purple-400">
                {formatCurrency(newItem.quantity * newItem.unitPrice)}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddItem}
                disabled={!newItem.description}
                className="flex-1 gradient-purple"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAdding(false)}
                className="glass border-white/20"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Sections */}
      <div className="space-y-4">
        {renderBudgetSection('captacao', captacaoItems, captacaoTotal, captacaoPaid)}
        {renderBudgetSection('edicao', edicaoItems, edicaoTotal, edicaoPaid)}
      </div>

      {/* Comparison with Original Costs */}
      {(captationCost > 0 || editionCost > 0) && (
        <Card className="glass-card border-yellow-500/30">
          <CardHeader>
            <CardTitle className="text-base">⚠️ Comparação com Custos Originais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo Captação Original:</span>
                <span>{formatCurrency(captationCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo Captação Detalhado:</span>
                <span className={captacaoTotal > captationCost ? 'text-red-400' : 'text-green-400'}>
                  {formatCurrency(captacaoTotal)}
                </span>
              </div>
              <div className="h-px bg-white/10 my-2" />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo Edição Original:</span>
                <span>{formatCurrency(editionCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Custo Edição Detalhado:</span>
                <span className={edicaoTotal > editionCost ? 'text-red-400' : 'text-green-400'}>
                  {formatCurrency(edicaoTotal)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
