'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'compact' | 'detailed';

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
  isCompact: boolean;
  isDetailed: boolean;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

const VIEW_MODE_KEY = 'willflow-view-mode';

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('compact');

  // Load saved view mode from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === 'compact' || saved === 'detailed') {
      setViewModeState(saved as ViewMode);
    }
  }, []);

  // Save view mode to localStorage when it changes
  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(VIEW_MODE_KEY, mode);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'compact' ? 'detailed' : 'compact';
    setViewMode(newMode);
  };

  const value: ViewContextType = {
    viewMode,
    setViewMode,
    toggleViewMode,
    isCompact: viewMode === 'compact',
    isDetailed: viewMode === 'detailed',
  };

  return <ViewContext.Provider value={value}>{children}</ViewContext.Provider>;
}

export function useView() {
  const context = useContext(ViewContext);
  if (context === undefined) {
    throw new Error('useView must be used within a ViewProvider');
  }
  return context;
}
