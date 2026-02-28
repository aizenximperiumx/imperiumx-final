import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Cmd = { label: string; path: string; hotkey?: string };

export default function CommandPalette() {
  const { isAuthenticated, isStaff } = useAuth();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands: Cmd[] = useMemo(() => {
    const base: Cmd[] = [
      { label: 'Home', path: '/' },
      { label: 'Browse', path: '/browse' },
      { label: 'Bundles', path: '/bundle' },
      { label: 'Reviews', path: '/reviews' },
      { label: 'Terms', path: '/terms' },
    ];
    if (isAuthenticated) {
      base.push(
        { label: 'My Tickets', path: '/tickets' },
        { label: 'Create Ticket', path: '/tickets/create' },
        { label: 'Profile', path: '/profile' },
        { label: 'Notifications', path: '/notifications' },
        { label: 'Loyalty', path: '/loyalty' },
        { label: 'Referral', path: '/referral' },
        { label: 'Gift Cards', path: '/gift-cards' },
      );
    }
    if (isStaff) {
      base.push(
        { label: 'Staff Dashboard', path: '/staff' },
        { label: 'Analytics', path: '/staff/analytics' },
        { label: 'Moderate Reviews', path: '/staff/reviews' },
      );
    }
    return base;
  }, [isAuthenticated, isStaff]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(c => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(v => !v);
        setQuery('');
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-black/70 animate-fade-in">
      <div className="w-full max-w-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-3 border-b border-white/10">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or page…"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-red-500"
          />
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filtered.map((cmd, i) => (
            <button
              key={i}
              onClick={() => { setOpen(false); navigate(cmd.path); }}
              className="w-full text-left px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>{cmd.label}</span>
              <span className="text-xs text-gray-400">{cmd.path}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-6 text-gray-400 text-center">No matches</div>
          )}
        </div>
      </div>
    </div>
  );
}
