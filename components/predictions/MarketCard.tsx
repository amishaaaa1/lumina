'use client';

import { formatDistanceToNow } from 'date-fns';

interface Market {
  id: string;
  protocol: string;
  question: string;
  icon: string;
  riskType: string;
  deadline: string;
  status: string;
  outcome: string;
  yesOdds: string;
  noOdds: string;
  yesPool: number;
  noPool: number;
  totalVolume: number;
  participantCount: number;
  insuranceEnabled: boolean;
}

interface MarketCardProps {
  market: Market;
  address?: string;
  onSelect: (market: Market) => void;
}

export function MarketCard({ market, address, onSelect }: MarketCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl bg-gray-50">
            {market.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">{market.protocol}</h3>
            <p className="text-xs text-gray-500">{market.riskType}</p>
          </div>
        </div>
        
        <p className="text-sm text-gray-700 leading-snug">
          {market.question}
        </p>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4 flex-1 flex flex-col">
        {/* Insurance */}
        {market.insuranceEnabled && (
          <div className="text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md w-fit">
            Insurance available
          </div>
        )}

        {/* Odds */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs text-gray-600">YES</div>
            <div className="text-xl font-bold text-green-600">{market.yesOdds}%</div>
            <div className="text-xs text-gray-500 mt-0.5">${(market.yesPool / 1000).toFixed(0)}K</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <div className="text-xs text-gray-600">NO</div>
            <div className="text-xl font-bold text-red-600">{market.noOdds}%</div>
            <div className="text-xs text-gray-500 mt-0.5">${(market.noPool / 1000).toFixed(0)}K</div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 mt-auto">
          <span>{market.participantCount} bets</span>
          <span>${(market.totalVolume / 1000).toFixed(0)}K pool</span>
        </div>

        <div className="text-xs text-gray-500">
          Closes {formatDistanceToNow(new Date(market.deadline), { addSuffix: true })}
        </div>

        {/* Action */}
        {market.status === 'Active' && (
          <button
            onClick={() => address && onSelect(market)}
            className={`w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${
              address
                ? 'bg-gray-900 text-white hover:bg-gray-800'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!address}
          >
            {address ? 'Place Bet' : 'Connect Wallet'}
          </button>
        )}

        {market.status === 'Resolved' && (
          <div className={`text-center py-2 rounded-lg text-sm font-medium ${
            market.outcome === 'Yes' 
              ? 'bg-green-50 text-green-700' 
              : 'bg-red-50 text-red-700'
          }`}>
            Resolved: {market.outcome}
          </div>
        )}
      </div>
    </div>
  );
}
