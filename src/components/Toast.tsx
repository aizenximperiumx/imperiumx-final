import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Toast({ message, type, onClose, duration = 5000, actionLabel, onAction }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: 'from-green-600 to-green-700 shadow-green-500/30 border-green-500',
    error: 'from-brand-red600 to-brand-red700 shadow-red-500/30 border-red-500',
    warning: 'from-yellow-600 to-yellow-700 shadow-yellow-500/30 border-yellow-500',
    info: 'from-blue-600 to-blue-700 shadow-blue-500/30 border-blue-500',
  };

  return (
    <div role="alert" aria-live="polite" className={`fixed top-20 right-4 z-50 px-6 py-4 bg-gradient-to-r ${styles[type]} rounded-2xl shadow-2xl border-2 flex items-center gap-3 animate-slide-in max-w-md`}>
      <span className="font-semibold flex-1">{message}</span>
      {onAction && actionLabel && (
        <button onClick={onAction} className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20 text-sm font-semibold">
          {actionLabel}
        </button>
      )}
      <button 
        onClick={onClose} 
        className="ml-2 hover:opacity-70 transition-opacity text-xl"
      >
        ✕
      </button>
    </div>
  );
}
