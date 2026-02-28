import React from 'react';

type Props = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export default function Select({ label, className = '', children, ...rest }: Props) {
  return (
    <div>
      {label && <label className="block text-gray-300 mb-2 font-semibold">{label}</label>}
      <select
        className={`w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white transition-all duration-180 ease-out-quint focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red600 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  );
}
