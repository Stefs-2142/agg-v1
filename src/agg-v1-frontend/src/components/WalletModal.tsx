import React, { useState } from 'react';
import { X, Search, ChevronRight } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  {
    id: 'keplr',
    name: 'Keplr',
    logo: 'https://raw.githubusercontent.com/chainapsis/keplr-wallet/master/packages/extension/src/public/assets/logo-256.png',
    description: 'Cosmos blockchain'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    logo: 'https://image.pngaaa.com/356/6547356-middle.png',
    description: 'Solana blockchain'
  },
  {
    id: 'trustwallet',
    name: 'Trust Wallet',
    logo: 'https://play-lh.googleusercontent.com/cd5BevWohRqLwsI2_i3k4YIVtcO57cIZCs6l20H1Hcdj0P2rFEcX_7QtgKbTM3Sn_A=w240-h480-rw',
    description: 'EVM blockchain'
  },
  {
    id: 'oisy',
    name: 'Oisy',
    logo: 'https://pbs.twimg.com/profile_images/1850944235778043904/NnDSSTPp_400x400.png',
    description: 'Chain Fusion wallet'
  }
];

export function WalletModal({ isOpen, onClose }: WalletModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { connect } = useWallet();

  if (!isOpen) return null;

  const handleConnect = (walletId: string) => {
    connect(walletId);
    onClose();
  };

  const filteredWallets = WALLETS.filter(wallet =>
    wallet.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-xl font-semibold dark:text-white">Connect Wallet</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
            />
          </div>
        </div>

        {/* Wallet List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {filteredWallets.map(wallet => (
              <button
                key={wallet.id}
                onClick={() => handleConnect(wallet.id)}
                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm">
                  <img 
                    src={wallet.logo} 
                    alt={wallet.name} 
                    className="w-8 h-8 object-contain"
                  />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium dark:text-white">{wallet.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{wallet.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
              </button>
            ))}

            {filteredWallets.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No wallets found</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
            By connecting a wallet, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}