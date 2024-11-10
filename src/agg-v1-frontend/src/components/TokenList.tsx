import React from 'react';
import { Check } from 'lucide-react';

interface Token {
  symbol: string;
  logo: string;
}

interface TokenListProps {
  tokens: Token[];
  selectedToken: Token;
  onSelect: (token: Token) => void;
  onClose: () => void;
  prices?: Record<string, number>;
}

export function TokenList({ tokens, selectedToken, onSelect, onClose, prices }: TokenListProps) {
  return (
    <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-2 z-50">
      <div className="space-y-1">
        {tokens.map((token) => {
          const price = prices?.[token.symbol];
          
          return (
            <button
              key={token.symbol}
              onClick={() => {
                onSelect(token);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                selectedToken.symbol === token.symbol ? 'bg-blue-50 dark:bg-blue-900/50' : ''
              }`}
            >
              <img src={token.logo} alt={token.symbol} className="w-6 h-6 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium dark:text-white">{token.symbol}</span>
                  {price && (
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ${price.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {selectedToken.symbol === token.symbol && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}