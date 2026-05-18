import React, { createContext, useContext, useState, useCallback } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface ToastContextType {
  toasts: Toast[];
  success: (message: string) => void;
  error: (message: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: 'success' | 'error') => {
      const id = Date.now().toString();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => remove(id), 3000);
    },
    [remove]
  );

  const success = useCallback((msg: string) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg: string) => addToast(msg, 'error'), [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, success, error, remove }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast ${t.type === 'success' ? 'toast-success' : 'toast-error'}`}
            onClick={() => remove(t.id)}
          >
            {t.type === 'success' ? '✓' : '✕'} {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
