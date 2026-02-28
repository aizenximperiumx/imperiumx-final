import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  points: number;
  tier: string;
  level: number;
  referralCode: string;
  createdAt: string;
};

export default function StaffUsers() {
  const { token, isStaff, isCEO } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!token || !isStaff) return;
      setLoading(true);
      try {
        const data = await api.get('/users', { headers: { Authorization: `Bearer ${token}` } });
        setUsers(data || []);
      } catch (e: any) {
        setMsg(e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, isStaff]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(u =>
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.referralCode?.toLowerCase().includes(q)
    );
  }, [users, query]);

  if (!isStaff) return <div className="min-h-screen flex items-center justify-center">Staff only</div>;

  const doUpdateInfo = async (id: string, username: string, email: string) => {
    if (!token) return;
    setSaving(id);
    setMsg('');
    try {
      await api.patch(`/users/${id}`, { username, email }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, username, email } : u));
      setMsg('Saved');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to save');
    } finally {
      setSaving(null);
    }
  };

  const doSetPassword = async (id: string, password: string) => {
    if (!token || !isCEO) return;
    if (!password || password.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    setSaving(id);
    setMsg('');
    try {
      await api.patch(`/users/${id}/password`, { password }, { headers: { Authorization: `Bearer ${token}` } });
      setMsg('Password updated');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to update password');
    } finally {
      setSaving(null);
    }
  };

  const doAdjustPoints = async (id: string, delta: number, reason: string) => {
    if (!token) return;
    setSaving(id);
    setMsg('');
    try {
      const res = await api.post(`/users/${id}/points`, { delta, reason }, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, points: res.points } : u));
      setMsg('Points adjusted');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to adjust points');
    } finally {
      setSaving(null);
    }
  };

  const doBan = async (id: string, ban: boolean) => {
    if (!token || !isCEO) return;
    setSaving(id);
    setMsg('');
    try {
      const path = ban ? `/users/${id}/ban` : `/users/${id}/unban`;
      const res = await api.patch(path, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: res?.user?.role || (ban ? 'banned' : 'customer') } : u));
      setMsg(ban ? 'User banned' : 'User unbanned');
    } catch (e: any) {
      setMsg(e?.message || 'Failed to update role');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold">User Management</h1>
            <p className="text-gray-400 text-sm">Edit accounts, roles and points</p>
          </div>
          <div className="w-72">
            <Input placeholder="Search username, email, role…" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </div>
        {msg && <div className="mb-4 text-sm text-gray-300">{msg}</div>}
        {loading && <div className="text-gray-400">Loading…</div>}
        {!loading && filtered.length === 0 && <div className="text-gray-400">No users</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.slice(0, 50).map(u => (
            <Card key={u.id} variant="lux" color="brand" padded>
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold">{u.username}</div>
                <div className="text-xs text-gray-400">{u.role} • {u.points} pts</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input label="Username" defaultValue={u.username} onChange={e => (u.username = e.target.value)} />
                <Input label="Email" defaultValue={u.email} onChange={e => (u.email = e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button onClick={() => doUpdateInfo(u.id, u.username, u.email)} disabled={saving === u.id}>Save</Button>
                <Input type="number" placeholder="Points delta (e.g., 100 or -50)" onChange={e => (u as any)._delta = parseInt(e.target.value || '0', 10)} />
                <Input placeholder="Reason" onChange={e => (u as any)._reason = e.target.value} />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const d = Number((u as any)._delta);
                    const r = String((u as any)._reason || 'manual_adjust');
                    if (!d || Number.isNaN(d)) {
                      setMsg('Enter a non-zero delta');
                      return;
                    }
                    doAdjustPoints(u.id, d, r);
                  }}
                  disabled={saving === u.id}
                >
                  Adjust
                </Button>
              </div>
              {isCEO && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <Input placeholder="New password (CEO only)" onChange={e => (u as any)._password = e.target.value} />
                  <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => doSetPassword(u.id, String((u as any)._password || ''))} disabled={saving === u.id}>Set Password</Button>
                    {u.role === 'banned' ? (
                      <Button variant="ghost" onClick={() => doBan(u.id, false)} disabled={saving === u.id}>Unban</Button>
                    ) : (
                      <Button variant="danger" onClick={() => doBan(u.id, true)} disabled={saving === u.id}>Ban</Button>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
