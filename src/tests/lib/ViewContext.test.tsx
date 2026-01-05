import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { ViewProvider, useView } from '@/lib/ViewContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ViewContext', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  it('deve fornecer o valor padrão como compact', () => {
    const { result } = renderHook(() => useView(), {
      wrapper: ViewProvider,
    });

    expect(result.current.viewMode).toBe('compact');
    expect(result.current.isCompact).toBe(true);
    expect(result.current.isDetailed).toBe(false);
  });

  it('deve alternar entre compact e detailed', () => {
    const { result } = renderHook(() => useView(), {
      wrapper: ViewProvider,
    });

    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe('detailed');
    expect(result.current.isCompact).toBe(false);
    expect(result.current.isDetailed).toBe(true);

    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.viewMode).toBe('compact');
    expect(result.current.isCompact).toBe(true);
    expect(result.current.isDetailed).toBe(false);
  });

  it('deve definir o modo de visualização diretamente', () => {
    const { result } = renderHook(() => useView(), {
      wrapper: ViewProvider,
    });

    act(() => {
      result.current.setViewMode('detailed');
    });

    expect(result.current.viewMode).toBe('detailed');
    expect(result.current.isDetailed).toBe(true);

    act(() => {
      result.current.setViewMode('compact');
    });

    expect(result.current.viewMode).toBe('compact');
    expect(result.current.isCompact).toBe(true);
  });

  it('deve persistir o modo de visualização no localStorage', () => {
    const { result } = renderHook(() => useView(), {
      wrapper: ViewProvider,
    });

    act(() => {
      result.current.setViewMode('detailed');
    });

    expect(localStorageMock.getItem('willflow-view-mode')).toBe('detailed');

    act(() => {
      result.current.setViewMode('compact');
    });

    expect(localStorageMock.getItem('willflow-view-mode')).toBe('compact');
  });

  it('deve carregar o modo de visualização salvo do localStorage', () => {
    localStorageMock.setItem('willflow-view-mode', 'detailed');

    const { result } = renderHook(() => useView(), {
      wrapper: ViewProvider,
    });

    // Wait for useEffect to run
    expect(result.current.viewMode).toBe('detailed');
    expect(result.current.isDetailed).toBe(true);
  });

  it('deve lançar erro se usado fora do ViewProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useView());
    }).toThrow('useView must be used within a ViewProvider');

    consoleSpy.mockRestore();
  });

  it('deve fornecer valores corretos para isCompact e isDetailed', () => {
    const { result } = renderHook(() => useView(), {
      wrapper: ViewProvider,
    });

    // Initial state: compact
    expect(result.current.isCompact).toBe(true);
    expect(result.current.isDetailed).toBe(false);

    // Toggle to detailed
    act(() => {
      result.current.toggleViewMode();
    });

    expect(result.current.isCompact).toBe(false);
    expect(result.current.isDetailed).toBe(true);
  });
});
