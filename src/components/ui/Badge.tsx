import React from 'react';

type Props = {
  children: React.ReactNode;
  color?: 'red' | 'green' | 'blue' | 'yellow' | 'gray' | 'purple';
  className?: string;
};

const styles: Record<NonNullable<Props['color']>, string> = {
  red: 'bg-red-500/20 text-red-400',
  green: 'bg-green-500/20 text-green-400',
  blue: 'bg-blue-500/20 text-blue-400',
  yellow: 'bg-yellow-500/20 text-yellow-300',
  gray: 'bg-gray-500/20 text-gray-300',
  purple: 'bg-purple-600/20 text-purple-300',
};

export default function Badge({ children, color = 'gray', className = '' }: Props) {
  return (
    <span className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide uppercase ${styles[color]} ${className}`}>
      {children}
    </span>
  );
}
