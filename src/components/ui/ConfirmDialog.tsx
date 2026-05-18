import { createContext, useCallback, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning';
}

interface ConfirmState extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

const ConfirmContext = createContext<(opts: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...opts, resolve });
    });
  }, []);

  const respond = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };

  const isDanger = !state?.variant || state.variant === 'danger';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <motion.div
            className="modal-overlay"
            style={{ zIndex: 200 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => respond(false)}
          >
            <motion.div
              className="modal-content"
              style={{ maxWidth: 360, textAlign: 'center' }}
              initial={{ opacity: 0, scale: 0.93, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Ícone */}
              <div style={{
                width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isDanger ? 'var(--accent-red-soft)' : 'var(--accent-amber-soft)',
              }}>
                {isDanger
                  ? <Trash2 size={24} style={{ color: 'var(--accent-red)' }} />
                  : <AlertTriangle size={24} style={{ color: 'var(--accent-amber)' }} />
                }
              </div>

              {/* Texto */}
              <h3 style={{
                fontSize: '1rem', fontWeight: 700,
                color: 'var(--text-primary)', marginBottom: 8,
              }}>
                {state.title}
              </h3>
              {state.message && (
                <p style={{
                  fontSize: '0.845rem', color: 'var(--text-secondary)',
                  lineHeight: 1.55, marginBottom: 24,
                }}>
                  {state.message}
                </p>
              )}
              {!state.message && <div style={{ marginBottom: 24 }} />}

              {/* Botões */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="btn-secondary"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => respond(false)}
                >
                  {state.cancelLabel ?? 'Cancelar'}
                </button>
                <button
                  className={isDanger ? 'btn-danger' : 'btn-primary'}
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => respond(true)}
                >
                  {state.confirmLabel ?? 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
