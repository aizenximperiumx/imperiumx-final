import React, { useEffect } from 'react';

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
};

export default function Modal({ open, title, onClose, children, footer, size = 'md' }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  const widths: Record<string, string> = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} mx-4 rounded-2xl bg-surface-900/90 border border-white/10 shadow-panel`}>
        <div className="p-6">
          {title && <div className="text-xl font-bold mb-3">{title}</div>}
          <div>{children}</div>
        </div>
        {footer && <div className="p-4 border-t border-white/10 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
