import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start justify-between gap-3 backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-slate-900/95 border-emerald-500/40 text-white'
                : toast.type === 'error'
                ? 'bg-slate-900/95 border-rose-500/40 text-white'
                : 'bg-slate-900/95 border-blue-500/40 text-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle size={18} className="text-rose-400" />}
                {toast.type === 'info' && <Info size={18} className="text-blue-400" />}
              </div>
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold leading-tight">{toast.title}</h4>
                {toast.description && (
                  <p className="text-[11px] text-slate-300 leading-snug">{toast.description}</p>
                )}
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 p-0.5"
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
