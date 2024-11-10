import { useState, useEffect } from 'react';

const COINGECKO_IDS: Record<string, string> = {
  'ICP': 'internet-computer',
  'ckBTC': 'bitcoin',
  'ckETH': 'ethereum',
  'ckUSDT': 'tether',
  'ckUSDC': 'usd-coin',
  'CHAT': 'openchat-protocol'
};

export function useTokenPrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = Object.values(COINGECKO_IDS).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }

        const data = await response.json();
        const formattedPrices: Record<string, number> = {};
        
        Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
          formattedPrices[symbol] = data[id]?.usd || 0;
        });

        setPrices(formattedPrices);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch prices');
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
}