import React, { useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Toast from './Toast';
import { useNavigate } from 'react-router-dom';

type Event = { type: string; title: string; body: string; timestamp: string; url?: string };

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' | 'info'; url?: string } | null>(null);
  const { token, isAuthenticated } = useAuth();
  const esRef = useRef<EventSource | null>(null);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const data = await api.get('/notifications', { headers });
      setEvents(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    load();
    try {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      const url = `/api/notifications/stream?token=${encodeURIComponent(token)}`;
      const es = new EventSource(url);
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          setEvents((prev) => [data, ...prev].slice(0, 20));
          if (!open) {
            setToast({ message: data.title || 'New notification', type: 'info', url: data.url });
          }
        } catch {}
      };
      esRef.current = es;
    } catch {}
    return () => {
      try { esRef.current?.close(); } catch {}
      esRef.current = null;
    };
  }, [isAuthenticated, token]);

  const count = events.length;

  return (
    <div className="relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={3000}
          actionLabel={toast.url ? 'View' : undefined}
          onAction={toast.url ? () => { navigate(toast.url as string); setToast(null); } : undefined}
        />
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
      >
        <span>🔔</span>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full px-1">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-black/90 border border-white/10 rounded-xl shadow-xl z-50">
          <div className="p-3 border-b border-white/10 font-bold">Notifications</div>
          <div className="max-h-80 overflow-y-auto">
            {events.length === 0 && (
              <div className="p-4 text-sm text-gray-400">No notifications</div>
            )}
            {events.map((e, i) => (
              <div key={i} className="p-4 border-b border-white/10">
                <div className="text-sm font-semibold">{e.title}</div>
                <div className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString()}</div>
                <div className="text-sm mt-1 text-gray-300">{e.body}</div>
              </div>
            ))}
          </div>
          <div className="p-2 text-center">
            <button onClick={() => setEvents([])} className="text-xs text-gray-400 hover:text-white">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
