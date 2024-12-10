import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface SwapNotificationProps {
  type: 'success' | 'error';
  message: string;
  visible: boolean;
}

export function SwapNotification({ type, message, visible }: SwapNotificationProps) {
  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg transition-all ${
        type === 'success' 
          ? 'bg-green-600 dark:bg-green-500 text-white' 
          : 'bg-red-600 dark:bg-red-500 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <XCircle className="w-5 h-5" />
        )}
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
} 