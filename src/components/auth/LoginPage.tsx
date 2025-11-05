'use client';

import { useState } from 'react';
import { Play, LogIn, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoginPageProps {
  onLogin: (email: string, password: string) => { success: boolean; error?: string };
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validação básica
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      setIsLoading(false);
      return;
    }

    // Tentar login
    const result = onLogin(email, password);

    if (!result.success) {
      setError(result.error || 'Erro ao fazer login');
    }

    setIsLoading(false);
  };

  const fillDemoCredentials = (type: 'admin' | 'editor' | 'freelancer') => {
    switch (type) {
      case 'admin':
        setEmail('admin@in-sights.pt');
        setPassword('admin123');
        break;
      case 'editor':
        setEmail('editor@in-sights.pt');
        setPassword('editor123');
        break;
      case 'freelancer':
        setEmail('freelancer@in-sights.pt');
        setPassword('freelancer123');
        break;
    }
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-3 md:p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 md:w-96 md:h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative">
        <div className="glass-card p-6 md:p-8 shadow-glow">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <img
              src="/logo-willflow-login.png"
              alt="WillFlow"
              className="w-32 h-32 md:w-40 md:h-40 object-contain"
            />
            <p className="text-muted-foreground text-xs md:text-sm text-center mt-2">Porque criar deve ser simples.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            {/* Email */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="email" className="text-xs md:text-sm font-medium">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 glass border-white/20 focus:border-purple-500/50 text-sm md:text-base"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5 md:space-y-2">
              <Label htmlFor="password" className="text-xs md:text-sm font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 glass border-white/20 focus:border-purple-500/50 text-sm md:text-base"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs md:text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gradient-purple hover:gradient-purple-hover text-white font-medium py-5 md:py-6 text-sm md:text-base"
              disabled={isLoading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10">
            <p className="text-xs text-muted-foreground text-center mb-2 md:mb-3">
              Credenciais de demonstração:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('admin')}
                className="px-2.5 py-2 text-xs rounded-lg glass hover:bg-white/10 transition-colors border border-white/10 hover:border-purple-500/30"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('editor')}
                className="px-2.5 py-2 text-xs rounded-lg glass hover:bg-white/10 transition-colors border border-white/10 hover:border-purple-500/30"
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('freelancer')}
                className="px-2.5 py-2 text-xs rounded-lg glass hover:bg-white/10 transition-colors border border-white/10 hover:border-purple-500/30"
              >
                Freelancer
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 md:mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              © 2024 WillFlow. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
