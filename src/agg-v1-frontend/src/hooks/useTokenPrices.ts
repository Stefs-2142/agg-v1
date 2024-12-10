import { useState, useEffect } from 'react';

interface PriceResponse {
  [key: string]: {
    usd: number;
    usd_24h_change?: number;
  };
}

interface TokenPrices {
  [key: string]: number;
}

const MOCK_PRICES: Record<string, number> = {
  'ICP': 12.5,
  'ckBTC': 52000,
  'ckETH': 3200,
  'ckUSDT': 1,
  'ckUSDC': 1,
  'CHAT': 0.15
};

export function useTokenPrices() {
  const [prices, setPrices] = useState<TokenPrices>(MOCK_PRICES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Имитируем небольшие изменения цен каждые 30 секунд
    const interval = setInterval(() => {
      setPrices(prevPrices => {
        const newPrices = { ...prevPrices };
        Object.keys(newPrices).forEach(token => {
          // Случайное изменение цены в пределах ±1%
          const change = 1 + (Math.random() * 0.02 - 0.01);
          newPrices[token] = Number((newPrices[token] * change).toFixed(2));
        });
        return newPrices;
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
}