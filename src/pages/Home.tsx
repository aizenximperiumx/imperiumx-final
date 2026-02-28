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
            <a
              href="https://discord.gg/dCWxyNuyG4"
              target="_blank"
              rel="noopener noreferrer"
              className="ring-glow px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-xl font-bold text-lg hover:opacity-95 transition-all shadow-lg shadow-indigo-500/30 border border-indigo-400/30 inline-flex items-center gap-3"
              title="Official ImperiumX Discord Server"
            >
              <DiscordIcon className="w-6 h-6" />
              Join Discord
              <span className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-white/10">Official Server</span>
            </a>
          </div>
        </div>
      </section>

      {/* Discord Highlight */}
      <section className="py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="lux-card lux-card-brand rounded-2xl p-8 border-2 border-indigo-500/30 shadow-2xl shadow-indigo-500/30">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-indigo-600/30">
                  <DiscordIcon className="w-8 h-8 text-indigo-300" />
                </div>
                <div>
                  <div className="text-2xl font-extrabold">Join Our Official Discord</div>
                  <div className="text-gray-300 text-sm">Support, announcements, drops and private offers</div>
                </div>
              </div>
              <a
                href="https://discord.gg/dCWxyNuyG4"
                target="_blank"
                rel="noopener noreferrer"
                className="ring-glow px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-700 rounded-xl font-bold text-lg hover:opacity-95 transition-all inline-flex items-center gap-3 border border-indigo-400/30"
              >
                <DiscordIcon className="w-6 h-6" />
                Join Discord
              </a>
            </div>
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

function DiscordIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.317 4.369A18.886 18.886 0 0 0 16.671 3c-.179.33-.381.777-.523 1.128a17.31 17.31 0 0 0-4.297 0c-.15-.36-.355-.82-.536-1.151a18.91 18.91 0 0 0-3.647 1.371C4.06 7.54 3.256 10.567 3.492 13.546a18.85 18.85 0 0 0 5.64 2.871c.272-.376.578-.86.79-1.254a11.71 11.71 0 0 1-1.855-.891c.155-.113.307-.232.453-.355 3.609 1.693 7.514 1.693 11.079 0 .147.123.299.242.453.355-.6.36-1.219.654-1.855.891.213.394.514.878.79 1.254a18.82 18.82 0 0 0 5.642-2.87c.369-4.626-.63-7.606-2.962-9.643ZM9.596 12.838c-.86 0-1.563-.79-1.563-1.76 0-.969.692-1.76 1.563-1.76.88 0 1.574.801 1.563 1.76 0 .97-.692 1.76-1.563 1.76Zm4.818 0c-.86 0-1.563-.79-1.563-1.76 0-.969.692-1.76 1.563-1.76.881 0 1.574.801 1.563 1.76 0 .97-.682 1.76-1.563 1.76Z" />
    </svg>
  );
}
