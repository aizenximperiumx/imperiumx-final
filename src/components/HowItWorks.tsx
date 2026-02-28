import React from 'react';

export default function HowItWorks() {
  const steps = [
    { title: 'Create Ticket', desc: 'Tell us what you want or need help with.' },
    { title: 'Pay Securely', desc: 'Staff sends instructions. Pay your way.' },
    { title: 'We Deliver', desc: 'Credentials or resolution sent in your ticket.' },
    { title: 'Vouch & Earn', desc: 'Leave a review and earn points.' },
  ];
  return (
    <div className="grid md:grid-cols-4 gap-4">
      {steps.map((s, i) => (
        <div key={s.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-red-600 text-white flex items-center justify-center font-extrabold">
            {i + 1}
          </div>
          <div className="text-lg font-bold mb-1">{s.title}</div>
          <div className="text-sm text-gray-400">{s.desc}</div>
        </div>
      ))}
    </div>
  );
}
