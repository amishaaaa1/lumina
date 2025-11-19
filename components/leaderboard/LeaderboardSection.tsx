'use client';

import { useState } from 'react';

interface LeaderboardEntry {
  rank: number;
  address: string;
  displayName: string;
  value: string;
  change: number;
  avatar: string;
}

const MOCK_TRADERS: LeaderboardEntry[] = [
  { rank: 1, address: '0x742d...4e89', displayName: '0x742d...4e89', value: '$127,450', change: 12.5, avatar: '' },
  { rank: 2, address: '0x8f3a...2b1c', displayName: '0x8f3a...2b1c', value: '$98,320', change: 8.3, avatar: '' },
  { rank: 3, address: '0x1c9d...7f4a', displayName: '0x1c9d...7f4a', value: '$76,890', change: -2.1, avatar: '' },
  { rank: 4, address: '0x5e2b...9c3d', displayName: '0x5e2b...9c3d', value: '$64,210', change: 15.7, avatar: '' },
  { rank: 5, address: '0x9a7f...1e8b', displayName: '0x9a7f...1e8b', value: '$52,340', change: 5.2, avatar: '' },
  { rank: 6, address: '0x3d8c...6a2f', displayName: '0x3d8c...6a2f', value: '$48,920', change: -4.3, avatar: '' },
  { rank: 7, address: '0x6b4e...8d1c', displayName: '0x6b4e...8d1c', value: '$43,560', change: 9.8, avatar: '' },
  { rank: 8, address: '0x2f1a...5c9e', displayName: '0x2f1a...5c9e', value: '$39,780', change: 3.4, avatar: '' },
  { rank: 9, address: '0x7c5d...3b4a', displayName: '0x7c5d...3b4a', value: '$35,120', change: -1.2, avatar: '' },
  { rank: 10, address: '0x4a9b...7e2d', displayName: '0x4a9b...7e2d', value: '$31,450', change: 7.6, avatar: '' },
];

const MOCK_LPS: LeaderboardEntry[] = [
  { rank: 1, address: '0xa1b2...c3d4', displayName: '0xa1b2...c3d4', value: '$2.4M', change: 18.2, avatar: '' },
  { rank: 2, address: '0xe5f6...a7b8', displayName: '0xe5f6...a7b8', value: '$1.8M', change: 12.4, avatar: '' },
  { rank: 3, address: '0xj9k0...l1m2', displayName: '0xj9k0...l1m2', value: '$1.5M', change: 9.7, avatar: '' },
  { rank: 4, address: '0xn3o4...p5q6', displayName: '0xn3o4...p5q6', value: '$1.2M', change: 15.3, avatar: '' },
  { rank: 5, address: '0xr7s8...t9u0', displayName: '0xr7s8...t9u0', value: '$980K', change: 6.8, avatar: '' },
  { rank: 6, address: '0xv1w2...x3y4', displayName: '0xv1w2...x3y4', value: '$850K', change: -3.2, avatar: '' },
  { rank: 7, address: '0xz5a6...b7c8', displayName: '0xz5a6...b7c8', value: '$720K', change: 11.5, avatar: '' },
  { rank: 8, address: '0xd9e0...f1g2', displayName: '0xd9e0...f1g2', value: '$650K', change: 8.9, avatar: '' },
  { rank: 9, address: '0xh3i4...j5k6', displayName: '0xh3i4...j5k6', value: '$580K', change: 4.2, avatar: '' },
  { rank: 10, address: '0xl7m8...n9o0', displayName: '0xl7m8...n9o0', value: '$520K', change: -1.8, avatar: '' },
];

export function LeaderboardSection() {
  const [activeTab, setActiveTab] = useState<'traders' | 'lps'>('traders');

  const currentData = activeTab === 'traders' ? MOCK_TRADERS : MOCK_LPS;
  const title = activeTab === 'traders' ? 'Top Traders' : 'Top Liquidity Providers';
  const subtitle = activeTab === 'traders' 
    ? 'Ranked by total profit from predictions' 
    : 'Ranked by total value locked and earnings';

  return (
    <div className="mt-16 pt-16 border-t border-gray-200">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h2>
        <p className="text-gray-600">Top performers this month</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('traders')}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'traders'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          Top Traders
        </button>
        <button
          onClick={() => setActiveTab('lps')}
          className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all ${
            activeTab === 'lps'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
          }`}
        >
          Top LPs
        </button>
      </div>

      {/* Leaderboard Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
        </div>

        {/* Leaderboard List */}
        <div className="divide-y divide-gray-100">
          {currentData.map((entry, idx) => (
            <div
              key={entry.address}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                idx < 3 ? 'bg-gradient-to-r from-yellow-50/50 to-transparent' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                {/* Rank */}
                <div className="flex-shrink-0 w-12 text-center">
                  {entry.rank <= 3 ? (
                    <div className="text-2xl">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                    </div>
                  ) : (
                    <div className="text-lg font-bold text-gray-400">#{entry.rank}</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-sm text-gray-900">{entry.displayName}</div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  {/* Value */}
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{entry.value}</div>
                    <div className="text-xs text-gray-500">
                      {activeTab === 'traders' ? 'profit' : 'deposited'}
                    </div>
                  </div>

                  {/* Change */}
                  <div className="flex-shrink-0 w-16 text-right">
                    <div
                      className={`text-sm font-semibold ${
                        entry.change >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {entry.change >= 0 ? '+' : ''}{entry.change}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Updated daily
          </p>
        </div>
      </div>
    </div>
  );
}
