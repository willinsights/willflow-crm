'use client';

import { useState, useEffect } from 'react';
import { Plus, Building2, Mail, Phone, User } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/lib/useAppStore';
import { Client } from '@/lib/types';

interface CreateClientModalProps {
  client?: Client | null;
  onClose?: () => void;
}

export default function CreateClientModal({ client, onClose }: CreateClientModalProps) {
  const { createClient, updateClient } = useAppStore();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  // Preencher form quando estiver editando
  useEffect(() => {
    if (client && open) {
      setFormData({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        company: client.company || '',
      });
    } else if (!open) {
      // Reset ao fechar
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
      });
    }
  }, [client, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (client) {
        // Editar cliente existente
        await updateClient(client.id, formData);
      } else {
        // Criar novo cliente
        await createClient(formData);
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
      });

      setOpen(false);
      if (onClose) onClose();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      alert('Erro ao salvar cliente: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
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
        {client ? (
          <Button variant="ghost" size="sm" className="w-full justify-start">
            Editar
          </Button>
        ) : (
          <Button className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-strong border border-white/20 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-gradient">
            {client ? 'Editar Cliente' : 'Criar Novo Cliente'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados do cliente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="Nome do cliente"
                className="pl-10 glass border-white/20 focus:border-purple-500/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="cliente@exemplo.pt"
                className="pl-10 glass border-white/20 focus:border-purple-500/50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+351 xxx xxx xxx"
                className="pl-10 glass border-white/20 focus:border-purple-500/50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Empresa</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => updateField('company', e.target.value)}
                placeholder="Nome da empresa"
                className="pl-10 glass border-white/20 focus:border-purple-500/50"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="glass border-white/20"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="gradient-purple hover:gradient-purple-hover text-white"
            >
              {isLoading ? 'Salvando...' : (client ? 'Atualizar' : 'Criar Cliente')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
