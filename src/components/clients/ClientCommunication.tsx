'use client';

import { useState } from 'react';
import {
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  Send,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  Edit2,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Client, Communication, CommunicationType, ClientNote } from '@/lib/types';

interface ClientCommunicationProps {
  client: Client;
  onAddCommunication?: (communication: Omit<Communication, 'id' | 'sentAt'>) => void;
  onAddNote?: (note: Omit<ClientNote, 'id' | 'createdAt'>) => void;
}

export default function ClientCommunication({
  client,
  onAddCommunication,
  onAddNote
}: ClientCommunicationProps) {
  const [isAddingCommunication, setIsAddingCommunication] = useState(false);
  const [isAddingNote, setIsAddingNote] = useState(false);

  const [newComm, setNewComm] = useState<{
    type: CommunicationType;
    subject: string;
    content: string;
    status: 'pending' | 'sent' | 'received' | 'completed';
  }>({
    type: 'email',
    subject: '',
    content: '',
    status: 'pending',
  });

  const [newNote, setNewNote] = useState('');

  const communications = client.communications || [];
  const notes = client.notes || [];

  const getCommunicationIcon = (type: CommunicationType) => {
    switch (type) {
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      case 'meeting':
        return <Calendar className="w-4 h-4" />;
      case 'message':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getCommunicationLabel = (type: CommunicationType) => {
    const labels: Record<CommunicationType, string> = {
      email: 'Email',
      phone: 'Telefone',
      meeting: 'Reunião',
      message: 'Mensagem',
      other: 'Outro',
    };
    return labels[type];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-400"><CheckCircle className="w-3 h-3 mr-1" />Concluído</Badge>;
      case 'sent':
        return <Badge className="bg-blue-500/20 text-blue-400"><Send className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'received':
        return <Badge className="bg-purple-500/20 text-purple-400">Recebido</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
    }
  };

  const handleAddCommunication = () => {
    if (!newComm.subject || !onAddCommunication) return;

    onAddCommunication({
      clientId: client.id,
      ...newComm,
    });

    setNewComm({
      type: 'email',
      subject: '',
      content: '',
      status: 'pending',
    });
    setIsAddingCommunication(false);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !onAddNote) return;

    onAddNote({
      clientId: client.id,
      content: newNote,
      createdBy: 'current-user', // TODO: Get from auth context
    });

    setNewNote('');
    setIsAddingNote(false);
  };

  const handleQuickEmail = () => {
    if (client.email) {
      window.location.href = `mailto:${client.email}`;
    }
  };

  const handleQuickCall = () => {
    if (client.phone) {
      window.location.href = `tel:${client.phone}`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="glass border-white/20"
          onClick={handleQuickEmail}
          disabled={!client.email}
        >
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
        <Button
          variant="outline"
          className="glass border-white/20"
          onClick={handleQuickCall}
          disabled={!client.phone}
        >
          <Phone className="w-4 h-4 mr-2" />
          Ligar
        </Button>
        <Button
          variant="outline"
          className="glass border-white/20"
          onClick={() => setIsAddingCommunication(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Comunicação
        </Button>
        <Button
          variant="outline"
          className="glass border-white/20"
          onClick={() => setIsAddingNote(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nota
        </Button>
      </div>

      {/* Add Communication Form */}
      {isAddingCommunication && (
        <Card className="glass-card border-purple-500/30">
          <CardHeader>
            <CardTitle className="text-base">Nova Comunicação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={newComm.type}
                  onValueChange={(value: CommunicationType) =>
                    setNewComm({ ...newComm, type: value })
                  }
                >
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    <SelectItem value="email">📧 Email</SelectItem>
                    <SelectItem value="phone">📞 Telefone</SelectItem>
                    <SelectItem value="meeting">📅 Reunião</SelectItem>
                    <SelectItem value="message">💬 Mensagem</SelectItem>
                    <SelectItem value="other">📄 Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={newComm.status}
                  onValueChange={(value: 'pending' | 'sent' | 'received' | 'completed') =>
                    setNewComm({ ...newComm, status: value })
                  }
                >
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    <SelectItem value="pending">⏱ Pendente</SelectItem>
                    <SelectItem value="sent">📤 Enviado</SelectItem>
                    <SelectItem value="received">📥 Recebido</SelectItem>
                    <SelectItem value="completed">✅ Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={newComm.subject}
                onChange={(e) => setNewComm({ ...newComm, subject: e.target.value })}
                placeholder="Ex: Proposta Comercial, Follow-up Projeto..."
                className="glass border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label>Conteúdo</Label>
              <Textarea
                value={newComm.content}
                onChange={(e) => setNewComm({ ...newComm, content: e.target.value })}
                placeholder="Detalhes da comunicação..."
                rows={4}
                className="glass border-white/20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddCommunication}
                disabled={!newComm.subject}
                className="flex-1 gradient-purple"
              >
                <Send className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingCommunication(false)}
                className="glass border-white/20"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Note Form */}
      {isAddingNote && (
        <Card className="glass-card border-blue-500/30">
          <CardHeader>
            <CardTitle className="text-base">Nova Nota</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nota</Label>
              <Textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicione uma nota sobre este cliente..."
                rows={3}
                className="glass border-white/20"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="flex-1 gradient-purple"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nota
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddingNote(false)}
                className="glass border-white/20"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Communication History */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Histórico de Comunicações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma comunicação registrada</p>
              <p className="text-sm mt-1">
                Clique em "Comunicação" para adicionar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {communications.map((comm) => (
                <div
                  key={comm.id}
                  className="p-4 rounded-lg glass border border-white/10 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        {getCommunicationIcon(comm.type)}
                      </div>
                      <div>
                        <p className="font-medium">{comm.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {getCommunicationLabel(comm.type)} • {new Date(comm.sentAt).toLocaleDateString('pt-PT')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(comm.status)}
                    </div>
                  </div>
                  {comm.content && (
                    <p className="text-sm text-muted-foreground pl-12">
                      {comm.content}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Notas Internas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Nenhuma nota registrada</p>
              <p className="text-sm mt-1">
                Clique em "Nota" para adicionar observações
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg glass border border-white/10"
                >
                  <p className="text-sm mb-2">{note.content}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Por: {note.createdBy}</span>
                    <span>{new Date(note.createdAt).toLocaleDateString('pt-PT')}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
