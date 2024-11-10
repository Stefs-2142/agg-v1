import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { TokenList } from './TokenList';

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
  prices?: Record<string, number>;
  isOutput?: boolean;
  rate?: number;
}

export function TokenInput({ 
  label, 
  value, 
  onChange, 
  onSelectToken, 
  selectedToken,
  availableTokens,
  otherToken,
  prices,
  isOutput,
  rate
}: TokenInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTokens = availableTokens.filter(token => 
    !otherToken || token.symbol !== otherToken.symbol
  );

  const usdValue = prices && prices[selectedToken.symbol] && value
    ? (parseFloat(value) * prices[selectedToken.symbol]).toFixed(2)
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
    const inputValue = e.target.value;
    
    // Allow empty input
    if (inputValue === '') {
      onChange('');
      return;
    }

    // Allow single decimal point
    if (inputValue === '.' || inputValue === '0.') {
      onChange(inputValue);
      return;
    }

    // Validate decimal number format
    const regex = /^\d*\.?\d*$/;
    if (regex.test(inputValue)) {
      // Remove leading zeros but keep decimal part
      const parts = inputValue.split('.');
      const integerPart = parts[0].replace(/^0+(?=\d)/, '');
      const normalizedValue = parts.length > 1 
        ? `${integerPart || '0'}.${parts[1]}`
        : integerPart || '0';
      
      onChange(normalizedValue);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <div className="flex justify-between mb-2">
        <label className="text-sm text-gray-500 dark:text-gray-400">{label}</label>
        {rate && !isOutput && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            1 {selectedToken.symbol} = {rate.toFixed(6)} {otherToken?.symbol}
          </span>
        )}
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
            readOnly={isOutput}
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