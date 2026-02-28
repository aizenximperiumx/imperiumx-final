import React from 'react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  full?: boolean;
};

export default function Button({ variant = 'primary', size = 'md', full, className = '', ...rest }: Props) {
  const base = 'rounded-xl font-bold transition-all duration-180 ease-out-quint focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red600 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 active:scale-95';
  const variants: Record<string, string> = {
    primary: 'bg-gradient-to-r from-brand-red600 to-brand-red700 hover:opacity-90 shadow-lg shadow-red-500/30 text-white',
    secondary: 'bg-white/10 hover:bg-white/20 border border-white/20 text-white',
    danger: 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:opacity-90 text-white',
    ghost: 'bg-transparent hover:bg-white/10 border border-white/10 text-gray-200',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3',
    lg: 'px-8 py-4 text-lg',
  };
  const width = full ? 'w-full' : '';
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${width} ${className}`}
      {...rest}
    />
  );
}
