import { useState, useEffect } from 'react';
import { useIdentityKit } from '@nfid/identitykit/react';
import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';
import { TOKENS } from '../constants/tokens';

// Ledger interface для токенов
interface TokenLedger {
  icrc1_balance_of: (arg: { owner: Principal; subaccount: [] }) => Promise<bigint>;
}

// IDL для ICRC-1 токенов
const icrcIDL = ({ IDL }: { IDL: typeof IDL }) => {
  return IDL.Service({
    'icrc1_balance_of': IDL.Func(
      [
        IDL.Record({
          'owner': IDL.Principal,
          'subaccount': IDL.Opt(IDL.Vec(IDL.Nat8)),
        })
      ],
      [IDL.Nat],
      ['query']
    ),
  });
};

// Canister IDs для токенов
const TOKEN_CANISTERS = {
  ICP: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  ckBTC: 'mxzaz-hqaaa-aaaar-qaada-cai',
  ckETH: 'ss2fx-dyaaa-aaaar-qacoq-cai',
  ckUSDC: 'xevnm-gaaaa-aaaar-qafnq-cai',
  ckUSDT: 'cngnf-vqaaa-aaaar-qag4q-cai'
} as const;

interface TokenBalances {
  [key: string]: string | undefined;
}

export function useTokenBalances() {
  const [balances, setBalances] = useState<TokenBalances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, identity } = useIdentityKit();

  const createTokenActor = (canisterId: string): TokenLedger => {
    const agent = new HttpAgent({
      identity,
      host: "https://icp0.io"
    });

    return Actor.createActor<TokenLedger>(icrcIDL, {
      agent,
      canisterId,
    });
  };

  const fetchBalance = async (symbol: keyof typeof TOKEN_CANISTERS) => {
    if (!user || !identity) return undefined;

    try {
      const canisterId = TOKEN_CANISTERS[symbol];
      const actor = createTokenActor(canisterId);
      const balance = await actor.icrc1_balance_of({
        owner: user.principal,
        subaccount: []
      });

      // Конвертируем баланс с учетом decimals токена
      const decimals = TOKENS[symbol].decimals;
      return (Number(balance) / Math.pow(10, decimals)).toFixed(decimals);
    } catch (err) {
      console.error(`Error fetching ${symbol} balance:`, err);
      return undefined;
    }
  };

  const fetchAllBalances = async () => {
    if (!user || !identity) {
      setBalances({});
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const balancePromises = Object.keys(TOKEN_CANISTERS).map(async (symbol) => {
        const balance = await fetchBalance(symbol as keyof typeof TOKEN_CANISTERS);
        return [symbol, balance];
      });

      const results = await Promise.all(balancePromises);
      const newBalances = Object.fromEntries(results);
      setBalances(newBalances);
    } catch (err) {
      console.error('Error fetching balances:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balances');
    } finally {
      setIsLoading(false);
    }
  };

  // Обновляем балансы при подключении/отключении кошелька
  useEffect(() => {
    if (user && identity) {
      fetchAllBalances();
      // Обновляем балансы каждую минуту
      const interval = setInterval(fetchAllBalances, 60000);
      return () => clearInterval(interval);
    }
  }, [user, identity]);

  return {
    balances,
    isLoading,
    error,
    refreshBalances: fetchAllBalances
  };
} 