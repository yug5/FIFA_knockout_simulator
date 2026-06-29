import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Award } from 'lucide-react';
import { getAllPredictions } from '../api/endpoints';

export default function PredictionsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  const { data: participants = [], isLoading, isError } = useQuery({
    queryKey: ['predictions'],
    queryFn: getAllPredictions,
  });

  const filtered = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === 'score_desc') {
      return b.totalScore - a.totalScore;
    }
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-navy-light/60 rounded-xl w-1/4 mx-auto"></div>
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
            <div className="h-12 bg-navy-light/50 rounded-xl flex-grow"></div>
            <div className="h-12 bg-navy-light/50 rounded-xl w-32"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="h-28 bg-navy-light/40 rounded-xl w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="glass-panel border-red-500/25 bg-red-950/5 p-8 rounded-2xl text-red-200">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold mb-2">Connection Error</h2>
          <p className="text-xs text-slate-400">
            Failed to query public predictions from the database. Make sure port 8081 is active.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 uppercase">
          All Brackets
        </h1>
        <p className="text-slate-400 text-xs">
          See how other fans filled out their bracket.
        </p>
      </div>

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-8 max-w-3xl mx-auto">
        <div className="relative w-full sm:flex-grow">
          <input
            type="text"
            placeholder="Search brackets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-navy-light/60 border border-glass-border focus:border-white/30 rounded-xl py-3 pl-11 pr-4 text-white text-sm outline-none font-bold placeholder-gray-500"
          />
          <Search className="absolute left-4 top-3.5 text-gray-500 w-4 h-4" />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-48 bg-navy-light/60 border border-glass-border/40 focus:border-white/30 rounded-xl py-3 px-4 text-white text-sm font-bold outline-none cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="score_desc">Highest Score</option>
            <option value="name_asc">Name A-Z</option>
          </select>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl max-w-lg mx-auto">
          <Award className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-base font-extrabold text-white mb-1">No Brackets Found</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Try searching for a different name or predict your own bracket.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sorted.map((participant) => (
            <div
              key={participant.id}
              onClick={() => navigate(`/predictions/${encodeURIComponent(participant.name)}`)}
              className="glass-panel p-6 rounded-xl border border-glass-border hover:border-white/25 hover:shadow-[0_0_15px_rgba(255,255,255,0.05)] cursor-pointer flex flex-col justify-between transition-all duration-300"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-extrabold text-white text-base truncate pr-2 hover:text-slate-350 transition-all">
                    {participant.name}
                  </h3>
                  <span className="font-black text-gold text-base shrink-0">
                    {participant.totalScore} pts
                  </span>
                </div>
                <p className="text-[9px] text-gray-500 uppercase tracking-wider">
                  Submitted: {formatDate(participant.submittedAt)}
                </p>
              </div>

              <div className="border-t border-glass-border/10 pt-3 mt-4 flex items-center justify-between">
                <span className="text-[9px] uppercase font-black text-slate-400 tracking-widest">
                  View Bracket &rarr;
                </span>
                <span className="text-[10px] font-semibold text-gray-500">
                  2026 Predictor
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
