import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  const items = [
    { to: '/', label: 'Home', icon: HomeIcon },
    { to: '/browse', label: 'Browse', icon: GridIcon },
    { to: '/tickets', label: 'Tickets', icon: TicketIcon },
    { to: '/profile', label: 'Profile', icon: UserIcon },
    { to: '/more', label: 'More', icon: DotsIcon },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="mx-auto max-w-7xl px-2 pb-2">
        <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl shadow-panel">
          <ul className="grid grid-cols-5">
            {items.map(({ icon: Icon, ...item }) => {
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <li key={item.to}>
                  <Link
                    to={item.to === '/more' ? '/profile' : item.to}
                    className={`flex flex-col items-center py-3 text-xs font-semibold transition-all duration-180 ease-out-quint ${active ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span>{item.label}</span>
                    {active && <span className="mt-1 w-6 h-1 rounded-full bg-gradient-to-r from-brand-red600 to-brand-red700" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </nav>
  );
}

function HomeIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10a1 1 0 001 1h12a1 1 0 001-1V10" />
    </svg>
  );
}
function GridIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="8" height="8" />
      <rect x="13" y="3" width="8" height="8" />
      <rect x="3" y="13" width="8" height="8" />
      <rect x="13" y="13" width="8" height="8" />
    </svg>
  );
}
function TicketIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 01-2 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 002-2V8z" />
      <path d="M12 8v8" />
    </svg>
  );
}
function UserIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="7" r="4" />
      <path d="M6 21c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    </svg>
  );
}
function DotsIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}
