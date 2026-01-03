'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Supported locales
export type SupportedLocale = 'pt-PT' | 'pt-BR';
export type SupportedCurrency = 'EUR' | 'BRL';
export type SupportedTimezone = 'Europe/Lisbon' | 'America/Sao_Paulo';

// Locale configuration
interface LocaleConfig {
  locale: SupportedLocale;
  currency: SupportedCurrency;
  timezone: SupportedTimezone;
  currencySymbol: string;
  currencyPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandsSeparator: string;
  dateFormat: string;
  timeFormat: string;
}

// Preset configurations
const LOCALE_PRESETS: Record<SupportedLocale, LocaleConfig> = {
  'pt-PT': {
    locale: 'pt-PT',
    currency: 'EUR',
    timezone: 'Europe/Lisbon',
    currencySymbol: '€',
    currencyPosition: 'before',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
  'pt-BR': {
    locale: 'pt-BR',
    currency: 'BRL',
    timezone: 'America/Sao_Paulo',
    currencySymbol: 'R$',
    currencyPosition: 'before',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: 'HH:mm',
  },
};

// Context type
interface LocaleContextType {
  config: LocaleConfig;
  locale: SupportedLocale;
  currency: SupportedCurrency;
  timezone: SupportedTimezone;

  // Actions
  setLocale: (locale: SupportedLocale) => void;
  setCurrency: (currency: SupportedCurrency) => void;
  setTimezone: (timezone: SupportedTimezone) => void;

  // Formatters
  formatCurrency: (value: number) => string;
  formatDate: (date: Date | string, includeTime?: boolean) => string;
  formatRelativeDate: (date: Date | string) => string;
  formatNumber: (value: number, decimals?: number) => string;

  // Labels
  getLocaleLabel: (locale: SupportedLocale) => string;
  getCurrencyLabel: (currency: SupportedCurrency) => string;
  getTimezoneLabel: (timezone: SupportedTimezone) => string;
}

const LocaleContext = createContext<LocaleContextType | null>(null);

const STORAGE_KEY = 'willflow-locale-config';

// Labels
const LOCALE_LABELS: Record<SupportedLocale, string> = {
  'pt-PT': 'Português (Portugal)',
  'pt-BR': 'Português (Brasil)',
};

const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  'EUR': 'Euro (€)',
  'BRL': 'Real (R$)',
};

const TIMEZONE_LABELS: Record<SupportedTimezone, string> = {
  'Europe/Lisbon': 'Lisboa (UTC+0/+1)',
  'America/Sao_Paulo': 'São Paulo (UTC-3)',
};

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LocaleConfig>(LOCALE_PRESETS['pt-PT']);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle any missing properties
        const locale = parsed.locale as SupportedLocale || 'pt-PT';
        const baseConfig = LOCALE_PRESETS[locale];
        setConfig({
          ...baseConfig,
          ...parsed,
        });
      }
    } catch (error) {
      console.error('Error loading locale config:', error);
    }
    setMounted(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, mounted]);

  // Set locale and auto-adjust currency/timezone
  const setLocale = (locale: SupportedLocale) => {
    const preset = LOCALE_PRESETS[locale];
    setConfig(preset);
  };

  // Override currency manually
  const setCurrency = (currency: SupportedCurrency) => {
    setConfig(prev => ({
      ...prev,
      currency,
      currencySymbol: currency === 'EUR' ? '€' : 'R$',
    }));
  };

  // Override timezone manually
  const setTimezone = (timezone: SupportedTimezone) => {
    setConfig(prev => ({ ...prev, timezone }));
  };

  // Format currency with locale settings
  const formatCurrency = (value: number): string => {
    const absValue = Math.abs(value);
    const isNegative = value < 0;

    // Format number with separators
    const parts = absValue.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);
    const decimalPart = parts[1];

    const formattedNumber = `${integerPart}${config.decimalSeparator}${decimalPart}`;

    // Apply currency symbol
    let result: string;
    if (config.currencyPosition === 'before') {
      result = `${config.currencySymbol}${formattedNumber}`;
    } else {
      result = `${formattedNumber} ${config.currencySymbol}`;
    }

    return isNegative ? `-${result}` : result;
  };

  // Format date with timezone
  const formatDate = (date: Date | string, includeTime: boolean = false): string => {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) {
      return '-';
    }

    try {
      const options: Intl.DateTimeFormatOptions = {
        timeZone: config.timezone,
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      };

      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }

      return d.toLocaleDateString(config.locale, options);
    } catch {
      // Fallback for SSR
      const day = d.getDate().toString().padStart(2, '0');
      const month = (d.getMonth() + 1).toString().padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  // Format relative date (hoje, ontem, há X dias)
  const formatRelativeDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();

    const diffTime = now.getTime() - d.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `Há ${diffDays} dias`;
    if (diffDays < 30) return `Há ${Math.floor(diffDays / 7)} semanas`;
    if (diffDays < 365) return `Há ${Math.floor(diffDays / 30)} meses`;
    return `Há ${Math.floor(diffDays / 365)} anos`;
  };

  // Format number
  const formatNumber = (value: number, decimals: number = 0): string => {
    const parts = value.toFixed(decimals).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, config.thousandsSeparator);

    if (decimals > 0 && parts[1]) {
      return `${integerPart}${config.decimalSeparator}${parts[1]}`;
    }

    return integerPart;
  };

  // Label getters
  const getLocaleLabel = (locale: SupportedLocale) => LOCALE_LABELS[locale];
  const getCurrencyLabel = (currency: SupportedCurrency) => CURRENCY_LABELS[currency];
  const getTimezoneLabel = (timezone: SupportedTimezone) => TIMEZONE_LABELS[timezone];

  const value: LocaleContextType = {
    config,
    locale: config.locale,
    currency: config.currency,
    timezone: config.timezone,
    setLocale,
    setCurrency,
    setTimezone,
    formatCurrency,
    formatDate,
    formatRelativeDate,
    formatNumber,
    getLocaleLabel,
    getCurrencyLabel,
    getTimezoneLabel,
  };

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

// Export constants for use in settings
export { LOCALE_LABELS, CURRENCY_LABELS, TIMEZONE_LABELS, LOCALE_PRESETS };
