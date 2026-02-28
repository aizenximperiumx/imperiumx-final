import React from 'react';
import Card from '../components/ui/Card';

export default function Terms() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">Terms of Service</h1>

        <Card padded variant="lux" color="brand" className="mb-8">
          <div className="font-semibold mb-3">On this page</div>
          <ul className="grid grid-cols-2 gap-2 text-sm text-red-400">
            <li><a href="#section-1" className="hover:underline">1. Account Delivery</a></li>
            <li><a href="#section-2" className="hover:underline">2. Refund Policy (Bank/Card)</a></li>
            <li><a href="#section-3" className="hover:underline">3. Refund Policy (Full Access)</a></li>
            <li><a href="#section-4" className="hover:underline">4. Transaction Fees</a></li>
            <li><a href="#section-5" className="hover:underline">5. Service Refusal</a></li>
            <li><a href="#section-6" className="hover:underline">6. Customer Misuse</a></li>
            <li><a href="#section-7" className="hover:underline">7. Warranty & Compensation</a></li>
            <li><a href="#section-8" className="hover:underline">8. Account Pullbacks</a></li>
            <li><a href="#section-9" className="hover:underline">9. TOS Modifications</a></li>
            <li><a href="#section-10" className="hover:underline">10. Acceptance</a></li>
          </ul>
        </Card>

        <Card padded variant="lux" color="brand" className="space-y-6">
          <div className="p-4 bg-white/10 rounded-lg" id="section-1">
            <h2 className="text-xl font-bold mb-2">1. Account Delivery</h2>
            <p className="text-gray-300">We will not give the account until the transaction is fully confirmed.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-2">
            <h2 className="text-xl font-bold mb-2">2. Refund Policy (Bank/Card)</h2>
            <p className="text-gray-300">We will not provide refunds for payments sent from bank, or card.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-3">
            <h2 className="text-xl font-bold mb-2">3. Refund Policy (Full Access)</h2>
            <p className="text-gray-300">We will not provide refunds for any Full Access accounts where the transaction is more than one day old.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-4">
            <h2 className="text-xl font-bold mb-2">4. Transaction Fees</h2>
            <p className="text-gray-300">We do not cover any fees you may have whilst sending.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-5">
            <h2 className="text-xl font-bold mb-2">5. Service Refusal</h2>
            <p className="text-gray-300">We can refuse services without a given reason.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-6">
            <h2 className="text-xl font-bold mb-2">6. Customer Misuse</h2>
            <p className="text-gray-300">We cannot be held responsible for any misuse of our products by customers.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-7">
            <h2 className="text-xl font-bold mb-2">7. Warranty & Compensation</h2>
            <p className="text-gray-300">By redeeming an account you consent to any issues you may further have. Compensation may only be provided if it is a problem on our side or the account credentials do not work 120 seconds after the purchase.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-8">
            <h2 className="text-xl font-bold mb-2">8. Account Pullbacks</h2>
            <p className="text-gray-300">We are not responsible for any pullbacks for our accounts. After you have logged into the account, we are not held responsible for anything that happens after.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-9">
            <h2 className="text-xl font-bold mb-2">9. TOS Modifications</h2>
            <p className="text-gray-300">We retain the right to modify our Terms of Service at any point in time.</p>
          </div>

          <div className="p-4 bg-white/10 rounded-lg" id="section-10">
            <h2 className="text-xl font-bold mb-2">10. Acceptance</h2>
            <p className="text-gray-300">Upon purchasing from us, regardless of the platform, you are deemed to have accepted these TOS automatically.</p>
          </div>
        </Card>
      </div>
    </div>
  );
}
