'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, User, Mail, Shield, Video, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usersApi } from '@/lib/api';
import { User as UserType, UserRole } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'freelancer_captacao' as UserRole,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersApi.list();
      if (response.success) {
        setUsers(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingUser) {
        // Atualizar
        await usersApi.update(editingUser.id, formData);
      } else {
        // Criar
        await usersApi.create(formData);
      }

      await loadUsers();
      resetForm();
      setShowModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar colaborador');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este colaborador?')) return;

    try {
      await usersApi.delete(id);
      await loadUsers();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao deletar colaborador');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setEditingUser(null);
    setShowModal(true);
  };

  const openEditModal = (user: UserType) => {
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'freelancer_captacao',
    });
    setEditingUser(null);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Admin</Badge>;
      case 'freelancer_captacao':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Freelancer Captação</Badge>;
      case 'editor_edicao':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Editor Edição</Badge>;
    }
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'freelancer_captacao':
        return <Video className="w-4 h-4 text-blue-400" />;
      case 'editor_edicao':
        return <Edit3 className="w-4 h-4 text-green-400" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando colaboradores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Colaboradores</h1>
          <p className="text-muted-foreground">
            Gestão de freelancers e editores
          </p>
        </div>
        <Button
          onClick={openCreateModal}
          className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Colaborador
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Colaboradores
            </CardTitle>
            <User className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Freelancers Captação
            </CardTitle>
            <Video className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'freelancer_captacao').length}
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Editores Edição
            </CardTitle>
            <Edit3 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'editor_edicao').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="glass-card group hover:scale-105 transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRoleIcon(user.role)}
                  <div className="flex-1">
                    <CardTitle className="text-base">{user.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(user)}
                    className="hover:bg-white/10"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {user.role !== 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="hover:bg-red-500/20 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {getRoleBadge(user.role)}
            </CardContent>
          </Card>
        ))}

        {users.length === 0 && (
          <div className="col-span-full glass-card p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Nenhum colaborador cadastrado</p>
            <Button
              onClick={openCreateModal}
              variant="outline"
              className="glass border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro colaborador
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glass-strong border border-white/20">
          <DialogHeader>
            <DialogTitle className="text-gradient">
              {editingUser ? 'Editar Colaborador' : 'Novo Colaborador'}
            </DialogTitle>
            <DialogDescription>
              Preencha os dados do colaborador
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do colaborador"
                  className="pl-10 glass border-white/20 focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.pt"
                  className="pl-10 glass border-white/20 focus:border-purple-500/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Tipo de Colaborador *</Label>
              <Select
                value={formData.role}
                onValueChange={(value: UserRole) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger className="glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border border-white/20">
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      Admin
                    </div>
                  </SelectItem>
                  <SelectItem value="freelancer_captacao">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-400" />
                      Freelancer Captação
                    </div>
                  </SelectItem>
                  <SelectItem value="editor_edicao">
                    <div className="flex items-center gap-2">
                      <Edit3 className="w-4 h-4 text-green-400" />
                      Editor Edição
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowModal(false)}
                className="glass border border-white/20"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
              >
                {editingUser ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
