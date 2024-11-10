import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenList } from './TokenList';
import { PriceData } from '../services/prices';

interface Token {
  symbol: string;
  logo: string;
}

interface TokenInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onSelectToken: (token: Token) => void;
  selectedToken: Token;
  availableTokens: Token[];
  otherToken?: Token;
  prices?: PriceData | null;
}

export function TokenInput({ 
  label, 
  value, 
  onChange, 
  onSelectToken, 
  selectedToken,
  availableTokens,
  otherToken,
  prices
}: TokenInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTokens = availableTokens.filter(token => 
    !otherToken || token.symbol !== otherToken.symbol
  );

  const usdValue = prices && prices[selectedToken.symbol] && value
    ? (parseFloat(value) * prices[selectedToken.symbol].usd).toFixed(2)
    : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(',', '.');
    
    if (value === '') {
      onChange('');
      return;
    }

    if (value === '.' || value === '0.') {
      onChange(value);
      return;
    }

    const regex = /^(?!00)\d*\.?\d*$/;
    if (regex.test(value)) {
      const normalizedValue = value.replace(/^0(\d)/, '$1');
      onChange(normalizedValue);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between mb-2">
        <label className="text-sm text-gray-500 dark:text-gray-400">{label}</label>
        <span className="text-sm text-gray-500 dark:text-gray-400">Balance: 0.00</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="text"
            inputMode="decimal"
            value={value}
            onChange={handleInputChange}
            className="w-full text-2xl bg-transparent outline-none dark:text-white"
            placeholder="0.0"
            autoComplete="off"
          />
          {usdValue && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              ≈ ${usdValue}
            </div>
          )}
        </div>
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <img src={selectedToken.logo} alt={selectedToken.symbol} className="w-6 h-6 rounded-full" />
            <span className="font-medium dark:text-white">{selectedToken.symbol}</span>
            <ChevronDown className={`w-4 h-4 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
    </div>
  );
}