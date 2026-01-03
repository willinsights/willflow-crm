'use client';

import { useState, useRef, useCallback, ReactNode, useEffect } from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  className?: string;
  threshold?: number; // Pull distance needed to trigger refresh
  disabled?: boolean;
}

type PullState = 'idle' | 'pulling' | 'ready' | 'refreshing' | 'complete';

export default function PullToRefresh({
  children,
  onRefresh,
  className = '',
  threshold = 80,
  disabled = false,
}: PullToRefreshProps) {
  const [pullState, setPullState] = useState<PullState>('idle');
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef<number>(0);
  const currentY = useRef<number>(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;

    const scrollTop = containerRef.current?.scrollTop || 0;

    // Only start pull if at top of scroll
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, [disabled]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isPulling.current || disabled || pullState === 'refreshing') return;

    currentY.current = e.touches[0].clientY;
    const distance = currentY.current - startY.current;

    // Only pull down, not up
    if (distance > 0) {
      // Apply resistance to make it feel natural
      const resistance = 0.5;
      const adjustedDistance = distance * resistance;

      setPullDistance(Math.min(adjustedDistance, threshold * 1.5));

      if (adjustedDistance >= threshold) {
        setPullState('ready');
      } else {
        setPullState('pulling');
      }

      // Prevent default scroll behavior while pulling
      e.preventDefault();
    }
  }, [threshold, disabled, pullState]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current || disabled) return;

    isPulling.current = false;

    if (pullState === 'ready') {
      setPullState('refreshing');
      setPullDistance(threshold * 0.5); // Keep indicator visible during refresh

      try {
        await onRefresh();
        setPullState('complete');

        // Brief success state
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('Refresh failed:', error);
      }
    }

    // Reset
    setPullDistance(0);
    setPullState('idle');
  }, [pullState, threshold, onRefresh, disabled]);

  // Calculate indicator styles
  const getIndicatorStyles = () => {
    const opacity = Math.min(pullDistance / threshold, 1);
    const scale = Math.min(0.5 + (pullDistance / threshold) * 0.5, 1);
    const translateY = Math.min(pullDistance - 40, threshold - 20);

    return {
      opacity,
      transform: `translateY(${translateY}px) scale(${scale})`,
      transition: pullState === 'idle' ? 'all 0.3s ease-out' : 'none',
    };
  };

  // Get indicator content based on state
  const getIndicatorContent = () => {
    switch (pullState) {
      case 'pulling':
        return (
          <div className="flex flex-col items-center gap-1">
            <ArrowDown className="w-5 h-5 text-muted-foreground" style={{
              transform: `rotate(${Math.min(pullDistance / threshold * 180, 180)}deg)`,
              transition: 'transform 0.1s ease-out',
            }} />
            <span className="text-xs text-muted-foreground">Puxe para atualizar</span>
          </div>
        );
      case 'ready':
        return (
          <div className="flex flex-col items-center gap-1">
            <RefreshCw className="w-5 h-5 text-purple-400" />
            <span className="text-xs text-purple-400">Solte para atualizar</span>
          </div>
        );
      case 'refreshing':
        return (
          <div className="flex flex-col items-center gap-1">
            <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-xs text-purple-400">Atualizando...</span>
          </div>
        );
      case 'complete':
        return (
          <div className="flex flex-col items-center gap-1">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs text-green-400">Atualizado!</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Pull indicator */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10 pointer-events-none"
        style={{
          top: 0,
          ...getIndicatorStyles(),
        }}
      >
        <div className="glass rounded-full p-3 shadow-lg">
          {getIndicatorContent()}
        </div>
      </div>

      {/* Content container */}
      <div
        ref={containerRef}
        className="overflow-auto h-full touch-pan-y"
        style={{
          transform: pullState !== 'idle' && pullDistance > 0
            ? `translateY(${pullDistance * 0.3}px)`
            : 'none',
          transition: pullState === 'idle' ? 'transform 0.3s ease-out' : 'none',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
    </div>
  );
}

// Hook for simpler usage
export function usePullToRefresh(onRefresh: () => Promise<void>) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  return {
    isRefreshing,
    handleRefresh,
  };
}
