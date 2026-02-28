import React from 'react';
import { Link } from 'react-router-dom';

export default function BundleDeals() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Bundle Deals</h1>

        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-lg p-8 mb-8 text-center">
          <h2 className="text-3xl font-bold mb-4">BUY 2 ACCOUNTS - GET 30% OFF!</h2>
          <p className="text-xl mb-6">Add any 2 accounts to your purchase and save big!</p>
          <div className="text-5xl font-bold mb-6">30% OFF</div>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/browse"
              className="inline-block px-8 py-4 bg-white text-black rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
            >
              Browse Accounts
            </Link>
            <Link
              to="/tickets/create?type=buying"
              className="inline-block px-8 py-4 bg-gradient-to-r from-black/70 to-black/70 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-colors"
            >
              Start Bundle
            </Link>
          </div>
        </div>

        <div className="lux-card lux-card-brand rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Bundle Rules</h2>
          <div className="grid md:grid-cols-3 gap-4 text-gray-300">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold mb-1">Qualifies</div>
              <div>Any two accounts</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold mb-1">Discount</div>
              <div>30% off applied manually</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold mb-1">Games</div>
              <div>Valid for Valorant & Fortnite</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold mb-1">Combining offers</div>
              <div>Cannot combine with other offers</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold mb-1">Loyalty/Referral</div>
              <div>Cannot use with points or referral discounts</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="font-bold mb-1">Warranty</div>
              <div>120s warranty; lifetime optional</div>
            </div>
          </div>
        </div>

        <div className="lux-card lux-card-brand rounded-2xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Example Savings</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="text-gray-400">Regular total</div>
              <div className="text-2xl font-bold">$350</div>
            </div>
            <div className="p-4 bg-white/10 rounded-lg">
              <div className="text-gray-400">30% discount</div>
              <div className="text-2xl font-bold text-green-500">-$105</div>
            </div>
            <div className="p-4 bg-gradient-to-r from-red-600 to-rose-600 rounded-lg">
              <div className="text-gray-100">You pay</div>
              <div className="text-3xl font-extrabold">$245</div>
            </div>
          </div>
          <div className="text-center mt-6">
            <Link
              to="/tickets/create?type=buying"
              className="inline-block px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 rounded-lg font-bold text-lg hover:opacity-90 transition-colors"
            >
              Open Ticket for Bundle
            </Link>
          </div>
        </div>

        <div className="lux-card lux-card-brand rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6">FAQ</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold mb-2">Q: Can I bundle 3 accounts?</h3>
              <p className="text-gray-400">A: Yes! Buy 2 get 30% off, 3rd account at regular price. You can create separate tickets for additional discounts.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Q: Does warranty apply to bundle purchases?</h3>
              <p className="text-gray-400">A: Yes, all accounts come with 120-second warranty. Lifetime warranty is also available for each account.</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Q: Can I use loyalty points with bundle discount?</h3>
              <p className="text-gray-400">A: No, bundle discount cannot be combined with loyalty points redemption. You still earn points on the purchase!</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Q: How do I claim the bundle discount?</h3>
              <p className="text-gray-400">A: Create a ticket mentioning you want to bundle accounts. Staff will apply the 30% discount manually.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
