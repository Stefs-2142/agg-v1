import React, { useState, useRef, useEffect } from 'react';
import { Wallet, Copy, LogOut } from 'lucide-react';
import { useIdentityKit } from '@nfid/identitykit/react';

export function ConnectWallet() {
    const { user, connect, disconnect } = useIdentityKit();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCopyAddress = async () => {
        if (user) {
            await navigator.clipboard.writeText(user.principal.toString());
            // Optional: Add a toast notification here
        }
    };

    const handleConnect = () => {
        if (!user) {
            connect();
        } else {
            setIsOpen(!isOpen);
        }
    };

    const formatAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
                style={{
                    backgroundColor: user ? 'rgb(239 246 255)' : 'rgb(37 99 235)',
                    color: user ? 'rgb(37 99 235)' : 'white',
                }}
            >
                {!user ? (
                    <>
                        <Wallet className="w-5 h-5" />
                        Connect Wallet
                    </>
                ) : (
                    <span className="font-medium">
                        {formatAddress(user.principal.toString())}
                    </span>
                )}
            </button>

            {isOpen && user && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                    <div className="px-4 py-2">
                        <div className="text-sm text-gray-500">Wallet address</div>
                        <div className="flex items-center justify-between mt-1">
                            <span className="font-medium">
                                {formatAddress(user.principal.toString())}
                            </span>
                            <button
                                onClick={handleCopyAddress}
                                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <Copy className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="border-t border-gray-100 mt-2" />
                    <button
                        onClick={disconnect}
                        className="w-full px-4 py-2 flex items-center gap-2 hover:bg-gray-100 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                    </button>
                </div>
            )}
        </div>
    );
}