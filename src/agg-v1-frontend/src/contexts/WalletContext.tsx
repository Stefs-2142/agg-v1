import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletContextType {
  connect: (walletId: string) => void;
  disconnect: () => void;
  isConnected: boolean;
  address: string | null;
  walletType: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const FAKE_ADDRESSES: Record<string, string> = {
  keplr: 'cosmos1j2h4x8kxf6wvxv7zw3tznqz76y8gvy3rwf5x4c',
  phantom: '5FHwkrdxkjdkzgdwsu4g8dxjzk2345',
  trustwallet: '0x942d35Cc6634C0532925a3b844Bc454e4438f456',
  oisy: 'rrkah-fqaaa-aaaaa-aaaaq-cai' // Added Oisy ICP address format
};

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [walletType, setWalletType] = useState<string | null>(null);

  const connect = (walletId: string) => {
    const fakeAddress = FAKE_ADDRESSES[walletId];
    if (fakeAddress) {
      setAddress(fakeAddress);
      setWalletType(walletId);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setWalletType(null);
  };

  return (
    <WalletContext.Provider value={{
      connect,
      disconnect,
      isConnected: !!address,
      address,
      walletType
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
}