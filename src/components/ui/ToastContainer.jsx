import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const STYLES = {
  success: 'bg-stone-900 text-stone-50 border-stone-700',
  error: 'bg-red-700 text-white border-red-600',
  info: 'bg-stone-700 text-stone-50 border-stone-600',
  warning: 'bg-amber-600 text-white border-amber-500',
};

const ICON_COLORS = {
  success: 'text-emerald-400',
  error: 'text-red-200',
  info: 'text-blue-300',
  warning: 'text-amber-200',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map(toast => {
        const Icon = ICONS[toast.type] ?? Info;
        return (
          <div
            key={toast.id}
            className={`
              pointer-events-auto flex items-start gap-3 min-w-[300px] max-w-[400px]
              border px-4 py-3.5 shadow-xl
              animate-toast-in
              ${STYLES[toast.type] ?? STYLES.info}
            `}
            role="alert"
          >
            <Icon
              size={18}
              className={`mt-0.5 flex-shrink-0 ${ICON_COLORS[toast.type] ?? ''}`}
            />
            <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity ml-1"
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
