import React from 'react';

type Tab = { id: string; label: string };

type Props = {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
};

export default function Tabs({ tabs, active, onChange, className = '' }: Props) {
  return (
    <div role="tablist" aria-label="Tabs" className={`flex gap-2 ${className}`}>
      {tabs.map(t => {
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(t.id)}
            className={`px-4 py-2 rounded-xl transition-all duration-180 ease-out-quint focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-red600 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20 ${
              isActive ? 'bg-gradient-to-r from-brand-red600 to-brand-red700 text-white' : 'bg-white/10 hover:bg-white/20 text-gray-200'
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
