import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isExiting?: boolean;
  duration?: number;
}

interface ToastContextType {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isExiting: true } : t))
    );

    // Wait for the exit animation to complete before removing from state
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const addToast = useCallback(
    (message: string, type: Toast['type'], duration = 4000) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, duration?: number) => addToast(message, 'success', duration),
    [addToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => addToast(message, 'error', duration),
    [addToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => addToast(message, 'warning', duration),
    [addToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => addToast(message, 'info', duration),
    [addToast]
  );

  // Map toast types to styles, icons and colors
  const toastConfig = {
    success: {
      border: 'border-l-4 border-emerald-500',
      progress: 'bg-emerald-500',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
      title: 'Éxito',
      titleColor: 'text-emerald-400',
      shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]',
    },
    error: {
      border: 'border-l-4 border-shisha-ember',
      progress: 'bg-shisha-ember',
      icon: <XCircle className="w-5 h-5 text-shisha-ember shrink-0 mt-0.5" />,
      title: 'Error',
      titleColor: 'text-shisha-ember',
      shadow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]',
    },
    warning: {
      border: 'border-l-4 border-amber-500',
      progress: 'bg-amber-500',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
      title: 'Advertencia',
      titleColor: 'text-amber-400',
      shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.15)]',
    },
    info: {
      border: 'border-l-4 border-shisha-neon',
      progress: 'bg-shisha-neon',
      icon: <Info className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />,
      title: 'Información',
      titleColor: 'text-purple-400',
      shadow: 'shadow-[0_0_20px_rgba(168,85,247,0.15)]',
    },
  };

  return (
    <ToastContext.Provider value={{ success, error, warning, info }}>
      {children}

      {/* Toast Floating Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => {
          const config = toastConfig[toast.type];
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto glass-panel flex items-start gap-3 p-4 rounded-xl shadow-2xl relative overflow-hidden transition-all duration-300 ${
                config.border
              } ${config.shadow} ${
                toast.isExiting ? 'animate-toast-out' : 'animate-toast-in'
              }`}
            >
              {config.icon}
              <div className="flex-1 mr-4">
                <p className={`font-black text-xs uppercase tracking-wider mb-1 ${config.titleColor}`}>
                  {config.title}
                </p>
                <p className="text-shisha-text-main text-xs font-medium leading-relaxed">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-3 right-3 text-shisha-text-dim hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Progress Bar */}
              {!toast.isExiting && (
                <div
                  className={`absolute bottom-0 left-0 h-1 ${config.progress}`}
                  style={{
                    animation: `shrink ${toast.duration ?? 4000}ms linear forwards`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
