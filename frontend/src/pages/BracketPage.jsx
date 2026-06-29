import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trophy, ShieldAlert, Check, X, AlertCircle } from 'lucide-react';
import CountdownTimer from '../components/CountdownTimer';
import Bracket from '../components/Bracket';
import { getMatches, checkName, submitPrediction, getPopularityStats } from '../api/endpoints';

const nextMatchMap = {
  1: 17, 2: 17, 3: 18, 4: 18, 5: 19, 6: 19, 7: 20, 8: 20,
  9: 21, 10: 21, 11: 22, 12: 22, 13: 23, 14: 23, 15: 24, 16: 24,
  17: 25, 18: 25, 19: 26, 20: 26, 21: 27, 22: 27, 23: 28, 24: 28,
  25: 29, 26: 29, 27: 30, 28: 30, 29: 31, 30: 31, 31: 'CHAMPION'
};

export default function BracketPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [predictions, setPredictions] = useState({});
  const [zoomScale, setZoomScale] = useState(0.7);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [isNameAvailable, setIsNameAvailable] = useState(null);
  const [checkingName, setCheckingName] = useState(false);



  // Debounced check name availability
  useEffect(() => {
    const cleanName = name.trim();
    if (!cleanName) {
      setIsNameAvailable(null);
      return;
    }
    
    setCheckingName(true);
    const timeout = setTimeout(() => {
      checkName(cleanName)
        .then((res) => {
          setIsNameAvailable(res.available);
        })
        .catch(() => {
          setIsNameAvailable(false);
        })
        .finally(() => {
          setCheckingName(false);
        });
    }, 450);

    return () => clearTimeout(timeout);
  }, [name]);

  // Query matches
  const { data: rawMatches, isLoading: matchesLoading, isError: matchesError } = useQuery({
    queryKey: ['matches'],
    queryFn: getMatches,
  });

  // Sync predictions state with actual winners from backend
  useEffect(() => {
    if (rawMatches) {
      setPredictions((prev) => {
        const updated = { ...prev };
        let changed = false;
        rawMatches.forEach((m) => {
          if (m.actualWinner) {
            if (updated[m.id] !== m.actualWinner) {
              updated[m.id] = m.actualWinner;
              changed = true;
            }
          }
        });
        
        // Also pre-fill CHAMPION if final match is resolved
        const finalMatch = rawMatches.find((m) => m.id === 31);
        if (finalMatch && finalMatch.actualWinner) {
          if (updated['CHAMPION'] !== finalMatch.actualWinner) {
            updated['CHAMPION'] = finalMatch.actualWinner;
            changed = true;
          }
        }
        
        return changed ? updated : prev;
      });
    }
  }, [rawMatches]);

  // Query popularity stats
  const { data: popularityStats } = useQuery({
    queryKey: ['popularityStats'],
    queryFn: getPopularityStats,
  });

  // Dynamic bracket builder based on base matches + selections
  const buildCurrentBracket = () => {
    if (!rawMatches) return [];
    
    let updatedMatches = rawMatches.map(m => ({ ...m }));
    const sorted = [...updatedMatches].sort((a, b) => a.id - b.id);

    sorted.forEach((m) => {
      const predictedWinner = predictions[m.id];
      if (predictedWinner && m.nextMatchId) {
        const targetIndex = updatedMatches.findIndex(x => x.id === m.nextMatchId);
        if (targetIndex !== -1) {
          if (m.id % 2 !== 0) {
            updatedMatches[targetIndex].team1 = predictedWinner;
          } else {
            updatedMatches[targetIndex].team2 = predictedWinner;
          }
        }
      }
    });
    return updatedMatches;
  };

  const clearDownstream = (mid, oldTeam, nextPredictions) => {
    const nextMatchId = nextMatchMap[mid];
    if (!nextMatchId) return;

    if (nextMatchId === 'CHAMPION') {
      if (nextPredictions['CHAMPION'] === oldTeam) {
        delete nextPredictions['CHAMPION'];
      }
      return;
    }

    if (nextPredictions[nextMatchId] === oldTeam) {
      delete nextPredictions[nextMatchId];
    }
    clearDownstream(nextMatchId, oldTeam, nextPredictions);
  };

  const handleSelectTeam = (matchId, selectedTeam) => {
    const prevWinner = predictions[matchId];
    const nextPredictions = { ...predictions, [matchId]: selectedTeam };

    if (prevWinner && prevWinner !== selectedTeam) {
      clearDownstream(matchId, prevWinner, nextPredictions);
    }

    if (matchId === 31) {
      nextPredictions['CHAMPION'] = selectedTeam;
    }

    setPredictions(nextPredictions);

    if (matchId === 31 && selectedTeam) {
      const picksCount = Object.keys(nextPredictions).filter(k => k !== 'CHAMPION').length;
      if (picksCount === 31) {
        setShowModal(true);
      } else {
        toast.error('Complete all 31 picks before locking your bracket.');
      }
    }
  };

  // Submission mutation
  const submitMutation = useMutation({
    mutationFn: ({ name, predictionsArray }) => submitPrediction(name, predictionsArray),
    onSuccess: (data) => {
      toast.success('Bracket submitted successfully!');
      localStorage.setItem('wc_submitted_bracket_name', data.name);
      queryClient.invalidateQueries(['leaderboard']);
      queryClient.invalidateQueries(['predictions']);
      setShowModal(false);
      navigate(`/predictions/${encodeURIComponent(data.name)}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.error || err.message || 'Failed to submit predictions';
      toast.error(msg);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !isNameAvailable || submitMutation.isPending) return;

    // Build predictions array: predictions = [{matchId, predictedTeam}, ...]
    const predictionsArray = Object.entries(predictions)
      .filter(([k]) => k !== 'CHAMPION')
      .map(([matchId, predictedTeam]) => ({
        matchId: Number(matchId),
        predictedTeam
      }));

    submitMutation.mutate({
      name: name.trim(),
      predictionsArray
    });
  };

  const matches = buildCurrentBracket();
  const predictionsCount = Object.keys(predictions).filter(k => k !== 'CHAMPION').length;
  const progressPercent = Math.min(Math.round((predictionsCount / 31) * 100), 100);

  if (matchesLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Pulse Skeleton */}
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-navy-light/60 rounded-xl w-3/4 mx-auto"></div>
          <div className="h-6 bg-navy-light/40 rounded-lg w-1/2 mx-auto"></div>
          <div className="h-40 bg-navy-light/50 rounded-2xl w-full"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-24 bg-navy-light/50 rounded-xl"></div>
            <div className="h-24 bg-navy-light/50 rounded-xl"></div>
            <div className="h-24 bg-navy-light/50 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (matchesError) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-4">
        <div className="glass-panel border-red-500/20 bg-red-950/5 p-8 rounded-2xl text-red-200">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-extrabold mb-2">Connection Unreachable</h2>
          <p className="text-xs text-slate-400">
            We are unable to connect to the backend server. Please verify the Spring Boot service is active and running.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="text-center mb-8">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase mb-3">
          World Cup 2026 <span className="text-slate-400">Predictor</span>
        </h1>
        <p className="text-slate-400 text-xs max-w-xl mx-auto mb-6 leading-relaxed">
          Pick your winners round-by-round. Lock in your champion to submit your bracket.
        </p>
        
        <div className="mb-8">
          <CountdownTimer />
        </div>

        <div className="max-w-md mx-auto bg-navy-light/60 border border-glass-border/30 rounded-full h-4 p-0.5 overflow-hidden relative shadow-inner mb-6">
          <div
            className="bg-white/30 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(255,255,255,0.15)]"
            style={{ width: `${progressPercent}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-wider">
            {predictionsCount} / 31 Picks Made ({progressPercent}%)
          </span>
        </div>

        {progressPercent === 100 && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-white hover:bg-slate-200 text-navy-dark font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-6 animate-pulse"
          >
            Submit Bracket
          </button>
        )}

        {/* Zoom Controls */}
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
        </div>
      </div>

      <Bracket
        predictions={predictions}
        initialMatches={matches}
        onSelectTeam={handleSelectTeam}
        readOnly={false}
        popularityStats={popularityStats}
        zoomScale={zoomScale}
      />

      {showModal && (
        <div className="fixed inset-0 bg-navy-dark/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-base font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <Trophy className="w-10 h-10 text-gold mx-auto mb-3 animate-pulse" />
              <h2 className="text-xl font-black text-white tracking-tight uppercase mt-3">
                Lock Bracket
              </h2>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                Choose a unique display name. Once submitted, your selections are locked.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] uppercase font-bold text-gray-450 tracking-wider">
                    Display Name
                  </label>
                  {name.trim() && (
                    <span className="text-[10px] font-extrabold transition-all">
                      {checkingName ? (
                        <span className="text-gray-400">checking...</span>
                      ) : isNameAvailable ? (
                        <span className="text-green-400 flex items-center gap-1"><Check className="w-3 h-3" /> Available</span>
                      ) : (
                        <span className="text-red-400 flex items-center gap-1"><X className="w-3 h-3" /> Taken</span>
                      )}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="e.g. FootballFanatic99"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setIsNameAvailable(null);
                  }}
                  className="w-full bg-navy-light/60 border border-glass-border focus:border-white/30 rounded-xl py-3 px-4 text-white text-sm outline-none font-bold"
                  maxLength={30}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim() || !isNameAvailable || checkingName || submitMutation.isPending}
                className="bg-white hover:bg-slate-200 disabled:bg-gray-500/20 text-navy disabled:text-gray-500 font-extrabold py-3.5 rounded-xl transition-all duration-300 transform active:scale-95 shadow-md shadow-white/5"
              >
                {submitMutation.isPending ? 'Submitting...' : 'Submit Bracket'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold py-2 mt-1 underline"
              >
                Review Picks
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
