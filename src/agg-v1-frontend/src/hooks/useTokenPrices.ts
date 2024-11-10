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

const COINGECKO_IDS: Record<string, string> = {
  'ICP': 'internet-computer',
  'ckBTC': 'bitcoin',
  'ckETH': 'ethereum',
  'ckUSDT': 'tether',
  'ckUSDC': 'usd-coin',
  'CHAT': 'openchat-protocol'
};

const MOCK_PRICES: Record<string, number> = {
  'ICP': 12.5,
  'ckBTC': 52000,
  'ckETH': 3200,
  'ckUSDT': 1,
  'ckUSDC': 1,
  'CHAT': 0.15
};

export function useTokenPrices() {
  const [prices, setPrices] = useState<TokenPrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ids = Object.values(COINGECKO_IDS).join(',');
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch prices');
        }

        const data: PriceResponse = await response.json();
        const formattedPrices: TokenPrices = {};
        
        // Map CoinGecko IDs back to our token symbols and format prices
        Object.entries(COINGECKO_IDS).forEach(([symbol, id]) => {
          if (data[id]) {
            formattedPrices[symbol] = parseFloat(data[id].usd.toFixed(6));
          } else {
            // Fallback to mock prices if API fails for a token
            formattedPrices[symbol] = MOCK_PRICES[symbol];
          }
        });

        setPrices(formattedPrices);
        setError(null);
      } catch (err) {
        console.error('Error fetching prices:', err);
        // Fallback to mock prices if API fails
        setPrices(MOCK_PRICES);
        setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
}