'use client';

import * as React from 'react';
import { X, Check, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  emptyMessage?: string;
  className?: string;
  maxDisplay?: number;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = 'Selecionar...',
  emptyMessage = 'Nenhuma opção disponível',
  className,
  maxDisplay = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter((v) => v !== value));
  };

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between glass border-white/20 hover:bg-white/5 min-h-[40px] h-auto',
            className
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedOptions.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : selectedOptions.length <= maxDisplay ? (
              selectedOptions.map((opt) => (
                <Badge
                  key={opt.value}
                  variant="secondary"
                  className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                >
                  {opt.label}
                  <button
                    className="ml-1 hover:text-red-400"
                    onClick={(e) => handleRemove(opt.value, e)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <>
                {selectedOptions.slice(0, maxDisplay).map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs"
                  >
                    {opt.label}
                    <button
                      className="ml-1 hover:text-red-400"
                      onClick={(e) => handleRemove(opt.value, e)}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                <Badge variant="outline" className="text-xs">
                  +{selectedOptions.length - maxDisplay} mais
                </Badge>
              </>
            )}
          </div>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 glass-strong border-white/20" align="start">
        <div className="max-h-[300px] overflow-y-auto p-1">
          {options.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors',
                    isSelected
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'hover:bg-white/10'
                  )}
                  onClick={() => handleToggle(option.value)}
                >
                  <div
                    className={cn(
                      'w-4 h-4 border rounded flex items-center justify-center',
                      isSelected
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-white/30'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {option.icon && <span className="flex-shrink-0">{option.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{option.label}</div>
                    {option.description && (
                      <div className="text-xs text-muted-foreground truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {selected.length > 0 && (
          <div className="border-t border-white/10 p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-red-400"
              onClick={() => onChange([])}
            >
              Limpar seleção ({selected.length})
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
