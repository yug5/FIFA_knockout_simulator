import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

export default function CountdownTimer() {
  // Kickoff date of World Cup 2026: June 11, 2026
  const targetDate = new Date('2026-06-11T18:00:00Z').getTime();
  
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      setIsExpired(false);
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      };
    };

    setTimeLeft(calculateTime());

    const timer = setInterval(() => {
      const time = calculateTime();
      setTimeLeft(time);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, '0');

  if (isExpired) {
    return (
      <div className="glass-panel py-6 px-8 rounded-2xl max-w-md mx-auto text-center border border-glass-border/30">
        <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
          Tournament Status
        </h3>
        <div className="text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 animate-pulse uppercase tracking-wider">
          <Play className="w-4 h-4 text-green-500 fill-green-500 shrink-0" /> Tournament Live
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel py-6 px-8 rounded-2xl max-w-md mx-auto text-center border border-glass-border/30">
      <h3 className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">
        Kickoff Countdown
      </h3>
      <div className="flex justify-center gap-4">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center">
            <div className="bg-navy-light/85 text-white font-extrabold text-2xl sm:text-3xl w-14 sm:w-16 h-14 sm:h-16 rounded-xl flex items-center justify-center border border-glass-border/20 shadow-inner">
              {formatNumber(item.value)}
            </div>
            <span className="text-[9px] uppercase font-bold text-gray-400 mt-2 tracking-wider">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
