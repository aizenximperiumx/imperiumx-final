import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function GiftCards() {
  const { isCEO, token, login } = useAuth();
  const [redeemCode, setRedeemCode] = useState('');
  const [generateAmount, setGenerateAmount] = useState('');
  const [notification, setNotification] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) {
      setNotification('Enter a gift card code');
      return;
    }
    try {
      const data = await api.post('/giftcards/redeem', { code: redeemCode.trim().toUpperCase() }, { headers: { Authorization: `Bearer ${token}` } });
      setNotification(`Code redeemed. Amount: $${data.amount} • Points added: ${data.pointsAdded}`);
      try {
        const me = await api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } });
        if (token && me) {
          login(token, me);
        }
      } catch {}
      setRedeemCode('');
    } catch (err: any) {
      setNotification(err.message || 'Failed to redeem code');
    } finally {
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateAmount) {
      setNotification('Select an amount');
      return;
    }
    try {
      const data = await api.post('/giftcards/generate', { amount: Number(generateAmount) }, { headers: { Authorization: `Bearer ${token}` } });
      setGeneratedCode(data.code);
      setNotification(`Gift card generated — Code: ${data.code} • Amount: $${data.amount}`);
      setGenerateAmount('');
      setTimeout(() => setNotification(''), 10000);
    } catch (err: any) {
      setNotification(err.message || 'Failed to generate code');
      setTimeout(() => setNotification(''), 5000);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    setNotification('Code copied to clipboard.');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Gift Cards</h1>
          <p className="text-gray-400">For giveaways, rewards, and store credit.</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className="bg-green-500/20 border-2 border-green-500 text-green-500 p-6 rounded-2xl mb-8 whitespace-pre-line">
            {notification}
          </div>
        )}

        {/* Two-column layout */}
        <div className={`grid gap-8 ${isCEO ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Redeem */}
          <div className="lux-card lux-card-brand rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-6">Redeem Gift Card</h2>
            <form onSubmit={handleRedeem} className="space-y-4">
              <div>
                <label className="block text-gray-300 mb-3 font-semibold">Gift Card Code</label>
                <input
                  type="text"
                  value={redeemCode}
                  onChange={(e) => setRedeemCode(e.target.value.toUpperCase())}
                  className="w-full px-5 py-4 bg-gray-900 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white text-lg tracking-wider transition-all"
                  placeholder="GC-XXXXXXXX"
                />
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-red-500/30"
              >
                Redeem Code
              </button>
            </form>
            <div className="grid grid-cols-3 gap-3 mt-6 text-sm text-gray-400">
              <div className="p-3 bg-white/10 rounded-lg">
                Enter code and redeem
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                Code locks immediately
              </div>
              <div className="p-3 bg-white/10 rounded-lg">
                Points added to your balance
              </div>
            </div>
          </div>

          {/* Generate (CEO) */}
          {isCEO && (
            <div className="lux-card lux-card-brand rounded-2xl p-8">
              <h2 className="text-2xl font-bold mb-6">Generate Gift Card (CEO)</h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-3 font-semibold">Select Amount</label>
                  <select
                    value={generateAmount}
                    onChange={(e) => setGenerateAmount(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-900 border-2 border-white/20 rounded-xl focus:outline-none focus:border-red-500 text-white text-lg transition-all"
                  >
                    <option value="" className="text-black">Choose amount...</option>
                    <option value="10" className="text-black">$10</option>
                    <option value="25" className="text-black">$25</option>
                    <option value="50" className="text-black">$50</option>
                    <option value="100" className="text-black">$100</option>
                    <option value="200" className="text-black">$200</option>
                    <option value="500" className="text-black">$500</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-red-500/30"
                >
                  Generate Gift Card
                </button>
              </form>

              {generatedCode && (
                <div className="mt-6 p-6 bg-gray-900 rounded-xl border-2 border-red-500">
                  <div className="text-center">
                    <div className="text-gray-400 mb-2">Your Gift Card Code:</div>
                    <div className="text-4xl font-mono font-bold text-red-400 mb-4 tracking-wider">
                      {generatedCode}
                    </div>
                    <button
                      onClick={copyToClipboard}
                      className="px-6 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition-all"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="lux-card lux-card-brand rounded-2xl p-8 mt-8">
          <h2 className="text-2xl font-bold mb-6">Gift Card Information</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-xl">
              <div>
                <div className="font-bold mb-1">Available Denominations</div>
                <div className="text-gray-400">$10, $25, $50, $100, $200, $500</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-xl">
              <div>
                <div className="font-bold mb-1">No Expiration</div>
                <div className="text-gray-400">Gift cards never expire</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-xl">
              <div>
                <div className="font-bold mb-1">Transferable</div>
                <div className="text-gray-400">Can be transferred to other users</div>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-gray-900 rounded-xl">
              <div>
                <div className="font-bold mb-1">Perfect for Giveaways</div>
                <div className="text-gray-400">Use for community events & giveaways</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
