'use client';

import { useState, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useContractWrite } from '@/hooks/useContract';
import { formatUSD, parseTokenAmount } from '@/lib/utils';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { cn } from '@/lib/utils';

const MARKETS = [
  {
    id: 'btc-100k-2024',
    title: 'Bitcoin hits $100k in 2024?',
    category: 'Crypto',
    odds: 68,
    volume: '$2.4M',
    ends: 'Dec 31, 2024',
    hot: true,
  },
  {
    id: 'eth-5k-2024',
    title: 'Ethereum reaches $5k in 2024?',
    category: 'Crypto',
    odds: 42,
    volume: '$1.8M',
    ends: 'Dec 31, 2024',
  },
  {
    id: 'trump-2024',
    title: 'Trump wins 2024 election?',
    category: 'Politics',
    odds: 54,
    volume: '$8.2M',
    ends: 'Nov 5, 2024',
    hot: true,
  },
  {
    id: 'ai-agi-2025',
    title: 'AGI achieved by end of 2025?',
    category: 'Tech',
    odds: 12,
    volume: '$890K',
    ends: 'Dec 31, 2025',
  },
  {
    id: 'fed-rate-cut',
    title: 'Fed cuts rates by 0.5% in Q1 2025?',
    category: 'Finance',
    odds: 35,
    volume: '$1.2M',
    ends: 'Mar 31, 2025',
  },
  {
    id: 'tesla-500',
    title: 'Tesla stock above $500 by EOY?',
    category: 'Stocks',
    odds: 28,
    volume: '$650K',
    ends: 'Dec 31, 2024',
  },
];

export default function InsuranceClient() {
  const { address, isConnected } = useAccount();
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [coverageAmount, setCoverageAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const market = MARKETS.find((m) => m.id === selectedMarket);

  const { data: premium, isLoading: premiumLoading } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'calculatePremium',
    args:
      selectedMarket && coverageAmount && parseFloat(coverageAmount) > 0
        ? [selectedMarket, parseTokenAmount(coverageAmount)]
        : undefined,
  });

  const { data: balance } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { write, isPending, isConfirming, isSuccess, error } = useContractWrite();

  const filteredMarkets = useMemo(() => {
    return MARKETS.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, categoryFilter]);

  const categories = ['all', ...Array.from(new Set(MARKETS.map((m) => m.category)))];

  const handleBuy = async () => {
    if (!selectedMarket || !premium || !address || !coverageAmount) return;

    const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);
    const amount = parseTokenAmount(coverageAmount);

    try {
      // First approve
      await write({
        ...ASSET_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.PolicyManager.address, premium],
      });

      // Wait a bit then create policy
      setTimeout(async () => {
        await write({
          ...CONTRACTS.PolicyManager,
          functionName: 'createPolicy',
          args: [address, selectedMarket, amount, premium, durationSeconds],
        });
      }, 2000);
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  if (!isConnected) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-3">Connect Wallet</h2>
            <p className="text-gray-600 mb-8">
              Connect your wallet to buy insurance
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-3">Buy Insurance</h1>
            <p className="text-lg text-gray-600">
              Hedge your prediction market bets
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search markets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    categoryFilter === cat
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Markets list */}
            <div className="lg:col-span-2 space-y-4">
              {filteredMarkets.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-gray-600">No markets found</p>
                </div>
              ) : (
                filteredMarkets.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMarket(m.id)}
                    className={cn(
                      'w-full p-6 bg-white rounded-xl border-2 transition-all text-left',
                      selectedMarket === m.id
                        ? 'border-blue-600 shadow-lg ring-2 ring-blue-100'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium text-gray-700">
                            {m.category}
                          </span>
                          {m.hot && (
                            <span className="px-2 py-1 bg-red-100 rounded text-xs font-medium text-red-700">
                              🔥 Hot
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{m.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Volume: {m.volume}</span>
                          <span>•</span>
                          <span>Ends: {m.ends}</span>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-xs text-gray-500 mb-1">Yes odds</div>
                        <div className="text-2xl font-bold text-blue-600">{m.odds}%</div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Purchase form */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
                <h2 className="text-xl font-bold mb-6">Insurance Details</h2>

                {!selectedMarket ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-sm">Select a market to continue</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Selected market */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-600 font-medium mb-1">SELECTED MARKET</div>
                      <div className="font-semibold text-sm">{market?.title}</div>
                    </div>

                    {/* Coverage input */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Coverage Amount (USDT)</label>
                      <input
                        type="number"
                        value={coverageAmount}
                        onChange={(e) => setCoverageAmount(e.target.value)}
                        placeholder="100"
                        min="0.01"
                        max="100"
                        step="0.01"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">Min: 0.01 • Max: 100</p>
                    </div>

                    {/* Duration */}
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      >
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                        <option value="60">60 days</option>
                        <option value="90">90 days</option>
                      </select>
                    </div>

                    {/* Summary */}
                    {premiumLoading && coverageAmount && (
                      <div className="flex items-center justify-center py-4">
                        <LoadingSpinner size="sm" />
                        <span className="ml-2 text-sm text-gray-600">Calculating premium...</span>
                      </div>
                    )}

                    {premium && coverageAmount && !premiumLoading && (
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Coverage</span>
                          <span className="font-semibold">${coverageAmount}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Premium</span>
                          <span className="font-semibold">{formatUSD(premium)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Duration</span>
                          <span className="font-semibold">{duration} days</span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 flex justify-between">
                          <span className="font-semibold">You pay</span>
                          <span className="font-bold text-lg">{formatUSD(premium)}</span>
                        </div>
                      </div>
                    )}

                    {/* Balance */}
                    <div className="text-xs text-gray-500">
                      Your balance: {balance ? formatUSD(balance) : '$0.00'}
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    )}

                    {/* Success */}
                    {isSuccess && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">Policy created successfully!</p>
                      </div>
                    )}

                    {/* Buy button */}
                    <button
                      onClick={handleBuy}
                      disabled={!coverageAmount || isPending || isConfirming || premiumLoading}
                      className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <LoadingSpinner size="sm" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        'Buy Insurance'
                      )}
                    </button>

                    {/* Info */}
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-xs text-blue-700">
                        💡 Your policy will be minted as an NFT. You can claim if the market resolves
                        against you.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
