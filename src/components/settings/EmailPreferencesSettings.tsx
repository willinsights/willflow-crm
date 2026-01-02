'use client';

import { useState, useEffect } from 'react';
import { Mail, Shield, Briefcase, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  getEmailPreferences,
  saveEmailPreferences,
  getPreferencesByCategory,
  type EmailPreferences
} from '@/lib/emailPreferences';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Conta e Segurança': <Shield className="w-5 h-5 text-purple-400" />,
  'Projetos': <Briefcase className="w-5 h-5 text-blue-400" />,
  'Prazos': <Clock className="w-5 h-5 text-yellow-400" />,
  'Financeiro': <Wallet className="w-5 h-5 text-green-400" />,
};

export default function EmailPreferencesSettings() {
  const [prefs, setPrefs] = useState<EmailPreferences>(getEmailPreferences());
  const [saved, setSaved] = useState(false);

  const categories = getPreferencesByCategory();

  useEffect(() => {
    setPrefs(getEmailPreferences());
  }, []);

  const handleToggle = (key: keyof EmailPreferences) => {
    const newValue = !prefs[key];
    const newPrefs = { ...prefs, [key]: newValue };
    setPrefs(newPrefs);
    saveEmailPreferences({ [key]: newValue });

    // Show saved indicator
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enableAll = () => {
    const allEnabled = Object.keys(prefs).reduce((acc, key) => {
      acc[key as keyof EmailPreferences] = true;
      return acc;
    }, {} as EmailPreferences);
    setPrefs(allEnabled);
    saveEmailPreferences(allEnabled);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const disableOptional = () => {
    // Keep security emails, disable others
    const optionalDisabled: Partial<EmailPreferences> = {
      projectCreated: false,
      projectCompleted: false,
      statusChanged: false,
      deadlineReminder: false,
      paymentReceived: false,
      freelancerPayment: false,
    };
    const newPrefs = { ...prefs, ...optionalDisabled };
    setPrefs(newPrefs);
    saveEmailPreferences(optionalDisabled);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card className="glass-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mail className="w-6 h-6 text-purple-400" />
            <div>
              <CardTitle>Preferências de Email</CardTitle>
              <CardDescription>
                Escolha quais emails deseja receber
              </CardDescription>
            </div>
          </div>
          {saved && (
            <span className="text-sm text-green-400 animate-pulse">
              ✓ Guardado
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick actions */}
        <div className="flex gap-2 pb-4 border-b border-white/10">
          <button
            onClick={enableAll}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
          >
            Ativar Todos
          </button>
          <button
            onClick={disableOptional}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 text-muted-foreground hover:bg-white/10 transition-colors"
          >
            Apenas Essenciais
          </button>
        </div>

        {/* Categories */}
        {Object.entries(categories).map(([category, items]) => (
          <div key={category} className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              {CATEGORY_ICONS[category]}
              <h3 className="font-semibold text-sm">{category}</h3>
            </div>

            <div className="space-y-2 pl-7">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div className="flex-1 mr-4">
                    <p className="font-medium text-sm">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Switch
                    checked={prefs[item.key]}
                    onCheckedChange={() => handleToggle(item.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs text-muted-foreground">
            Os emails de segurança (boas-vindas, alteração de senha) são sempre recomendados para manter a sua conta segura.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
