'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'oled';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  isOLED: boolean;
  cycleTheme: () => void; // Cycles through all themes
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'audiovisual-crm-theme';

// Theme cycle order
const THEME_CYCLE: Theme[] = ['dark', 'light', 'oled'];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (storedTheme && THEME_CYCLE.includes(storedTheme)) {
      setThemeState(storedTheme);
    }
    setMounted(true);
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Remove all theme classes first
    root.classList.remove('light', 'dark', 'oled');

    // Add the current theme class
    root.classList.add(theme);

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme, mounted]);

  // Toggle between dark and light (simple toggle)
  const toggleTheme = () => {
    setThemeState(prev => prev === 'dark' || prev === 'oled' ? 'light' : 'dark');
  };

  // Cycle through all themes including OLED
  const cycleTheme = () => {
    setThemeState(prev => {
      const currentIndex = THEME_CYCLE.indexOf(prev);
      const nextIndex = (currentIndex + 1) % THEME_CYCLE.length;
      return THEME_CYCLE[nextIndex];
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const value = {
    theme,
    toggleTheme,
    setTheme,
    isOLED: theme === 'oled',
    cycleTheme
  };

  // Prevent flash of unstyled content
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
