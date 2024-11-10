import React, { useState } from 'react';
import { Wallet, LogOut, ExternalLink } from 'lucide-react';
import { WalletModal } from './WalletModal';
import { useWallet } from '../contexts/WalletContext';

export function ConnectWallet() {
  const [isOpen, setIsOpen] = useState(false);
  const { isConnected, address, disconnect } = useWallet();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        <a
          href="#"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
        >
          <span className="font-medium">
            {address.slice(0, 6)}...{address.slice(-4)}
          </span>
          <ExternalLink className="w-4 h-4" />
        </a>
        <button
          onClick={disconnect}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
          title="Disconnect wallet"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
      >
        <Wallet className="w-5 h-5" />
        Connect Wallet
      </button>

      <WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}