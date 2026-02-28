import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

type Review = {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  isPublic: boolean;
  user?: { username: string; email?: string };
  order?: { id: string; orderId: string; amount: number };
};

export default function StaffReviews() {
  const { token, isStaff, isCEO } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!token || !(isStaff || isCEO)) return;
    setLoading(true);
    try {
      const r = await api.get('/reviews', { headers: { Authorization: `Bearer ${token}` } });
      setReviews(Array.isArray(r) ? r : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [token]);

  const togglePublic = async (review: Review) => {
    if (!token) return;
    await api.patch(`/reviews/${review.id}/public`, { isPublic: !review.isPublic }, { headers: { Authorization: `Bearer ${token}` } });
    await load();
  };

  if (!(isStaff || isCEO)) {
    return <div className="min-h-screen flex items-center justify-center">Not authorized</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Reviews Moderation</h1>
          <p className="text-gray-400">Approve vouches for public display</p>
        </div>

        {loading && <div className="text-center mb-4">Loading...</div>}

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div key={rev.id} className="lux-card lux-card-brand rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <div className="font-semibold">{rev.user?.username}</div>
                <div className="text-sm text-gray-400">{new Date(rev.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className="text-yellow-500 font-bold">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
                <div className="text-sm text-gray-400">{rev.order?.orderId} • ${rev.order?.amount?.toFixed(2)}</div>
              </div>
              {rev.comment && <div className="text-gray-300 mb-3">{rev.comment}</div>}
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${rev.isPublic ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                  {rev.isPublic ? 'Public' : 'Private'}
                </span>
                <button
                  onClick={() => togglePublic(rev)}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
                >
                  {rev.isPublic ? 'Make Private' : 'Make Public'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
