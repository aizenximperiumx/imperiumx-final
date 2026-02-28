import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type Item = {
  id: string;
  user: { id: string; username: string; email: string; role: string; discord?: string } | null;
  delta: number;
  reason: string;
  meta?: any;
  createdAt: string;
};

export default function StaffLedger() {
  const { token, isCEO } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const load = async () => {
      if (!token || !isCEO) return;
      setLoading(true);
      try {
        const data = await api.get('/loyalty/transactions/all?limit=500', { headers: { Authorization: `Bearer ${token}` } });
        setItems(data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [token, isCEO]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(i => {
      const parts = [i.user?.username || '', i.user?.discord || '', i.reason, JSON.stringify(i.meta || {})];
      return parts.some(p => String(p).toLowerCase().includes(q));
    });
  }, [items, query]);

  const exportCsv = () => {
    const lines = [
      ['timestamp','username','discord','delta','reason','meta'].join(','),
      ...filtered.map(i => [
        new Date(i.createdAt).toISOString(),
        i.user?.username || '',
        i.user?.discord || '',
        i.delta,
        i.reason,
        JSON.stringify(i.meta || {}),
      ].map(v => `"${String(v).replace(/"/g,'"')}"`).join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `points-ledger.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!isCEO) return <div className="min-h-screen flex items-center justify-center">CEO only</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">Points Ledger</h1>
            <p className="text-gray-400 text-sm">All point transactions across users</p>
          </div>
          <div className="flex gap-3">
            <Input placeholder="Search…" value={query} onChange={e => setQuery(e.target.value)} />
            <Button variant="secondary" onClick={exportCsv}>Export CSV</Button>
          </div>
        </div>

        {loading && <div className="text-gray-400">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="text-gray-400">No transactions</div>}

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.slice(0, 200).map(i => (
            <Card key={i.id} variant="lux" color="brand" padded>
              <div className="flex items-center justify-between">
                <div className="font-bold">{i.user?.username || '—'} • {i.user?.discord || '—'}</div>
                <div className="text-xs text-gray-400">{new Date(i.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-2 text-sm text-gray-200">
                <span className={`font-bold ${i.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{i.delta >= 0 ? `+${i.delta}` : i.delta} pts</span>
                <span className="ml-2 text-gray-300">• {i.reason}</span>
              </div>
              {i.meta && <div className="mt-1 text-xs text-gray-400 break-all">{JSON.stringify(i.meta)}</div>}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
