import React, { useState } from 'react';

type Props = {
  label: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
};

export default function Tooltip({ label, children, side = 'top' }: Props) {
  const [open, setOpen] = useState(false);
  const pos = side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2';
  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <div className={`absolute ${pos} left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1 rounded-lg bg-black/80 border border-white/10 text-xs`}>
          {label}
        </div>
      )}
    </div>
  );
}
