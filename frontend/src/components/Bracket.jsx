import React, { useRef } from 'react';
import { Trophy } from 'lucide-react';
import MatchCard from './MatchCard';
import BracketConnectorsOverlay from './BracketConnectorsOverlay';

export default function Bracket({
  initialMatches,
  predictions,
  onSelectTeam,
  readOnly = false,
  popularityStats = null,
  zoomScale = 1.0,
}) {
  const containerRef = useRef(null);

  if (!initialMatches || initialMatches.length === 0) {
    return <div className="text-gray-400 text-center py-12">Loading matches...</div>;
  }

  // Map matches by ID for quick O(1) rendering
  const matchMap = {};
  initialMatches.forEach((m) => {
    matchMap[m.id] = m;
  });

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

  const getTeamFlagForName = (teamName) => {
    if (!teamName || !initialMatches) return null;
    const match = initialMatches.find(m => 
      (m.team1 && m.team1.toLowerCase() === teamName.toLowerCase()) || 
      (m.team2 && m.team2.toLowerCase() === teamName.toLowerCase())
    );
    if (match) {
      return (match.team1 && match.team1.toLowerCase() === teamName.toLowerCase()) ? match.flag1 : match.flag2;
    }
    return null;
  };

  const renderMatch = (id) => {
    const match = matchMap[id];
    if (!match) return null;

    // Get popularity stats if available
    let p1 = null, p2 = null;
    if (popularityStats && popularityStats.matchPopularity) {
      const pop = popularityStats.matchPopularity[id] || popularityStats.matchPopularity[String(id)];
      if (pop) {
        p1 = pop.team1;
        p2 = pop.team2;
      }
    }

    return (
      <MatchCard
        key={id}
        match={match}
        predictedTeam={predictions[id]}
        predictions={predictions}
        onSelectTeam={onSelectTeam}
        readOnly={readOnly}
        popularity1={p1}
        popularity2={p2}
        getTeamFlag={getTeamFlagForName}
      />
    );
  };

  // Mirrored desktop columns
  const leftR32 = [1, 2, 3, 4, 5, 6, 7, 8];
  const leftR16 = [17, 18, 19, 20];
  const leftQF = [25, 26];
  const leftSF = [29];

  const rightR32 = [9, 10, 11, 12, 13, 14, 15, 16];
  const rightR16 = [21, 22, 23, 24];
  const rightQF = [27, 28];
  const rightSF = [30];

  const finalMatch = 31;
  const championTeam = predictions['CHAMPION'];

  // Helper for rendering Champion flag
  const renderChampionFlag = () => {
    if (!championTeam) return null;
    const champFlag = getTeamFlagForName(championTeam);
    return (
      <div className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-black tracking-tighter shrink-0 select-none overflow-hidden bg-slate-800 text-slate-450 border border-slate-700">
        {champFlag ? (
          (champFlag.startsWith('http://') || champFlag.startsWith('https://') || champFlag.startsWith('/')) ? (
            <img src={champFlag} alt="" className="w-full h-full object-cover" />
          ) : champFlag
        ) : getTeamBadge(championTeam)}
      </div>
    );
  };

  return (
    <div className="relative w-full">
      {/* 1. DESKTOP SCROLL & SCALE WRAPPER */}
      <div 
        className="hidden xl:block overflow-x-auto bracket-scroll-container pb-6 relative z-10 w-full"
        style={{ 
          height: `${960 * zoomScale}px`, 
          transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
        }}
      >
        <div
          ref={containerRef}
          className="flex justify-between h-[900px] w-[2200px] gap-6 relative mx-auto"
          style={{ 
            transform: `scale(${zoomScale})`, 
            transformOrigin: 'top center',
            transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
          }}
        >
          {/* Connecting lines SVG layer */}
          <BracketConnectorsOverlay
            matches={initialMatches}
            predictions={predictions}
            containerRef={containerRef}
            zoomScale={zoomScale}
          />

          {/* LEFT SIDE BRACKET */}
          {/* Left Round of 32 */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-450">Round of 32</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {leftR32.map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Left Round of 16 */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-450">Round of 16</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {leftR16.map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Left Quarter-finals */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-455">Quarter-Finals</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {leftQF.map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Left Semi-finals */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-450">Semi-Finals</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {leftSF.map((id) => renderMatch(id))}
            </div>
          </div>

          {/* CENTER TROPHY & FINAL */}
          <div className="w-[240px] shrink-0 flex flex-col h-full justify-center">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Champion</span>
            </div>
            <div className="flex-grow flex flex-col justify-center items-center gap-16 py-4">
              {/* Champion Display Card */}
              <div className="flex flex-col items-center">
                <div className="text-[9px] uppercase tracking-wider font-bold text-slate-500 mb-2 text-center">Champion</div>
                <div
                  id="match-card-champion"
                  onClick={() => championTeam && onSelectTeam && onSelectTeam('CHAMPION', championTeam)}
                  className={`glass-panel border rounded-2xl p-5 w-[210px] flex flex-col items-center text-center justify-center transition-all duration-300 ${
                    championTeam 
                      ? 'border-white/20 bg-white/[0.02] shadow-[0_0_20px_rgba(255,255,255,0.06)] cursor-pointer' 
                      : 'border-glass-border bg-navy-light/10 hover:border-white/10 cursor-not-allowed'
                  }`}
                >
                  <Trophy className="w-10 h-10 text-gold mb-3 animate-pulse" />
                  <h3 className="font-extrabold text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                    World Cup 2026
                  </h3>
                  <div className="flex items-center gap-2 mt-1 justify-center max-w-full">
                    {renderChampionFlag()}
                    <p className="text-xs font-black text-white truncate max-w-[120px]">
                      {championTeam || 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Final Match Card */}
              <div className="flex flex-col justify-center items-center">
                <div className="text-[9px] uppercase tracking-wider font-bold text-gray-500 text-center mb-2">Final</div>
                {renderMatch(finalMatch)}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE BRACKET */}
          {/* Right Semi-finals */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-450">Semi-Finals</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {rightSF.map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Right Quarter-finals */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-450">Quarter-Finals</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {rightQF.map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Right Round of 16 */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-450">Round of 16</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {rightR16.map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Right Round of 32 */}
          <div className="w-[210px] shrink-0 flex flex-col h-full">
            <div className="sticky-round-label text-center pb-2 select-none">
              <span className="text-[10px] uppercase tracking-widest font-black text-slate-450">Round of 32</span>
            </div>
            <div className="flex-grow flex flex-col justify-around py-4">
              {rightR32.map((id) => renderMatch(id))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MOBILE & TABLET VIEW (Horizontal scroll snap per round) */}
      <div className="xl:hidden flex flex-col gap-4 w-full relative z-10">
        <div className="text-center text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Swipe Left/Right to Navigate Rounds
        </div>
        
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-8 px-4 no-scrollbar">
          {/* Slide 1: Round of 32 */}
          <div className="snap-center shrink-0 w-[280px] flex flex-col gap-4">
            <h3 className="text-center font-extrabold text-slate-400 uppercase tracking-widest text-sm border-b border-glass-border pb-2">
              Round of 32
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[65vh] no-scrollbar pr-1">
              {[...leftR32, ...rightR32].map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Slide 2: Round of 16 */}
          <div className="snap-center shrink-0 w-[280px] flex flex-col gap-4">
            <h3 className="text-center font-extrabold text-slate-400 uppercase tracking-widest text-sm border-b border-glass-border pb-2">
              Round of 16
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[65vh] no-scrollbar pr-1">
              {[...leftR16, ...rightR16].map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Slide 3: Quarter-finals */}
          <div className="snap-center shrink-0 w-[280px] flex flex-col gap-4">
            <h3 className="text-center font-extrabold text-slate-400 uppercase tracking-widest text-sm border-b border-glass-border pb-2">
              Quarter-finals
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[65vh] no-scrollbar pr-1">
              {[...leftQF, ...rightQF].map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Slide 4: Semi-finals */}
          <div className="snap-center shrink-0 w-[280px] flex flex-col gap-4">
            <h3 className="text-center font-extrabold text-slate-400 uppercase tracking-widest text-sm border-b border-glass-border pb-2">
              Semi-finals
            </h3>
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[65vh] no-scrollbar pr-1">
              {[...leftSF, ...rightSF].map((id) => renderMatch(id))}
            </div>
          </div>

          {/* Slide 5: The Final & Champion */}
          <div className="snap-center shrink-0 w-[280px] flex flex-col gap-6 items-center">
            <h3 className="text-center font-extrabold text-slate-400 uppercase tracking-widest text-sm border-b border-glass-border pb-2 w-full">
              Championship
            </h3>
            
            <div className="flex flex-col items-center mt-4">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-2">Champion Pick</span>
              <div
                onClick={() => championTeam && onSelectTeam && onSelectTeam('CHAMPION', championTeam)}
                className={`glass-panel border rounded-2xl p-6 w-[220px] flex flex-col items-center text-center justify-center transition-all ${
                  championTeam ? 'border-white/20 bg-white/[0.02]' : 'border-glass-border bg-navy-light/10'
                }`}
              >
                <Trophy className="w-10 h-10 text-gold mb-3 animate-pulse" />
                <h3 className="font-extrabold text-xs uppercase tracking-widest text-slate-400 mb-1">
                  World Cup 2026
                </h3>
                <div className="flex items-center gap-2 mt-1 justify-center max-w-full">
                  {renderChampionFlag()}
                  <p className="text-sm font-black text-white truncate max-w-[120px]">
                    {championTeam || 'TBD'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center w-full">
              <span className="text-[10px] uppercase font-bold text-gray-500 tracking-widest mb-2">Final Match</span>
              {renderMatch(finalMatch)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
