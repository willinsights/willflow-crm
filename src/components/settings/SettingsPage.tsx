'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Palette,
  Database,
  Shield,
  Download,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppStore } from '@/lib/useAppStore';
import { useTheme } from '@/lib/ThemeContext';

export default function SettingsPage() {
  const { currentUser, refreshData, lastRefresh } = useAppStore();
  const { theme, toggleTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Settings state
  const [settings, setSettings] = useState({
    userName: currentUser?.name || '',
    userEmail: currentUser?.email || '',
    notifications: {
      deadlines: true,
      statusChanges: true,
      newProjects: true,
      payments: true,
    },
    autoRefresh: true,
    refreshInterval: 30,
    language: 'pt',
    currency: 'EUR',
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setIsSaving(false);
      alert('✅ Configurações salvas com sucesso!');
    }, 1000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setTimeout(() => {
      setIsRefreshing(false);
      alert('✅ Dados atualizados!');
    }, 500);
  };

  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Nunca';
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastRefresh.getTime()) / 1000);

    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    return lastRefresh.toLocaleTimeString('pt-PT');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gradient mb-2">Configurações</h1>
          <p className="text-muted-foreground">
            Personalize sua experiência no sistema
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gradient-purple hover:gradient-purple-hover text-white"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Perfil do Usuário */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Nome</Label>
              <Input
                id="userName"
                value={settings.userName}
                onChange={(e) => setSettings({ ...settings, userName: e.target.value })}
                className="glass border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userEmail">Email</Label>
              <Input
                id="userEmail"
                type="email"
                value={settings.userEmail}
                onChange={(e) => setSettings({ ...settings, userEmail: e.target.value })}
                className="glass border-white/20"
              />
            </div>

            <div className="space-y-2">
              <Label>Função</Label>
              <div className="glass border-white/20 rounded-md p-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span className="font-medium">Administrador</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a interface visual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Tema</Label>
              <div className="flex items-center justify-between glass border-white/20 rounded-md p-3">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Modo Escuro</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Modo Claro</span>
                    </>
                  )}
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Idioma</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border border-white/20">
                  <SelectItem value="pt">Português (PT)</SelectItem>
                  <SelectItem value="en">English (EN)</SelectItem>
                  <SelectItem value="es">Español (ES)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Moeda</Label>
              <Select
                value={settings.currency}
                onValueChange={(value) => setSettings({ ...settings, currency: value })}
              >
                <SelectTrigger className="glass border-white/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-strong border border-white/20">
                  <SelectItem value="EUR">Euro (€)</SelectItem>
                  <SelectItem value="USD">Dólar ($)</SelectItem>
                  <SelectItem value="GBP">Libra (£)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Notificações
            </CardTitle>
            <CardDescription>
              Gerencie suas preferências de notificação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prazos de Projetos</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas de datas de entrega próximas
                </p>
              </div>
              <Switch
                checked={settings.notifications.deadlines}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, deadlines: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mudanças de Status</Label>
                <p className="text-sm text-muted-foreground">
                  Quando um projeto muda de fase
                </p>
              </div>
              <Switch
                checked={settings.notifications.statusChanges}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, statusChanges: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Novos Projetos</Label>
                <p className="text-sm text-muted-foreground">
                  Quando um novo projeto é criado
                </p>
              </div>
              <Switch
                checked={settings.notifications.newProjects}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, newProjects: checked },
                  })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Pagamentos</Label>
                <p className="text-sm text-muted-foreground">
                  Lembretes de pagamentos pendentes
                </p>
              </div>
              <Switch
                checked={settings.notifications.payments}
                onCheckedChange={(checked) =>
                  setSettings({
                    ...settings,
                    notifications: { ...settings.notifications, payments: checked },
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Dados e Sincronização */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              Dados e Sincronização
            </CardTitle>
            <CardDescription>
              Gerencie a atualização dos dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualização Automática</Label>
                <p className="text-sm text-muted-foreground">
                  Recarregar dados automaticamente
                </p>
              </div>
              <Switch
                checked={settings.autoRefresh}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, autoRefresh: checked })
                }
              />
            </div>

            {settings.autoRefresh && (
              <div className="space-y-2">
                <Label htmlFor="refreshInterval">Intervalo de Atualização</Label>
                <Select
                  value={settings.refreshInterval.toString()}
                  onValueChange={(value) =>
                    setSettings({ ...settings, refreshInterval: parseInt(value) })
                  }
                >
                  <SelectTrigger className="glass border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border border-white/20">
                    <SelectItem value="10">10 segundos</SelectItem>
                    <SelectItem value="30">30 segundos</SelectItem>
                    <SelectItem value="60">1 minuto</SelectItem>
                    <SelectItem value="300">5 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="pt-4 space-y-3">
              <div className="glass border-white/20 rounded-md p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Última atualização:</span>
                  <span className="font-medium">{formatLastRefresh()}</span>
                </div>
              </div>

              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="outline"
                className="w-full glass border-white/20"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Atualizar Agora'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Importar/Exportar */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-purple-400" />
              Importar / Exportar Dados
            </CardTitle>
            <CardDescription>
              Faça backup ou restaure seus dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="glass border-white/20 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Dados (JSON)
              </Button>

              <Button
                variant="outline"
                className="glass border-white/20 hover:bg-white/10"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar Dados
              </Button>

              <Button
                variant="outline"
                className="glass border-white/20 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Relatório (PDF)
              </Button>

              <Button
                variant="outline"
                className="glass border-white/20 hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Financeiro (CSV)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info do Sistema */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Informações do Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Versão</p>
              <p className="font-medium">46.0.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Build</p>
              <p className="font-medium">2024.11.05</p>
            </div>
            <div>
              <p className="text-muted-foreground">Ambiente</p>
              <p className="font-medium">Produção</p>
            </div>
            <div>
              <p className="text-muted-foreground">Base de Dados</p>
              <p className="font-medium">PostgreSQL (Railway)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
