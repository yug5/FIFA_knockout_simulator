import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ShieldAlert, Share2, Award, Clipboard, Maximize2, Minimize2 } from 'lucide-react';
import Bracket from '../components/Bracket';
import { getPredictionByName, getLeaderboard } from '../api/endpoints';

export default function SingleBracketPage() {
  const { name } = useParams();
  const [copied, setCopied] = useState(false);
  const [zoomScale, setZoomScale] = useState(0.7);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Query participant predictions
  const { data: bracketData, isLoading: bracketLoading, isError: bracketError } = useQuery({
    queryKey: ['predictions', name],
    queryFn: () => getPredictionByName(name),
  });

  // Query leaderboard for rank lookup
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (bracketLoading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-20 bg-navy-light/60 rounded-xl w-full"></div>
          <div className="h-6 bg-navy-light/40 rounded-lg w-1/3 mx-auto"></div>
          <div className="h-[500px] bg-navy-light/30 rounded-2xl w-full"></div>
        </div>
      </div>
    );
  }

  if (bracketError) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="glass-panel border-red-500/20 bg-red-950/5 p-8 rounded-2xl text-red-200">
          <ShieldAlert className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold mb-2">Bracket Not Found</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            We couldn't find a prediction bracket for "{name}". Create one to join the action!
          </p>
          <Link to="/" className="inline-block mt-6 bg-white hover:bg-slate-200 text-navy font-bold px-5 py-2.5 rounded-xl text-xs transition-all">
            Create Bracket
          </Link>
        </div>
      </div>
    );
  }

  // Deconstruct API response
  const predictionsList = bracketData.predictions || [];
  
  // 1. Rebuild matches list
  const matches = predictionsList.map((p) => ({
    id: p.matchId,
    round: p.round,
    team1: p.team1,
    team2: p.team2,
    actualWinner: p.actualWinner,
    matchOrder: p.matchOrder,
    nextMatchId: p.nextMatchId
  }));

  // 2. Rebuild predictions dictionary
  const predictionsDict = {};
  predictionsList.forEach((p) => {
    predictionsDict[p.matchId] = p.predictedTeam;
  });
  // Auto-fill champion selection
  const finalPrediction = predictionsList.find((p) => p.round === 'FINAL');
  predictionsDict['CHAMPION'] = finalPrediction ? predictionsDict[finalPrediction.matchId] : null;

  // 3. Count correct picks
  const correctCount = predictionsList.filter((p) => p.isCorrect === true).length;
  const resolvedCount = predictionsList.filter((p) => p.actualWinner !== null).length;

  // Find leaderboard rank
  const leaderboardRow = leaderboard.find(
    (row) => row.name.toLowerCase() === name.toLowerCase()
  );
  const rank = leaderboardRow ? leaderboardRow.rank : 'N/A';

  // Check if own bracket
  const isOwnBracket = localStorage.getItem('wc_submitted_bracket_name')?.toLowerCase() === name.toLowerCase();

  return (
    <div className="max-w-7xl mx-auto px-2">
      {/* Header Stats Sheet */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-white/5 bg-navy-light/30 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                {bracketData.name}'s Bracket
              </h1>
              {isOwnBracket && (
                <span className="bg-white/10 text-white border border-white/15 text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                  Bracket locked
                </span>
              )}
            </div>
            <p className="text-slate-400 text-xs">
              Submitted: {new Date(bracketData.submittedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="flex gap-4 sm:gap-6 flex-wrap">
            <div className="bg-navy-light/60 border border-glass-border p-3.5 px-5 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Score
              </span>
              <span className="text-gold font-black text-2xl">
                {bracketData.totalScore} pts
              </span>
            </div>
            
            <div className="bg-navy-light/60 border border-glass-border p-3.5 px-5 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Rank
              </span>
              <span className="text-white font-black text-2xl">
                #{rank}
              </span>
            </div>

            <div className="bg-navy-light/60 border border-glass-border p-3.5 px-5 rounded-xl text-center">
              <span className="block text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                Correct Picks
              </span>
              <span className="text-white font-black text-2xl">
                {correctCount} <span className="text-xs text-gray-450 font-normal">/ {resolvedCount} resolved</span>
              </span>
            </div>
          </div>
        </div>

        {/* Copy Shareable Link Input */}
        {isOwnBracket && (
          <div className="border-t border-glass-border/30 pt-6 mt-6 max-w-xl">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block mb-2 flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-slate-400" /> Share your bracket
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={window.location.href}
                className="w-full bg-navy/80 border border-glass-border rounded-xl px-4 py-2 text-xs text-gray-300 font-bold outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="bg-white hover:bg-slate-200 text-navy text-xs font-black px-4 rounded-xl transition-all duration-300 transform active:scale-95 shrink-0 flex items-center gap-1"
              >
                <Clipboard className="w-3.5 h-3.5" /> {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Zoom & Fullscreen Controls */}
      <div className="hidden xl:flex justify-center items-center gap-2 mb-6">
        <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Zoom View:</span>
        {[
          { label: '55%', value: 0.55 },
          { label: '70% (Fit)', value: 0.7 },
          { label: '100%', value: 1.0 },
        ].map((opt) => (
          <button
            key={opt.value}
            onClick={() => setZoomScale(opt.value)}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
              zoomScale === opt.value
                ? 'bg-white/10 text-white border border-white/20'
                : 'bg-navy-light/40 border border-glass-border/30 text-gray-400 hover:text-white hover:border-white/20'
            }`}
          >
            {opt.label}
          </button>
        ))}

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="ml-4 px-3 py-1 rounded-lg text-xs font-black transition-all bg-navy-light/40 border border-glass-border/30 text-gray-400 hover:text-white hover:border-white/20 flex items-center gap-1.5"
          title="Toggle Fullscreen Bracket"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Fullscreen Mode
        </button>
      </div>

      {isFullscreen ? (
        <div className="fixed inset-0 bg-[#050814] z-50 flex flex-col p-6 overflow-auto animate-fade-in">
          {/* Fullscreen Header Controls */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-glass-border/30">
            <div className="flex items-center gap-4">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">{name}'s Predictions</h2>
              <span className="text-[10px] bg-white/5 px-2.5 py-1 rounded border border-glass-border font-bold text-slate-400">
                Correct: {correctCount} / 31 ({totalScore} pts)
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Fullscreen Zoom Controls */}
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider mr-1">Zoom:</span>
                {[
                  { label: '55%', value: 0.55 },
                  { label: '70% (Fit)', value: 0.7 },
                  { label: '85%', value: 0.85 },
                  { label: '100%', value: 1.0 },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setZoomScale(opt.value)}
                    className={`px-2.5 py-0.5 rounded text-[10px] font-black transition-all ${
                      zoomScale === opt.value
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'bg-navy-light/40 border border-glass-border/30 text-gray-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsFullscreen(false)}
                className="bg-red-950/40 border border-red-500/25 hover:bg-red-500 hover:text-white text-red-400 text-[10px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"
              >
                <Minimize2 className="w-3 h-3" /> Exit Fullscreen
              </button>
            </div>
          </div>

          <div className="flex-grow flex justify-center items-start overflow-auto">
            <Bracket
              predictions={predictionsDict}
              initialMatches={matches}
              onSelectTeam={null}
              readOnly={true}
              zoomScale={zoomScale}
            />
          </div>
        </div>
      ) : (
        <Bracket
          predictions={predictionsDict}
          initialMatches={matches}
          onSelectTeam={null}
          readOnly={true}
          zoomScale={zoomScale}
        />
      )}
    </div>
  );
}
