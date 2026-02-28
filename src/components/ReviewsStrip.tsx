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

export default function ReviewsStrip() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get('/reviews/public?limit=12&offset=0');
        setReviews(Array.isArray(r) ? r : []);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return null;
  }

  if (!reviews.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto hide-scrollbar">
      <div className="flex gap-4 min-w-full">
        {reviews.map((rev) => (
          <div key={rev.id} className="min-w-[280px] max-w-[320px] bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{rev.user?.username || 'Customer'}</div>
              <div className="text-xs text-gray-400">{new Date(rev.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-yellow-500 font-bold">{'★'.repeat(rev.rating)}{'☆'.repeat(5 - rev.rating)}</div>
              <div className="text-xs text-gray-400">{rev.order?.orderId || ''}</div>
            </div>
            {rev.comment && <div className="text-gray-300 text-sm">{rev.comment}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
