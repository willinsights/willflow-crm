'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { getLastSyncTime, hasPendingActions, getCacheSizeFormatted } from '@/lib/localStorage';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [pendingActions, setPendingActions] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 B');

  useEffect(() => {
    // Check online status
    const handleOnline = () => {
      setIsOnline(true);
      // Show brief reconnected message
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    // Set initial state
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check localStorage status
    setLastSync(getLastSyncTime());
    setPendingActions(hasPendingActions());
    setCacheSize(getCacheSizeFormatted());

    // Update periodically
    const interval = setInterval(() => {
      setLastSync(getLastSyncTime());
      setPendingActions(hasPendingActions());
      setCacheSize(getCacheSizeFormatted());
    }, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSync) return 'Nunca';

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return 'Agora mesmo';
    if (diffMinutes < 60) return `${diffMinutes} min atrás`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;

    return lastSync.toLocaleDateString('pt-PT');
  };

  if (!showBanner && isOnline) return null;

  return (
    <>
      {/* Offline Banner */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white px-4 py-2 shadow-lg safe-area-top">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <WifiOff className="w-4 h-4 animate-pulse" />
            <span>Você está offline</span>
            <span className="text-orange-200">• Usando dados em cache</span>
          </div>
        </div>
      )}

      {/* Reconnected Banner */}
      {isOnline && showBanner && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-green-500 text-white px-4 py-2 shadow-lg safe-area-top animate-fade-in">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Check className="w-4 h-4" />
            <span>Conexão restaurada!</span>
          </div>
        </div>
      )}

      {/* Offline Status Card (for settings page) */}
      {!isOnline && (
        <div className="fixed bottom-20 left-4 right-4 z-50 lg:left-auto lg:right-4 lg:w-80">
          <div className="glass-strong rounded-2xl p-4 shadow-xl border border-orange-500/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                <WifiOff className="w-5 h-5 text-orange-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">Modo Offline</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Os dados serão sincronizados quando a conexão for restaurada.
                </p>

                <div className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Última sincronização:</span>
                    <span>{formatLastSync()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cache local:</span>
                    <span>{cacheSize}</span>
                  </div>
                  {pendingActions && (
                    <div className="flex items-center gap-1 text-yellow-400 mt-2">
                      <AlertCircle className="w-3 h-3" />
                      <span>Ações pendentes para sincronizar</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Hook to check online status
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
