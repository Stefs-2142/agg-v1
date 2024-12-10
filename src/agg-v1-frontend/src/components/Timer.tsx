import React, { useState, useEffect, useCallback } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  onTimerEnd?: () => void;
}

export function Timer({ onTimerEnd }: TimerProps) {
  const [seconds, setSeconds] = useState(30);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleTimerEnd = useCallback(() => {
    setIsAnimating(true);
    if (onTimerEnd) {
      onTimerEnd();
    }
    setTimeout(() => setIsAnimating(false), 300);
  }, [onTimerEnd]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 1) {
          handleTimerEnd();
          return 30;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleTimerEnd]);

  return (
    <div 
      className={`flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-full border border-blue-100 dark:border-blue-800 transition-all duration-300 ${
        isAnimating ? 'scale-110 bg-blue-100 dark:bg-blue-800/40' : ''
      }`}
    >
      <div className="bg-blue-500/10 dark:bg-blue-400/10 p-1.5 rounded-full">
        <TimerIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      </div>
      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 pr-2">{seconds}s</span>
    </div>
  );
}