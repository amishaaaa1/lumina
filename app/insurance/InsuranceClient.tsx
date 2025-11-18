'use client';

import { useState, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Header } from '@/components/layout/Header';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useContractWrite } from '@/hooks/useContract';
import { formatUSD, parseTokenAmount } from '@/lib/utils';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { Shield, Search, TrendingUp, DollarSign } from 'lucide-react';

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
    category: 'Crypto',
  },
  {
    id: '4',
    token: 'Solana',
    symbol: 'SOL',
    question: 'SOL maintains above $200?',
    votes: 203,
    poolLiquidity: '$11.2M',
    currentPrice: '$178',
    premium: '3.9%',
    coverage: '$3.7M',
    category: 'Crypto',
  },
  {
    id: '5',
    token: 'Polkadot',
    symbol: 'DOT',
    question: 'DOT hits $15 by March?',
    votes: 91,
    poolLiquidity: '$5.4M',
    currentPrice: '$7.23',
    premium: '5.4%',
    coverage: '$1.8M',
    category: 'Crypto',
  },
  {
    id: '6',
    token: 'Chainlink',
    symbol: 'LINK',
    question: 'LINK reaches $40 in 2025?',
    votes: 167,
    poolLiquidity: '$8.9M',
    currentPrice: '$18.45',
    premium: '4.3%',
    coverage: '$2.9M',
    category: 'Crypto',
  },
  {
    id: '7',
    token: 'US Election',
    symbol: 'VOTE',
    question: 'Democrats win 2024?',
    votes: 456,
    poolLiquidity: '$24.1M',
    currentPrice: 'N/A',
    premium: '6.2%',
    coverage: '$8.4M',
    category: 'Politics',
  },
  {
    id: '8',
    token: 'Fed Rate',
    symbol: 'FED',
    question: 'Rate cut by March 2025?',
    votes: 312,
    poolLiquidity: '$15.7M',
    currentPrice: 'N/A',
    premium: '4.8%',
    coverage: '$5.1M',
    category: 'Politics',
  },
];

export default function InsuranceClient() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [coverageAmount, setCoverageAmount] = useState('');
  const [duration, setDuration] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'premium-low' | 'premium-high' | 'liquidity'>('premium-low');
  const [validationError, setValidationError] = useState<string>('');

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
    const filtered = MARKETS.filter((m) => {
      const matchesSearch =
        m.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.token.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || m.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });

    // Sorting
    filtered.sort((a, b) => {
      const premiumA = parseFloat(a.premium);
      const premiumB = parseFloat(b.premium);
      const liquidityA = parseFloat(a.poolLiquidity.replace(/[$M,K]/g, ''));
      const liquidityB = parseFloat(b.poolLiquidity.replace(/[$M,K]/g, ''));

      if (sortBy === 'premium-low') return premiumA - premiumB;
      if (sortBy === 'premium-high') return premiumB - premiumA;
      return liquidityB - liquidityA;
    });

    return filtered;
  }, [searchQuery, categoryFilter, sortBy]);

  const categories = ['all', ...Array.from(new Set(MARKETS.map((m) => m.category)))];

  const validateCoverage = (value: string) => {
    setValidationError('');
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setValidationError('Please enter a valid amount');
      return false;
    }
    if (num < 0.01) {
      setValidationError('Minimum coverage is 0.01 USDT');
      return false;
    }
    if (num > 100) {
      setValidationError('Maximum coverage is 100 USDT');
      return false;
    }
    return true;
  };

  const handleBuy = async () => {
    if (!selectedMarket || !premium || !address || !coverageAmount) return;
    if (!validateCoverage(coverageAmount)) return;

    const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);
    const amount = parseTokenAmount(coverageAmount);

    try {
      await write({
        ...ASSET_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.PolicyManager.address, premium],
      });

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
              <Shield className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect to view and purchase insurance
            </p>
            <button
              onClick={openConnectModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Markets</h1>
            <p className="text-gray-600">Protect your prediction market positions</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Protected</span>
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">$42.8M</div>
              <div className="text-xs text-green-600 mt-1">+12.5% this week</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Active Policies</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">1,247</div>
              <div className="text-xs text-blue-600 mt-1">+8.3% this week</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Avg Premium</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">4.2%</div>
              <div className="text-xs text-gray-500 mt-1">Competitive rates</div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search markets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    aria-label="Search markets"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'premium-low' | 'premium-high' | 'liquidity')}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white"
                  aria-label="Sort markets"
                >
                  <option value="premium-low">Lowest Premium</option>
                  <option value="premium-high">Highest Premium</option>
                  <option value="liquidity">Highest Liquidity</option>
                </select>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      categoryFilter === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                    aria-pressed={categoryFilter === cat}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Markets Grid */}
          {filteredMarkets.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-200">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No markets found</h3>
              <p className="text-gray-600 mb-4">
                Try adjusting your search or filters
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMarkets.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMarket(m.id);
                  setShowPurchaseModal(true);
                }}
                className="bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-500 hover:scale-105 text-left group"
              >
                <div className="space-y-4">
                  {/* Token Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                      {m.symbol.substring(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900">{m.token}</h3>
                      <p className="text-xs text-gray-500">{m.symbol}</p>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-semibold text-gray-900 min-h-[44px] leading-snug">
                    {m.question}
                  </p>

                  {/* Stats - 4 important ones */}
                  <div className="space-y-2.5 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Current Price</span>
                      <span className="text-sm font-bold text-gray-900">{m.currentPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Premium</span>
                      <span className="text-sm font-bold text-green-600">{m.premium}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Pool Liquidity</span>
                      <span className="text-sm font-bold text-gray-900">{m.poolLiquidity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Coverage Available</span>
                      <span className="text-sm font-bold text-gray-900">{m.coverage}</span>
                    </div>
                  </div>

                  {/* Button */}
                  <div className="pt-2">
                    <div className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all text-center shadow-md group-hover:shadow-lg">
                      Insure Position
                    </div>
                  </div>
                </div>
              </button>
              ))}
            </div>
          )}

        </div>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedMarket && market && (
        <Modal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedMarket(null);
            setCoverageAmount('');
          }}
          title="Purchase Insurance"
        >
          <div className="space-y-6">
            {/* Selected market */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-xs text-blue-600 font-medium mb-1">SELECTED MARKET</div>
              <div className="font-semibold text-sm">{market.question}</div>
              <div className="text-xs text-gray-600 mt-1">{market.token} ({market.symbol})</div>
            </div>

            {/* Coverage input */}
            <div>
              <label className="block text-sm font-medium mb-2">Coverage Amount (USDT)</label>
              <input
                type="number"
                value={coverageAmount}
                onChange={(e) => {
                  setCoverageAmount(e.target.value);
                  if (e.target.value) validateCoverage(e.target.value);
                }}
                placeholder="100"
                min="0.01"
                max="100"
                step="0.01"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors",
                  validationError ? "border-red-500" : "border-gray-300"
                )}
                aria-label="Coverage amount"
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "coverage-error" : undefined}
              />
              {validationError ? (
                <p id="coverage-error" className="text-xs text-red-600 mt-1">{validationError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Min: 0.01 USDT • Max: 100 USDT</p>
              )}
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBuy}
                disabled={!coverageAmount || !!validationError || isPending || isConfirming || premiumLoading}
                className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                aria-label="Buy insurance"
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
              <button
                onClick={() => {
                  setShowPurchaseModal(false);
                  setSelectedMarket(null);
                  setCoverageAmount('');
                  setValidationError('');
                }}
                className="px-6 py-4 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="Cancel"
              >
                Cancel
              </button>
            </div>

            {/* Info */}
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-700">
                Your policy will be minted as an NFT. You can claim if the market resolves against you.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
