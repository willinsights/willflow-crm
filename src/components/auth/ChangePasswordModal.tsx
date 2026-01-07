'use client';

import { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ChangePasswordModalProps {
  isOpen: boolean;
  isMandatory?: boolean; // Se true, não pode fechar sem alterar
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  onClose?: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  isMandatory = false,
  onChangePassword,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Mínimo 8 caracteres');
    if (!/[A-Z]/.test(password)) errors.push('Uma letra maiúscula');
    if (!/[a-z]/.test(password)) errors.push('Uma letra minúscula');
    if (!/[0-9]/.test(password)) errors.push('Um número');
    return errors;
  };

  const passwordErrors = validatePassword(newPassword);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordErrors.length > 0) {
      setError('A senha não atende aos requisitos mínimos');
      return;
    }

    if (!passwordsMatch) {
      setError('As senhas não coincidem');
      return;
    }

    setIsLoading(true);

    // If mandatory, no need to pass current password (user is using generated password)
    const result = await onChangePassword(isMandatory ? '' : currentPassword, newPassword);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        onClose?.();
      }, 2000);
    } else {
      setError(result.error || 'Erro ao alterar senha');
    }

    setIsLoading(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isMandatory) {
      onClose?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-strong border border-white/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gradient">
            <Shield className="w-5 h-5 text-purple-400" />
            {isMandatory ? 'Alterar Senha Obrigatório' : 'Alterar Senha'}
          </DialogTitle>
          <DialogDescription>
            {isMandatory ? (
              <span className="text-yellow-400">
                Por segurança, você precisa alterar sua senha antes de continuar.
              </span>
            ) : (
              'Altere sua senha para uma mais segura.'
            )}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-green-400">Senha alterada com sucesso!</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecionando...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Current Password - only if not mandatory */}
            {!isMandatory && (
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Digite sua senha atual"
                    className="pl-10 pr-10 glass border-white/20"
                    required={!isMandatory}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Digite sua nova senha"
                  className="pl-10 pr-10 glass border-white/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="grid grid-cols-2 gap-1 text-xs mt-2">
                {['Mínimo 8 caracteres', 'Uma letra maiúscula', 'Uma letra minúscula', 'Um número'].map((req, idx) => {
                  const isMet = !passwordErrors.includes(req);
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1 ${isMet ? 'text-green-400' : 'text-muted-foreground'}`}
                    >
                      {isMet ? (
                        <CheckCircle className="w-3 h-3" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-current" />
                      )}
                      {req}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirme sua nova senha"
                  className={`pl-10 pr-10 glass border-white/20 ${
                    confirmPassword && !passwordsMatch ? 'border-red-500/50' : ''
                  } ${passwordsMatch ? 'border-green-500/50' : ''}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-400">As senhas não coincidem</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-sm text-red-400">{error}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              {!isMandatory && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1 glass border border-white/20"
                >
                  Cancelar
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading || passwordErrors.length > 0 || !passwordsMatch}
                className={`gradient-purple hover:gradient-purple-hover text-white ${isMandatory ? 'w-full' : 'flex-1'}`}
              >
                {isLoading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
