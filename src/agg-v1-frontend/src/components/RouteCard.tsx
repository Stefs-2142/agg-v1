import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';

interface RouteCardProps {
  protocol: string;
  logo: string;
  rate: string;
  isOptimal: boolean;
  disabled?: boolean;
  chain?: string;
}

export function RouteCard({ protocol, logo, rate, isOptimal, disabled, chain }: RouteCardProps) {
  return (
    <div 
      className={`p-4 rounded-xl border transition-all hover:shadow-md ${
        disabled ? 'opacity-50 cursor-not-allowed dark:opacity-40' :
        isOptimal ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 dark:border-blue-400' : 
        'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt={protocol} className="w-8 h-8 rounded-full" />
          <div>
            <h3 className="font-medium dark:text-white">{protocol}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chain ? `Via ${protocol} (${chain})` : `Via ${protocol}`}
            </p>
          </div>
        </div>
        {isOptimal && !disabled && (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full text-sm">
            <Zap className="w-4 h-4" />
            Best Rate
          </div>
        )}
      </div>
      <div className="mt-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Rate: {rate}</span>
      </div>
    </div>
  );
}