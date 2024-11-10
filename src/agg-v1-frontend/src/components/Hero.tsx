import React from 'react';
import { TrendingUp, Users, Zap } from 'lucide-react';
import { Logo } from './Logo';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-600 to-blue-700 text-white">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=2070"
          alt="Trading Background"
          className="w-full h-full object-cover opacity-10"
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            ICSpore: Your IC Ecosystem DEX Aggregator
          </h1>
          <p className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto">
            Swap with the best rates across the Internet Computer ecosystem
          </p>
        </div>
        
        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/30 p-3 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Best Rates</h3>
              <p className="text-blue-100 text-sm">Compare across IC DEXes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/30 p-3 rounded-xl">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Low Fees</h3>
              <p className="text-blue-100 text-sm">Optimize swap costs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/30 p-3 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">Trusted</h3>
              <p className="text-blue-100 text-sm">By IC community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}