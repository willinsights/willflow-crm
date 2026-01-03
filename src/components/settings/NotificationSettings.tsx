'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { getNotificationPermission, requestNotificationPermission, getNotificationPreferences, saveNotificationPreferences, isNotificationSupported } from '@/lib/pushNotifications';

export default function NotificationSettings() {
  const [permission, setPermission] = useState<string>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [prefs, setPrefs] = useState({
    enabled: true,
    projectUpdates: true,
    deadlineAlerts: true,
    paymentAlerts: true,
  });

  useEffect(() => {
    setIsSupported(isNotificationSupported());
    setPermission(getNotificationPermission());
    setPrefs(getNotificationPreferences());
  }, []);

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);
  };

  const updatePref = (key: string, value: boolean) => {
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    saveNotificationPreferences(newPrefs);
  };

  if (!isSupported) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5 text-muted-foreground" />
            Notificacoes nao suportadas
          </CardTitle>
          <CardDescription>
            Seu navegador nao suporta notificacoes push.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          Notificacoes
        </CardTitle>
        <CardDescription>
          Configure como voce deseja receber notificacoes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission !== 'granted' ? (
          <div className="p-4 glass rounded-lg border border-yellow-500/30">
            <p className="text-sm text-yellow-400 mb-3">
              {permission === 'denied' 
                ? 'Notificacoes foram bloqueadas. Ative nas configuracoes do navegador.'
                : 'Ative as notificacoes para receber alertas importantes.'}
            </p>
            {permission !== 'denied' && (
              <Button onClick={handleRequestPermission} size="sm" className="gradient-purple">
                <Bell className="w-4 h-4 mr-2" />
                Ativar Notificacoes
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            Notificacoes ativadas
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificacoes Ativas</p>
              <p className="text-sm text-muted-foreground">Ativar ou desativar todas</p>
            </div>
            <Switch checked={prefs.enabled} onCheckedChange={(v) => updatePref('enabled', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Atualizacoes de Projetos</p>
              <p className="text-sm text-muted-foreground">Novos projetos e alteracoes</p>
            </div>
            <Switch checked={prefs.projectUpdates} onCheckedChange={(v) => updatePref('projectUpdates', v)} disabled={!prefs.enabled} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Prazo</p>
              <p className="text-sm text-muted-foreground">Prazos proximos e vencidos</p>
            </div>
            <Switch checked={prefs.deadlineAlerts} onCheckedChange={(v) => updatePref('deadlineAlerts', v)} disabled={!prefs.enabled} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Alertas de Pagamento</p>
              <p className="text-sm text-muted-foreground">Pagamentos recebidos e pendentes</p>
            </div>
            <Switch checked={prefs.paymentAlerts} onCheckedChange={(v) => updatePref('paymentAlerts', v)} disabled={!prefs.enabled} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
