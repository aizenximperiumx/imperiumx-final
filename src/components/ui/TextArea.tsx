import React from 'react';

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
};

export default function TextArea({ label, className = '', ...rest }: Props) {
  return (
    <div>
      {label && <label className="block text-gray-300 mb-2 font-semibold">{label}</label>}
      <textarea
        className={`w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all ${className}`}
        {...rest}
      />
    </div>
  );
}
