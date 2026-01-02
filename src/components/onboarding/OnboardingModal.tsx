'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Video, Users, Euro, Bell, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const ONBOARDING_COMPLETED_KEY = 'willflow_onboarding_completed';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Bem-vindo ao WillFlow',
    description: 'O sistema completo de gestao de producao audiovisual. Vamos conhecer as principais funcionalidades.',
    icon: <Video className="w-12 h-12 text-purple-400" />,
  },
  {
    id: 'projects',
    title: 'Gestao de Projetos',
    description: 'Acompanhe seus projetos em todas as fases: captacao, edicao e finalizacao.',
    icon: <Video className="w-12 h-12 text-blue-400" />,
  },
  {
    id: 'clients',
    title: 'Clientes e Colaboradores',
    description: 'Gerencie seus clientes e equipe de colaboradores.',
    icon: <Users className="w-12 h-12 text-green-400" />,
  },
  {
    id: 'finance',
    title: 'Controle Financeiro',
    description: 'Acompanhe receitas, despesas e margens de lucro.',
    icon: <Euro className="w-12 h-12 text-yellow-400" />,
  },
  {
    id: 'notifications',
    title: 'Notificacoes',
    description: 'Receba alertas sobre prazos e atualizacoes importantes.',
    icon: <Bell className="w-12 h-12 text-orange-400" />,
  },
];

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
    if (!completed) {
      setShowOnboarding(true);
      setIsCompleted(false);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
    setShowOnboarding(false);
    setIsCompleted(true);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
    setShowOnboarding(true);
    setIsCompleted(false);
  };

  return { showOnboarding, setShowOnboarding, isCompleted, completeOnboarding, resetOnboarding };
}

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export default function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const goToNextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="glass-strong border-white/20 max-w-md p-0 overflow-hidden">
        <button onClick={onComplete} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            {onboardingSteps.map((_, index) => (
              <div key={index} className={`w-2 h-2 rounded-full transition-all ${index === currentStep ? 'w-8 bg-purple-500' : index < currentStep ? 'bg-purple-500/50' : 'bg-white/20'}`} />
            ))}
          </div>

          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 rounded-full glass flex items-center justify-center">{step.icon}</div>
            </div>
            <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
            <p className="text-muted-foreground">{step.description}</p>
          </div>

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <Button variant="ghost" onClick={goToPrevStep} disabled={currentStep === 0}>
              <ChevronLeft className="w-4 h-4 mr-1" />Anterior
            </Button>
            <Button onClick={goToNextStep} className="gradient-purple">
              {isLastStep ? <><Check className="w-4 h-4 mr-2" />Comecar</> : <>Proximo<ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
