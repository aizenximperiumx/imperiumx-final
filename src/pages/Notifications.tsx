import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Event = { type: string; title: string; body: string; timestamp: string };

export default function Notifications() {
  const { token, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const data = await api.get('/notifications', { headers });
      setEvents(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      load();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  if (!isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Please login to view notifications</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Notifications</h1>
          <p className="text-gray-400">Your recent account activity</p>
        </div>

        {loading && <div className="text-center text-gray-400">Loading…</div>}

        {!loading && events.length === 0 && (
          <div className="text-center text-gray-400">No notifications yet</div>
        )}

        <div className="space-y-3">
          {events.map((e, i) => (
            <div key={i} className="p-4 lux-card lux-card-brand rounded-2xl flex items-center justify-between">
              <div>
                <div className="font-semibold">{e.title}</div>
                <div className="text-sm text-gray-400">{e.body}</div>
              </div>
              <div className="text-xs text-gray-400">{new Date(e.timestamp).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
