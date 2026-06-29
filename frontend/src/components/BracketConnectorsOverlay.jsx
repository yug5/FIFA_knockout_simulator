import React, { useState, useEffect } from 'react';

export default function BracketConnectorsOverlay({ matches, predictions, containerRef, zoomScale = 1.0 }) {
  const [paths, setPaths] = useState([]);

  const updatePaths = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newPaths = [];

    matches.forEach((match) => {
      if (!match.nextMatchId) return;

      const currentEl = document.getElementById(`match-card-${match.id}`);
      const nextEl = document.getElementById(`match-card-${match.nextMatchId}`);

      if (currentEl && nextEl) {
        const currentRect = currentEl.getBoundingClientRect();
        const nextRect = nextEl.getBoundingClientRect();

        // Determine if left or right side of the bracket
        const isLeft = [1, 2, 3, 4, 5, 6, 7, 8, 17, 18, 19, 20, 25, 26, 29].includes(match.id);

        let x1, y1, x2, y2;
        if (isLeft) {
          x1 = (currentRect.right - containerRect.left) / zoomScale;
          y1 = (currentRect.top + currentRect.height / 2 - containerRect.top) / zoomScale;
          x2 = (nextRect.left - containerRect.left) / zoomScale;
          y2 = (nextRect.top + nextRect.height / 2 - containerRect.top) / zoomScale;
        } else {
          x1 = (currentRect.left - containerRect.left) / zoomScale;
          y1 = (currentRect.top + currentRect.height / 2 - containerRect.top) / zoomScale;
          x2 = (nextRect.right - containerRect.left) / zoomScale;
          y2 = (nextRect.top + nextRect.height / 2 - containerRect.top) / zoomScale;
        }

        const midX = x1 + (x2 - x1) * 0.5;
        const pathD = `M ${x1} ${y1} H ${midX} V ${y2} H ${x2}`;

        // Path is active if the prediction matches the next match's prediction slot
        const predictedWinner = predictions[match.id];
        const nextPrediction = predictions[match.nextMatchId];
        const isActive = predictedWinner && nextPrediction && predictedWinner === nextPrediction;

        newPaths.push({
          id: `${match.id}-${match.nextMatchId}`,
          d: pathD,
          isActive,
        });
      }
    });

    // Connector from final match (Match 31) to Champion display card
    const finalEl = document.getElementById('match-card-31');
    const champEl = document.getElementById('match-card-champion');
    if (finalEl && champEl) {
      const finalRect = finalEl.getBoundingClientRect();
      const champRect = champEl.getBoundingClientRect();

      const x1 = (finalRect.left + finalRect.width / 2 - containerRect.left) / zoomScale;
      const y1 = (finalRect.top - containerRect.top) / zoomScale;
      const x2 = (champRect.left + champRect.width / 2 - containerRect.left) / zoomScale;
      const y2 = (champRect.bottom - containerRect.top) / zoomScale;

      const midY = y2 + (y1 - y2) * 0.5;
      const pathD = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;

      const predictedChampion = predictions['CHAMPION'];
      const finalWinner = predictions[31];
      const isActive = predictedChampion && finalWinner && predictedChampion === finalWinner;

      newPaths.push({
        id: '31-champion',
        d: pathD,
        isActive,
      });
    }

    setPaths(newPaths);
  };

  useEffect(() => {
    updatePaths();
    window.addEventListener('resize', updatePaths);
    
    const t1 = setTimeout(updatePaths, 100);
    const t2 = setTimeout(updatePaths, 300);
    const t3 = setTimeout(updatePaths, 600);

    return () => {
      window.removeEventListener('resize', updatePaths);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [matches, predictions, zoomScale]);

  return (
    <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
      {paths.map((path) => (
        <path
          key={path.id}
          d={path.d}
          fill="none"
          stroke={path.isActive ? '#d4af37' : 'rgba(148, 163, 184, 0.15)'}
          strokeWidth={path.isActive ? 2.5 : 1.25}
          className="transition-all duration-300"
          style={{
            filter: path.isActive ? 'drop-shadow(0 0 5px rgba(212, 175, 55, 0.6))' : 'none',
          }}
        />
      ))}
    </svg>
  );
}
