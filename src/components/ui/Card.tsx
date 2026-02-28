import React from 'react';

type Props = React.HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  variant?: 'default' | 'lux';
  color?: 'brand' | 'gold';
};

export default function Card({ padded = true, variant = 'default', color = 'brand', className = '', children, ...rest }: Props) {
  const base = 'rounded-2xl shadow-panel bg-surface-900/80 backdrop-blur-xl border border-white/10';
  const padding = padded ? 'p-8' : '';
  const defaults = 'bg-gradient-to-br from-white/10 to-white/5';
  const lux = `lux-card ${color === 'gold' ? 'lux-card-gold' : 'lux-card-brand'}`;
  const applied = variant === 'lux' ? lux : defaults;
  return (
    <div className={`${base} ${applied} ${padding} ${className}`} {...rest}>
      {children}
    </div>
  );
}
