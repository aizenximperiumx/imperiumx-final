import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Account = {
  id: string;
  game: string;
  level: number;
  skinsCount: number;
  rank: string;
  region: string;
  winRate: number;
  price?: number;
  originalPrice?: number;
  skinNames?: string[] | string;
  descriptionHtml?: string;
  rankHistory?: string;
  available?: boolean;
};

export default function BrowseAccounts() {
  const navigate = useNavigate();
  const { isStaff, isCEO, token } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [editHtml, setEditHtml] = useState<Record<string, string>>({});
  const [editRank, setEditRank] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [savingRank, setSavingRank] = useState<Record<string, boolean>>({});
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [drafts, setDrafts] = useState<Record<string, Partial<Account>>>({});
  const [creating, setCreating] = useState(false);
  const [createDraft, setCreateDraft] = useState<Partial<Account>>({
    id: '',
    game: 'valorant',
    level: 0,
    skinsCount: 0,
    rank: '',
    region: 'NA',
    winRate: 0,
    price: 0,
    originalPrice: 0,
    skinNames: '',
    descriptionHtml: '',
    rankHistory: '',
    available: true,
  });
  const [createSaving, setCreateSaving] = useState(false);
  const [createMsg, setCreateMsg] = useState<{ kind: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const timers = useRef<Record<string, any>>({});
  const rankTimers = useRef<Record<string, any>>({});

  useEffect(() => {
    const loadLocalDrafts = (): Account[] => {
      try {
        const raw = localStorage.getItem('ix_local_accounts') || '[]';
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      } catch {
        return [];
      }
    };
    const load = async () => {
      try {
        const list = await api.get('/accounts');
        const fromApi = Array.isArray(list) ? (list as Account[]) : [];
        const drafts = loadLocalDrafts();
        const merged = [...drafts, ...fromApi].filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i);
        setAccounts(merged);
      } catch {
        const drafts = loadLocalDrafts();
        setAccounts(drafts);
      }
    };
    load();
  }, []);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(acc => {
      if (filter !== 'all' && acc.game.toLowerCase() !== filter.toLowerCase()) return false;
      if (search) {
        const hay = [acc.game, acc.rank, acc.region].join(' ').toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
  }, [accounts, filter, search]);

  const summary = useMemo(() => {
    const total = accounts.length;
    const shown = filteredAccounts.length;
    const countByGame = accounts.reduce((m, a) => {
      const g = (a.game || 'other').toLowerCase();
      m[g] = (m[g] || 0) + 1;
      return m;
    }, {} as Record<string, number>);
    const avgWinRate = filteredAccounts.length
      ? Math.round(filteredAccounts.reduce((s, a) => s + (a.winRate || 0), 0) / filteredAccounts.length)
      : 0;
    return { total, shown, countByGame, avgWinRate };
  }, [accounts, filteredAccounts]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const beginEdit = (acc: Account) => {
    setIsEditing(e => ({ ...e, [acc.id]: true }));
    setDrafts(d => ({
      ...d,
      [acc.id]: {
        id: acc.id,
        game: acc.game,
        level: acc.level,
        skinsCount: acc.skinsCount,
        rank: acc.rank,
        region: acc.region,
        winRate: acc.winRate,
        price: acc.price,
        originalPrice: acc.originalPrice,
        skinNames: Array.isArray(acc.skinNames) ? acc.skinNames.join(', ') : (acc.skinNames || ''),
        descriptionHtml: acc.descriptionHtml || '',
        rankHistory: acc.rankHistory || '',
        available: acc.available ?? true,
      }
    }));
    setExpanded(x => ({ ...x, [acc.id]: true }));
  };

  const cancelEdit = (id: string) => {
    setIsEditing(e => ({ ...e, [id]: false }));
    setDrafts(d => {
      const next = { ...d };
      delete next[id];
      return next;
    });
  };

  const saveEdit = async (id: string) => {
    if (!token) return;
    const draft = drafts[id] || {};
    const body: any = { ...draft };
    if (typeof body.skinNames === 'string') {
      body.skinNames = body.skinNames
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    try {
      const updated = await api.patch(`/accounts/${id}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAccounts((list) => list.map((a) => (a.id === id ? { ...a, ...updated } : a)));
      setIsEditing(e => ({ ...e, [id]: false }));
    } catch (e) {
      // soft fail
    }
  };

  const removeAccount = async (id: string) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    if (!token) {
      // Local-only delete
      try {
        const raw = localStorage.getItem('ix_local_accounts') || '[]';
        const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        const next = arr.filter((a: any) => a.id !== id);
        localStorage.setItem('ix_local_accounts', JSON.stringify(next));
      } catch {}
      setAccounts(list => list.filter(a => a.id !== id));
      setCreateMsg({ kind: 'success', text: 'Product deleted (local)' });
      return;
    }
    try {
      await api.delete(`/accounts/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAccounts(list => list.filter(a => a.id !== id));
      // Also remove any local shadow copy
      try {
        const raw = localStorage.getItem('ix_local_accounts') || '[]';
        const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        const next = arr.filter((a: any) => a.id !== id);
        localStorage.setItem('ix_local_accounts', JSON.stringify(next));
      } catch {}
      setCreateMsg({ kind: 'success', text: 'Product deleted' });
    } catch (e: any) {
      // Fallback: local removal if API not present
      const msg = String(e?.message || '');
      if (/not\s*found|404|cannot connect|temporarily unavailable/i.test(msg)) {
        try {
          const raw = localStorage.getItem('ix_local_accounts') || '[]';
          const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
          const next = arr.filter((a: any) => a.id !== id);
          localStorage.setItem('ix_local_accounts', JSON.stringify(next));
        } catch {}
        setAccounts(list => list.filter(a => a.id !== id));
        setCreateMsg({ kind: 'success', text: 'Product deleted (local)' });
      } else {
        setCreateMsg({ kind: 'error', text: 'Failed to delete product' });
      }
    }
  };

  const createAccount = async () => {
    setCreateMsg(null);
    if (!token) {
      setCreateMsg({ kind: 'error', text: 'You must be logged in as CEO to create accounts' });
      return;
    }
    const required = ['id', 'game', 'region', 'rank'] as const;
    for (const k of required) {
      if (!String((createDraft as any)[k] || '').trim()) {
        setCreateMsg({ kind: 'error', text: `Missing required field: ${k}` });
        return;
      }
    }
    const level = Number(createDraft.level || 0);
    const skinsCount = Number(createDraft.skinsCount || 0);
    const winRate = Number(createDraft.winRate || 0);
    if (level < 0 || skinsCount < 0 || winRate < 0 || winRate > 100) {
      setCreateMsg({ kind: 'error', text: 'Enter valid numeric values (win‑rate 0–100)' });
      return;
    }
    const body: any = { ...createDraft };
    if (typeof body.skinNames === 'string') {
      body.skinNames = body.skinNames
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
    }
    try {
      setCreateSaving(true);
      const created = await api.post('/accounts', body, { headers: { Authorization: `Bearer ${token}` } });
      setAccounts((list) => [created, ...list]);
      setCreateMsg({ kind: 'success', text: 'Account created successfully' });
      setHighlightId(created.id);
      setTimeout(() => setHighlightId(null), 2500);
      setCreateDraft({
        id: '',
        game: 'valorant',
        level: 0,
        skinsCount: 0,
        rank: '',
        region: 'NA',
        winRate: 0,
        price: 0,
        originalPrice: 0,
        skinNames: '',
        descriptionHtml: '',
        rankHistory: '',
        available: true,
      });
    } catch (e: any) {
      // Fallback to local drafts when backend is unavailable or route not found
      const msg = String(e?.message || 'Failed to create account');
      const notFound = /not found|404/i.test(msg);
      if (notFound || /Cannot connect to backend/i.test(msg)) {
        const created: Account = {
          id: String(createDraft.id),
          game: String(createDraft.game),
          level: Number(createDraft.level || 0),
          skinsCount: Number(createDraft.skinsCount || 0),
          rank: String(createDraft.rank || ''),
          region: String(createDraft.region || ''),
          winRate: Number(createDraft.winRate || 0),
          price: Number(createDraft.price || 0),
          originalPrice: Number(createDraft.originalPrice || 0),
          skinNames: (typeof createDraft.skinNames === 'string'
            ? createDraft.skinNames.split(',').map(s => s.trim()).filter(Boolean)
            : (createDraft.skinNames as string[]) || []),
          descriptionHtml: String(createDraft.descriptionHtml || ''),
          rankHistory: String(createDraft.rankHistory || ''),
          available: Boolean(createDraft.available),
        };
        const raw = localStorage.getItem('ix_local_accounts') || '[]';
        const arr = Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
        const next = [created, ...arr.filter((a: any) => a.id !== created.id)];
        localStorage.setItem('ix_local_accounts', JSON.stringify(next));
        setAccounts(list => [created, ...list.filter(a => a.id !== created.id)]);
        setCreateMsg({ kind: 'success', text: 'Account created (saved locally)' });
        setHighlightId(created.id);
        setTimeout(() => setHighlightId(null), 2500);
      } else {
        setCreateMsg({ kind: 'error', text: msg });
      }
    } finally {
      setCreateSaving(false);
    }
  };

  const saveHtml = async (id: string, html: string) => {
    if (!token) return;
    setSaving(s => ({ ...s, [id]: true }));
    try {
      await api.patch(`/accounts/${id}`, { descriptionHtml: html }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setSaving(s => ({ ...s, [id]: false }));
  };

  const onEditorInput = (id: string, html: string) => {
    setEditHtml(prev => ({ ...prev, [id]: html }));
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => saveHtml(id, html), 800);
  };

  const saveRankHistory = async (id: string, text: string) => {
    if (!token) return;
    setSavingRank(s => ({ ...s, [id]: true }));
    try {
      await api.patch(`/accounts/${id}`, { rankHistory: text }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {}
    setSavingRank(s => ({ ...s, [id]: false }));
  };

  const onRankInput = (id: string, text: string) => {
    setEditRank(prev => ({ ...prev, [id]: text }));
    if (rankTimers.current[id]) clearTimeout(rankTimers.current[id]);
    rankTimers.current[id] = setTimeout(() => saveRankHistory(id, text), 800);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Browse Accounts</h1>
          <p className="text-gray-400">Find your perfect gaming account</p>
        </div>

        {(isCEO) && (
          <div className="lux-card lux-card-brand rounded-2xl p-4 mb-4">
            {!creating ? (
              <button
                onClick={() => setCreating(true)}
                className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
              >
                Add New Account
              </button>
            ) : (
              <div className="space-y-3">
                {createMsg && (
                  <div className={`p-3 rounded-xl text-sm ${createMsg.kind === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                    {createMsg.text}
                  </div>
                )}
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">ID</div>
                    <input className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" placeholder="e.g., VAL-004" value={createDraft.id as any} onChange={(e) => setCreateDraft(d => ({ ...d, id: e.target.value }))} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Game</div>
                    <select className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={createDraft.game as any} onChange={(e) => setCreateDraft(d => ({ ...d, game: e.target.value }))}>
                      <option value="valorant">Valorant</option>
                      <option value="fortnite">Fortnite</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Region</div>
                    <input className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" placeholder="e.g., NA" value={createDraft.region as any} onChange={(e) => setCreateDraft(d => ({ ...d, region: e.target.value }))} />
                  </div>
                </div>
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Level</div>
                    <input type="number" className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={Number(createDraft.level || 0)} onChange={(e) => setCreateDraft(d => ({ ...d, level: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Skins Count</div>
                    <input type="number" className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={Number(createDraft.skinsCount || 0)} onChange={(e) => setCreateDraft(d => ({ ...d, skinsCount: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Win‑Rate %</div>
                    <input type="number" className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={Number(createDraft.winRate || 0)} onChange={(e) => setCreateDraft(d => ({ ...d, winRate: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Rank</div>
                    <input className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={createDraft.rank as any} onChange={(e) => setCreateDraft(d => ({ ...d, rank: e.target.value }))} />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Price</div>
                    <input type="number" className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={Number(createDraft.price || 0)} onChange={(e) => setCreateDraft(d => ({ ...d, price: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Original Price</div>
                    <input type="number" className="w-full px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={Number(createDraft.originalPrice || 0)} onChange={(e) => setCreateDraft(d => ({ ...d, originalPrice: Number(e.target.value) }))} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!createDraft.available} onChange={(e) => setCreateDraft(d => ({ ...d, available: e.target.checked }))} />
                      Available
                    </label>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Skin Names (comma‑separated)</div>
                  <textarea className="w-full min-h-[70px] p-3 bg-white/10 rounded-lg border border-white/10" placeholder="Oni Vandal, Reaver Phantom, ..." value={(createDraft.skinNames as any) || ''} onChange={(e) => setCreateDraft(d => ({ ...d, skinNames: e.target.value }))} />
                </div>
                <div className="flex gap-2">
                  <button disabled={createSaving} onClick={createAccount} className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 disabled:opacity-50">
                    {createSaving ? 'Creating…' : 'Create'}
                  </button>
                  <button onClick={() => setCreating(false)} className="px-5 py-3 bg-white/10 rounded-xl hover:bg-white/20">Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Summary removed per request */}

        {/* Filters */}
        <div className="sticky top-32 z-50 lux-card lux-card-brand rounded-2xl p-4 mb-16 shadow-2xl flex flex-col md:flex-row gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-5 py-4 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all"
            placeholder="Search accounts..."
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-5 py-4 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all"
          >
            <option value="all" className="bg-gray-900">All</option>
            <option value="valorant" className="bg-gray-900">Valorant</option>
            <option value="fortnite" className="bg-gray-900">Fortnite</option>
            <option value="other" className="bg-gray-900">Other</option>
          </select>
        </div>

        {/* Spacer to avoid overlap while sticky */}
        <div className="h-8 md:h-6" />

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch mt-12">
          {filteredAccounts.map((acc) => {
            const skins = Array.isArray(acc.skinNames)
              ? acc.skinNames
              : typeof acc.skinNames === 'string'
                ? acc.skinNames.split(',').map(s => s.trim()).filter(Boolean)
                : [];
            const isOpen = !!expanded[acc.id];
            const canEdit = isStaff || isCEO;
            const editing = !!isEditing[acc.id];
            const price = Number(acc.price || 0);
            const original = Number(acc.originalPrice || 0);
            const discount = price && original ? Math.round((1 - price / original) * 100) : 0;
            const pts = price ? Math.round(price * 10) : 0;
            return (
              <div 
                key={acc.id} 
                className={`lux-card lux-card-brand rounded-2xl p-6 h-full min-h-[340px] flex flex-col transform transition-transform duration-240 ease-out-quint hover:-translate-y-1 ${highlightId === acc.id ? 'ring-2 ring-green-500/50' : ''}`}
              >
                {canEdit && (
                  <div className="flex justify-end -mt-2 -mr-2 gap-2">
                    {!editing && (
                      <>
                        <button onClick={() => beginEdit(acc)} className="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20">Edit</button>
                        <button onClick={() => removeAccount(acc.id)} className="px-3 py-1 bg-red-600/20 rounded-lg text-xs hover:bg-red-600/30">Delete</button>
                      </>
                    )}
                    {editing && (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(acc.id)} className="px-3 py-1 bg-gradient-to-r from-red-600 to-red-700 rounded-lg text-xs font-bold hover:opacity-90">Save</button>
                        <button onClick={() => cancelEdit(acc.id)} className="px-3 py-1 bg-white/10 rounded-lg text-xs hover:bg-white/20">Cancel</button>
                        <button onClick={() => removeAccount(acc.id)} className="px-3 py-1 bg-red-600/20 rounded-lg text-xs hover:bg-red-600/30">Delete</button>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div className="text-sm uppercase tracking-widest text-gray-400">{acc.game}</div>
                  {price > 0 && original > 0 && discount > 0 && (
                    <span className="px-3 py-1 bg-gradient-to-r from-red-500/20 to-red-500/10 border border-red-500 rounded-full text-xs font-bold text-red-500">
                      -{discount}%
                    </span>
                  )}
                </div>

                {!editing ? (
                  <>
                    <h3 className="text-xl font-bold mb-1 capitalize">{acc.rank}</h3>
                    <div className="text-gray-400 text-sm mb-4">{acc.region} • Level {acc.level}</div>
                  </>
                ) : (
                  <div className="grid md:grid-cols-4 gap-2 mb-3">
                    <select className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={String(drafts[acc.id]?.game ?? acc.game)} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), game: e.target.value } }))}>
                      <option value="valorant">Valorant</option>
                      <option value="fortnite">Fortnite</option>
                      <option value="other">Other</option>
                    </select>
                    <input className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={String(drafts[acc.id]?.rank ?? acc.rank)} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), rank: e.target.value } }))} />
                    <input className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={String(drafts[acc.id]?.region ?? acc.region)} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), region: e.target.value } }))} />
                    <input type="number" className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" value={Number(drafts[acc.id]?.level ?? acc.level)} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), level: Number(e.target.value) } }))} />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center p-3 bg-white/10 rounded-xl">
                    <div className="text-lg font-bold text-red-500">{editing ? (drafts[acc.id]?.skinsCount ?? acc.skinsCount) : acc.skinsCount}</div>
                    <div className="text-xs text-gray-400">Skins</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-xl">
                    <div className="text-lg font-bold text-red-500">{editing ? (drafts[acc.id]?.winRate ?? acc.winRate) : acc.winRate}%</div>
                    <div className="text-xs text-gray-400">Win-Rate</div>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-xl">
                    <div className="text-lg font-bold text-red-500">{editing ? (drafts[acc.id]?.level ?? acc.level) : acc.level}</div>
                    <div className="text-xs text-gray-400">Level</div>
                  </div>
                </div>

                {!editing && price > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl font-bold text-red-500">${price}</span>
                    {original > 0 && <span className="text-sm text-gray-500 line-through">${original}</span>}
                    {pts > 0 && (
                      <span className="ml-auto px-2 py-1 bg-white/10 text-gray-300 rounded text-xs font-semibold">
                        Earn {pts} pts
                      </span>
                    )}
                  </div>
                )}
                {editing && (
                  <div className="grid md:grid-cols-4 gap-2 mb-3">
                    <input type="number" className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" placeholder="Skins" value={Number(drafts[acc.id]?.skinsCount ?? acc.skinsCount)} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), skinsCount: Number(e.target.value) } }))} />
                    <input type="number" className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" placeholder="Win‑Rate %" value={Number(drafts[acc.id]?.winRate ?? acc.winRate)} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), winRate: Number(e.target.value) } }))} />
                    <input type="number" className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" placeholder="Price" value={Number(((drafts[acc.id]?.price ?? acc.price) || 0))} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), price: Number(e.target.value) } }))} />
                    <input type="number" className="px-3 py-2 bg-white/10 rounded-lg border border-white/10" placeholder="Original" value={Number(((drafts[acc.id]?.originalPrice ?? acc.originalPrice) || 0))} onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), originalPrice: Number(e.target.value) } }))} />
                  </div>
                )}

                <div className="mt-auto flex items-center gap-3 pt-2">
                  <button
                    onClick={() => toggleExpand(acc.id)}
                    className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-sm font-semibold"
                  >
                    {isOpen ? 'Hide Info' : 'More Info'}
                  </button>
                  {price > 0 && (
                    <button
                      onClick={() => navigate(`/tickets/create?type=buying&game=${acc.game}&price=${price}`)}
                      className="ml-auto px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
                    >
                      Buy Now
                    </button>
                  )}
                </div>

                {isOpen && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    {!editing ? (
                      <>
                        <div className="text-xs text-gray-400 mb-1">Skins</div>
                        <div className="max-h-40 overflow-y-auto text-sm text-gray-300 p-3 bg-white/5 rounded-lg border border-white/10">
                          {skins.length > 0 ? skins.join(', ') : 'No skins listed'}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-xs text-gray-400 mb-1">Skins (comma‑separated)</div>
                        <textarea
                          className="w-full min-h-[70px] p-3 bg-white/5 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-red-500"
                          value={String(drafts[acc.id]?.skinNames ?? (Array.isArray(acc.skinNames) ? acc.skinNames.join(', ') : (acc.skinNames || '')))}
                          onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), skinNames: e.target.value } }))}
                          placeholder="Oni Vandal, Reaver Phantom, ..."
                        />
                        <div className="flex items-center gap-2 mt-2">
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={Boolean(drafts[acc.id]?.available ?? acc.available ?? true)}
                              onChange={(e) => setDrafts(d => ({ ...d, [acc.id]: { ...(d[acc.id]||{}), available: e.target.checked } }))}
                            />
                            Available
                          </label>
                          <span className="text-xs text-gray-400">Uncheck to hide when sold</span>
                        </div>
                      </>
                    )}
                    
                    {canEdit && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-gray-400">Admin Notes (rich text)</div>
                          <div className="text-xs">{saving[acc.id] ? 'Saving…' : 'Saved'}</div>
                        </div>
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => document.execCommand('bold')}
                              className="px-2 py-1 bg-white/10 rounded text-xs hover:bg-white/20"
                              type="button"
                            >
                              B
                            </button>
                            <button
                              onClick={() => document.execCommand('italic')}
                              className="px-2 py-1 bg-white/10 rounded text-xs hover:bg-white/20"
                              type="button"
                            >
                              I
                            </button>
                            <button
                              onClick={() => document.execCommand('underline')}
                              className="px-2 py-1 bg-white/10 rounded text-xs hover:bg-white/20"
                              type="button"
                            >
                              U
                            </button>
                          </div>
                          <div
                            contentEditable
                            className="min-h-[120px] max-h-64 overflow-y-auto p-3 bg-black/40 rounded-lg text-sm"
                            suppressContentEditableWarning
                            onInput={(e) => onEditorInput(acc.id, (e.target as HTMLDivElement).innerHTML)}
                            dangerouslySetInnerHTML={{ __html: editHtml[acc.id] ?? acc.descriptionHtml ?? '' }}
                          />
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs text-gray-400">Rank History (plain text)</div>
                            <div className="text-xs">{savingRank[acc.id] ? 'Saving…' : 'Saved'}</div>
                          </div>
                          <textarea
                            className="w-full min-h-[100px] max-h-64 p-3 bg-white/5 rounded-lg border border-white/10 text-sm focus:outline-none focus:border-red-500"
                            value={editRank[acc.id] ?? acc.rankHistory ?? ''}
                            onChange={(e) => onRankInput(acc.id, e.target.value)}
                            placeholder="Season by season or progression history..."
                          />
                        </div>
                        {editing && (
                          <div className="mt-4 flex gap-2">
                            <button onClick={() => saveEdit(acc.id)} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">Save Changes</button>
                            <button onClick={() => cancelEdit(acc.id)} className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20">Cancel</button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-lg font-semibold">No accounts found</div>
            <div className="text-sm mt-2">There are no products to display.</div>
            {isCEO && (
              <div className="mt-4">
                <button onClick={() => setCreating(true)} className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">
                  Add Your First Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
