'use client';

import { useState } from 'react';
import { Settings, User, Bell, Globe, Lock, Database, Palette, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/lib/ThemeContext';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    projectReminders: true,
    deadlineAlerts: true,
    autoSave: true,
    darkMode: theme === 'dark',
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));

    if (key === 'darkMode') {
      toggleTheme();
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Configurações' }]} />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient mb-2">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie preferências e configurações do sistema
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Perfil */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Perfil do Usuário
            </CardTitle>
            <CardDescription>
              Informações básicas da conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                defaultValue="Administrador"
                className="glass border-white/20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue="admin@in-sights.pt"
                className="glass border-white/20"
              />
            </div>
            <Button className="w-full gradient-purple">
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <CardDescription>
              Preferências de alertas e avisos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receber notificações por email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleToggle('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="desktop-notifications">Desktop</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações no navegador
                </p>
              </div>
              <Switch
                id="desktop-notifications"
                checked={settings.desktopNotifications}
                onCheckedChange={() => handleToggle('desktopNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="project-reminders">Lembretes</Label>
                <p className="text-sm text-muted-foreground">
                  Alertas de prazos
                </p>
              </div>
              <Switch
                id="project-reminders"
                checked={settings.projectReminders}
                onCheckedChange={() => handleToggle('projectReminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="deadline-alerts">Prazos Urgentes</Label>
                <p className="text-sm text-muted-foreground">
                  Avisos 24h antes
                </p>
              </div>
              <Switch
                id="deadline-alerts"
                checked={settings.deadlineAlerts}
                onCheckedChange={() => handleToggle('deadlineAlerts')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalização visual do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Modo Escuro</Label>
                <p className="text-sm text-muted-foreground">
                  Tema escuro para melhor visualização
                </p>
              </div>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={() => handleToggle('darkMode')}
              />
            </div>

            <div className="space-y-2">
              <Label>Tema Atual</Label>
              <div className="flex gap-2">
                <div className="flex-1 p-4 rounded-lg glass border border-white/20 text-center">
                  {theme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Sistema
            </CardTitle>
            <CardDescription>
              Configurações gerais do sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Auto Salvar</Label>
                <p className="text-sm text-muted-foreground">
                  Salvamento automático
                </p>
              </div>
              <Switch
                id="auto-save"
                checked={settings.autoSave}
                onCheckedChange={() => handleToggle('autoSave')}
              />
            </div>

            <div className="space-y-2">
              <Label>Idioma</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg glass border border-white/20">
                <Globe className="w-4 h-4" />
                <span>Português (Portugal)</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fuso Horário</Label>
              <div className="flex items-center gap-2 p-3 rounded-lg glass border border-white/20">
                <span>GMT+0 (Lisboa)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Segurança
            </CardTitle>
            <CardDescription>
              Senha e autenticação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full glass border-white/20">
              Alterar Senha
            </Button>
            <Button variant="outline" className="w-full glass border-white/20">
              Configurar 2FA
            </Button>
            <div className="pt-2 border-t border-white/10">
              <p className="text-sm text-muted-foreground mb-2">
                Última sessão: Hoje às 18:05
              </p>
              <Button variant="outline" size="sm" className="glass border-red-500/30 text-red-400 hover:bg-red-500/10">
                Encerrar Todas as Sessões
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Dados e Backup */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Dados e Backup
            </CardTitle>
            <CardDescription>
              Exportação e backup de dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline" className="w-full glass border-white/20">
              <Download className="w-4 h-4 mr-2" />
              Exportar Todos os Dados
            </Button>
            <div className="p-3 rounded-lg glass border border-white/20">
              <p className="text-sm font-medium mb-1">Último Backup</p>
              <p className="text-sm text-muted-foreground">
                06/11/2025 às 18:00
              </p>
            </div>
            <Button variant="outline" className="w-full glass border-white/20">
              Agendar Backup Automático
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Danger Zone */}
      <Card className="glass-card border-red-500/30">
        <CardHeader>
          <CardTitle className="text-red-400">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis - use com cuidado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full md:w-auto glass border-red-500/30 text-red-400 hover:bg-red-500/10">
            Limpar Todos os Projetos
          </Button>
          <Button variant="outline" className="w-full md:w-auto glass border-red-500/30 text-red-400 hover:bg-red-500/10 ml-0 md:ml-2">
            Resetar Configurações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
