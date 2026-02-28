import React, { useEffect, useRef } from 'react';
import Button from '../components/ui/Button';

export default function Concept() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tiltRef = useRef<HTMLDivElement | null>(null);
  const reduce = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || reduce) return;
    const layers = Array.from(el.querySelectorAll('[data-speed]')) as HTMLElement[];
    const onScroll = () => {
      const y = window.scrollY;
      layers.forEach(layer => {
        const s = Number(layer.dataset.speed || 0);
        layer.style.transform = `translateY(${y * s}px)`;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true } as any);
    return () => window.removeEventListener('scroll', onScroll as any);
  }, [reduce]);

  useEffect(() => {
    const el = tiltRef.current;
    if (!el || reduce) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      const rx = dy * 8;
      const ry = -dx * 12;
      el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
    };
    const onLeave = () => {
      el.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [reduce]);

  return (
    <div ref={containerRef} className="min-h-screen">
      <section className="relative h-[92vh] overflow-hidden grid place-items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-surface-900/80 to-black" />
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full blur-3xl opacity-25 bg-gradient-to-br from-brand-red600 to-brand-red700" data-speed="-0.12" />
        <div className="relative text-center px-6">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-4 leading-tight">
            The Vault
          </h1>
          <div className="text-gray-300 max-w-2xl mx-auto mb-6">
            A cinematic marketplace experience. Depth, motion, and intelligence without friction.
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button onClick={() => window.location.assign('/browse')}>Enter Marketplace</Button>
            <button className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-180 ease-out-quint" onClick={() => window.location.assign('/design')}>
              View System
            </button>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl" data-speed="-0.06">
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Immersion</div>
            <div className="text-xl font-bold mb-2">Depth without drag</div>
            <div className="text-gray-400 text-sm">Parallax and tilt add tactility yet keep interactions instant and accessible.</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl" data-speed="-0.04">
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Curation</div>
            <div className="text-xl font-bold mb-2">Adaptive discovery</div>
            <div className="text-gray-400 text-sm">Recommendations adjust to taste, highlighting rank, region, and budget sweet spots.</div>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl" data-speed="-0.02">
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Velocity</div>
            <div className="text-xl font-bold mb-2">Under 2 seconds</div>
            <div className="text-gray-400 text-sm">All motion degrades gracefully. LCP targets sub‑1.8s on median 4G.</div>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-widest text-gray-400">Showcase</div>
            <div className="text-3xl font-extrabold">Cinematic product spotlights</div>
            <div className="text-gray-300">A hero tile tilts to input and reveals key stats on hover. Works with keyboard and reduced‑motion defaults.</div>
            <div className="flex gap-3">
              <Button onClick={() => window.location.assign('/browse')}>Browse Now</Button>
              <button className="px-4 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all duration-180 ease-out-quint" onClick={() => window.location.assign('/tickets/create')}>
                Start a Ticket
              </button>
            </div>
          </div>
          <div className="perspective-1000">
            <div
              ref={tiltRef}
              className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 shadow-panel h-72 grid place-items-center select-none"
              style={{ transformStyle: 'preserve-3d' } as any}
              aria-hidden="true"
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-2">Ascendant 2 • NA</div>
                <div className="text-gray-400">68 Level • 45 Skins • 56% WR</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
