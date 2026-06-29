import React from 'react';
import { motion } from 'framer-motion';
import PopularityBar from './PopularityBar';

const getTeamBadge = (teamName) => {
  if (!teamName) return '??';
  const name = teamName.toLowerCase().trim();
  if (name.includes('argentina')) return 'AR';
  if (name.includes('brazil')) return 'BR';
  if (name.includes('france')) return 'FR';
  if (name.includes('germany')) return 'DE';
  if (name.includes('spain')) return 'ES';
  if (name.includes('england')) return 'EN';
  if (name.includes('italy')) return 'IT';
  if (name.includes('portugal')) return 'PT';
  if (name.includes('belgium')) return 'BE';
  if (name.includes('croatia')) return 'HR';
  if (name.includes('morocco')) return 'MA';
  if (name.includes('netherlands')) return 'NL';
  if (name.includes('senegal')) return 'SN';
  if (name.includes('japan')) return 'JP';
  if (name.includes('usa') || name.includes('united states')) return 'US';
  if (name.includes('mexico')) return 'MX';
  if (name.includes('canada')) return 'CA';
  if (name.includes('uruguay')) return 'UY';
  
  const parts = teamName.split(' ');
  const lastPart = parts[parts.length - 1];
  if (lastPart) {
    return lastPart.substring(0, 2).toUpperCase();
  }
  return '??';
};

const getFeedingMatchIds = (id) => {
  if (id >= 17 && id <= 24) return [2 * (id - 17) + 1, 2 * (id - 17) + 2];
  if (id >= 25 && id <= 28) return [17 + 2 * (id - 25), 18 + 2 * (id - 25)];
  if (id >= 29 && id <= 30) return [25 + 2 * (id - 29), 26 + 2 * (id - 29)];
  if (id === 31) return [29, 30];
  return [null, null];
};

export default function MatchCard({
  match,
  predictedTeam,
  predictions = {},
  onSelectTeam,
  readOnly = false,
  popularity1 = null,
  popularity2 = null,
  getTeamFlag = null,
}) {
  const { id, team1, team2, actualWinner } = match;

  const [feed1, feed2] = getFeedingMatchIds(id);
  
  // Resolve Team 1 from predictions if TBD
  let displayTeam1 = team1;
  let isTeam1Dull = false;
  if (!displayTeam1 && feed1 && predictions[feed1]) {
    displayTeam1 = predictions[feed1];
    isTeam1Dull = true;
  }

  // Resolve Team 2 from predictions if TBD
  let displayTeam2 = team2;
  let isTeam2Dull = false;
  if (!displayTeam2 && feed2 && predictions[feed2]) {
    displayTeam2 = predictions[feed2];
    isTeam2Dull = true;
  }

  const handleSelect = (team, isDull) => {
    if (readOnly || isDull || actualWinner || !team || !onSelectTeam) return;
    onSelectTeam(id, team);
  };

  // Border and background classes based on state
  let borderClass = 'border-glass-border';
  let bgClass = 'bg-navy-light/45';

  if (predictedTeam) {
    if (actualWinner) {
      if (predictedTeam.toLowerCase() === actualWinner.toLowerCase()) {
        borderClass = 'border-green-500 shadow-[0_0_12px_rgba(34,197,94,0.25)]';
        bgClass = 'bg-green-950/10';
      } else {
        borderClass = 'border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)]';
        bgClass = 'bg-red-950/10';
      }
    } else {
      borderClass = 'border-white/20 shadow-[0_0_12px_rgba(255,255,255,0.06)]';
      bgClass = 'bg-white/[0.02]';
    }
  }

  const renderTeamRow = (team, isDull = false, isTeam2 = false) => {
    const isSelected = predictedTeam && team && predictedTeam.toLowerCase() === team.toLowerCase();
    const isOpponentSelected = predictedTeam && team && predictedTeam.toLowerCase() !== team.toLowerCase();
    const popularity = isTeam2 ? popularity2 : popularity1;

    return (
      <div
        onClick={() => handleSelect(team, isDull)}
        className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-300 ${
          readOnly || isDull ? '' : team ? 'cursor-pointer hover:bg-white/5' : 'cursor-not-allowed'
        } ${
          isSelected 
            ? 'bg-white/10 text-white font-black border border-white/10 shadow-[inset_0_0_8px_rgba(255,255,255,0.04)]' 
            : isDull 
              ? 'opacity-30 text-slate-400 font-medium italic' 
              : isOpponentSelected 
                ? 'opacity-40 text-gray-500' 
                : 'text-gray-300'
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Radio selector - hide if dull */}
          {!readOnly && team && !isDull && (
            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-all ${
              isSelected ? 'border-white bg-white' : 'border-gray-500'
            }`}>
              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-navy-light" />}
            </div>
          )}

          {/* Dynamic Badge or Custom Flag */}
          <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-black tracking-tighter shrink-0 select-none uppercase overflow-hidden ${
            team 
              ? 'bg-slate-800 text-slate-450 border border-slate-700' 
              : 'bg-slate-900/40 text-slate-600 border border-slate-800/40 font-mono'
          }`}>
            {!team ? '?' : (() => {
              const customFlag = getTeamFlag ? getTeamFlag(team) : null;
              if (customFlag) {
                if (customFlag.startsWith('http://') || customFlag.startsWith('https://') || customFlag.startsWith('/')) {
                  return <img src={customFlag} alt="" className="w-full h-full object-cover" />;
                }
                return customFlag;
              }
              return getTeamBadge(team);
            })()}
          </div>

          {/* Team Name */}
          <span className={`text-xs font-bold truncate max-w-[110px] ${!team ? 'text-gray-600 italic' : ''}`}>
            {team || 'TBD'}
          </span>
        </div>

        {/* Popularity stats or icons */}
        <div className="flex items-center gap-2">
          {popularity !== null && team && !isDull && (
            <span className="text-[9px] bg-white/5 px-1 py-0.5 rounded text-gray-500 font-bold">
              {Math.round(popularity)}%
            </span>
          )}
          {isSelected && !isDull && (
            actualWinner ? (
              predictedTeam.toLowerCase() === actualWinner.toLowerCase() ? (
                <span className="text-green-500 text-xs font-bold transition-all">✓</span>
              ) : (
                <span className="text-red-500 text-xs font-bold transition-all">✗</span>
              )
            ) : (
              <span className="text-white text-xs font-bold transition-all">✓</span>
            )
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      id={`match-card-${id}`}
      className={`group glass-panel rounded-xl overflow-hidden border p-1 w-full max-w-[210px] flex flex-col gap-1 transition-all z-10 ${borderClass} ${bgClass}`}
      whileHover={readOnly ? {} : { scale: 1.025 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
    >
      <div className="px-2 pt-1 pb-0.5 flex justify-between items-center text-[9px] font-black text-gray-500 tracking-wider">
        <span>MATCH {id}</span>
      </div>
      
      {renderTeamRow(displayTeam1, isTeam1Dull, false)}
      
      {/* Divider */}
      <div className="h-[1px] bg-glass-border/30 mx-2" />
      
      {renderTeamRow(displayTeam2, isTeam2Dull, true)}

      {team1 && team2 && (popularity1 !== null || popularity2 !== null) && (
        <div className="opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-12 transition-all duration-300 ease-out border-t border-glass-border/10">
          <PopularityBar 
            team1={team1} 
            team2={team2} 
            pct1={popularity1} 
            pct2={popularity2} 
          />
        </div>
      )}
    </motion.div>
  );
}
