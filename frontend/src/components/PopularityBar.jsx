import React from 'react';

export default function PopularityBar({ team1, team2, pct1, pct2 }) {
  const p1 = pct1 !== null && pct1 !== undefined ? pct1 : 50;
  const p2 = pct2 !== null && pct2 !== undefined ? pct2 : 50;

  if (!team1 || !team2) return null;

  return (
    <div className="w-full flex flex-col gap-0.5 py-1 px-2 text-[8px] font-black text-gray-500">
      <div className="flex justify-between items-center leading-none mb-0.5">
        <span className="truncate max-w-[45%] text-left">{Math.round(p1)}%</span>
        <span className="truncate max-w-[45%] text-right">{Math.round(p2)}%</span>
      </div>
      <div className="w-full bg-navy border border-glass-border/20 h-1 rounded-full overflow-hidden flex">
        <div 
          className="bg-gold h-full transition-all duration-500" 
          style={{ width: `${p1}%` }}
        />
        <div 
          className="bg-slate-700 h-full flex-grow transition-all duration-500" 
        />
      </div>
    </div>
  );
}
