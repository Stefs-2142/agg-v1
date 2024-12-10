import React from 'react';
import { TOKENS } from '../constants/tokens';

type Token = typeof TOKENS[keyof typeof TOKENS];

interface TokenListProps {
  tokens: Token[];
  selectedToken: Token;
  onSelect: (token: Token) => void;
  onClose: () => void;
  prices?: Record<string, number>;
}

export function TokenList({ tokens, selectedToken, onSelect, onClose, prices }: TokenListProps) {
  return (
    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 py-2 z-50">
      <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-medium dark:text-white">Select Token</h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {tokens.map((token) => (
          <button
            key={token.symbol}
            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
              token.symbol === selectedToken.symbol ? 'bg-gray-50 dark:bg-gray-800' : ''
            }`}
            onClick={() => {
              onSelect(token);
              onClose();
            }}
          >
            <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
            <div className="flex-1 text-left">
              <div className="font-medium dark:text-white">{token.symbol}</div>
              {prices && prices[token.symbol] && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  ${prices[token.symbol].toFixed(2)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}