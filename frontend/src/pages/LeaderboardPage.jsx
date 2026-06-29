import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Flame, ShieldAlert, Award } from 'lucide-react';
import { getLeaderboard, getPopularityStats } from '../api/endpoints';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: leaderboard = [], isLoading, isError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    refetchInterval: 30000,
  });

  const { data: popularityStats } = useQuery({
    queryKey: ['popularityStats'],
    queryFn: getPopularityStats,
  });

  const filteredLeaderboard = leaderboard.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'bg-white text-navy-dark font-black shadow-[0_0_10px_rgba(255,255,255,0.15)]';
    if (rank === 2) return 'bg-slate-700 text-white font-bold';
    if (rank === 3) return 'bg-slate-800 text-slate-300 font-bold border border-slate-700';
    return 'bg-navy-light/40 border border-glass-border/30 text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-navy-light/60 rounded-xl w-1/3 mx-auto"></div>
          <div className="h-12 bg-navy-light/50 rounded-xl max-w-md mx-auto"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-14 bg-navy-light/40 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="glass-panel border-red-500/20 bg-red-950/5 p-8 rounded-2xl text-red-200">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold mb-2">Connection Failure</h2>
          <p className="text-xs text-slate-400">
            Failed to query standings from the server. Check backend API status.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 uppercase">
          Leaderboard
        </h1>
        <p className="text-slate-400 text-xs leading-relaxed">
          Rankings update automatically as results come in.
        </p>
      </div>

      {popularityStats && popularityStats.mostPopularChampion && (
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-navy-light/35 flex items-center justify-between mb-8 max-w-md mx-auto text-sm animate-pulse">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-slate-400 shrink-0" />
            <div className="text-left">
              <span className="text-[9px] uppercase font-black text-slate-455 tracking-widest block">Trending Pick</span>
              <span className="text-white/80 font-bold text-xs">Most picked to win it all: </span>
              <span className="text-white font-extrabold text-xs">{popularityStats.mostPopularChampion}</span>
            </div>
          </div>
          <span className="text-[9px] text-gray-400 font-extrabold uppercase bg-white/5 px-2 py-0.5 rounded border border-glass-border">
            Fav
          </span>
        </div>
      )}

      {/* Search Input */}
      <div className="mb-8 max-w-md mx-auto relative">
        <input
          type="text"
          placeholder="Find player..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-navy-light/60 border border-glass-border focus:border-white/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none font-bold placeholder-gray-500"
        />
        <Search className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
      </div>

      {filteredLeaderboard.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl">
          <Award className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-base font-extrabold text-white mb-1">No Standings Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Be the first to submit a bracket and lead the board.
          </p>
        </div>
      ) : (
        <>
          {/* DESKTOP TABLE VIEW */}
          <div className="hidden md:block glass-panel rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-glass-border/30 bg-navy-light/20 text-gray-400 font-extrabold text-[10px] uppercase tracking-wider">
                  <th className="p-4 pl-6 text-center w-20">Rank</th>
                  <th className="p-4">Player</th>
                  <th className="p-4 text-center">Correct</th>
                  <th className="p-4 pr-6 text-right w-36">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-border/10">
                {filteredLeaderboard.map((row) => (
                  <tr 
                    key={row.name} 
                    className="hover:bg-white/5 transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(`/predictions/${encodeURIComponent(row.name)}`)}
                  >
                    <td className="p-4 pl-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${getRankBadgeClass(row.rank)}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link 
                        to={`/predictions/${encodeURIComponent(row.name)}`}
                        onClick={(e) => e.stopPropagation()}
                        className="font-extrabold text-white hover:text-slate-300 transition-all"
                      >
                        {row.name}
                      </Link>
                    </td>
                    <td className="p-4 text-center text-xs font-bold text-gray-300">
                      {row.correctCount} / 31
                    </td>
                    <td className="p-4 pr-6 text-right font-black text-gold text-base">
                      {row.totalScore} pts
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredLeaderboard.map((row) => (
              <div 
                key={row.name}
                onClick={() => navigate(`/predictions/${encodeURIComponent(row.name)}`)}
                className="glass-panel p-4 rounded-xl flex items-center justify-between border border-glass-border cursor-pointer hover:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${getRankBadgeClass(row.rank)}`}>
                    {row.rank}
                  </span>
                  <div className="flex flex-col">
                    <Link 
                      to={`/predictions/${encodeURIComponent(row.name)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-bold text-white hover:text-slate-300 transition-all text-sm"
                    >
                      {row.name}
                    </Link>
                    <span className="text-[9px] text-gray-400">
                      Correct: {row.correctCount} / 31
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-gold text-base">{row.totalScore} pts</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
