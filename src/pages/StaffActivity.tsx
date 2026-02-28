import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type Item = {
  id: string;
  userId?: string | null;
  type: string;
  meta?: any;
  createdAt: string;
};

export default function StaffActivity() {
  const { token, isStaff } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!token || !isStaff) return;
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('limit', '100');
        if (type) params.set('type', type);
        const data = await api.get(`/activity?${params.toString()}`, { headers: { Authorization: `Bearer ${token}` } });
        setItems(data || []);
      } catch (e) {}
      setLoading(false);
    };
    load();
  }, [token, isStaff, type]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => {
      const parts = [i.type, i.userId || '', JSON.stringify(i.meta || {})];
      return parts.some(p => String(p).toLowerCase().includes(q));
    });
  }, [items, query]);

  if (!isStaff) return <div className="min-h-screen flex items-center justify-center">Staff only</div>;

  const types = [
    'user.register',
    'user.login',
    'ticket.create',
    'order.completed',
    'admin.user.update',
    'admin.user.password',
    'admin.user.ban',
    'admin.user.unban',
    'loyalty.redeem',
    'referral.credit',
    'giftcard.generate',
    'giftcard.redeem',
  ];

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Activity Feed</h1>
            <p className="text-gray-400 text-sm">Live view of site events</p>
          </div>
          <div className="flex gap-3">
            <Input placeholder="Search events…" value={query} onChange={e => setQuery(e.target.value)} />
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white"
            >
              <option value="">All types</option>
              {types.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <Button variant="secondary" onClick={() => setType('')}>Reset</Button>
          </div>
        </div>
        {loading && <div className="text-gray-400">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="text-gray-400">No events</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.slice(0, 100).map(i => (
            <Card key={i.id} variant="lux" color="brand" padded>
              <div className="flex items-center justify-between">
                <div className="font-bold">{i.type}</div>
                <div className="text-xs text-gray-400">{new Date(i.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-xs text-gray-300 mt-2">User: {i.userId || '—'}</div>
              <div className="mt-2 text-gray-200 text-sm">
                <pre className="whitespace-pre-wrap break-all">{JSON.stringify(i.meta || {}, null, 2)}</pre>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
