import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTickets } from '../contexts/TicketContext';
import { SkeletonCard } from '../components/Skeleton';
import { useAuth } from '../contexts/AuthContext';

export default function MyTickets() {
  const navigate = useNavigate();
  const { tickets, fetchTickets, loading } = useTickets();
  const { isAuthenticated } = useAuth();
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    if (isAuthenticated) {
      fetchTickets({ offset: page * pageSize, limit: pageSize });
    }
  }, [isAuthenticated, page]);

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'all') return true;
    return ticket.status === filter;
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="text-gray-400 mb-6">You need to login to view your tickets</p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 transition-all"
          >
            Login
          </button>
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
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Tickets</h1>
            <p className="text-gray-400">View and manage your tickets</p>
          </div>
          <button
            onClick={() => navigate('/tickets/create')}
            className="px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-green-500/30"
          >
            Create New Ticket
          </button>
        </div>

        {/* Filter */}
        <div className="flex gap-4 mb-8">
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

        {/* Tickets List */}
        <div className="space-y-4">
          {loading && tickets.length === 0 && (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          )}
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => navigate(`/tickets/${ticket.id}`)}
              className="lux-card lux-card-brand rounded-2xl p-6 hover:border-red-500/50 transition-all cursor-pointer shadow-lg hover:shadow-red-500/20"
            >
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold">
                      {ticket.orderId || `Ticket #${ticket.id.substring(0, 8)}`}
                    </h3>
                    {ticket.lifetimeWarranty && (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-500 rounded-full text-xs font-bold">
                        Lifetime Warranty
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      ticket.status === 'open' ? 'bg-green-500/20 text-green-500' :
                      ticket.status === 'closed' ? 'bg-red-500/20 text-red-500' :
                      ticket.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {ticket.status === 'open' ? 'Open' :
                       ticket.status === 'closed' ? 'Closed' :
                       ticket.status === 'completed' ? 'Completed' : 'Payment Pending'}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-purple-600 to-purple-700">
                      {ticket.type === 'buying' ? 'Buying' : 'Support'}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      ticket.priority === 'urgent' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {ticket.priority === 'urgent' ? 'Urgent' : 'Normal'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-2">{ticket.description.substring(0, 100)}...</p>
                  <p className="text-gray-500 text-xs">Created: {new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {(ticket.type === 'buying' && (ticket.status === 'payment_pending' || ticket.status === 'open')) ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/tickets/${ticket.id}?focus=payment`);
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl font-bold hover:opacity-90"
                    >
                      Resume Payment
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">Click to view</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTickets.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-xl font-semibold mb-2">No tickets found</div>
            <div className="text-sm mb-6">
              {tickets.length === 0 
                ? "You haven't created any tickets yet" 
                : "No tickets match your filter"}
            </div>
            {tickets.length === 0 && (
              <button
                onClick={() => navigate('/tickets/create')}
                className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 transition-all"
              >
                Create Your First Ticket
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
