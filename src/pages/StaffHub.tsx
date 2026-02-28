import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTickets } from '../contexts/TicketContext';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function StaffHub() {
  const { isStaff, isCEO } = useAuth();
  const { tickets, fetchTickets, loading } = useTickets();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'open' | 'payment_pending' | 'completed' | 'closed'>('all');

  useEffect(() => {
    if (isStaff) fetchTickets({ limit: 50 });
  }, [isStaff]);

  const stats = useMemo(() => {
    const open = tickets.filter(t => t.status === 'open').length;
    const pending = tickets.filter(t => t.status === 'payment_pending').length;
    const completed = tickets.filter(t => t.status === 'completed').length;
    const closed = tickets.filter(t => t.status === 'closed').length;
    return { total: tickets.length, open, pending, completed, closed };
  }, [tickets]);

  const filtered = useMemo(() => {
    if (filter === 'all') return tickets.slice(0, 12);
    return tickets.filter(t => t.status === filter).slice(0, 12);
  }, [tickets, filter]);

  if (!isStaff) {
    return <div className="min-h-screen flex items-center justify-center">Staff only</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-extrabold mb-2">Staff Suite</h1>
            <p className="text-gray-400">All tools in one place</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => fetchTickets({ limit: 50 })} className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20">
              Refresh
            </button>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-10">
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-3xl font-bold text-white">{stats.total}</div>
            <div className="text-gray-400 text-xs">Total</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-3xl font-bold text-green-500">{stats.open}</div>
            <div className="text-gray-400 text-xs">Open</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
            <div className="text-gray-400 text-xs">Pending</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-3xl font-bold text-blue-500">{stats.completed}</div>
            <div className="text-gray-400 text-xs">Completed</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-3xl font-bold text-red-500">{stats.closed}</div>
            <div className="text-gray-400 text-xs">Closed</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-3xl font-bold">{tickets.slice(0,12).length}</div>
            <div className="text-gray-400 text-xs">Snapshot</div>
          </Card>
        </div>

        {/* Tools */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card variant="lux" color="brand" padded className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">Tickets</div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10">Core</span>
            </div>
            <p className="text-gray-400 text-sm">Work the queue from a unified list view.</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => navigate('/staff')} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">
                Open List
              </button>
              <button onClick={() => navigate('/staff/kanban')} className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20">
                Kanban
              </button>
            </div>
          </Card>

          <Card variant="lux" color="brand" padded className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">Analytics</div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10">Insights</span>
            </div>
            <p className="text-gray-400 text-sm">Throughput, revenue, satisfaction and daily volumes.</p>
            <div className="pt-2">
              <button onClick={() => navigate('/staff/analytics')} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">
                View Analytics
              </button>
            </div>
          </Card>

          <Card variant="lux" color="brand" padded className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">Moderate Reviews</div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10">Trust</span>
            </div>
            <p className="text-gray-400 text-sm">Approve customer vouches for public display.</p>
            <div className="pt-2">
              <button onClick={() => navigate('/staff/reviews')} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">
                Open Moderation
              </button>
            </div>
          </Card>

          <Card variant="lux" color="brand" padded className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xl font-bold">Users</div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10">Admin</span>
            </div>
            <p className="text-gray-400 text-sm">Edit accounts, roles and points.</p>
            <div className="pt-2">
              <button onClick={() => navigate('/staff/users')} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">
                Manage Users
              </button>
            </div>
          </Card>

          {isCEO && (
            <Card variant="lux" color="brand" padded className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">A/B Report</div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10">CEO</span>
              </div>
              <p className="text-gray-400 text-sm">Compare variant conversion and lift for experiments.</p>
              <div className="pt-2">
                <button onClick={() => navigate('/staff/ab')} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">
                  View Report
                </button>
              </div>
            </Card>
          )}

          {isCEO && (
            <Card variant="lux" color="brand" padded className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">Gift Cards</div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10">CEO</span>
              </div>
              <p className="text-gray-400 text-sm">Generate codes for rewards and store credit.</p>
              <div className="pt-2">
                <button onClick={() => navigate('/gift-cards')} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90">
                  Manage Gift Cards
                </button>
              </div>
            </Card>
          )}
        </div>

        {/* Snapshot */}
        <Card variant="lux" color="brand" padded className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xl font-bold">Tickets Snapshot</div>
            <div className="flex gap-2">
              {(['all','open','payment_pending','completed','closed'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold ${filter === f ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  {f === 'payment_pending' ? 'Pending' : f[0].toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading && <div className="text-gray-400">Loading…</div>}
            {!loading && filtered.length === 0 && (
              <div className="text-gray-400">No tickets</div>
            )}
            {filtered.map(t => (
              <button key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="text-left p-4 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold">{t.orderId || t.id.substring(0,8)}</div>
                  <Badge color={
                    t.status === 'open' ? 'green' :
                    t.status === 'payment_pending' ? 'yellow' :
                    t.status === 'completed' ? 'blue' : 'red'
                  }>
                    {t.status}
                  </Badge>
                </div>
                <div className="text-xs text-gray-400">{t.type === 'buying' ? 'Buying' : 'Support'} • {new Date(t.createdAt).toLocaleString()}</div>
                <div className="text-sm text-gray-300 mt-2 line-clamp-2">{t.description}</div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
