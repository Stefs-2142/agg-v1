import React, { useState, useEffect, useCallback } from 'react';
import { Settings, RefreshCw } from 'lucide-react';
import { Logo } from './components/Logo';
import { ThemeToggle } from './components/ThemeToggle';
import { ConnectWallet } from './components/ConnectWallet';
import { TokenInput } from './components/TokenInput';
import { RouteCard } from './components/RouteCard';
import { Timer } from './components/Timer';
import { useWallet } from './contexts/WalletContext';
import { useTokenPrices } from './hooks/useTokenPrices';
import { useBackend } from './hooks/useBackend';
import { useTokenBalances } from './hooks/useTokenBalances';
import { TOKENS, ALL_TOKENS, fromDecimalAmount, toDecimalAmount } from './constants/tokens';
import { SwapNotification } from './components/SwapNotification';

// Canister IDs для токенов
const TOKEN_CANISTERS = {
  ICP: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
  ckBTC: 'mxzaz-hqaaa-aaaar-qaada-cai',
  ckETH: 'ss2fx-dyaaa-aaaar-qacoq-cai',
  ckUSDC: 'xevnm-gaaaa-aaaar-qafnq-cai',
  ckUSDT: 'cngnf-vqaaa-aaaar-qag4q-cai'
} as const;

// Компонент для анимации точек загрузки
const LoadingDots = () => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '') return '.';
        if (prev === '.') return '..';
        if (prev === '..') return '...';
        return '';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Используем моноширинный шрифт и фиксированную ширину для стабильности
  return (
    <span className="inline-block w-[24px] font-mono">
      {dots}
    </span>
  );
};

function App() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(TOKENS.ICP);
  const [toToken, setToToken] = useState(TOKENS.ckBTC);
  const [isRotating, setIsRotating] = useState(false);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected } = useWallet();
  const { prices, loading: pricesLoading } = useTokenPrices();
  const { getQuotes, executeSwap, isAuthenticated } = useBackend();
  const { balances, isLoading: balancesLoading, refreshBalances } = useTokenBalances();
  const [insufficientBalance, setInsufficientBalance] = useState(false);
  const [swapInProgress, setSwapInProgress] = useState(false);
  const [swapStatus, setSwapStatus] = useState<'idle' | 'approving' | 'swapping' | 'success' | 'error'>('idle');
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    visible: boolean;
  }>({
    type: 'success',
    message: '',
    visible: false
  });

  // Логируем балансы для отладки
  useEffect(() => {
    console.log('Token balances:', balances);
  }, [balances]);

  // Получаем баланс для выбранного токена
  const getTokenBalance = (symbol: string) => {
    return balances[symbol];
  };

  // Функция для замены токенов местами
  const handleSwapTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 300);
  };

  // Выносим логику получения котировок в отдельную функцию
  const fetchQuotes = useCallback(async () => {
    if (!fromAmount || !isAuthenticated) {
      console.log('Skipping quote fetch:', { fromAmount, isAuthenticated });
      return;
    }

    // Check balance before making any quote requests
    const currentBalance = balances[fromToken.symbol];
    if (!currentBalance || Number(fromAmount) > Number(currentBalance)) {
      console.log('Amount exceeds balance, skipping quote fetch');
      setQuotes([]);
      setToAmount('');
      return;
    }
    
    setIsLoading(true);
    try {
      console.log('Fetching quotes with params:', {
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        amount: fromAmount,
        slippage: 0.01
      });

      const result = await getQuotes(
        fromToken.symbol,
        toToken.symbol,
        fromAmount,
        0.01
      );
      
      console.log('Raw result from getQuotes:', result);

      if ('ok' in result) {
        const sortedQuotes = result.ok.sort((a, b) => 
          Number(b.outputAmount) - Number(a.outputAmount)
        );

        console.log('Sorted quotes:', sortedQuotes);
        setQuotes(sortedQuotes);

        if (sortedQuotes.length > 0) {
          const toTokenDecimals = TOKENS[toToken.symbol as keyof typeof TOKENS].decimals;
          const humanReadableAmount = fromDecimalAmount(sortedQuotes[0].outputAmount, toTokenDecimals);
          setToAmount(humanReadableAmount);
        }
      } else {
        console.error('Error in quotes response:', result.err);
        setQuotes([]);
        setToAmount('');
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
      setQuotes([]);
      setToAmount('');
    } finally {
      setIsLoading(false);
    }
  }, [fromAmount, fromToken.symbol, toToken.symbol, isAuthenticated, getQuotes, balances]);

  // Вызываем fetchQuotes при изменении зависимостей
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const handleSwap = async () => {
    if (!isAuthenticated || !fromAmount || !quotes.length) {
      return;
    }

    setSwapInProgress(true);
    setSwapStatus('approving');

    try {
      // Конвертируем сумму с учетом decimals токена
      const fromTokenDecimals = TOKENS[fromToken.symbol as keyof typeof TOKENS].decimals;
      const decimalAmount = toDecimalAmount(fromAmount, fromTokenDecimals);

      console.log('Executing swap with params:', {
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        amount: decimalAmount.toString(),
        slippage: 0.01
      });

      setSwapStatus('swapping');
      const result = await executeSwap(
        fromToken.symbol,
        toToken.symbol,
        fromAmount,
        0.01
      );

      if ('ok' in result) {
        console.log('Swap executed successfully:', result.ok);
        setSwapStatus('success');
        // Очищаем форму после успешного свопа
        setFromAmount('');
        setToAmount('');
        setQuotes([]);
        // Обновляем балансы после свопа
        refreshBalances();
        // Показываем уведомление об успехе
        setNotification({
          type: 'success',
          message: 'Swap completed successfully!',
          visible: true
        });
      } else {
        console.error('Swap failed:', result.err);
        setSwapStatus('error');
        setNotification({
          type: 'error',
          message: `Swap failed: ${result.err}`,
          visible: true
        });
      }
    } catch (error) {
      console.error('Failed to execute swap:', error);
      setSwapStatus('error');
      setNotification({
        type: 'error',
        message: 'Failed to execute swap. Please try again.',
        visible: true
      });
    } finally {
      setSwapInProgress(false);
      // Reset swap status after a delay
      setTimeout(() => {
        setSwapStatus('idle');
        setNotification(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
  };

  // Обработчики выбора токенов
  const handleFromTokenSelect = (token: typeof TOKENS[keyof typeof TOKENS]) => {
    if (token.symbol === toToken.symbol) {
      // Если выбран тот же токен, что и в другом поле, меняем их местами
      setFromToken(toToken);
      setToToken(fromToken);
    } else {
      setFromToken(token);
    }
  };

  const handleToTokenSelect = (token: typeof TOKENS[keyof typeof TOKENS]) => {
    if (token.symbol === fromToken.symbol) {
      // Если выбран тот же токен, что и в другом поле, меняем их местами
      setFromToken(toToken);
      setToToken(fromToken);
    } else {
      setToToken(token);
    }
  };

  // Add balance check to amount change handler
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    
    // Check balance immediately when amount changes
    const currentBalance = balances[fromToken.symbol];
    if (currentBalance && Number(value) > Number(currentBalance)) {
      setInsufficientBalance(true);
      setQuotes([]); // Clear quotes when amount exceeds balance
      setToAmount(''); // Clear output amount
    } else {
      setInsufficientBalance(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <SwapNotification
        type={notification.type}
        message={notification.message}
        visible={notification.visible}
      />
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo />
              <span className="ml-2 text-xl font-semibold dark:text-white">ICSpore</span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Swap with best rates in IC ecosystem
              </span>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Settings className="w-5 h-5 dark:text-gray-400" />
              </button>
              <ConnectWallet />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 pt-20 pb-16">
        <div className="mt-8">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold dark:text-white">Swap</h2>
              <Timer onTimerEnd={fetchQuotes} />
            </div>

            <div className="space-y-4">
              <TokenInput
                label="You Pay"
                value={fromAmount}
                onChange={handleFromAmountChange}
                onSelectToken={handleFromTokenSelect}
                selectedToken={fromToken}
                availableTokens={ALL_TOKENS}
                otherToken={toToken}
                prices={prices}
                balance={getTokenBalance(fromToken.symbol)}
              />
              <div className="flex justify-center -my-2 relative z-10">
                <button 
                  onClick={handleSwapTokens}
                  className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm"
                >
                  <RefreshCw 
                    className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600"
                    style={{
                      transform: isRotating ? 'rotate(360deg)' : 'rotate(0deg)',
                      transition: 'transform 300ms ease'
                    }}
                  />
                </button>
              </div>
              <TokenInput
                label="You Receive"
                value={toAmount}
                onChange={setToAmount}
                onSelectToken={handleToTokenSelect}
                selectedToken={toToken}
                availableTokens={ALL_TOKENS}
                otherToken={fromToken}
                prices={prices}
                balance={getTokenBalance(toToken.symbol)}
                isOutput={true}
              />
            </div>

            <div className="mt-6 space-y-2">
              {quotes.map((quote, index) => {
                // Рассчитываем курс обмена для каждой котировки с учетом decimals
                const fromTokenDecimals = TOKENS[fromToken.symbol as keyof typeof TOKENS].decimals;
                const toTokenDecimals = TOKENS[toToken.symbol as keyof typeof TOKENS].decimals;
                
                // Конвертируем значения с учетом decimals обоих токенов
                const rate = Number(quote.outputAmount) / Math.pow(10, toTokenDecimals) / 
                            (Number(quote.inputAmount) / Math.pow(10, fromTokenDecimals));
                
                // Форматируем курс �� нужной точностью, убирая незначащие нули
                const formattedRate = rate.toFixed(8).replace(/\.?0+$/, '');
                
                return (
                  <RouteCard
                    key={quote.dexName}
                    protocol={quote.dexName}
                    logo={quote.dexName === "ICPSwap" 
                      ? "https://assets.coingecko.com/coins/images/37024/standard/ICS_LOGO.png?1713156630" 
                      : "https://avatars.githubusercontent.com/u/180925691?s=200&v=4"}
                    rate={`1 ${fromToken.symbol} = ${formattedRate} ${toToken.symbol}`}
                    isOptimal={index === 0}
                  />
                );
              })}
            </div>

            <button 
              className={`w-full mt-6 py-4 px-6 rounded-xl font-medium transition-colors ${
                isAuthenticated 
                  ? swapInProgress
                    ? 'bg-blue-600 dark:bg-blue-500 cursor-not-allowed'
                    : insufficientBalance
                      ? 'bg-red-600 dark:bg-red-500 cursor-not-allowed'
                      : quotes.length > 0
                        ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              onClick={handleSwap}
              disabled={!isAuthenticated || swapInProgress || quotes.length === 0 || insufficientBalance}
            >
              {swapInProgress ? (
                <span className="flex items-center justify-center gap-2">
                  {swapStatus === 'approving' && (
                    <>
                      <span>Approving</span>
                      <LoadingDots />
                    </>
                  )}
                  {swapStatus === 'swapping' && (
                    <>
                      <span>Swapping</span>
                      <LoadingDots />
                    </>
                  )}
                  {swapStatus === 'success' && (
                    <span className="text-green-500">Swap Successful!</span>
                  )}
                  {swapStatus === 'error' && (
                    <span className="text-red-500">Swap Failed</span>
                  )}
                </span>
              ) : insufficientBalance ? (
                `Insufficient ${fromToken.symbol}`
              ) : (
                'Swap'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;