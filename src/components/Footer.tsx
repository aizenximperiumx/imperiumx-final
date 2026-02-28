import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-6 text-sm">
        <div>
          <div className="text-2xl font-extrabold mb-2">IMPERIUMX</div>
          <div className="text-gray-400">Premium Gaming Accounts Marketplace</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Link to="/browse" className="text-gray-300 hover:text-white transition-colors">Browse</Link>
            <div><Link to="/bundle" className="text-gray-300 hover:text-white">Bundles</Link></div>
            <div><Link to="/reviews" className="text-gray-300 hover:text-white">Reviews</Link></div>
          </div>
          <div className="space-y-2">
            <div><Link to="/terms" className="text-gray-300 hover:text-white">Terms</Link></div>
            <div><a href="#" className="text-gray-300 pointer-events-none opacity-60">Status (coming soon)</a></div>
            <div><a href="#" className="text-gray-300 pointer-events-none opacity-60">Privacy (coming soon)</a></div>
          </div>
        </div>
        <div className="text-gray-400">
          © {new Date().getFullYear()} ImperiumX. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
