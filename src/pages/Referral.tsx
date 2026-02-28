import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Referral() {
  const { user, token } = useAuth();
  const [referral, setReferral] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const data = await api.get('/referral', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReferral(data);
      } catch (error) {
        console.error('Failed to fetch referral:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchReferral();
    }
  }, [token]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Referral Program</h1>

        {/* Referral Code */}
        <div className="lux-card lux-card-brand rounded-2xl p-8 mb-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Your Referral Code</h2>
          <div className="text-5xl font-extrabold mb-4 tracking-widest inline-block px-8 py-4 rounded-lg bg-white/10 border border-white/20">
            {referral?.referralCode || user?.referralCode || '—'}
          </div>
          <p className="text-lg mb-6">Share this code during registration.</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => copyToClipboard(referral?.referralCode || user?.referralCode || '')}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
            >
              {copied ? 'Copied' : 'Copy Code'}
            </button>
          </div>
        </div>

        {/* Earnings Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-500">{referral?.totalReferrals || 0}</div>
            <div className="text-gray-400">Total Referrals</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-500">${referral?.totalEarnings || 0}</div>
            <div className="text-gray-400">Total Earnings</div>
          </div>
          <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-500">{(referral?.totalPoints || 0) + 500 * (referral?.totalReferrals || 0)}</div>
            <div className="text-gray-400">Points Earned</div>
          </div>
        </div>

        {/* Commission Tiers */}
        <div className="lux-card lux-card-brand rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Commission Tiers</h2>
          <div className="space-y-4">
            <div className={`p-4 rounded-lg ${referral?.commissionRate === 0.25 ? 'bg-red-500/20 border border-red-500' : 'bg-white/10'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">1-4 Referrals</div>
                  <div className="text-gray-400">25% commission + 500 points per referral</div>
                </div>
                <div className="text-2xl font-bold text-red-500">25%</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${referral?.commissionRate === 0.30 ? 'bg-red-500/20 border border-red-500' : 'bg-white/10'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">5-9 Referrals</div>
                  <div className="text-gray-400">30% commission + 500 points per referral</div>
                </div>
                <div className="text-2xl font-bold text-red-500">30%</div>
              </div>
            </div>
            <div className={`p-4 rounded-lg ${referral?.commissionRate === 0.35 ? 'bg-red-500/20 border border-red-500' : 'bg-white/10'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold text-lg">10+ Referrals</div>
                  <div className="text-gray-400">35% commission + 500 points per referral</div>
                </div>
                <div className="text-2xl font-bold text-red-500">35%</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="lux-card lux-card-brand rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">How It Works</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div>
                <div className="font-bold">Share Your Code</div>
                <div className="text-gray-400">Share your unique code; guests enter it on registration</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div>
                <div className="font-bold">Friend Makes Purchase</div>
                <div className="text-gray-400">When your friend buys an account using your code</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div>
                <div className="font-bold">Earn Commission</div>
                <div className="text-gray-400">Get 25-35% commission plus 500 points instantly</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div>
                <div className="font-bold">Redeem Rewards</div>
                <div className="text-gray-400">Use earnings for discounts or withdraw as store credit</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
