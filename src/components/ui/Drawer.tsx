import React, { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: 'right' | 'bottom';
  children: React.ReactNode;
};

export default function Drawer({ open, onClose, title, side = 'right', children }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const sideClasses =
    side === 'right'
      ? 'right-0 top-0 h-full w-full max-w-md translate-x-0'
      : 'left-0 bottom-0 w-full h-[65vh] translate-y-0';
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`absolute bg-surface-900/90 border-l border-white/10 shadow-panel transition-transform duration-240 ease-out-quint ${sideClasses}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="text-lg font-bold">{title}</div>
          <button onClick={onClose} className="px-3 py-1 bg-white/10 rounded-lg hover:bg-white/20">Close</button>
        </div>
        <div className="p-5 overflow-auto h-[calc(100%-73px)]">{children}</div>
      </div>
    </div>
  );
}
