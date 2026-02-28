import React from 'react';

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse bg-white/5 border border-white/10 rounded-2xl p-6 space-y-3">
      <div className="h-6 bg-white/10 rounded w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-white/10 rounded w-full" />
      ))}
      <div className="h-4 bg-white/10 rounded w-2/3" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse border-t border-white/10">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 bg-white/10 rounded w-24" />
        </td>
      ))}
    </tr>
  );
}
