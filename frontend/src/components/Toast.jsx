import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let borderClass = 'border-orbit-steel/30';
        let icon = <Info className="w-5 h-5 text-orbit-steel" />;

        if (toast.type === 'success') {
          borderClass = 'border-orbit-lime/60 bg-orbit-midnight/95';
          icon = <CheckCircle2 className="w-5 h-5 text-orbit-lime" />;
        } else if (toast.type === 'error') {
          borderClass = 'border-orbit-coral/60 bg-orbit-midnight/95';
          icon = <AlertCircle className="w-5 h-5 text-orbit-coral" />;
        } else {
          borderClass = 'border-orbit-borderLight bg-orbit-surface/95';
          icon = <Info className="w-5 h-5 text-orbit-lime" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-2xl backdrop-blur-md border ${borderClass} text-orbit-ivory transition-all duration-300 animate-slide-in`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-1 text-sm font-sans leading-relaxed">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-orbit-steel hover:text-orbit-ivory transition-colors p-1"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
