import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Lock, ShieldAlert, Check, X, Database, Edit2 } from 'lucide-react';
import { getAdminMatches, setMatchResult, seedMatches, getAllPredictions, updateMatchTeams } from '../api/endpoints';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [tokenInput, setTokenInput] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Modal confirm result states
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedWinner, setSelectedWinner] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Edit teams modal states
  const [editingMatch, setEditingMatch] = useState(null);
  const [editTeam1, setEditTeam1] = useState('');
  const [editTeam2, setEditTeam2] = useState('');
  const [editFlag1, setEditFlag1] = useState('');
  const [editFlag2, setEditFlag2] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  // Danger zone seed states
  const [showSeedModal, setShowSeedModal] = useState(false);
  const [seedConfirmText, setSeedConfirmText] = useState('');

  // Auto login check on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('adminToken');
    if (savedToken) {
      getAdminMatches()
        .then(() => {
          setIsAuthenticated(true);
        })
        .catch(() => {
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setIsAuthenticated(false);
      setCheckingAuth(false);
    }
  }, []);

  // Fetch admin matches
  const { data: adminMatches = [], refetch: refetchMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ['adminMatches'],
    queryFn: getAdminMatches,
    enabled: isAuthenticated,
  });

  // Fetch predictions list for total participants count
  const { data: participants = [], refetch: refetchParticipants } = useQuery({
    queryKey: ['predictionsList'],
    queryFn: getAllPredictions,
    enabled: isAuthenticated,
  });

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;

    localStorage.setItem('adminToken', tokenInput.trim());
    try {
      await getAdminMatches();
      setIsAuthenticated(true);
      toast.success('Admin authorized');
    } catch (err) {
      localStorage.removeItem('adminToken');
      toast.error('Invalid password. Access denied.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
    setTokenInput('');
    toast.success('Logged out');
  };

  // Result submission mutation
  const resultMutation = useMutation({
    mutationFn: ({ id, winner }) => setMatchResult(id, winner),
    onSuccess: () => {
      toast.success('Result saved. Standings recalculated.');
      refetchMatches();
      refetchParticipants();
      queryClient.invalidateQueries(['matches']);
      queryClient.invalidateQueries(['leaderboard']);
      setShowConfirmModal(false);
      setSelectedMatch(null);
      setSelectedWinner('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to save result');
    }
  });

  // Seeding mutation
  const seedMutation = useMutation({
    mutationFn: seedMatches,
    onSuccess: () => {
      toast.success('Database reset and seeded.');
      refetchMatches();
      refetchParticipants();
      queryClient.invalidateQueries(['matches']);
      queryClient.invalidateQueries(['leaderboard']);
      setShowSeedModal(false);
      setSeedConfirmText('');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to seed database');
    }
  });

  // Edit teams mutation
  const editTeamsMutation = useMutation({
    mutationFn: ({ id, payload }) => updateMatchTeams(id, payload),
    onSuccess: () => {
      toast.success('Match teams updated successfully');
      refetchMatches();
      queryClient.invalidateQueries(['matches']);
      setShowEditModal(false);
      setEditingMatch(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || err.message || 'Failed to update teams');
    }
  });

  const triggerConfirmResult = (match, winner) => {
    setSelectedMatch(match);
    setSelectedWinner(winner);
    setShowConfirmModal(true);
  };

  const handleConfirmResult = () => {
    if (!selectedMatch || !selectedWinner) return;
    resultMutation.mutate({
      id: selectedMatch.id,
      winner: selectedWinner
    });
  };

  const triggerEditTeams = (match) => {
    setEditingMatch(match);
    setEditTeam1(match.team1 || '');
    setEditTeam2(match.team2 || '');
    setEditFlag1(match.flag1 || '');
    setEditFlag2(match.flag2 || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editingMatch) return;
    editTeamsMutation.mutate({
      id: editingMatch.id,
      payload: {
        team1: editTeam1.trim() || null,
        team2: editTeam2.trim() || null,
        flag1: editFlag1.trim() || null,
        flag2: editFlag2.trim() || null,
      }
    });
  };

  const handleConfirmSeed = (e) => {
    e.preventDefault();
    if (seedConfirmText.toLowerCase() !== 'reset') return;
    seedMutation.mutate();
  };

  if (checkingAuth) {
    return (
      <div className="max-w-md mx-auto text-center py-16">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-405 text-xs">Authorizing admin access...</p>
      </div>
    );
  }

  // 1. GATE VIEW (Authentication Form)
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16 px-4">
        <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-lg text-center">
          <Lock className="w-10 h-10 text-slate-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-white tracking-tight uppercase mb-2">
            Admin Login
          </h2>
          <p className="text-slate-400 text-xs mb-6">
            Enter your admin password to continue.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Admin password..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="w-full bg-navy-light/60 border border-glass-border focus:border-white/30 rounded-xl py-3 px-4 text-white text-center text-sm outline-none font-bold"
              required
            />
            <button
              type="submit"
              className="bg-white hover:bg-slate-200 text-navy font-extrabold py-3.5 rounded-xl transition-all duration-300 transform active:scale-95 shadow-md shadow-white/5"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalMatches = adminMatches.length;
  const completedMatches = adminMatches.filter(m => m.actualWinner !== null).length;
  const remainingMatches = totalMatches - completedMatches;

  // Group matches by round
  const rounds = {
    'Round of 32': adminMatches.filter(m => m.round === 'ROUND_OF_32'),
    'Round of 16': adminMatches.filter(m => m.round === 'ROUND_OF_16'),
    'Quarter-finals': adminMatches.filter(m => m.round === 'QUARTER_FINAL'),
    'Semi-finals': adminMatches.filter(m => m.round === 'SEMI_FINAL'),
    'The Final': adminMatches.filter(m => m.round === 'FINAL'),
  };

  return (
    <div className="max-w-6xl mx-auto px-2 pb-16">
      {/* Header Panel */}
      <div className="flex justify-between items-center mb-8 border-b border-glass-border/30 pb-4 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 text-xs">
            Enter results and update the bracket tree.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-950/25 border border-red-500/25 hover:bg-red-500 hover:text-white text-red-400 text-xs font-bold px-4 py-2 rounded-xl transition-all"
        >
          Logout Admin
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="glass-panel p-5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Players</span>
          <span className="text-white text-xl font-black">{participants.length}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Completed</span>
          <span className="text-green-400 text-xl font-black">{completedMatches} / {totalMatches}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center">
          <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Remaining</span>
          <span className="text-white text-xl font-black">{remainingMatches}</span>
        </div>
        <div className="glass-panel p-5 rounded-xl text-center flex flex-col justify-center items-center">
          <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider block mb-1">Danger Zone</span>
          <button
            onClick={() => setShowSeedModal(true)}
            className="text-[10px] bg-red-900/20 text-red-300 hover:bg-red-900/50 border border-red-800/20 font-black px-3.5 py-1.5 rounded-lg flex items-center gap-1"
          >
            <Database className="w-3.5 h-3.5" /> Reset Database
          </button>
        </div>
      </div>

      {/* Matches Listing grouped by Round */}
      {matchesLoading ? (
        <div className="text-center py-12 text-gray-400">Loading matches...</div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(rounds).map(([roundName, matches]) => {
            if (matches.length === 0) return null;
            return (
              <div key={roundName} className="glass-panel p-6 rounded-2xl border border-glass-border">
                <h3 className="text-white font-extrabold uppercase tracking-widest text-xs border-b border-glass-border/30 pb-2 mb-4">
                  {roundName}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matches.map((match) => {
                    const isTbd = !match.team1 || !match.team2;
                    return (
                      <div
                        key={match.id}
                        className={`p-4 rounded-xl border relative flex flex-col justify-between transition-all duration-300 ${
                          match.actualWinner 
                            ? 'border-green-500/40 bg-green-950/5' 
                            : isTbd
                              ? 'border-glass-border/15 bg-navy-light/10' 
                              : 'border-glass-border hover:border-white/10 bg-navy-light/20'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] uppercase font-bold text-gray-500">Match {match.id}</span>
                            <button
                              onClick={() => triggerEditTeams(match)}
                              className="text-slate-500 hover:text-white transition-all"
                              title="Edit Teams & Flags"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                          {match.actualWinner ? (
                            <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                              Winner: {match.actualWinner}
                            </span>
                          ) : (
                            <span className="bg-white/5 text-slate-400 border border-white/10 text-[9px] uppercase px-2 py-0.5 rounded-full font-bold">
                              Pending
                            </span>
                          )}
                        </div>

                        {/* Teams display */}
                        <div className="flex flex-col gap-2 mb-4 text-xs font-bold">
                          <div className={`flex justify-between items-center p-2 rounded-lg ${match.actualWinner === match.team1 ? 'bg-green-500/10 text-green-400' : 'text-white'}`}>
                            <div className="flex items-center gap-2">
                              {match.flag1 && (
                                <span className="text-xs shrink-0 select-none">
                                  {match.flag1.startsWith('http') || match.flag1.startsWith('/') ? '🖼️' : match.flag1}
                                </span>
                              )}
                              <span>{match.team1 || 'TBD'}</span>
                            </div>
                            {match.team1 && (
                              <button
                                disabled={resultMutation.isPending}
                                onClick={() => triggerConfirmResult(match, match.team1)}
                                className={`text-[9px] font-black px-2 py-1 rounded-md border ${
                                  match.actualWinner === match.team1 
                                    ? 'border-green-400 bg-green-500/20' 
                                    : 'border-glass-border hover:border-white/20 bg-navy-dark text-gray-300 hover:text-white'
                                }`}
                              >
                                Set Winner
                              </button>
                            )}
                          </div>
                          <div className={`flex justify-between items-center p-2 rounded-lg ${match.actualWinner === match.team2 ? 'bg-green-500/10 text-green-400' : 'text-white'}`}>
                            <div className="flex items-center gap-2">
                              {match.flag2 && (
                                <span className="text-xs shrink-0 select-none">
                                  {match.flag2.startsWith('http') || match.flag2.startsWith('/') ? '🖼️' : match.flag2}
                                </span>
                              )}
                              <span>{match.team2 || 'TBD'}</span>
                            </div>
                            {match.team2 && (
                              <button
                                disabled={resultMutation.isPending}
                                onClick={() => triggerConfirmResult(match, match.team2)}
                                className={`text-[9px] font-black px-2 py-1 rounded-md border ${
                                  match.actualWinner === match.team2 
                                    ? 'border-green-400 bg-green-500/20' 
                                    : 'border-glass-border hover:border-white/20 bg-navy-dark text-gray-300 hover:text-white'
                                }`}
                              >
                                Set Winner
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Teams & Flags Modal */}
      {showEditModal && editingMatch && (
        <div className="fixed inset-0 bg-navy-dark/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl max-w-md w-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingMatch(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-base font-bold"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-white tracking-tight uppercase mb-2 text-center">
              Edit Match Details
            </h3>
            <p className="text-[10px] text-gray-400 mb-6 text-center">
              Configure team names and flags (flag can be emoji character or image URL).
            </p>

            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              {/* Team 1 Details */}
              <div className="bg-navy-light/30 p-4 rounded-xl border border-glass-border/30">
                <h4 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-3">Team 1 (Top Slot)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Name</label>
                    <input
                      type="text"
                      value={editTeam1}
                      onChange={(e) => setEditTeam1(e.target.value)}
                      placeholder="e.g. Argentina"
                      className="w-full bg-navy/80 border border-glass-border rounded-lg py-2 px-3 text-white text-xs outline-none focus:border-white/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Flag Emoji / URL</label>
                    <input
                      type="text"
                      value={editFlag1}
                      onChange={(e) => setEditFlag1(e.target.value)}
                      placeholder="e.g. 🇦🇷 or /flags/ar.png"
                      className="w-full bg-navy/80 border border-glass-border rounded-lg py-2 px-3 text-white text-xs outline-none focus:border-white/20 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Team 2 Details */}
              <div className="bg-navy-light/30 p-4 rounded-xl border border-glass-border/30">
                <h4 className="text-[9px] uppercase font-bold text-gray-400 tracking-wider mb-3">Team 2 (Bottom Slot)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Name</label>
                    <input
                      type="text"
                      value={editTeam2}
                      onChange={(e) => setEditTeam2(e.target.value)}
                      placeholder="e.g. Brazil"
                      className="w-full bg-navy/80 border border-glass-border rounded-lg py-2 px-3 text-white text-xs outline-none focus:border-white/20 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Flag Emoji / URL</label>
                    <input
                      type="text"
                      value={editFlag2}
                      onChange={(e) => setEditFlag2(e.target.value)}
                      placeholder="e.g. 🇧🇷 or /flags/br.png"
                      className="w-full bg-navy/80 border border-glass-border rounded-lg py-2 px-3 text-white text-xs outline-none focus:border-white/20 font-mono text-center"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingMatch(null);
                  }}
                  className="flex-1 bg-navy-light/60 border border-glass-border hover:border-white/20 text-gray-300 font-bold py-3 rounded-xl transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editTeamsMutation.isPending}
                  className="flex-1 bg-white hover:bg-slate-200 text-navy font-extrabold py-3 rounded-xl transition-all shadow-md shadow-white/5 text-xs"
                >
                  {editTeamsMutation.isPending ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Result Input */}
      {showConfirmModal && selectedMatch && (
        <div className="fixed inset-0 bg-navy-dark/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl max-w-sm w-full border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center relative">
            <h3 className="text-lg font-black text-white tracking-tight uppercase mb-3">
              Confirm Winner
            </h3>
            <p className="text-slate-400 text-xs mb-6 leading-relaxed">
              Set <span className="text-white font-bold">{selectedWinner}</span> as the winner of Match {selectedMatch.id}? This will recalculate all player scores.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedMatch(null);
                  setSelectedWinner('');
                }}
                className="flex-1 bg-navy-light/60 border border-glass-border hover:border-white/20 text-gray-300 font-bold py-3 rounded-xl transition-all text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResult}
                disabled={resultMutation.isPending}
                className="flex-1 bg-white hover:bg-slate-200 text-navy font-extrabold py-3 rounded-xl transition-all shadow-md shadow-white/5 text-xs"
              >
                {resultMutation.isPending ? 'Saving...' : 'Set Winner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal for database reset */}
      {showSeedModal && (
        <div className="fixed inset-0 bg-navy-dark/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass-panel p-8 rounded-2xl max-w-sm w-full border border-red-500/20 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-center relative">
            <ShieldAlert className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-red-400 tracking-tight uppercase mb-3">
              Danger Zone
            </h3>
            <p className="text-slate-300 text-xs mb-4 leading-relaxed">
              This will permanently delete all predictions and match results, and re-seed the match list.
            </p>
            
            <form onSubmit={handleConfirmSeed} className="flex flex-col gap-4">
              <div>
                <label className="text-[9px] uppercase font-bold text-gray-400 tracking-wider block mb-2">
                  Type <span className="text-red-400 font-bold">RESET</span> to confirm:
                </label>
                <input
                  type="text"
                  placeholder="RESET"
                  value={seedConfirmText}
                  onChange={(e) => setSeedConfirmText(e.target.value)}
                  className="w-full bg-navy-light/60 border border-glass-border/30 focus:border-red-500/40 rounded-xl py-2 px-4 text-center text-white text-sm outline-none font-bold"
                  required
                />
              </div>

              <div className="flex gap-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSeedModal(false);
                    setSeedConfirmText('');
                  }}
                  className="flex-1 bg-navy-light/60 border border-glass-border hover:border-white/20 text-gray-300 font-bold py-2.5 rounded-xl transition-all text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={seedConfirmText.toLowerCase() !== 'reset' || seedMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-extrabold py-2.5 rounded-xl transition-all text-xs disabled:opacity-40"
                >
                  {seedMutation.isPending ? 'Resetting...' : 'Reset & Seed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
