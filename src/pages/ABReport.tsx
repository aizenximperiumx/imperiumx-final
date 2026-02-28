import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import Card from '../components/ui/Card';

type Stats = {
  experiments: Record<string, {
    A: { impressions: number; conversions: number };
    B: { impressions: number; conversions: number };
  }>;
};

export default function ABReport() {
  const { isCEO, token } = useAuth();
  const [data, setData] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      const d = await api.get('/report/ab', { headers });
      setData(d);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isCEO) load();
    else setLoading(false);
  }, [isCEO, token]);

  const rows = useMemo(() => {
    const out: Array<{ name: string; aImp: number; aConv: number; aRate: number; bImp: number; bConv: number; bRate: number; lift: number }> = [];
    const exps = data?.experiments || {};
    Object.keys(exps).forEach((k) => {
      const e = exps[k];
      const aRate = e.A.impressions ? (e.A.conversions / e.A.impressions) : 0;
      const bRate = e.B.impressions ? (e.B.conversions / e.B.impressions) : 0;
      const lift = aRate === 0 && bRate === 0 ? 0 : ((bRate - aRate) / (aRate || 1));
      out.push({
        name: k,
        aImp: e.A.impressions, aConv: e.A.conversions, aRate,
        bImp: e.B.impressions, bConv: e.B.conversions, bRate,
        lift,
      });
    });
    return out;
  }, [data]);

  if (!isCEO) return <div className="min-h-screen flex items-center justify-center">CEO only</div>;

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">A/B Report</h1>
          <p className="text-gray-400">Live stats from experiments</p>
        </div>

        {loading && <div className="text-center text-gray-400">Loading…</div>}
        {!loading && rows.length === 0 && (
          <div className="text-center text-gray-400">No experiments recorded</div>
        )}

        {rows.map((r) => (
          <Card key={r.name} className="mb-4" variant="lux" color="brand">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-bold">{r.name}</div>
              <div className={`px-3 py-1 rounded-full text-sm font-semibold ${r.lift >= 0 ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                Lift: {(r.lift * 100).toFixed(1)}%
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/10 rounded-xl">
                <div className="font-semibold mb-1">Variant A</div>
                <div className="text-sm text-gray-400">Impressions: {r.aImp}</div>
                <div className="text-sm text-gray-400">Conversions: {r.aConv}</div>
                <div className="text-lg font-bold mt-1">Rate: {(r.aRate * 100).toFixed(2)}%</div>
              </div>
              <div className="p-4 bg-white/10 rounded-xl">
                <div className="font-semibold mb-1">Variant B</div>
                <div className="text-sm text-gray-400">Impressions: {r.bImp}</div>
                <div className="text-sm text-gray-400">Conversions: {r.bConv}</div>
                <div className="text-lg font-bold mt-1">Rate: {(r.bRate * 100).toFixed(2)}%</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
