import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

export function Timer() {
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 1) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 300);
          return 15;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className={`flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full border border-blue-100 dark:border-blue-800 transition-all duration-300 ${
        isAnimating ? 'scale-110 bg-blue-100 dark:bg-blue-800/40' : ''
      }`}
    >
      <div className="bg-blue-500/10 dark:bg-blue-400/10 p-1.5 rounded-full">
        <TimerIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 pr-2">{timeLeft}s</span>
    </div>
  );
}