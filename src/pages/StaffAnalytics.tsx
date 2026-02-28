import React, { useEffect, useState } from 'react';
import { useTickets } from '../contexts/TicketContext';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function StaffAnalytics() {
  const { tickets } = useTickets();
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    completedTickets: 0,
    avgResponseTime: 0,
    totalRevenue: 0,
    customerSatisfaction: 0,
    ticketsByDay: [] as any[],
  });
  const [reviewsSummary, setReviewsSummary] = useState<{ averageRating: number; totalReviews: number; breakdown: Record<string, number> } | null>(null);

  useEffect(() => {
    calculateStats();
  }, [tickets]);

  useEffect(() => {
    const fetchReviewsSummary = async () => {
      try {
        const data = await api.get('/reviews/summary', { headers: { Authorization: `Bearer ${token}` } });
        setReviewsSummary(data);
      } catch {}
    };
    if (token) fetchReviewsSummary();
  }, [token]);

  const calculateStats = () => {
    const totalTickets = tickets.length;
    const openTickets = tickets.filter(t => t.status === 'open').length;
    const completedTickets = tickets.filter(t => t.status === 'completed').length;
    
    // Calculate revenue from completed orders
    const totalRevenue = tickets
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (Math.random() * 200 + 50), 0); // Mock data

    // Calculate average response time (mock)
    const avgResponseTime = 15; // minutes

    // Customer satisfaction (mock)
    const customerSatisfaction = 4.7;

    // Tickets by day (last 7 days)
    const ticketsByDay = Array.from({ length: 7 }, (_, i) => ({
      day: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'short' }),
      count: Math.floor(Math.random() * 20) + 5,
    })).reverse();

    setStats({
      totalTickets,
      openTickets,
      completedTickets,
      avgResponseTime,
      totalRevenue,
      customerSatisfaction,
      ticketsByDay,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Staff Analytics</h1>
          <p className="text-gray-400">Track performance and metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">{stats.totalTickets}</div>
            <div className="text-gray-400 text-sm">Total Tickets</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.openTickets}</div>
            <div className="text-gray-400 text-sm">Open</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{stats.completedTickets}</div>
            <div className="text-gray-400 text-sm">Completed</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">{stats.avgResponseTime}m</div>
            <div className="text-gray-400 text-sm">Avg Response</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">${stats.totalRevenue.toFixed(0)}</div>
            <div className="text-gray-400 text-sm">Revenue</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-yellow-500 mb-2">{stats.customerSatisfaction}</div>
            <div className="text-gray-400 text-sm">Satisfaction</div>
          </div>
        </div>

        {/* Chart */}
        <div className="lux-card lux-card-brand rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Tickets Per Day (Last 7 Days)</h2>
          <div className="flex items-end justify-between gap-2 h-64">
            {stats.ticketsByDay.map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-red-600 to-red-400 rounded-t-xl transition-all hover:from-red-500 hover:to-red-300"
                  style={{ height: `${(day.count / 25) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-400">{day.day}</div>
                <div className="text-sm font-bold">{day.count}</div>
              </div>
            ))}
          </div>
        </div>

        {reviewsSummary && (
          <div className="lux-card lux-card-brand rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Reviews Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">{reviewsSummary.averageRating.toFixed(2)}</div>
                <div className="text-gray-400 text-sm">Average Rating</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-500">{reviewsSummary.totalReviews}</div>
                <div className="text-gray-400 text-sm">Total Reviews</div>
              </div>
              {[5,4,3,2,1].map(r => (
                <div key={r} className="text-center">
                  <div className="text-2xl font-bold">{reviewsSummary.breakdown[String(r)] || 0}</div>
                  <div className="text-gray-400 text-sm">{r} Star</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="lux-card lux-card-brand rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {tickets.slice(0, 5).map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    ticket.status === 'open' ? 'bg-green-500' :
                    ticket.status === 'completed' ? 'bg-blue-500' :
                    'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-semibold">{ticket.orderId || ticket.id.substring(0, 8)}</div>
                    <div className="text-sm text-gray-400">{ticket.type} - {new Date(ticket.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  ticket.status === 'open' ? 'bg-green-500/20 text-green-500' :
                  ticket.status === 'completed' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-red-500/20 text-red-500'
                }`}>
                  {ticket.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
