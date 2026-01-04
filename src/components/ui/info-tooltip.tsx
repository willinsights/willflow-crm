'use client';

import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface InfoTooltipProps {
  content: string | React.ReactNode;
  className?: string;
  iconClassName?: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function InfoTooltip({ content, className, iconClassName, side = 'top' }: InfoTooltipProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info
          className={cn('w-3.5 h-3.5 text-muted-foreground cursor-help hover:text-primary transition-colors', iconClassName)}
        />
      </TooltipTrigger>
      <TooltipContent side={side} className={cn('max-w-[280px] glass-strong border-white/20', className)}>
        {typeof content === 'string' ? <p className="text-sm">{content}</p> : content}
      </TooltipContent>
    </Tooltip>
  );
}
