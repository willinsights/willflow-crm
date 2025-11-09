'use client';

import { useState } from 'react';
import { X, User, Video, MessageSquare, Mail, Phone, Building2, Globe, MapPin } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Client, Project } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import ClientProjectHistory from './ClientProjectHistory';
import ClientCommunication from './ClientCommunication';

interface ClientDetailsModalProps {
  client: Client;
  projects: Project[];
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientDetailsModal({
  client,
  projects,
  isOpen,
  onClose,
}: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  const handleAddCommunication = async (communication: any) => {
    try {
      const response = await fetch(`/api/clients/${client.id}/communications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(communication),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}\n\n${data.communication.subject}`);
        console.log('✅ Comunicação criada:', data.communication);
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar comunicação:', error);
      alert('❌ Erro ao adicionar comunicação');
    }
  };

  const handleAddNote = async (note: any) => {
    try {
      const response = await fetch(`/api/clients/${client.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ ${data.message}`);
        console.log('✅ Nota criada:', data.note);
      } else {
        alert(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar nota:', error);
      alert('❌ Erro ao adicionar nota');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-strong border border-white/20 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl text-gradient mb-2">
                {client.name}
              </DialogTitle>
              <div className="flex items-center gap-2 flex-wrap">
                {client.company && (
                  <Badge variant="outline" className="text-xs">
                    <Building2 className="w-3 h-3 mr-1" />
                    {client.company}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  💰 {formatCurrency(client.totalRevenue)} receita
                </Badge>
                <Badge variant="outline" className="text-xs">
                  📊 {client.projectCount} projetos
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
              <User className="w-4 h-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Projetos
              {projects.filter(p => p.clientId === client.id).length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-purple-500/20">
                  {projects.filter(p => p.clientId === client.id).length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comunicação
              {client.communications && client.communications.length > 0 && (
                <Badge variant="secondary" className="ml-1 bg-purple-500/20">
                  {client.communications.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-4 space-y-4">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contato
                </h3>

                {client.email && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a
                      href={`mailto:${client.email}`}
                      className="text-sm text-purple-400 hover:underline flex items-center gap-2"
                    >
                      <Mail className="w-3 h-3" />
                      {client.email}
                    </a>
                  </div>
                )}

                {client.phone && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Telefone</p>
                    <a
                      href={`tel:${client.phone}`}
                      className="text-sm text-purple-400 hover:underline flex items-center gap-2"
                    >
                      <Phone className="w-3 h-3" />
                      {client.phone}
                    </a>
                  </div>
                )}

                {client.website && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Website</p>
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-purple-400 hover:underline flex items-center gap-2"
                    >
                      <Globe className="w-3 h-3" />
                      {client.website}
                    </a>
                  </div>
                )}

                {client.address && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Endereço</p>
                    <p className="text-sm flex items-start gap-2">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {client.address}
                    </p>
                  </div>
                )}
              </div>

              <div className="glass-card p-4 space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Empresa
                </h3>

                {client.company && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Nome da Empresa</p>
                    <p className="text-sm font-medium">{client.company}</p>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Cliente desde</p>
                  <p className="text-sm font-medium">
                    {new Date(client.createdAt).toLocaleDateString('pt-PT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>

                {client.lastContactDate && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Último Contato</p>
                    <p className="text-sm font-medium">
                      {new Date(client.lastContactDate).toLocaleDateString('pt-PT')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Receita Total</h3>
                <p className="text-2xl font-bold text-green-400">
                  {formatCurrency(client.totalRevenue)}
                </p>
              </div>

              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Custos Totais</h3>
                <p className="text-2xl font-bold text-orange-400">
                  {formatCurrency(client.totalCosts)}
                </p>
              </div>

              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Margem Total</h3>
                <p className="text-2xl font-bold text-purple-400">
                  {formatCurrency(client.totalMargin)}
                </p>
              </div>

              <div className="glass-card p-4 space-y-2">
                <h3 className="text-xs font-semibold text-muted-foreground">Projetos</h3>
                <p className="text-2xl font-bold text-blue-400">
                  {client.projectCount}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/20"
                onClick={() => { if (client.email) window.location.href = `mailto:${client.email}`; }}
                disabled={!client.email}
              >
                <Mail className="w-4 h-4 mr-2" />
                Enviar Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/20"
                onClick={() => { if (client.phone) window.location.href = `tel:${client.phone}`; }}
                disabled={!client.phone}
              >
                <Phone className="w-4 h-4 mr-2" />
                Ligar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="glass border-white/20"
                onClick={() => setActiveTab('communication')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Nova Comunicação
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="mt-4">
            <ClientProjectHistory client={client} projects={projects} />
          </TabsContent>

          <TabsContent value="communication" className="mt-4">
            <ClientCommunication
              client={client}
              onAddCommunication={handleAddCommunication}
              onAddNote={handleAddNote}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
