'use client';

import { useState } from 'react';
import { Settings, User, Bell, Globe, Lock, Database, Palette, Download, Shield, DollarSign, Clock, Tag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/lib/ThemeContext';
import { useLocale, LOCALE_LABELS, CURRENCY_LABELS, TIMEZONE_LABELS, SupportedLocale, SupportedCurrency, SupportedTimezone } from '@/lib/LocaleContext';
import { useAppStore } from '@/lib/useAppStore';
import Breadcrumbs from '@/components/layout/Breadcrumbs';
import PermissionsManager from './PermissionsManager';
import NotificationSettings from './NotificationSettings';
import EmailPreferencesSettings from './EmailPreferencesSettings';
import CategoriesPage from '@/components/categories/CategoriesPage';

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const { locale, currency, timezone, setLocale, setCurrency, setTimezone, formatCurrency } = useLocale();
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    emailNotifications: true,
    desktopNotifications: false,
    projectReminders: true,
    deadlineAlerts: true,
    autoSave: true,
    darkMode: theme === 'dark',
  });

  const isAdmin = currentUser?.role === 'admin';

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

      {/* Tabs for Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="glass border border-white/10 p-1 mb-6 flex-wrap">
          <TabsTrigger
            value="general"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger
            value="locale"
            className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
          >
            <Globe className="w-4 h-4 mr-2" />
            Idioma e Moeda
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger
              value="categories"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Tag className="w-4 h-4 mr-2" />
              Categorias
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger
              value="permissions"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400"
            >
              <Shield className="w-4 h-4 mr-2" />
              Permissões
            </TabsTrigger>
          )}
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          {/* Settings Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Perfil */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfil do Utilizador
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
                    defaultValue={currentUser?.name || 'Administrador'}
                    className="glass border-white/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={currentUser?.email || 'admin@in-sights.pt'}
                    className="glass border-white/20"
                  />
                </div>
                <Button className="w-full gradient-purple">
                  Guardar Alterações
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

            {/* Push Notifications */}
            <NotificationSettings />

            {/* Email Preferences */}
            <EmailPreferencesSettings />

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
                    <Label htmlFor="auto-save">Auto Guardar</Label>
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

                <div className="p-3 rounded-lg glass border border-white/20">
                  <p className="text-sm text-muted-foreground">
                    Versão do Sistema: <span className="text-purple-400">V145</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Locale Settings Tab */}
        <TabsContent value="locale">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Idioma e Região */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-400" />
                  Idioma e Região
                </CardTitle>
                <CardDescription>
                  Configurações regionais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="locale">Idioma</Label>
                  <Select
                    value={locale}
                    onValueChange={(value: SupportedLocale) => setLocale(value)}
                  >
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/20">
                      {(Object.keys(LOCALE_LABELS) as SupportedLocale[]).map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          <div className="flex items-center gap-2">
                            <span>{loc === 'pt-PT' ? '🇵🇹' : '🇧🇷'}</span>
                            <span>{LOCALE_LABELS[loc]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Ao mudar o idioma, a moeda e fuso horário são ajustados automaticamente.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-sm text-blue-400 font-medium mb-2">Configuração Atual</p>
                  <div className="space-y-1 text-sm">
                    <p className="text-muted-foreground">
                      Idioma: <span className="text-foreground">{LOCALE_LABELS[locale]}</span>
                    </p>
                    <p className="text-muted-foreground">
                      Região: <span className="text-foreground">{locale === 'pt-PT' ? 'Europa' : 'América do Sul'}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Moeda */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Moeda
                </CardTitle>
                <CardDescription>
                  Formato de valores monetários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda Padrão</Label>
                  <Select
                    value={currency}
                    onValueChange={(value: SupportedCurrency) => setCurrency(value)}
                  >
                    <SelectTrigger className="glass border-white/20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong border-white/20">
                      {(Object.keys(CURRENCY_LABELS) as SupportedCurrency[]).map((cur) => (
                        <SelectItem key={cur} value={cur}>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{cur === 'EUR' ? '€' : 'R$'}</span>
                            <span>{CURRENCY_LABELS[cur]}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Exemplo de Formatação</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-lg glass border border-white/20 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Valor</p>
                      <p className="text-lg font-bold text-green-400">{formatCurrency(1234.56)}</p>
                    </div>
                    <div className="p-3 rounded-lg glass border border-white/20 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Grande</p>
                      <p className="text-lg font-bold text-green-400">{formatCurrency(99999.00)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fuso Horário */}
            <Card className="glass-card md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Fuso Horário
                </CardTitle>
                <CardDescription>
                  Configuração de datas e horários
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select
                      value={timezone}
                      onValueChange={(value: SupportedTimezone) => setTimezone(value)}
                    >
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-strong border-white/20">
                        {(Object.keys(TIMEZONE_LABELS) as SupportedTimezone[]).map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            <div className="flex items-center gap-2">
                              <span>{tz.includes('Lisbon') ? '🇵🇹' : '🇧🇷'}</span>
                              <span>{TIMEZONE_LABELS[tz]}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="p-4 rounded-lg glass border border-white/20">
                    <p className="text-xs text-muted-foreground mb-2">Hora Atual</p>
                    <p className="text-2xl font-bold text-orange-400">
                      {new Date().toLocaleTimeString(locale, { timeZone: timezone })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date().toLocaleDateString(locale, { timeZone: timezone, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-sm text-orange-400">
                    <strong>Nota:</strong> Todas as datas e horários no sistema serão exibidos de acordo com este fuso horário.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Categories Tab - Admin Only */}
        {isAdmin && (
          <TabsContent value="categories">
            <CategoriesPage embedded={true} />
          </TabsContent>
        )}

        {/* Permissions Tab - Admin Only */}
        {isAdmin && (
          <TabsContent value="permissions">
            <PermissionsManager />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
