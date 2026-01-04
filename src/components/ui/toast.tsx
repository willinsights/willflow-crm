"use client"

import * as React from "react"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastActionElement = React.ReactElement<any>

export interface Toast {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "success" | "error" | "warning" | "info"
}

const ToastContext = React.createContext<{
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}>({
  toasts: [],
  addToast: () => {},
  removeToast: () => {},
})

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const getToastStyles = (variant?: Toast['variant']) => {
    switch (variant) {
      case 'success':
        return 'bg-green-500/20 border-green-500/50'
      case 'error':
        return 'bg-red-500/20 border-red-500/50'
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-500/50'
      case 'info':
        return 'bg-blue-500/20 border-blue-500/50'
      default:
        return 'glass-card'
    }
  }

  const getToastIcon = (variant?: Toast['variant']) => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-400" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
      case 'info':
        return <Info className="h-5 w-5 text-blue-400" />
      default:
        return null
    }
  }

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-2 max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "p-4 rounded-lg shadow-lg animate-in slide-in-from-bottom-5",
              getToastStyles(toast.variant)
            )}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start justify-between gap-3">
              {getToastIcon(toast.variant) && (
                <div className="flex-shrink-0 mt-0.5">
                  {getToastIcon(toast.variant)}
                </div>
              )}
              <div className="flex-1">
                {toast.title && (
                  <div className="font-semibold">{toast.title}</div>
                )}
                {toast.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {toast.description}
                  </div>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-muted-foreground hover:text-foreground flex-shrink-0"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return {
    toast: context.addToast,
    dismiss: context.removeToast,
  }
}
