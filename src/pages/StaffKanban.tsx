import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

type Ticket = {
  id: string;
  orderId?: string | null;
  status: 'open' | 'payment_pending' | 'completed' | 'closed';
  type: 'buying' | 'support';
  priority: 'normal' | 'urgent';
  createdAt: string;
  user?: { username: string; email: string };
  assignedUser?: { username: string; email: string } | null;
};

const COLUMNS: Array<{ key: Ticket['status']; title: string }> = [
  { key: 'open', title: 'Open' },
  { key: 'payment_pending', title: 'Payment Pending' },
  { key: 'completed', title: 'Completed' },
  { key: 'closed', title: 'Closed' },
];

export default function StaffKanban() {
  const { token, isStaff, isCEO } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const data = await api.get('/tickets', { headers });
      setTickets(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaff || isCEO) {
      load();
    } else {
      setLoading(false);
    }
  }, [isStaff, isCEO, token]);

  const grouped = useMemo(() => {
    const map: Record<Ticket['status'], Ticket[]> = {
      open: [],
      payment_pending: [],
      completed: [],
      closed: [],
    };
    tickets.forEach(t => {
      if (map[t.status]) map[t.status].push(t);
    });
    return map;
  }, [tickets]);

  if (!isStaff && !isCEO) {
    return <div className="min-h-screen flex items-center justify-center">Staff only</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Tickets Kanban</h1>
          <button
            onClick={load}
            className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
          >
            Refresh
          </button>
        </div>
        {loading && <div className="text-gray-400">Loading…</div>}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map(col => (
            <div key={col.key} className="lux-card lux-card-brand rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-bold">{col.title}</div>
                <div className="text-xs text-gray-400">{grouped[col.key].length}</div>
              </div>
              <div className="space-y-3">
                {grouped[col.key].map(t => (
                  <button
                    key={t.id}
                    onClick={() => navigate(`/tickets/${t.id}`)}
                    className="w-full text-left p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition-colors"
                    title={t.orderId || t.id}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">
                        {t.orderId || t.id.substring(0, 8)}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        t.priority === 'urgent' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {t.priority === 'urgent' ? 'Urgent' : 'Normal'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {t.type === 'buying' ? 'Buying' : 'Support'} • {new Date(t.createdAt).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {t.user?.username || 'Customer'}{t.assignedUser ? ` → ${t.assignedUser.username}` : ''}
                    </div>
                  </button>
                ))}
                {grouped[col.key].length === 0 && (
                  <div className="text-sm text-gray-400">No tickets</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
