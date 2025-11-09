'use client';

import { useState, useEffect } from 'react';
import { User, ChevronDown, Shield, Camera, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { mockUsers } from '@/lib/data';
import { roleLabels } from '@/lib/data';
import { User as UserType } from '@/lib/types';

interface UserSelectorProps {
  currentUser: UserType;
  onUserChange: (user: UserType) => void;
}

export default function UserSelector({ currentUser, onUserChange }: UserSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-purple-400" />;
      case 'freelancer_captacao':
        return <Camera className="w-4 h-4 text-orange-400" />;
      case 'editor_edicao':
        return <Edit3 className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'freelancer_captacao':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'editor_edicao':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      default:
        return 'bg-white/10 text-white border-white/20';
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="glass p-2 pr-3 h-auto">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8 border-2 border-purple-500/30">
              <AvatarFallback className="bg-purple-500/20 text-purple-300 text-sm">
                ...
              </AvatarFallback>
            </Avatar>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Carregando...</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </div>
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="text-xs text-muted-foreground">
                  ...
                </span>
              </div>
            </div>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="glass p-2 pr-3 h-auto">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8 border-2 border-purple-500/30">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-purple-500/20 text-purple-300 text-sm">
                  {currentUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </div>
                <div className="flex items-center gap-1">
                  {getRoleIcon(currentUser.role)}
                  <span className="text-xs text-muted-foreground">
                    {roleLabels[currentUser.role]}
                  </span>
                </div>
              </div>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="glass-strong border border-white/20 w-64">
          <DropdownMenuLabel className="text-muted-foreground">
            Trocar Usuário (Demo)
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-white/10" />

          {mockUsers.map((user) => (
            <DropdownMenuItem
              key={user.id}
              onClick={() => onUserChange(user)}
              className={`hover:bg-white/10 p-3 ${
                currentUser.id === user.id ? 'bg-white/5' : ''
              }`}
            >
              <div className="flex items-center gap-3 w-full">
                <Avatar className="w-8 h-8 border border-white/20">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="bg-purple-500/20 text-purple-300 text-sm">
                    {mounted ? user.name.split(' ').map(n => n[0]).join('') : '...'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">{user.name}</span>
                    {currentUser.id === user.id && (
                      <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-300">
                        Atual
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleIcon(user.role)}
                    <span className="text-xs text-muted-foreground">
                      {roleLabels[user.role]}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">
                    {user.email}
                  </div>
                </div>
              </div>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator className="bg-white/10" />

          <div className="p-3">
            <div className="text-xs text-muted-foreground mb-2">Permissões Atuais:</div>
            <div className="flex flex-wrap gap-1">
              {currentUser.canViewFinance && (
                <Badge className="text-xs bg-green-500/20 text-green-300 border-green-500/30">
                  Finanças
                </Badge>
              )}
              {currentUser.canEditProjects && (
                <Badge className="text-xs bg-blue-500/20 text-blue-300 border-blue-500/30">
                  Editar Projetos
                </Badge>
              )}
              {currentUser.canViewAllProjects && (
                <Badge className="text-xs bg-purple-500/20 text-purple-300 border-purple-500/30">
                  Ver Todos
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
