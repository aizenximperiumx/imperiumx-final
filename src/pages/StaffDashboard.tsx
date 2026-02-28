import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTickets } from '../contexts/TicketContext';
import { SkeletonRow } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

export default function StaffDashboard() {
  const navigate = useNavigate();
  const { tickets, fetchTickets, loading } = useTickets();
  const { user, isCEO } = useAuth();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    fetchTickets({ offset: page * pageSize, limit: pageSize });
  }, [page]);

  const filteredTickets = tickets
    .filter((ticket) => {
      if (filter !== 'all' && ticket.status !== filter) return false;
      if (search && !ticket.id.toLowerCase().includes(search.toLowerCase()) && 
          !ticket.user?.username?.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'priority') return a.priority === 'urgent' ? -1 : 1;
      return 0;
    });

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    pending: tickets.filter(t => t.status === 'payment_pending').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    closed: tickets.filter(t => t.status === 'closed').length,
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Staff Dashboard
            </h1>
            <p className="text-gray-400">Welcome back, {user?.username}!</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link 
              to="/staff/analytics" 
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-purple-500/30"
            >
              Analytics
            </Link>
            {isCEO && (
              <span className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl font-bold shadow-lg shadow-purple-500/30">
                CEO Access
              </span>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{stats.total}</div>
            <div className="text-gray-400 text-sm">Total Tickets</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-4xl font-bold text-green-500 mb-2">{stats.open}</div>
            <div className="text-gray-400 text-sm">Open</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">{stats.pending}</div>
            <div className="text-gray-400 text-sm">Payment Pending</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2">{stats.completed}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </Card>
          <Card variant="lux" color="brand" className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">{stats.closed}</div>
            <div className="text-gray-400 text-sm">Closed</div>
          </Card>
        </div>
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20"
            disabled={page === 0}
          >
            Prev
          </button>
          <div className="text-gray-400">Page {page + 1}</div>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20"
          >
            Next
          </button>
        </div>

        {/* Filters & Search */}
        <div className="lux-card lux-card-brand rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all"
              placeholder="Search by ticket ID or username..."
            />
            
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all"
            >
              <option value="all" className="text-black">All Status</option>
              <option value="open" className="text-black">Open</option>
              <option value="payment_pending" className="text-black">Payment Pending</option>
              <option value="completed" className="text-black">Completed</option>
              <option value="closed" className="text-black">Closed</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-5 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white transition-all"
            >
              <option value="newest" className="text-black">Newest First</option>
              <option value="oldest" className="text-black">Oldest First</option>
              <option value="priority" className="text-black">Priority First</option>
            </select>
          </div>

          {/* Quick Filter Buttons */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['all', 'open', 'payment_pending', 'completed', 'closed'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-xl font-semibold transition-all ${
                  filter === f
                    ? 'bg-gradient-to-r from-red-600 to-red-700 shadow-lg shadow-red-500/30'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                {f === 'payment_pending' ? 'Pending' : f === 'open' ? 'Open' : f === 'completed' ? 'Completed' : f === 'closed' ? 'Closed' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets Table */}
        <div className="lux-card lux-card-brand rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-white/15 to-white/5">
                <tr>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Ticket ID</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Customer</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Assignee</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Type</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Priority</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Created</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && filteredTickets.length === 0 && (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                )}
                {filteredTickets.map((ticket) => (
                  <tr 
                    key={ticket.id} 
                    className="border-t border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-red-400">
                        {ticket.orderId || `#${ticket.id.substring(0, 8)}`}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center font-bold">
                          {ticket.user?.username?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-semibold">{ticket.user?.username || 'Unknown'}</div>
                          <div className="text-xs text-gray-400">{ticket.user?.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">{(ticket as any).assignedUser?.username || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        ticket.type === 'buying' 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {ticket.type === 'buying' ? 'Buying' : 'Support'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={ticket.priority === 'urgent' ? 'red' : 'gray'}>
                        {ticket.priority === 'urgent' ? 'Urgent' : 'Normal'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={
                        ticket.status === 'open' ? 'green' :
                        ticket.status === 'payment_pending' ? 'yellow' :
                        ticket.status === 'completed' ? 'blue' : 'red'
                      }>
                        {ticket.status === 'open'
                          ? 'Open'
                          : ticket.status === 'payment_pending'
                          ? 'Pending'
                          : ticket.status === 'completed'
                          ? 'Completed'
                          : 'Closed'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/tickets/${ticket.id}`);
                        }}
                        className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-red-500/30"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredTickets.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <div className="text-xl font-semibold">No tickets found</div>
              <div className="text-sm mt-2">Try adjusting your filters</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
