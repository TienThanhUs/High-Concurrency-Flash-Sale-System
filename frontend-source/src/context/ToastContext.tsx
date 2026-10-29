import React, { createContext, useState, useCallback } from 'react';
import { PixelIconCheck, PixelIconAlert, PixelIconClose } from '../components/icons/PixelIcon';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      setToasts((prev) => [...prev, { id, type, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-pixel-green',
          border: 'border-outline',
          text: 'text-text-on-accent',
          icon: <PixelIconCheck size={16} className="text-text-on-accent" />,
        };
      case 'error':
        return {
          bg: 'bg-pixel-red',
          border: 'border-outline',
          text: 'text-text',
          icon: <PixelIconAlert size={16} className="text-white" />,
        };
      case 'warning':
        return {
          bg: 'bg-pixel-yellow',
          border: 'border-outline',
          text: 'text-text-on-accent',
          icon: <PixelIconAlert size={16} className="text-text-on-accent" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-pixel-blue',
          border: 'border-outline',
          text: 'text-text-on-accent',
          icon: <PixelIconAlert size={16} className="text-text-on-accent" />,
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast container top-right fixed */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          const style = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              role="alert"
              className={`
                pointer-events-auto flex items-center justify-between gap-3 p-3
                ${style.bg} ${style.text}
                border-4 ${style.border} rounded-none
                shadow-[4px_4px_0_0_var(--outline)]
                font-body text-[16px] leading-tight select-none
              `}
            >
              <div className="flex items-center gap-2.5">
                <span className="shrink-0">{style.icon}</span>
                <span className="font-semibold">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 hover:brightness-90 active:scale-95 text-current cursor-pointer"
                aria-label="Đóng thông báo"
              >
                <PixelIconClose size={12} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export { ToastContext };
export type { ToastContextValue };
