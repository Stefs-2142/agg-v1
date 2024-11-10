import React from 'react';
import { Zap, Infinity } from 'lucide-react';

interface SwapModeToggleProps {
  mode: 'regular' | 'fusion';
  onChange: (mode: 'regular' | 'fusion') => void;
}

export function SwapModeToggle({ mode, onChange }: SwapModeToggleProps) {
  return (
    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
      <button
        onClick={() => onChange('regular')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          mode === 'regular'
            ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Infinity className="w-4 h-4" />
        <span className="font-medium">IC Swap</span>
      </button>
      <button
        onClick={() => onChange('fusion')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
          mode === 'fusion'
            ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        <Zap className="w-4 h-4" />
        <span className="font-medium">Chain Fusion</span>
      </button>
    </div>
  );
}