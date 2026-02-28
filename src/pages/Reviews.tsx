import React, { useEffect, useState } from 'react';
import api from '../services/api';

type Review = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user?: { username: string };
  order?: { orderId: string; amount: number };
};

export default function Reviews() {
  const [summary, setSummary] = useState<{ averageRating: number; totalReviews: number; breakdown: Record<string, number> } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const fetchData = async () => {
    const s = await api.get('/reviews/public/summary');
    setSummary(s);
    const r = await api.get(`/reviews/public?limit=${limit}&offset=${offset}`);
    setReviews(Array.isArray(r) ? r : []);
  };

  useEffect(() => {
    fetchData();
  }, [offset]);

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Customer Reviews</h1>
          <p className="text-gray-400">Real vouches from completed orders</p>
        </div>

        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-yellow-500">{summary.averageRating.toFixed(2)}</div>
              <div className="text-gray-400 text-sm">Average Rating</div>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold">{summary.totalReviews}</div>
              <div className="text-gray-400 text-sm">Total Reviews</div>
            </div>
            {[5,4,3,2,1].map(r => (
              <div key={r} className="lux-card lux-card-brand rounded-2xl p-6 text-center hidden md:block">
                <div className="text-2xl font-bold">{summary.breakdown[String(r)] || 0}</div>
                <div className="text-gray-400 text-sm">{r} Star</div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {reviews.map(rev => (
            <div key={rev.id} className="lux-card lux-card-brand rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">{rev.user?.username || 'Customer'}</div>
                <div className="text-sm text-gray-400">{new Date(rev.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-yellow-500 font-bold">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                <div className="text-sm text-gray-400">{rev.order?.orderId} • ${rev.order?.amount?.toFixed(2)}</div>
              </div>
              {rev.comment && <div className="text-gray-300">{rev.comment}</div>}
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20"
            disabled={offset === 0}
          >
            Prev
          </button>
          <button
            onClick={() => setOffset(offset + limit)}
            className="px-4 py-2 bg-white/10 rounded-xl hover:bg-white/20"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
