'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Save,
  RotateCcw,
  Check,
  X,
  Euro,
  FolderOpen,
  Users,
  FileText,
  Settings,
  Eye,
  Edit3,
  Plus,
  Trash2,
  Download,
  MessageSquare,
  Image,
  Tag,
  Columns,
  Lock,
  Unlock,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UserRole } from '@/lib/types';
import { PermissionConfig, ROLE_PERMISSIONS } from '@/lib/permissions';

// Permission categories for organization
const PERMISSION_CATEGORIES = [
  {
    id: 'financial',
    label: 'Financeiro',
    icon: Euro,
    color: 'text-green-400',
    permissions: [
      { key: 'canViewClientPrices', label: 'Ver preços do cliente', description: 'Visualizar valores cobrados aos clientes' },
      { key: 'canViewCosts', label: 'Ver custos', description: 'Visualizar custos de captação e edição' },
      { key: 'canViewMargins', label: 'Ver margens', description: 'Visualizar margem de lucro dos projetos' },
      { key: 'canViewAllFinancials', label: 'Ver todos financeiros', description: 'Acesso completo a dados financeiros' },
    ],
  },
  {
    id: 'projects',
    label: 'Projetos',
    icon: FolderOpen,
    color: 'text-purple-400',
    permissions: [
      { key: 'canViewAllProjects', label: 'Ver todos projetos', description: 'Visualizar projetos de todos os utilizadores' },
      { key: 'canViewOwnProjects', label: 'Ver próprios projetos', description: 'Visualizar apenas projetos atribuídos' },
      { key: 'canEditAllProjects', label: 'Editar todos projetos', description: 'Modificar qualquer projeto' },
      { key: 'canEditOwnProjects', label: 'Editar próprios projetos', description: 'Modificar projetos atribuídos' },
      { key: 'canCreateProjects', label: 'Criar projetos', description: 'Criar novos projetos' },
      { key: 'canDeleteProjects', label: 'Excluir projetos', description: 'Remover projetos do sistema' },
    ],
  },
  {
    id: 'clients',
    label: 'Clientes',
    icon: Users,
    color: 'text-blue-400',
    permissions: [
      { key: 'canViewClients', label: 'Ver clientes', description: 'Visualizar lista de clientes' },
      { key: 'canViewClientContacts', label: 'Ver contactos', description: 'Ver email e telefone dos clientes' },
      { key: 'canEditClients', label: 'Editar clientes', description: 'Modificar dados de clientes' },
      { key: 'canCreateClients', label: 'Criar clientes', description: 'Adicionar novos clientes' },
    ],
  },
  {
    id: 'users',
    label: 'Colaboradores',
    icon: Users,
    color: 'text-orange-400',
    permissions: [
      { key: 'canViewUsers', label: 'Ver colaboradores', description: 'Visualizar lista de colaboradores' },
      { key: 'canEditUsers', label: 'Editar colaboradores', description: 'Modificar dados de colaboradores' },
      { key: 'canCreateUsers', label: 'Criar colaboradores', description: 'Adicionar novos colaboradores' },
    ],
  },
  {
    id: 'content',
    label: 'Conteúdo',
    icon: FileText,
    color: 'text-cyan-400',
    permissions: [
      { key: 'canViewChecklist', label: 'Ver checklist', description: 'Visualizar tarefas do projeto' },
      { key: 'canEditChecklist', label: 'Editar checklist', description: 'Modificar tarefas do projeto' },
      { key: 'canViewComments', label: 'Ver comentários', description: 'Visualizar comentários' },
      { key: 'canAddComments', label: 'Adicionar comentários', description: 'Escrever novos comentários' },
      { key: 'canViewMedia', label: 'Ver mídia', description: 'Visualizar arquivos do projeto' },
      { key: 'canAddMedia', label: 'Adicionar mídia', description: 'Fazer upload de arquivos' },
    ],
  },
  {
    id: 'system',
    label: 'Sistema',
    icon: Settings,
    color: 'text-red-400',
    permissions: [
      { key: 'canViewReports', label: 'Ver relatórios', description: 'Acesso a relatórios e analytics' },
      { key: 'canExportData', label: 'Exportar dados', description: 'Exportar dados em CSV/PDF' },
      { key: 'canManageCategories', label: 'Gerir categorias', description: 'Criar e editar categorias' },
      { key: 'canManageKanbanColumns', label: 'Gerir colunas Kanban', description: 'Personalizar colunas do Kanban' },
    ],
  },
];

const ROLE_INFO: Record<UserRole, { label: string; description: string; color: string }> = {
  admin: {
    label: 'Administrador',
    description: 'Acesso total ao sistema',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  },
  editor_edicao: {
    label: 'Editor',
    description: 'Foco em edição de projetos',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  freelancer_captacao: {
    label: 'Freelancer',
    description: 'Apenas próprios projetos',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  },
  visualizer: {
    label: 'Visualizador',
    description: 'Apenas visualização, sem edição',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  },
};

const STORAGE_KEY = 'willflow-custom-permissions';

export default function PermissionsManager() {
  const [permissions, setPermissions] = useState<Record<UserRole, PermissionConfig>>({
    ...ROLE_PERMISSIONS,
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [activeRole, setActiveRole] = useState<UserRole>('editor_edicao');

  // Load custom permissions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const customPermissions = JSON.parse(stored);
        setPermissions(prev => ({
          ...prev,
          ...customPermissions,
        }));
      } catch (error) {
        console.error('Erro ao carregar permissões:', error);
      }
    }
  }, []);

  const handleTogglePermission = (role: UserRole, permissionKey: string, value: boolean) => {
    // Don't allow editing admin permissions (safety)
    if (role === 'admin') {
      return;
    }

    setPermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionKey]: value,
      },
    }));
    setHasChanges(true);
    setSavedMessage('');
  };

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      editor_edicao: permissions.editor_edicao,
      freelancer_captacao: permissions.freelancer_captacao,
    }));

    setHasChanges(false);
    setSavedMessage('Permissões salvas com sucesso!');

    // Clear message after 3 seconds
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const handleReset = (role: UserRole) => {
    if (role === 'admin') return;

    setPermissions(prev => ({
      ...prev,
      [role]: ROLE_PERMISSIONS[role],
    }));
    setHasChanges(true);
    setSavedMessage('');
  };

  const handleResetAll = () => {
    setPermissions({ ...ROLE_PERMISSIONS });
    localStorage.removeItem(STORAGE_KEY);
    setHasChanges(false);
    setSavedMessage('Permissões restauradas para o padrão!');
    setTimeout(() => setSavedMessage(''), 3000);
  };

  const countActivePermissions = (role: UserRole) => {
    const rolePerms = permissions[role];
    return Object.values(rolePerms).filter(Boolean).length;
  };

  const totalPermissions = Object.keys(permissions.admin).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Gestão de Permissões
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as permissões de cada categoria de utilizador
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedMessage && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
              <Check className="w-3 h-3 mr-1" />
              {savedMessage}
            </Badge>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="glass border-white/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrão
          </Button>

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!hasChanges}
            className="gradient-purple text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Warning for Admin */}
      <Card className="glass border-yellow-500/30 bg-yellow-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Nota Importante</p>
            <p className="text-xs text-muted-foreground mt-1">
              As permissões do Administrador não podem ser alteradas por segurança.
              Apenas as permissões de Editor e Freelancer podem ser personalizadas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Roles Tabs */}
      <Tabs value={activeRole} onValueChange={(v) => setActiveRole(v as UserRole)}>
        <TabsList className="glass border border-white/10 p-1">
          {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => {
            const info = ROLE_INFO[role];
            const activeCount = countActivePermissions(role);

            return (
              <TabsTrigger
                key={role}
                value={role}
                className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
              >
                <div className="flex items-center gap-2">
                  {role === 'admin' ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <Unlock className="w-4 h-4" />
                  )}
                  <span>{info.label}</span>
                  <Badge variant="secondary" className="text-xs">
                    {activeCount}/{totalPermissions}
                  </Badge>
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => {
          const info = ROLE_INFO[role];
          const isAdmin = role === 'admin';

          return (
            <TabsContent key={role} value={role} className="mt-4">
              {/* Role Header */}
              <Card className="glass-card mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={info.color}>
                        {info.label}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{info.description}</span>
                    </div>

                    {!isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReset(role)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Restaurar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Permission Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {PERMISSION_CATEGORIES.map((category) => {
                  const CategoryIcon = category.icon;

                  return (
                    <Card key={category.id} className="glass-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <CategoryIcon className={`w-5 h-5 ${category.color}`} />
                          {category.label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {category.permissions.map((perm) => {
                          const permKey = perm.key as keyof PermissionConfig;
                          const isEnabled = permissions[role][permKey];

                          return (
                            <div
                              key={perm.key}
                              className={`
                                flex items-center justify-between p-3 rounded-lg border transition-all
                                ${isEnabled
                                  ? 'border-green-500/30 bg-green-500/5'
                                  : 'border-white/10 bg-white/5'
                                }
                                ${isAdmin ? 'opacity-60' : 'hover:border-purple-500/30'}
                              `}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  {isEnabled ? (
                                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  ) : (
                                    <X className="w-4 h-4 text-red-400 flex-shrink-0" />
                                  )}
                                  <span className="text-sm font-medium truncate">
                                    {perm.label}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 ml-6">
                                  {perm.description}
                                </p>
                              </div>

                              <Switch
                                checked={isEnabled}
                                onCheckedChange={(checked) =>
                                  handleTogglePermission(role, perm.key, checked)
                                }
                                disabled={isAdmin}
                                className="ml-3 flex-shrink-0"
                              />
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Summary */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-base">Resumo de Permissões</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => {
              const info = ROLE_INFO[role];
              const activeCount = countActivePermissions(role);
              const percentage = Math.round((activeCount / totalPermissions) * 100);

              return (
                <div key={role} className="p-4 rounded-lg glass border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={info.color}>{info.label}</Badge>
                    <span className="text-lg font-bold">{percentage}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        background: role === 'admin'
                          ? 'linear-gradient(90deg, #9333ea, #c084fc)'
                          : role === 'editor_edicao'
                          ? 'linear-gradient(90deg, #3b82f6, #60a5fa)'
                          : 'linear-gradient(90deg, #f97316, #fb923c)',
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {activeCount} de {totalPermissions} permissões ativas
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
