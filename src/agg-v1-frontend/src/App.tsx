import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Infinity, Zap } from 'lucide-react';
import { TokenInput } from './components/TokenInput';
import { RouteCard } from './components/RouteCard';
import { Logo } from './components/Logo';
import { ConnectWallet } from './components/ConnectWallet';
import { Timer } from './components/Timer';
import { ThemeToggle } from './components/ThemeToggle';
import { useWallet } from './contexts/WalletContext';

const TOKENS = {
  ICP: {
    symbol: 'ICP',
    logo: 'https://cryptologos.cc/logos/internet-computer-icp-logo.png'
  },
  ckBTC: {
    symbol: 'ckBTC',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwveUtVZjZueURlbXNBMW1BeFlhTkcucG5nIn0:dfinity:PrgFDN3hVntenLfLCcp-Ih8nkMYUw3D3oOa8DRYPc0k?width=2400'
  },
  ckUSDT: {
    symbol: 'ckUSDT',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwvRmRtRUdudUE0ZVNnYUh3ZFBGazcucG5nIn0:dfinity:OjxfOixU4LxtiNDK60EuejiKyMt6jGF7CIzqWNbhfCQ?width=2400'
  },
  ckUSDC: {
    symbol: 'ckUSDC',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwvTExyZzR0Ynd3N1h0UWpWZVZrd1AucG5nIn0:dfinity:98XVYNxw1g4W2eNHHEh6BlmbWJVxxr0sQhi0WRe-nJA?width=2400'
  },
  ckETH: {
    symbol: 'ckETH',
    logo: 'https://cdn-assets-eu.frontify.com/s3/frontify-enterprise-files-eu/eyJwYXRoIjoiZGZpbml0eVwvZmlsZVwvajhLVmRTNWlLS01aWXE2Z3JDSGUucG5nIn0:dfinity:kTWhzshTsVqv4nmX-0Fk9uXzAlpwaCPNfPUVHDEGo-8?width=2400'
  },
  CHAT: {
    symbol: 'CHAT',
    logo: 'https://dgegb-daaaa-aaaar-arlhq-cai.raw.icp0.io/avatar/319398709384407980892342373791723159552'
  }
};

const ALL_TOKENS = Object.values(TOKENS);

function App() {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromToken, setFromToken] = useState(TOKENS.ICP);
  const [toToken, setToToken] = useState(TOKENS.ckBTC);
  const [isRotating, setIsRotating] = useState(false);
  const [isChainFusion, setIsChainFusion] = useState(false);
  const { isConnected, principal } = useWallet();

  const handleSwap = () => {
    if (isRotating) return;
    
    setIsRotating(true);
    const tempToken = fromToken;
    const tempAmount = fromAmount;
    
    setFromToken(toToken);
    setToToken(tempToken);
    setFromAmount(toAmount);
    setToAmount(tempAmount);
    
    setTimeout(() => setIsRotating(false), 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Logo />
              <span className="ml-2 text-xl font-semibold dark:text-white">ICSpore</span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Swap with best price acros a Web3
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

      <main className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="swap-mode"
                  className="sr-only peer"
                  checked={!isChainFusion}
                  onChange={() => setIsChainFusion(false)}
                />
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  !isChainFusion 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <Infinity className="w-5 h-5" />
                  <span className="font-medium">IC Only</span>
                </div>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="swap-mode"
                  className="sr-only peer"
                  checked={isChainFusion}
                  onChange={() => setIsChainFusion(true)}
                />
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isChainFusion 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                  <Zap className="w-5 h-5" />
                  <span className="font-medium">Chain Fusion</span>
                </div>
              </label>
            </div>
            <Timer />
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
            <div className="space-y-4">
              <TokenInput
                label="You Pay"
                value={fromAmount}
                onChange={setFromAmount}
                onSelectToken={setFromToken}
                selectedToken={fromToken}
                availableTokens={ALL_TOKENS}
                otherToken={toToken}
              />
              <div className="flex justify-center -my-2 relative z-10">
                <button 
                  onClick={handleSwap}
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
                onSelectToken={setToToken}
                selectedToken={toToken}
                availableTokens={ALL_TOKENS}
                otherToken={fromToken}
              />
            </div>

            <div className="mt-6 space-y-3">
              {isChainFusion ? (
                <>
                  <RouteCard
                    protocol="Uniswap"
                    logo="https://cryptologos.cc/logos/uniswap-uni-logo.png"
                    rate={`1 ${fromToken.symbol} = 0.000042 ${toToken.symbol}`}
                    isOptimal={true}
                    chain="EVM"
                  />
                  <RouteCard
                    protocol="Jupiter"
                    logo="https://jup.ag/favicon-32x32.png"
                    rate={`1 ${fromToken.symbol} = 0.000041 ${toToken.symbol}`}
                    isOptimal={false}
                    chain="Solana"
                  />
                  <RouteCard
                    protocol="Osmosis"
                    logo="https://assets.coingecko.com/coins/images/16724/small/osmo.png"
                    rate={`1 ${fromToken.symbol} = 0.000040 ${toToken.symbol}`}
                    isOptimal={false}
                    chain="Cosmos"
                  />
                </>
              ) : (
                <>
                  <RouteCard
                    protocol="KongSwap"
                    logo="https://avatars.githubusercontent.com/u/180925691?s=200&v=4"
                    rate={`1 ${fromToken.symbol} = 0.000041 ${toToken.symbol}`}
                    isOptimal={true}
                  />
                  <RouteCard
                    protocol="ICLighthouse"
                    logo="https://avatars.githubusercontent.com/u/92904844?v=4"
                    rate={`1 ${fromToken.symbol} = 0.000040 ${toToken.symbol}`}
                    isOptimal={false}
                  />
                </>
              )}
            </div>

            <button 
              className={`w-full mt-6 py-4 px-6 rounded-xl font-medium transition-colors ${
                isConnected 
                  ? 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
              disabled={!isConnected}
            >
              {isConnected ? 'Swap' : 'Connect Wallet to Trade'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;