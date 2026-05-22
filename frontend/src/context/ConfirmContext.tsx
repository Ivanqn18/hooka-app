import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { AlertTriangle, Info, HelpCircle, X } from 'lucide-react';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info' | 'question';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const [animateIn, setAnimateIn] = useState(false);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({
        options,
        resolve,
      });
    });
  }, []);

  useEffect(() => {
    if (state) {
      // Trigger animations
      const timer = requestAnimationFrame(() => {
        setAnimateIn(true);
      });
      
      // Auto-focus confirm button
      const focusTimer = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 50);

      return () => {
        cancelAnimationFrame(timer);
        clearTimeout(focusTimer);
      };
    } else {
      setAnimateIn(false);
    }
  }, [state]);

  const handleClose = useCallback((value: boolean) => {
    if (!state) return;
    setAnimateIn(false);
    
    // Wait for exit transition to complete before clearing state and resolving
    const timer = setTimeout(() => {
      state.resolve(value);
      setState(null);
    }, 200);

    return () => clearTimeout(timer);
  }, [state]);

  const handleConfirm = () => handleClose(true);
  const handleCancel = () => handleClose(false);

  // Close on Escape key press
  useEffect(() => {
    if (!state) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, handleClose]);

  // Modal configuration based on confirmation type
  const typeConfig = {
    danger: {
      icon: <AlertTriangle className="w-7 h-7 text-rose-500" />,
      borderColor: 'border-rose-500/30',
      glowColor: 'rgba(244, 63, 94, 0.2)', // rose-500
      confirmBtnClass: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20 text-white',
      iconBg: 'bg-rose-500/10 border-rose-500/20',
    },
    warning: {
      icon: <AlertTriangle className="w-7 h-7 text-amber-500" />,
      borderColor: 'border-amber-500/30',
      glowColor: 'rgba(245, 158, 11, 0.2)', // amber-500
      confirmBtnClass: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20 text-white',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
    },
    info: {
      icon: <Info className="w-7 h-7 text-shisha-neon" />,
      borderColor: 'border-purple-500/30',
      glowColor: 'rgba(168, 85, 247, 0.2)', // shisha-neon
      confirmBtnClass: 'bg-shisha-neon hover:bg-purple-600 shadow-purple-500/20 text-white',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
    },
    question: {
      icon: <HelpCircle className="w-7 h-7 text-emerald-400" />,
      borderColor: 'border-emerald-500/30',
      glowColor: 'rgba(16, 185, 129, 0.2)', // emerald-500
      confirmBtnClass: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    },
  };

  const currentType = state?.options.type || 'question';
  const config = typeConfig[currentType];

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {state && (
        <div
          className={`fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-200 ${
            animateIn ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleCancel}
        >
          {/* Modal Container */}
          <div
            className={`glass-panel-premium w-full max-w-md rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden transition-all duration-200 transform shadow-3xl border border-white/10 ${
              animateIn ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color accent glow in the background */}
            <div
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-[80px] pointer-events-none"
              style={{ backgroundColor: config.glowColor }}
            />

            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 p-2 rounded-xl text-shisha-text-dim hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon Badge */}
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${config.iconBg} mb-5`}>
              {config.icon}
            </div>

            {/* Title & Message */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-snug">
                {state.options.title}
              </h3>
              <p className="text-shisha-text-muted text-sm leading-relaxed font-medium">
                {state.options.message}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-shisha-text-muted hover:text-white transition-colors font-black text-[10px] uppercase tracking-widest cursor-pointer"
              >
                {state.options.cancelText || 'Cancelar'}
              </button>
              <button
                ref={confirmButtonRef}
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 duration-200 cursor-pointer ${config.confirmBtnClass}`}
              >
                {state.options.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (context === undefined) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};
