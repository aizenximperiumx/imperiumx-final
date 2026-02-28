import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Tabs from '../components/ui/Tabs';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

type ProfileData = {
  user: { username: string; email: string; points: number; tier: string; createdAt: string };
  orders: Array<{ id: string; orderId: string; amount: number; status: string; createdAt: string }>;
  transactions: Array<{ id: string; delta: number; reason: string; createdAt: string; meta?: any }>;
};

export default function Profile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { token, isAuthenticated, isCEO, login } = useAuth();
  const [tab, setTab] = useState<'overview' | 'loyalty' | 'referral' | 'giftcards'>('overview');
  const [loyalty, setLoyalty] = useState<any>(null);
  const [credit, setCredit] = useState<number>(0);
  const [referral, setReferral] = useState<any>(null);
  const [redeemPoints, setRedeemPoints] = useState('');
  const [giftCode, setGiftCode] = useState('');
  const [giftMsg, setGiftMsg] = useState('');
  const [generating, setGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
        const d = await api.get('/profile', { headers });
        setData(d);
        try {
          const r = await api.get('/referral', { headers });
          setReferral(r);
        } catch {}
        try {
          const c = await api.get('/loyalty/credit', { headers });
          setCredit(Number(c?.credit || 0));
        } catch {}
      } finally {
        setLoading(false);
      }
    };
    if (isAuthenticated) {
      load();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, token]);

  const downloadReceipt = async (orderId: string) => {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    const r = await api.get(`/orders/${orderId}/receipt`, { headers });
    const html = `
      <html><head><title>Receipt ${r.orderId}</title></head>
      <body style="font-family: Arial; padding: 24px; color: #111;">
        <h1>Order Receipt</h1>
        <div><strong>Order ID:</strong> ${r.orderId}</div>
        <div><strong>Amount:</strong> $${Number(r.amount).toFixed(2)}</div>
        <div><strong>Payment Method:</strong> ${r.paymentMethod}</div>
        <div><strong>Status:</strong> ${r.status}</div>
        <div><strong>Date:</strong> ${new Date(r.createdAt).toLocaleString()}</div>
        <hr/>
        <div><strong>Customer:</strong> ${r.user.username} (${r.user.email})</div>
      </body></html>
    `;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt-${r.orderId}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!isAuthenticated) return <div className="min-h-screen flex items-center justify-center">Please login to view your profile</div>;
  if (!data) return <div className="min-h-screen flex items-center justify-center">Failed to load profile</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold mb-2">Profile</h1>
          <p className="text-gray-400">Overview and tools</p>
        </div>

        <Tabs
          className="justify-center mb-8"
          tabs={[
            { id: 'overview', label: 'Overview' },
            { id: 'loyalty', label: 'Loyalty' },
            { id: 'referral', label: 'Referral' },
            { id: 'giftcards', label: 'Gift Cards' },
          ]}
          active={tab}
          onChange={async (id) => {
            setTab(id as any);
            const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
            if (id === 'loyalty' && !loyalty) {
              const l = await api.get('/loyalty', { headers });
              setLoyalty(l);
            }
            if (id === 'referral' && !referral) {
              const r = await api.get('/referral', { headers });
              setReferral(r);
            }
          }}
        />

        {tab === 'overview' && (
        <>
        <div className="mb-6">
          <div className="lux-card lux-card-brand rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-sm text-gray-400">Your Referral Code</div>
                <div className="text-3xl font-extrabold tracking-widest">{(referral?.referralCode || (data as any)?.user?.referralCode || '—')}</div>
                <div className="text-xs text-gray-400 mt-1">Share this code; commissions are tracked automatically on qualifying purchases.</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const code = referral?.referralCode || (data as any)?.user?.referralCode || '';
                    if (!code) return;
                    navigator.clipboard.writeText(code);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 2000);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
                >
                  {copiedCode ? 'Copied' : 'Copy Code'}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-sm text-gray-400">Username</div>
            <div className="text-xl font-bold">{data.user.username}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-sm text-gray-400">Points</div>
            <div className="text-3xl font-bold text-red-500">{data.user.points}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-sm text-gray-400">Tier</div>
            <div className="text-xl font-bold capitalize">{data.user.tier}</div>
          </div>
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
            <div className="text-sm text-gray-400">Store Credit</div>
            <div className="text-3xl font-bold text-green-400">${credit.toFixed(2)}</div>
            <div className="text-xs text-gray-400 mt-1">Auto-applies on your next payment</div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setTab('loyalty')}
                className="px-3 py-2 bg-white/10 rounded-lg text-xs hover:bg-white/20"
              >
                Redeem Points
              </button>
              <button
                onClick={() => setTab('giftcards')}
                className="px-3 py-2 bg-white/10 rounded-lg text-xs hover:bg-white/20"
              >
                Redeem Gift Card
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card variant="lux" color="brand">
            <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
            <div className="space-y-3">
              {data.orders.map(o => (
                <div key={o.id} className="p-4 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{o.orderId}</div>
                    <div className="text-sm text-gray-400">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-red-500">${o.amount.toFixed(2)}</div>
                    <Badge color={o.status === 'completed' ? 'blue' : 'yellow'}>{o.status}</Badge>
                    <button
                      onClick={() => downloadReceipt(o.id)}
                      className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
                    >
                      Download Receipt
                    </button>
                  </div>
                </div>
              ))}
              {data.orders.length === 0 && <div className="text-gray-400">No orders yet</div>}
            </div>
          </Card>

          <Card variant="lux" color="brand">
            <h2 className="text-2xl font-bold mb-6">Points Ledger</h2>
            <div className="space-y-3">
              {data.transactions.map(t => {
                const isCreditAdd = t.reason === 'store_credit_add';
                const isCreditUse = t.reason === 'store_credit_use';
                const dollars = Number((t as any)?.meta?.dollars || 0);
                return (
                  <div key={t.id} className="p-4 bg-white/10 rounded-xl border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{t.reason.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-gray-400">{new Date(t.createdAt).toLocaleString()}</div>
                    </div>
                    {isCreditAdd || isCreditUse ? (
                      <div className={`font-bold ${isCreditAdd ? 'text-green-500' : 'text-yellow-400'}`}>
                        {isCreditAdd ? '+' : '-'}${dollars.toFixed(2)}
                      </div>
                    ) : (
                      <div className={`font-bold ${t.delta >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {t.delta >= 0 ? '+' : ''}{t.delta}
                      </div>
                    )}
                  </div>
                );
              })}
              {data.transactions.length === 0 && <div className="text-gray-400">No point activity yet</div>}
            </div>
          </Card>
        </div>
        </>
        )}

        {tab === 'loyalty' && loyalty && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="text-5xl font-bold text-red-500 mb-2">{loyalty.points}</div>
              <div className="text-gray-400 mb-4">Points</div>
              <div className="text-sm">Tier: <span className="font-semibold capitalize">{loyalty.tier}</span></div>
              <div className="text-sm">Next Tier: <span className="font-semibold capitalize">{loyalty.nextTier}</span></div>
              <div className="w-full bg-white/10 rounded-full h-2 mt-3">
                <div className="bg-red-600 h-2 rounded-full" style={{ width: `${Math.min(100, (loyalty.points / (loyalty.tier === 'gold' ? 5000 : loyalty.tier === 'silver' ? 5000 : 1000)) * 100)}%` }} />
              </div>
              <div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
                <div className="text-sm text-gray-400">Available Store Credit</div>
                <div className="text-2xl font-bold">${credit.toFixed(2)}</div>
                <div className="text-xs text-gray-400 mt-1">Automatically applied to your next payment</div>
              </div>
            </div>
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="font-bold mb-3">Redeem Points</div>
              <div className="flex gap-3">
                <input
                  value={redeemPoints}
                  onChange={(e) => setRedeemPoints(e.target.value)}
                  placeholder="Enter points (min 500)"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl"
                />
                <button
                  onClick={async () => {
                    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
                    const pts = parseInt(redeemPoints, 10);
                    if (!pts || pts < 500) return;
                    try {
                      const r = await api.post('/loyalty/redeem', { points: pts }, { headers });
                      setRedeemPoints('');
                      const l = await api.get('/loyalty', { headers });
                      setLoyalty(l);
                      const me = await api.get('/auth/me', { headers });
                      if (token && me) {
                        login(token, me);
                      }
                      const p = await api.get('/profile', { headers });
                      setData(p);
                      try {
                        const c = await api.get('/loyalty/credit', { headers });
                        setCredit(Number(c?.credit || 0));
                      } catch {}
                      alert(`Redeemed ${pts} points for $${Number(r.discount).toFixed(2)} discount`);
                    } catch (e) {
                      // silent
                    }
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
                >
                  Redeem
                </button>
              </div>
              <div className="text-sm text-gray-400 mt-2">100 points = $1 discount</div>
            </div>
          </div>
        )}

        {tab === 'referral' && referral && (
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-400">Referral Code</div>
                <div className="font-semibold">{referral.referralCode}</div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm text-gray-400">Link</div>
                <div className="flex gap-2">
                  <input className="flex-1 px-3 py-2 bg-white/10 rounded-lg" value={referral.referralLink} readOnly />
                  <button onClick={() => { navigator.clipboard.writeText(referral.referralLink); }} className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold hover:opacity-90">Copy</button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-white/10 rounded-lg text-center">
                <div className="text-2xl font-bold">{referral.totalReferrals}</div>
                <div className="text-sm text-gray-400">Referrals</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg text-center">
                <div className="text-2xl font-bold">${Number(referral.totalEarnings).toFixed(2)}</div>
                <div className="text-sm text-gray-400">Earnings</div>
              </div>
              <div className="p-4 bg-white/10 rounded-lg text-center">
                <div className="text-2xl font-bold">{referral.totalPoints}</div>
                <div className="text-sm text-gray-400">Points</div>
              </div>
            </div>
            <div className="text-lg font-bold mb-3">Recent Referrals</div>
            <div className="space-y-3">
              {referral.referrals?.slice(0, 10).map((r: any, i: number) => (
                <div key={i} className="p-4 bg-white/10 rounded-lg flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{r.username}</div>
                    <div className="text-sm text-gray-400">{r.email}</div>
                  </div>
                  <div className="text-sm">${Number(r.commission).toFixed(2)} • {r.status}</div>
                </div>
              ))}
              {(!referral.referrals || referral.referrals.length === 0) && <div className="text-gray-400">No referral activity yet</div>}
            </div>
          </div>
        )}

        {tab === 'giftcards' && (
          <div className={`grid gap-8 ${isCEO ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
              <div className="font-bold mb-3">Redeem Gift Card</div>
              <div className="flex gap-3">
                <input
                  value={giftCode}
                  onChange={(e) => setGiftCode(e.target.value.toUpperCase())}
                  placeholder="GC-XXXXXXXX"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl"
                />
                <button
                  onClick={async () => {
                    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
                    try {
                      const data = await api.post('/giftcards/redeem', { code: giftCode }, { headers });
                      setGiftMsg(`Redeemed $${data.amount} • ${data.pointsAdded} points added`);
                      setGiftCode('');
                    } catch (e: any) {
                      setGiftMsg(e.message || 'Failed to redeem');
                    }
                    setTimeout(() => setGiftMsg(''), 5000);
                  }}
                  className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90"
                >
                  Redeem
                </button>
              </div>
              {giftMsg && <div className="text-sm text-green-500 mt-2">{giftMsg}</div>}
            </div>
            {isCEO && (
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
                <div className="font-bold mb-3">Generate Gift Card (CEO)</div>
                <div className="flex gap-3">
                  <select
                    onChange={(e) => setRedeemPoints(e.target.value)}
                    className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white"
                  >
                    <option className="text-black" value="">Amount</option>
                    <option className="text-black" value="10">$10</option>
                    <option className="text-black" value="25">$25</option>
                    <option className="text-black" value="50">$50</option>
                  </select>
                  <button
                    disabled={generating || !redeemPoints}
                    onClick={async () => {
                      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
                      try {
                        setGenerating(true);
                        const d = await api.post('/giftcards/generate', { amount: Number(redeemPoints) }, { headers });
                        setGiftMsg(`Generated ${d.code} • $${d.amount}`);
                      } catch (e: any) {
                        setGiftMsg(e.message || 'Failed to generate');
                      } finally {
                        setGenerating(false);
                        setTimeout(() => setGiftMsg(''), 6000);
                      }
                    }}
                    className="px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
