import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenList } from './TokenList';
import { TOKENS } from '../constants/tokens';

type Token = typeof TOKENS[keyof typeof TOKENS];

interface TokenInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelectToken: (token: Token) => void;
  selectedToken: Token;
  availableTokens: Token[];
  otherToken: Token;
  isOutput?: boolean;
  prices?: Record<string, number>;
  balance?: string;
}

export function TokenInput({
  label,
  value,
  onChange,
  onSelectToken,
  selectedToken,
  availableTokens,
  otherToken,
  isOutput,
  prices,
  balance
}: TokenInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрываем дропдаун при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Фильтруем токены, исключая выбранный в другом поле
  const filteredTokens = availableTokens.filter(token => 
    !otherToken || token.symbol !== otherToken.symbol
  );

  // Рассчитываем примерную стоимость в USD
  const usdValue = prices && prices[selectedToken.symbol] 
    ? (Number(value || 0) * prices[selectedToken.symbol]).toFixed(2)
    : '0.00';

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        {balance && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Balance: {balance}
            </span>
            {!isOutput && (
              <button
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                onClick={() => onChange(balance)}
              >
                MAX
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <input
          type="text"
          className="flex-1 bg-transparent text-2xl font-medium outline-none dark:text-white"
          placeholder="0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={isOutput}
        />
        <div className="relative" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-6 h-6" />
            <span className="font-medium dark:text-white">{selectedToken.symbol}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {isOpen && (
            <TokenList
              tokens={filteredTokens}
              selectedToken={selectedToken}
              onSelect={onSelectToken}
              onClose={() => setIsOpen(false)}
              prices={prices}
            />
          )}
        </div>
      </div>
      <div className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
        ≈ ${usdValue}
      </div>
    </div>
  );
}