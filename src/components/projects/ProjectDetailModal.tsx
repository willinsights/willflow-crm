'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Calendar,
  MapPin,
  ExternalLink,
  Euro,
  User,
  FileText,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Project, ProjectPhase } from '@/lib/types';
import { videoTypeLabels, statusLabels } from '@/lib/data';
import { formatCurrency } from '@/lib/utils';
import { useAppStore } from '@/lib/useAppStore';

interface ProjectDetailModalProps {
  project: Project | null;
  phase: ProjectPhase;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ProjectDetailModal({
  project,
  phase,
  open,
  onOpenChange,
}: ProjectDetailModalProps) {
  const { userPermissions } = useAppStore();

  if (!project) return null;

  const currentStatus = phase === 'captacao' ? project.statusCaptacao : project.statusEdicao;
  const responsavel = phase === 'captacao' ? project.responsavelCaptacao : project.responsavelEdicao;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {project.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              {videoTypeLabels[project.videoType]}
            </Badge>
            {currentStatus && (
              <Badge className="text-xs">
                {statusLabels[currentStatus]}
              </Badge>
            )}
            {project.category && (
              <Badge variant="secondary" className="text-xs">
                {project.category.name}
              </Badge>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Client Info */}
          {project.client && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Cliente
              </h3>
              <div className="glass-card p-4">
                <p className="text-sm font-medium">{project.client.name}</p>
                {project.client.email && (
                  <p className="text-xs text-muted-foreground">{project.client.email}</p>
                )}
              </div>
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Descrição
              </h3>
              <div className="glass-card p-4">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {project.description}
                </p>
              </div>
            </div>
          )}

          {/* Location */}
          {project.location && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Localização
              </h3>
              <div className="glass-card p-4">
                <p className="text-sm">{project.location}</p>
              </div>
            </div>
          )}

          {/* Responsible Person */}
          {responsavel && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Responsável
              </h3>
              <div className="glass-card p-4 flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-sm">
                    {responsavel.name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{responsavel.name}</p>
                  <p className="text-xs text-muted-foreground">{responsavel.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Datas
            </h3>
            <div className="glass-card p-4 space-y-3">
              {project.clientDueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prazo Cliente:</span>
                  <span className="text-sm font-medium">
                    {new Date(project.clientDueDate).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              )}
              {project.freelancerDueDate && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Prazo Freelancer:</span>
                  <span className="text-sm font-medium">
                    {new Date(project.freelancerDueDate).toLocaleDateString('pt-PT')}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Criado em:</span>
                <span className="text-sm font-medium">
                  {new Date(project.createdAt).toLocaleDateString('pt-PT')}
                </span>
              </div>
            </div>
          </div>

          {/* Financial Info - Only for users with permission */}
          {userPermissions.canViewFinance && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Euro className="w-4 h-4" />
                Informações Financeiras
              </h3>
              <div className="glass-card p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Preço Cliente:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(project.clientPrice)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Custo Captação:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(project.captationCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Custo Edição:</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(project.editionCost)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <span className="text-sm font-semibold">Margem:</span>
                  <span className={`text-sm font-bold ${project.margin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {formatCurrency(project.margin)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Links */}
          {(project.nasLink || project.frameIoLink) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Links
              </h3>
              <div className="glass-card p-4 flex gap-3">
                {project.nasLink && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="glass border-white/20"
                    asChild
                  >
                    <a href={project.nasLink} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      NAS
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
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Frame.io
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Subtasks */}
          {project.subtasks && project.subtasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Subtarefas ({project.subtasks.filter(s => s.completed).length}/{project.subtasks.length})
              </h3>
              <div className="glass-card p-4 space-y-2">
                {project.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-start gap-2">
                    <CheckCircle
                      className={`w-4 h-4 mt-0.5 ${
                        subtask.completed ? 'text-green-400' : 'text-muted-foreground'
                      }`}
                    />
                    <span className={`text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
