import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Loyalty() {
  const { user, token } = useAuth();
  const [loyalty, setLoyalty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyalty = async () => {
      try {
        const data = await api.get('/loyalty', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLoyalty(data);
      } catch (error) {
        console.error('Failed to fetch loyalty:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchLoyalty();
    }
  }, [token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const tierColors = {
    bronze: 'from-amber-700 to-amber-900',
    silver: 'from-gray-400 to-gray-600',
    gold: 'from-yellow-500 to-yellow-700',
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Loyalty Program</h1>

        {/* Current Tier */}
        <div className={`bg-gradient-to-r ${tierColors[user?.tier as keyof typeof tierColors] || tierColors.bronze} rounded-lg p-8 mb-8`}>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">{user?.tier?.toUpperCase()} TIER</h2>
            <p className="text-xl mb-4">Level {user?.level}</p>
            <div className="text-4xl font-bold mb-2">{user?.points} Points</div>
            <p className="text-sm opacity-80">
              {loyalty?.pointsToNextTier > 0 
                ? `${loyalty.pointsToNextTier} points to ${loyalty.nextTier}`
                : 'Max tier reached!'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-red-500">{loyalty?.totalSpent || 0}</div>
            <div className="text-gray-400">Total Spent ($)</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-red-500">{loyalty?.orders || 0}</div>
            <div className="text-gray-400">Orders</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-red-500">{user?.points || 0}</div>
            <div className="text-gray-400">Available Points</div>
          </div>
        </div>

        {/* Tier Benefits */}
        <div className="lux-card lux-card-brand rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Tier Benefits</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <div className="font-bold">Bronze</div>
                <div className="text-gray-400">Base points earning (10 pts/$1)</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="font-bold">Silver (1,000+ points)</div>
                <div className="text-gray-400">+10% bonus on all purchases</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <div className="font-bold">Gold (5,000+ points)</div>
                <div className="text-gray-400">+25% bonus + VIP support + Exclusive deals</div>
              </div>
            </div>
          </div>
        </div>

        {/* How to Earn */}
        <div className="lux-card lux-card-brand rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">How to Earn Points</h2>
          <div className="space-y-3 text-gray-300">
            <div className="flex justify-between">
              <span>Welcome Bonus</span>
              <span className="text-green-500">+100 points</span>
            </div>
            <div className="flex justify-between">
              <span>Per $1 Spent</span>
              <span className="text-green-500">+10 points</span>
            </div>
            <div className="flex justify-between">
              <span>Per Referral</span>
              <span className="text-green-500">+500 points</span>
            </div>
            <div className="flex justify-between">
              <span>Silver Tier Bonus</span>
              <span className="text-green-500">+10% extra</span>
            </div>
            <div className="flex justify-between">
              <span>Gold Tier Bonus</span>
              <span className="text-green-500">+25% extra</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
