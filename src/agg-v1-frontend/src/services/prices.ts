import { useState, useEffect } from 'react';
import { TOKENS } from '../constants/tokens';

interface PriceData {
  [key: string]: {
    usd: number;
  };
}

export function usePrices() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = Object.values(TOKENS)
          .map(token => token.coingeckoId)
          .filter(Boolean)
          .join(',');

        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }

        const data = await response.json();
        setPrices(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching prices:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
}