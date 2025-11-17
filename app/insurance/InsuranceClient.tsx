'use client';

import { useState, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useContractWrite } from '@/hooks/useContract';
import { formatUSD, parseTokenAmount } from '@/lib/utils';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { cn } from '@/lib/utils';

const MARKETS = [
  {
    id: '1',
    token: 'Bitcoin',
    symbol: 'BTC',
    question: 'BTC hits $120K by Q2 2025?',
    votes: 234,
    poolLiquidity: '$18.4M',
    currentPrice: '$91,234',
    premium: '2.8%',
    coverage: '$6.2M',
    coingeckoId: 'bitcoin',
    category: 'Crypto',
  },
  {
    id: '2',
    token: 'Ethereum',
    symbol: 'ETH',
    question: 'ETH flips $5K before June?',
    votes: 187,
    poolLiquidity: '$14.2M',
    currentPrice: '$3,456',
    premium: '3.4%',
    coverage: '$4.8M',
    coingeckoId: 'ethereum',
    category: 'Crypto',
  },
  {
    id: '3',
    token: 'Cardano',
    symbol: 'ADA',
    question: 'ADA breaks $1.50 in 2025?',
    votes: 142,
    poolLiquidity: '$9.8M',
    currentPrice: '$0.92',
    premium: '4.6%',
    coverage: '$2.3M',
    coingeckoId: 'cardano',
    category: 'Crypto',
  },
  {
    id: '4',
    token: 'Astar Network',
    symbol: 'ASTR',
    question: 'ASTR reaches $0.35 this year?',
    votes: 78,
    poolLiquidity: '$3.4M',
    currentPrice: '$0.089',
    premium: '6.2%',
    coverage: '$890K',
    coingeckoId: 'astar',
    category: 'Crypto',
  },
  {
    id: '5',
    token: 'Hyperliquid',
    symbol: 'HYPE',
    question: 'HYPE surpasses $75 in Q1?',
    votes: 156,
    poolLiquidity: '$7.6M',
    currentPrice: '$32.10',
    premium: '5.1%',
    coverage: '$3.1M',
    coingeckoId: 'hyperliquid',
    category: 'Crypto',
  },
  {
    id: '6',
    token: 'Solana',
    symbol: 'SOL',
    question: 'SOL maintains above $200?',
    votes: 203,
    poolLiquidity: '$11.2M',
    currentPrice: '$178',
    premium: '3.9%',
    coverage: '$3.7M',
    coingeckoId: 'solana',
    category: 'Crypto',
  },
  {
    id: '7',
    token: 'Polkadot',
    symbol: 'DOT',
    question: 'DOT hits $15 by March?',
    votes: 91,
    poolLiquidity: '$5.4M',
    currentPrice: '$7.23',
    premium: '5.4%',
    coverage: '$1.8M',
    coingeckoId: 'polkadot',
    category: 'Crypto',
  },
  {
    id: '8',
    token: 'Chainlink',
    symbol: 'LINK',
    question: 'LINK reaches $40 in 2025?',
    votes: 167,
    poolLiquidity: '$8.9M',
    currentPrice: '$18.45',
    premium: '4.3%',
    coverage: '$2.9M',
    coingeckoId: 'chainlink',
    category: 'Crypto',
  },
  {
    id: '9',
    token: 'Avalanche',
    symbol: 'AVAX',
    question: 'AVAX breaks $80 this quarter?',
    votes: 124,
    poolLiquidity: '$6.7M',
    currentPrice: '$42.30',
    premium: '4.8%',
    coverage: '$2.1M',
    coingeckoId: 'avalanche-2',
    category: 'Crypto',
  },
  {
    id: '10',
    token: 'Polygon',
    symbol: 'MATIC',
    question: 'MATIC reaches $2 in 2025?',
    votes: 98,
    poolLiquidity: '$4.5M',
    currentPrice: '$0.87',
    premium: '5.7%',
    coverage: '$1.5M',
    coingeckoId: 'matic-network',
    category: 'Crypto',
  },
  {
    id: '11',
    token: 'Cosmos',
    symbol: 'ATOM',
    question: 'ATOM hits $25 by summer?',
    votes: 112,
    poolLiquidity: '$5.8M',
    currentPrice: '$9.12',
    premium: '5.3%',
    coverage: '$1.9M',
    coingeckoId: 'cosmos',
    category: 'Crypto',
  },
  {
    id: '12',
    token: 'Near Protocol',
    symbol: 'NEAR',
    question: 'NEAR surpasses $12 in Q2?',
    votes: 87,
    poolLiquidity: '$4.1M',
    currentPrice: '$4.56',
    premium: '6.1%',
    coverage: '$1.3M',
    coingeckoId: 'near',
    category: 'Crypto',
  },
];

export default function InsuranceClient() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
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
        m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect to view and purchase insurance
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        {/* Simple Header with Stats */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Insurance Markets</h1>
              <p className="text-gray-600 mt-1">Select a market to insure your position</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Total Protected</div>
                    <div className="text-3xl font-bold text-gray-900">$42.8M</div>
                  </div>
                </div>
                <div className="text-xs text-green-600 font-medium">↑ 12.5% this week</div>
              </div>

              <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Active Policies</div>
                    <div className="text-3xl font-bold text-gray-900">1,247</div>
                  </div>
                </div>
                <div className="text-xs text-blue-600 font-medium">↑ 8.3% this week</div>
              </div>

              <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Claims Paid</div>
                    <div className="text-3xl font-bold text-gray-900">$3.2M</div>
                  </div>
                </div>
                <div className="text-xs text-purple-600 font-medium">234 claims settled</div>
              </div>

              <div className="group bg-white rounded-2xl p-6 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Avg Premium</div>
                    <div className="text-3xl font-bold text-gray-900">4.2%</div>
                  </div>
                </div>
                <div className="text-xs text-yellow-600 font-medium">Competitive rates</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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

          <div>
            {/* Markets grid - Full Width */}
            <div>
              {filteredMarkets.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center">
                  <p className="text-gray-600">No markets found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMarkets.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        if (!isConnected) {
                          openConnectModal?.();
                          return;
                        }
                        setSelectedMarket(m.id);
                      }}
                      className={cn(
                        'bg-white rounded-2xl p-6 hover:shadow-lg transition-all border-2 text-left',
                        selectedMarket === m.id
                          ? 'border-blue-600 shadow-lg'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="space-y-4">
                        {/* Token Header */}
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                              src={`https://cryptologos.cc/logos/${m.token.toLowerCase().replace(' ', '-')}-${m.symbol.toLowerCase()}-logo.png`}
                              alt={m.token}
                              className="w-10 h-10 rounded-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = `https://via.placeholder.com/40/3B82F6/FFFFFF?text=${m.symbol}`;
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-sm text-gray-900">{m.token}</h3>
                            <p className="text-xs text-gray-500">{m.symbol}</p>
                          </div>
                        </div>

                        {/* Question */}
                        <p className="text-sm font-semibold text-gray-900 min-h-[42px] leading-tight">
                          {m.question}
                        </p>

                        {/* Stats */}
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Votes</span>
                            <span className="text-xs font-bold text-gray-900">{m.votes}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Pool liquidity</span>
                            <span className="text-xs font-bold text-gray-900">{m.poolLiquidity}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Current price</span>
                            <span className="text-xs font-bold text-gray-900">{m.currentPrice}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Premium</span>
                            <span className="text-xs font-bold text-green-600">{m.premium}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">Coverage</span>
                            <span className="text-xs font-bold text-gray-900">{m.coverage}</span>
                          </div>
                        </div>

                        {/* Insure Button */}
                        <div className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all mt-2 text-center shadow-lg hover:shadow-xl">
                          Insure Position
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Purchase form */}
            <div className="lg:sticky lg:top-24 h-fit">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg">
                <h2 className="text-lg font-semibold mb-6">Purchase Details</h2>

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
                      <div className="font-semibold text-sm">{market?.question}</div>
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
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-xs text-gray-700">
                        Your policy will be minted as an NFT. You can claim if the market resolves against you.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
