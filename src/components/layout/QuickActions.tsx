'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Plus,
  User,
  Calendar,
  BarChart3,
  Tag,
  X,
  Video,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CreateProjectModal from '@/components/projects/CreateProjectModal';
import CreateClientModal from '@/components/clients/CreateClientModal';

interface QuickActionsProps {
  onViewChange: (view: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
  action: () => void;
}

export default function QuickActions({ onViewChange }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Ctrl/Cmd + K to toggle quick actions
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      // ESC to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Swipe to close on mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;

    // Swipe up to close
    if (isUpSwipe && isOpen) {
      setIsOpen(false);
    }
  };

  // Trigger modals programmatically
  const triggerCreateProject = () => {
    setIsOpen(false);
    setShowProjectModal(true);
  };

  const triggerCreateClient = () => {
    setIsOpen(false);
    setShowClientModal(true);
  };

  const quickActions: QuickAction[] = [
    {
      id: 'new-project',
      label: 'Novo Projeto',
      icon: Video,
      description: 'Criar projeto audiovisual',
      color: 'text-purple-400',
      action: triggerCreateProject,
    },
    {
      id: 'new-client',
      label: 'Novo Cliente',
      icon: Briefcase,
      description: 'Adicionar cliente',
      color: 'text-blue-400',
      action: triggerCreateClient,
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      description: 'Ver calendário',
      color: 'text-green-400',
      action: () => {
        onViewChange('calendario');
        setIsOpen(false);
      },
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      description: 'Ver relatórios',
      color: 'text-orange-400',
      action: () => {
        onViewChange('relatorios');
        setIsOpen(false);
      },
    },
    {
      id: 'categories',
      label: 'Categorias',
      icon: Tag,
      description: 'Gerir categorias',
      color: 'text-pink-400',
      action: () => {
        onViewChange('categorias');
        setIsOpen(false);
      },
    },
  ];

  return (
    <TooltipProvider delayDuration={0}>
      {/* Trigger Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`
              p-2 rounded-lg glass transition-all duration-300 border border-white/10
              ${isOpen ? 'bg-purple-500/20 border-purple-500/50' : 'hover:bg-white/10 hover:border-purple-500/30'}
            `}
            aria-label="Ações Rápidas"
          >
            <Zap className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${isOpen ? 'text-purple-400' : ''}`} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="glass-strong border-white/20">
          <p>Ações Rápidas</p>
          <p className="text-xs text-muted-foreground mt-0.5">Ctrl+K</p>
        </TooltipContent>
      </Tooltip>

      {/* Overlay */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-50
          transition-opacity duration-300 ease-in-out
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={() => setIsOpen(false)}
      />

      {/* Quick Actions Panel */}
      <div
        ref={quickActionsRef}
        className={`
          fixed z-50
          w-full max-w-md
          glass-strong border border-white/20 rounded-2xl shadow-2xl
          transform transition-all duration-300 ease-out
          ${isOpen 
            ? 'opacity-100 translate-y-0 scale-100' 
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }
          
          /* Desktop: top-right below header */
          hidden md:block
          md:top-20 md:right-6
          
          /* Mobile: bottom sheet */
          md:hidden
          bottom-0 left-0 right-0
          rounded-b-none
          safe-area-bottom
        `}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Mobile Handle */}
        <div className="md:hidden flex justify-center pt-2 pb-1">
          <div className="w-12 h-1 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div>
            <h3 className="text-lg font-semibold text-gradient flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Ações Rápidas
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">Atalhos para agilizar seu trabalho</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg glass hover:bg-white/10 transition-all duration-300"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions Grid */}
        <div className="p-4 md:p-6 grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={action.action}
                className="
                  group
                  flex flex-col items-center justify-center
                  p-4 md:p-6
                  glass rounded-xl
                  hover:bg-white/10
                  hover:border-purple-500/30
                  border border-white/10
                  transition-all duration-300
                  hover:scale-105
                  hover:shadow-glow-sm
                  active:scale-95
                "
              >
                <div className={`
                  w-12 h-12 md:w-14 md:h-14
                  rounded-xl
                  glass
                  flex items-center justify-center
                  mb-3
                  transition-all duration-300
                  group-hover:scale-110
                  group-hover:bg-purple-500/20
                `}>
                  <Icon className={`w-6 h-6 ${action.color} transition-all duration-300 group-hover:scale-110`} />
                </div>
                <span className="font-medium text-sm md:text-base mb-1">{action.label}</span>
                <span className="text-xs text-muted-foreground text-center">{action.description}</span>
              </button>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="hidden md:block p-4 border-t border-white/10">
          <p className="text-xs text-center text-muted-foreground">
            💡 Dica: Use <kbd className="px-1.5 py-0.5 rounded glass text-xs">Ctrl+K</kbd> para abrir rapidamente
          </p>
        </div>
      </div>

      {/* Controlled Modals */}
      <CreateProjectModal
        isOpen={showProjectModal}
        onOpenChange={setShowProjectModal}
      />
      <CreateClientModal
        isOpen={showClientModal}
        onOpenChange={setShowClientModal}
      />
    </TooltipProvider>
  );
}
