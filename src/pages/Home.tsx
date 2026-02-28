import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ReviewsStrip from '../components/ReviewsStrip';
import HowItWorks from '../components/HowItWorks';

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen relative grid-pattern">
      {/* Subtle radial glows */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute w-[60vw] h-[60vw] rounded-full blur-3xl opacity-30 left-[-10vw] top-[-12vw]"
             style={{ background: 'radial-gradient(circle, rgba(255,32,64,0.45) 0%, rgba(0,0,0,0) 70%)' }} />
        <div className="absolute w-[50vw] h-[50vw] rounded-full blur-3xl opacity-20 right-[-15vw] bottom-[-18vw]"
             style={{ background: 'radial-gradient(circle, rgba(255,96,128,0.35) 0%, rgba(0,0,0,0) 70%)' }} />
      </div>

      {/* Hero */}
      <section className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="hero-title text-6xl md:text-8xl font-extrabold tracking-tight mb-4">
            IMPERIUMX
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12">
            Premium Gaming Accounts Marketplace
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-12">
            {[
              { label: 'Customers', value: '8,500+' },
              { label: 'Established', value: '2023' },
              { label: 'Avg Delivery', value: '< 15 min' },
              { label: 'Secure', value: '100%' },
            ].map((s) => (
              <div key={s.label} className="lux-card lux-card-brand rounded-2xl p-6">
                <div className="text-3xl font-extrabold text-red-500">{s.value}</div>
                <div className="text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link to="/tickets/create" className="ring-glow px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold text-lg hover:opacity-95 transition-all shadow-lg shadow-red-500/30 border border-red-500/30">
              Create Your First Ticket
            </Link>
            <Link to="/browse" className="ring-glow px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-700 rounded-xl font-bold text-lg hover:opacity-95 transition-all shadow-lg shadow-rose-500/30 border border-rose-500/30">
              Browse Accounts
            </Link>
            <Link to="/tickets/create?type=support" className="px-8 py-4 bg-white/[0.06] rounded-xl font-bold text-lg hover:bg-white/10 transition-all border border-white/10">
              Open Support Ticket
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Strip */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">What Customers Say</h2>
          <ReviewsStrip />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why ImperiumX</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
              <p className="text-gray-400">120-second warranty on all accounts</p>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Loyalty Rewards</h3>
              <p className="text-gray-400">Earn 10 points per $1 spent</p>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Referral Program</h3>
              <p className="text-gray-400">Up to 35% commission</p>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-400">Average delivery under 15 minutes</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <HowItWorks />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">FAQ</h2>
          <div className="space-y-4">
            <div className="lux-card lux-card-brand rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">How do I receive my account?</h3>
              <p className="text-gray-400">After payment confirmation, you'll receive the account credentials instantly via the ticket system.</p>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-400">We accept cryptocurrency (Bitcoin, Ethereum, USDT) and other payment methods discussed in ticket.</p>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">What is the warranty?</h3>
              <p className="text-gray-400">All accounts come with a 120-second warranty. If credentials don't work within 120 seconds, you get a full refund. Lifetime warranty is also available.</p>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">How does the referral program work?</h3>
              <p className="text-gray-400">Share your unique referral code. When someone purchases using your code, you get 25-35% commission plus 500 points.</p>
            </div>
            <div className="lux-card lux-card-brand rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-2">Can I bundle accounts for discount?</h3>
              <p className="text-gray-400">Yes! Buy 2 accounts and get 30% off the total price. Discount is applied automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Band */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-900/40 to-red-700/20 p-10 text-center">
            <h3 className="text-3xl font-extrabold mb-4">Ready to get started?</h3>
            <p className="text-gray-300 mb-8">Open a ticket in minutes or browse curated accounts.</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link to="/tickets/create" className="ring-glow px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-bold text-lg hover:opacity-95 transition-all shadow-lg shadow-red-500/30 border border-red-500/30">
                Create Ticket
              </Link>
              <Link to="/browse" className="px-8 py-4 bg-white/[0.06] rounded-xl font-bold text-lg hover:bg-white/10 transition-all border border-white/10">
                Browse Accounts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
