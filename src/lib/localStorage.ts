/**
 * LocalStorage Utility for WillFlow CRM
 * Provides offline persistence for app data
 */

const STORAGE_KEYS = {
  PROJECTS: 'willflow_projects',
  CLIENTS: 'willflow_clients',
  USER_PREFERENCES: 'willflow_user_prefs',
  LAST_SYNC: 'willflow_last_sync',
  PENDING_ACTIONS: 'willflow_pending_actions',
  CACHE_VERSION: 'willflow_cache_version',
} as const;

const CACHE_VERSION = '1.0.0';

// Check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

// Generic get with type safety
function getItem<T>(key: string, defaultValue: T): T {
  if (!isLocalStorageAvailable()) return defaultValue;

  try {
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
}

// Generic set with error handling
function setItem<T>(key: string, value: T): boolean {
  if (!isLocalStorageAvailable()) return false;

  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error writing to localStorage: ${key}`, error);
    // Try to clear old data if storage is full
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      clearOldCache();
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

// Remove item
function removeItem(key: string): void {
  if (!isLocalStorageAvailable()) return;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Error removing from localStorage: ${key}`, error);
  }
}

// Clear old cache when storage is full
function clearOldCache(): void {
  const keysToKeep = Object.values(STORAGE_KEYS);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && !keysToKeep.includes(key as any)) {
      localStorage.removeItem(key);
    }
  }
}

// ============ Projects Cache ============

export interface CachedProject {
  id: string;
  title: string;
  clientId: string;
  phase: string;
  statusCaptacao?: string;
  statusEdicao?: string;
  clientPrice: number;
  captationCost: number;
  editionCost: number;
  margin: number;
  paymentStatus: string;
  freelancerPaymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export function cacheProjects(projects: CachedProject[]): boolean {
  const success = setItem(STORAGE_KEYS.PROJECTS, projects);
  if (success) {
    setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
  }
  return success;
}

export function getCachedProjects(): CachedProject[] {
  return getItem<CachedProject[]>(STORAGE_KEYS.PROJECTS, []);
}

// ============ Clients Cache ============

export interface CachedClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectCount: number;
  totalRevenue: number;
  totalMargin: number;
  createdAt: string;
}

export function cacheClients(clients: CachedClient[]): boolean {
  return setItem(STORAGE_KEYS.CLIENTS, clients);
}

export function getCachedClients(): CachedClient[] {
  return getItem<CachedClient[]>(STORAGE_KEYS.CLIENTS, []);
}

// ============ User Preferences ============

export interface UserPreferences {
  theme: 'dark' | 'light';
  language: string;
  currency: string;
  timezone: string;
  sidebarCollapsed: boolean;
  lastActiveView: string;
  recentSearches: string[];
  favoriteProjects: string[];
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dark',
  language: 'pt-PT',
  currency: 'EUR',
  timezone: 'Europe/Lisbon',
  sidebarCollapsed: false,
  lastActiveView: 'dashboard',
  recentSearches: [],
  favoriteProjects: [],
};

export function savePreferences(prefs: Partial<UserPreferences>): boolean {
  const current = getPreferences();
  return setItem(STORAGE_KEYS.USER_PREFERENCES, { ...current, ...prefs });
}

export function getPreferences(): UserPreferences {
  return getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
}

export function updatePreference<K extends keyof UserPreferences>(
  key: K,
  value: UserPreferences[K]
): boolean {
  const prefs = getPreferences();
  prefs[key] = value;
  return setItem(STORAGE_KEYS.USER_PREFERENCES, prefs);
}

// ============ Pending Actions (Offline Queue) ============

export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'project' | 'client';
  data: any;
  timestamp: string;
  retryCount: number;
}

export function addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp' | 'retryCount'>): boolean {
  const pending = getPendingActions();
  const newAction: PendingAction = {
    ...action,
    id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  };
  pending.push(newAction);
  return setItem(STORAGE_KEYS.PENDING_ACTIONS, pending);
}

export function getPendingActions(): PendingAction[] {
  return getItem<PendingAction[]>(STORAGE_KEYS.PENDING_ACTIONS, []);
}

export function removePendingAction(actionId: string): boolean {
  const pending = getPendingActions().filter(a => a.id !== actionId);
  return setItem(STORAGE_KEYS.PENDING_ACTIONS, pending);
}

export function clearPendingActions(): boolean {
  return setItem(STORAGE_KEYS.PENDING_ACTIONS, []);
}

export function hasPendingActions(): boolean {
  return getPendingActions().length > 0;
}

// ============ Sync Status ============

export function getLastSyncTime(): Date | null {
  const timestamp = getItem<string | null>(STORAGE_KEYS.LAST_SYNC, null);
  return timestamp ? new Date(timestamp) : null;
}

export function isDataStale(maxAgeMinutes: number = 30): boolean {
  const lastSync = getLastSyncTime();
  if (!lastSync) return true;

  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  return diffMinutes > maxAgeMinutes;
}

// ============ Cache Management ============

export function clearAllCache(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    removeItem(key);
  });
}

export function getCacheSize(): number {
  if (!isLocalStorageAvailable()) return 0;

  let total = 0;
  Object.values(STORAGE_KEYS).forEach(key => {
    const item = localStorage.getItem(key);
    if (item) {
      total += item.length * 2; // UTF-16 uses 2 bytes per character
    }
  });

  return total;
}

export function getCacheSizeFormatted(): string {
  const bytes = getCacheSize();
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// ============ Version Management ============

export function checkCacheVersion(): boolean {
  const storedVersion = getItem<string>(STORAGE_KEYS.CACHE_VERSION, '');
  if (storedVersion !== CACHE_VERSION) {
    // Clear cache if version mismatch
    clearAllCache();
    setItem(STORAGE_KEYS.CACHE_VERSION, CACHE_VERSION);
    return false;
  }
  return true;
}

// Initialize cache version check on module load
if (typeof window !== 'undefined') {
  checkCacheVersion();
}

// ============ Export all functions ============

export const localStorageUtils = {
  isAvailable: isLocalStorageAvailable,
  cacheProjects,
  getCachedProjects,
  cacheClients,
  getCachedClients,
  savePreferences,
  getPreferences,
  updatePreference,
  addPendingAction,
  getPendingActions,
  removePendingAction,
  clearPendingActions,
  hasPendingActions,
  getLastSyncTime,
  isDataStale,
  clearAllCache,
  getCacheSize,
  getCacheSizeFormatted,
};

export default localStorageUtils;
