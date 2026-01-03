'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Edit, Trash2, User, Mail, Shield, Video, Edit3, Camera, Film,
  CreditCard, Building2, FileText, Lock, Eye, EyeOff, RefreshCw, Key,
  CheckCircle, AlertCircle, Power, TrendingUp, Target, Clock, Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usersApi } from '@/lib/api';
import { useAppStore } from '@/lib/useAppStore';
import { useLocale } from '@/lib/LocaleContext';
import { User as UserType, UserRole, CollaboratorType, ContributorType } from '@/lib/types';

export default function UsersPage() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { projects } = useAppStore();
  const { formatCurrency } = useLocale();

  // Calculate performance metrics for each user
  const userMetrics = useMemo(() => {
    const metrics: Record<string, {
      projectCount: number;
      completedProjects: number;
      activeProjects: number;
      totalRevenue: number;
      totalMargin: number;
      avgCompletionRate: number;
      onTimeDelivery: number;
    }> = {};

    users.forEach(user => {
      const userProjects = projects.filter(
        p => p.responsavelCaptacaoId === user.id || p.responsavelEdicaoId === user.id
      );

      const completed = userProjects.filter(p => p.phase === 'finalizados');
      const active = userProjects.filter(p => p.phase !== 'finalizados');

      // Calculate on-time delivery rate
      const projectsWithDeadline = completed.filter(p => p.clientDueDate);
      const onTimeProjects = projectsWithDeadline.filter(p => {
        if (!p.clientDueDate || !p.updatedAt) return true;
        return new Date(p.updatedAt) <= new Date(p.clientDueDate);
      });

      const onTimeRate = projectsWithDeadline.length > 0
        ? (onTimeProjects.length / projectsWithDeadline.length) * 100
        : 100;

      const totalRevenue = userProjects.reduce((sum, p) => sum + p.clientPrice, 0);
      const totalMargin = userProjects.reduce((sum, p) => sum + p.margin, 0);

      metrics[user.id] = {
        projectCount: userProjects.length,
        completedProjects: completed.length,
        activeProjects: active.length,
        totalRevenue,
        totalMargin,
        avgCompletionRate: userProjects.length > 0
          ? (completed.length / userProjects.length) * 100
          : 0,
        onTimeDelivery: onTimeRate,
      };
    });

    return metrics;
  }, [users, projects]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'freelancer_captacao' as UserRole,
    collaboratorType: '' as CollaboratorType | '',
    iban: '',
    bankName: '',
    nif: '',
    contributorType: '' as ContributorType | '',
    isActive: true,
  });

  useEffect(() => {
    loadUsers();
  }, []);

  // Auto-hide success message
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

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
      const dataToSend = {
        ...formData,
        collaboratorType: formData.collaboratorType || undefined,
        contributorType: formData.contributorType || undefined,
        iban: formData.iban || undefined,
        bankName: formData.bankName || undefined,
        nif: formData.nif || undefined,
        password: formData.password || undefined, // Só envia se preenchido
      };

      if (editingUser) {
        await usersApi.update(editingUser.id, dataToSend);
        setSuccessMessage('Colaborador atualizado com sucesso!');
      } else {
        const result = await usersApi.create(dataToSend);
        if (result.success) {
          setSuccessMessage(
            formData.password
              ? 'Colaborador criado com sucesso! Email de boas-vindas enviado.'
              : 'Colaborador criado! Senha gerada e enviada por email.'
          );
        }
      }
      await loadUsers();
      resetForm();
      setShowModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao salvar colaborador');
    }
  };

  const handleResetPassword = async (user: UserType) => {
    if (!confirm(`Resetar a senha de ${user.name}?\n\nUma nova senha será gerada e enviada para ${user.email}`)) {
      return;
    }

    setResetPasswordLoading(user.id);
    try {
      await usersApi.update(user.id, { resetPassword: true } as any);
      setSuccessMessage(`Nova senha enviada para ${user.email}`);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao resetar senha');
    } finally {
      setResetPasswordLoading(null);
    }
  };

  const handleToggleActive = async (user: UserType) => {
    try {
      await usersApi.update(user.id, { isActive: !user.isActive });
      await loadUsers();
      setSuccessMessage(
        user.isActive
          ? `Acesso de ${user.name} desativado`
          : `Acesso de ${user.name} ativado`
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao alterar status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar este colaborador?')) return;
    try {
      await usersApi.delete(id);
      await loadUsers();
      setSuccessMessage('Colaborador removido com sucesso');
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
      password: '', // Não mostrar senha existente
      role: user.role,
      collaboratorType: user.collaboratorType || '',
      iban: user.iban || '',
      bankName: user.bankName || '',
      nif: user.nif || '',
      contributorType: user.contributorType || '',
      isActive: user.isActive !== false,
    });
    setEditingUser(user);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'freelancer_captacao',
      collaboratorType: '',
      iban: '',
      bankName: '',
      nif: '',
      contributorType: '',
      isActive: true,
    });
    setEditingUser(null);
    setShowPassword(false);
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
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

  const getCollaboratorTypeLabel = (type?: CollaboratorType) => {
    switch (type) {
      case 'photographer': return 'Fotógrafo';
      case 'filmmaker': return 'Filmmaker';
      case 'both': return 'Fotógrafo + Filmmaker';
      default: return null;
    }
  };

  const getContributorTypeLabel = (type?: ContributorType) => {
    switch (type) {
      case 'company': return 'Empresa';
      case 'receipts': return 'Recibos Verdes';
      case 'freelancer': return 'Freelancer';
      case 'other': return 'Outro';
      default: return null;
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
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 p-4 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center gap-3 shadow-lg animate-in slide-in-from-top-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <span className="text-green-400">{successMessage}</span>
          <button onClick={() => setSuccessMessage(null)} className="text-green-400 hover:text-green-300">
            ×
          </button>
        </div>
      )}

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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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

        <Card className="stat-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ativos
            </CardTitle>
            <Power className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.isActive !== false).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card
            key={user.id}
            className={`glass-card group hover:scale-105 transition-all duration-200 ${
              user.isActive === false ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRoleIcon(user.role)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">{user.name}</CardTitle>
                      {user.isActive === false && (
                        <Badge variant="outline" className="text-xs border-red-500/30 text-red-400">
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditModal(user)}
                    className="hover:bg-white/10"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResetPassword(user)}
                    className="hover:bg-yellow-500/20 text-yellow-400"
                    disabled={resetPasswordLoading === user.id}
                    title="Resetar Senha"
                  >
                    {resetPasswordLoading === user.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                  </Button>
                  {user.role !== 'admin' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      className="hover:bg-red-500/20 text-red-400"
                      title="Deletar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {getRoleBadge(user.role)}
                {user.collaboratorType && (
                  <Badge variant="outline" className="text-xs">
                    {getCollaboratorTypeLabel(user.collaboratorType)}
                  </Badge>
                )}
              </div>
              {/* Performance Metrics */}
              {userMetrics[user.id] && userMetrics[user.id].projectCount > 0 && (
                <TooltipProvider>
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Projetos</span>
                      <span className="font-medium">
                        {userMetrics[user.id].completedProjects}/{userMetrics[user.id].projectCount}
                      </span>
                    </div>
                    <Progress
                      value={userMetrics[user.id].avgCompletionRate}
                      className="h-1.5"
                    />
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1 p-1.5 rounded glass text-center cursor-help">
                            <div className="text-xs font-bold text-green-400">
                              {formatCurrency(userMetrics[user.id].totalMargin)}
                            </div>
                            <div className="text-[10px] text-muted-foreground">Margem</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Margem total gerada</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex-1 p-1.5 rounded glass text-center cursor-help">
                            <div className={`text-xs font-bold ${
                              userMetrics[user.id].onTimeDelivery >= 80 ? 'text-green-400' :
                              userMetrics[user.id].onTimeDelivery >= 60 ? 'text-yellow-400' :
                              'text-red-400'
                            }`}>
                              {userMetrics[user.id].onTimeDelivery.toFixed(0)}%
                            </div>
                            <div className="text-[10px] text-muted-foreground">No prazo</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Taxa de entregas no prazo</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </TooltipProvider>
              )}

              {(user.nif || user.iban) && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-white/10">
                  {user.nif && (
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      NIF: {user.nif}
                    </div>
                  )}
                  {user.iban && (
                    <div className="flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      IBAN: {user.iban.slice(0, 8)}...
                    </div>
                  )}
                </div>
              )}
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
        <DialogContent className="glass-strong border border-white/20 max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient">
              {editingUser ? 'Editar Colaborador' : 'Novo Colaborador'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Atualize os dados do colaborador'
                : 'Preencha os dados do novo colaborador. Um email com as credenciais será enviado automaticamente.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-4">
                <TabsTrigger value="basic">Básicos</TabsTrigger>
                <TabsTrigger value="access">Acesso</TabsTrigger>
                <TabsTrigger value="financial">Bancários</TabsTrigger>
                <TabsTrigger value="fiscal">Fiscais</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
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
                  <Label htmlFor="email">Email de Login *</Label>
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
                  <p className="text-xs text-muted-foreground">
                    Este será o email usado para login no sistema
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Função *</Label>
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

                {/* Tipo de Colaborador - só para freelancer_captacao */}
                {formData.role === 'freelancer_captacao' && (
                  <div className="space-y-2">
                    <Label htmlFor="collaboratorType">Tipo de Colaborador</Label>
                    <Select
                      value={formData.collaboratorType}
                      onValueChange={(value: CollaboratorType) => setFormData({ ...formData, collaboratorType: value })}
                    >
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border border-white/20">
                        <SelectItem value="photographer">
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-cyan-400" />
                            Fotógrafo
                          </div>
                        </SelectItem>
                        <SelectItem value="filmmaker">
                          <div className="flex items-center gap-2">
                            <Film className="w-4 h-4 text-orange-400" />
                            Filmmaker
                          </div>
                        </SelectItem>
                        <SelectItem value="both">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-purple-400" />
                            Fotógrafo + Filmmaker
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="access" className="space-y-4">
                {!editingUser ? (
                  <>
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <div className="flex items-start gap-3">
                        <Key className="w-5 h-5 text-purple-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-purple-400 font-medium">Credenciais de Acesso</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Clique em "Gerar Senha" para criar uma senha automática.
                            A senha será visível para você copiar e enviar ao colaborador.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Password Generator - Prominent */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-base font-medium">Senha do Utilizador</Label>
                        <Button
                          type="button"
                          onClick={generateRandomPassword}
                          className="gradient-purple hover:gradient-purple-hover text-white shadow-glow-sm"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Gerar Senha Automática
                        </Button>
                      </div>

                      {/* Password Display - Always Visible */}
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type="text"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          placeholder="Digite ou gere uma senha"
                          className="pl-10 pr-12 glass border-white/20 focus:border-purple-500/50 font-mono text-base"
                        />
                        {formData.password && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              navigator.clipboard.writeText(formData.password);
                              setSuccessMessage('Senha copiada!');
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 px-2 text-xs text-purple-400 hover:text-purple-300"
                          >
                            Copiar
                          </Button>
                        )}
                      </div>

                      {/* Password Preview Box */}
                      {formData.password && (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-green-400 font-medium mb-1">Senha Gerada (Visível)</p>
                              <p className="font-mono text-lg text-white font-bold tracking-wider">
                                {formData.password}
                              </p>
                            </div>
                            <CheckCircle className="w-6 h-6 text-green-400" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            Guarde esta senha! Ela será enviada por email ao colaborador.
                          </p>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Mínimo 8 caracteres. A senha será enviada por email ao criar o utilizador.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Existing user edit controls - keep the same */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg glass border border-white/10">
                        <div className="flex items-center gap-3">
                          <Power className={`w-5 h-5 ${formData.isActive ? 'text-green-400' : 'text-red-400'}`} />
                          <div>
                            <p className="text-sm font-medium">Conta Ativa</p>
                            <p className="text-xs text-muted-foreground">
                              {formData.isActive
                                ? 'O utilizador pode fazer login no sistema'
                                : 'O utilizador não pode fazer login'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          checked={formData.isActive}
                          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                        />
                      </div>

                      <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <div className="flex items-start gap-3">
                          <Key className="w-5 h-5 text-yellow-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-yellow-400 font-medium">Resetar Senha</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Uma nova senha será gerada e enviada para o email do utilizador.
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => editingUser && handleResetPassword(editingUser)}
                              className="mt-3 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                              disabled={resetPasswordLoading === editingUser?.id}
                            >
                              {resetPasswordLoading === editingUser?.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Mail className="w-4 h-4 mr-2" />
                                  Enviar Nova Senha
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {editingUser?.mustChangePassword && (
                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                          <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-orange-400" />
                            <p className="text-sm text-orange-400">
                              Utilizador precisa alterar a senha no próximo login
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="financial" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN / Conta Bancária</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="iban"
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      placeholder="PT50 0000 0000 0000 0000 0000 0"
                      className="pl-10 glass border-white/20 focus:border-purple-500/50"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Utilizado para pagamentos ao colaborador
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Nome do Banco</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="bankName"
                      value={formData.bankName}
                      onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                      placeholder="Ex: Millennium BCP, Santander..."
                      className="pl-10 glass border-white/20 focus:border-purple-500/50"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nif">NIF / CPF</Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="nif"
                      value={formData.nif}
                      onChange={(e) => setFormData({ ...formData, nif: e.target.value })}
                      placeholder="Número de identificação fiscal"
                      className="pl-10 glass border-white/20 focus:border-purple-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contributorType">Tipo de Contribuinte</Label>
                  <Select
                    value={formData.contributorType}
                    onValueChange={(value: ContributorType) => setFormData({ ...formData, contributorType: value })}
                  >
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border border-white/20">
                      <SelectItem value="company">Empresa</SelectItem>
                      <SelectItem value="receipts">Recibos Verdes</SelectItem>
                      <SelectItem value="freelancer">Freelancer</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Define como o colaborador emite documentos fiscais
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
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
                {editingUser ? 'Atualizar' : 'Criar e Enviar Credenciais'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
