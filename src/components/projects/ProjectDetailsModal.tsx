'use client';

import { useState } from 'react';
import { X, FileText, Euro, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Project } from '@/lib/types';
import ProjectFiles from './ProjectFiles';
import ProjectBudget from './ProjectBudget';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface ProjectDetailsModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProjectDetailsModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  const handleUploadFile = async (file: File, description: string) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('description', description);

      const response = await fetch(`/api/projects/${project.id}/files`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}\n\nArquivo: ${data.file.name}\nTamanho: ${(data.file.size / 1024).toFixed(2)} KB`);
        console.log('✅ Arquivo uploaded:', data.file);
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('❌ Erro ao fazer upload do arquivo');
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Tem certeza que deseja deletar este arquivo?')) {
      try {
        const response = await fetch(`/api/projects/${project.id}/files?fileId=${fileId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          alert(`✅ ${data.message}`);
          console.log('✅ Arquivo deletado:', fileId);
        } else {
          alert(`❌ Erro: ${data.error}`);
        }
      } catch (error) {
        console.error('Erro ao deletar arquivo:', error);
        alert('❌ Erro ao deletar arquivo');
      }
    }
  };

  const handleAddBudgetItem = async (item: any) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}\n\n${data.budgetItem.description}\nTotal: €${data.budgetItem.total.toFixed(2)}`);
        console.log('✅ Budget item criado:', data.budgetItem);
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar item de orçamento:', error);
      alert('❌ Erro ao adicionar item de orçamento');
    }
  };

  const handleUpdateBudgetItem = async (itemId: string, updates: any) => {
    try {
      const response = await fetch(`/api/projects/${project.id}/budget?itemId=${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        console.log('✅ Budget item atualizado:', itemId);
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar item de orçamento:', error);
      alert('❌ Erro ao atualizar item de orçamento');
    }
  };

  const handleDeleteBudgetItem = async (itemId: string) => {
    if (confirm('Tem certeza que deseja deletar este item?')) {
      try {
        const response = await fetch(`/api/projects/${project.id}/budget?itemId=${itemId}`, {
          method: 'DELETE',
        });

        const data = await response.json();

        if (data.success) {
          alert(`✅ ${data.message}`);
          console.log('✅ Budget item deletado:', itemId);
        } else {
          alert(`❌ Erro: ${data.error}`);
        }
      } catch (error) {
        console.error('Erro ao deletar item de orçamento:', error);
        alert('❌ Erro ao deletar item de orçamento');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-strong border border-white/20 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl text-gradient mb-2">
                {project.title}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {project.client && (
                  <Badge variant="outline" className="text-xs">
                    👤 {project.client.name}
                  </Badge>
                )}
                {project.category && (
                  <Badge
                    variant="outline"
                    className="text-xs"
                    style={{ borderColor: project.category.color }}
                  >
                    <div
                      className="w-2 h-2 rounded-full mr-1"
                      style={{ backgroundColor: project.category.color }}
                    />
                    {project.category.name}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  💰 {formatCurrency(project.clientPrice)}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="files" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Arquivos
              {project.files && project.files.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-purple-500/20">
                  {project.files.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="budget" className="flex items-center gap-2">
              <Euro className="w-4 h-4" />
              Orçamento
              {project.budgetItems && project.budgetItems.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-purple-500/20">
                  {project.budgetItems.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Fase Atual</h3>
                <p className="text-lg font-medium capitalize">{project.phase}</p>
              </div>

              <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Status</h3>
                <p className="text-lg font-medium">
                  {project.statusCaptacao || project.statusEdicao || 'N/A'}
                </p>
              </div>

              {project.location && (
                <div className="glass-card p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">Localização</h3>
                  <p className="text-lg font-medium">{project.location}</p>
                </div>
              )}

              {project.clientDueDate && (
                <div className="glass-card p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground">Prazo Entrega</h3>
                  <p className="text-lg font-medium">
                    {new Date(project.clientDueDate).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              )}
            </div>

            {project.description && (
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Descrição</h3>
                <p className="text-sm">{project.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Preço Cliente</h3>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(project.clientPrice)}
                </p>
              </div>

              <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Custo Total</h3>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(project.captationCost + project.editionCost)}
                </p>
              </div>

              <div className="glass-card p-4 space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground">Margem</h3>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(project.margin)}
                </p>
              </div>
            </div>

            {(project.nasLink || project.frameIoLink) && (
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Links</h3>
                <div className="flex gap-2">
                  {project.nasLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20"
                      asChild
                    >
                      <a href={project.nasLink} target="_blank" rel="noopener noreferrer">
                        📁 NAS
                      </a>
                    </Button>
                  )}
                  {project.frameIoLink && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="glass border-white/20"
                      asChild
                    >
                      <a href={project.frameIoLink} target="_blank" rel="noopener noreferrer">
                        🎬 Frame.io
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="mt-4">
            <ProjectFiles
              projectId={project.id}
              files={project.files || []}
              onUpload={handleUploadFile}
              onDelete={handleDeleteFile}
            />
          </TabsContent>

          <TabsContent value="budget" className="mt-4">
            <ProjectBudget
              projectId={project.id}
              items={project.budgetItems || []}
              captationCost={project.captationCost}
              editionCost={project.editionCost}
              clientPrice={project.clientPrice}
              onAddItem={handleAddBudgetItem}
              onUpdateItem={handleUpdateBudgetItem}
              onDeleteItem={handleDeleteBudgetItem}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
