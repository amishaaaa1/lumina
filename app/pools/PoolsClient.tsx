'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { Clock, Users, DollarSign, Search, Vote as VoteIcon, TrendingUp, Award, AlertCircle } from 'lucide-react';
import { api, type Market } from '@/lib/api';

type MarketStatus = 'upcoming' | 'voting' | 'freeze' | 'in-progress' | 'finished';

const FALLBACK_MARKETS: Market[] = [
  {
    id: '1',
    question: 'Will BTC hit $120K by Q2 2025?',
    category: 'Crypto',
    status: 'voting',
    icon: '₿',
    votes: 234,
    volumeUSD: 18400,
    yesPercentage: 68,
    noPercentage: 32,
    endDate: '15 Mar 2025',
    riskScore: 6200,
    aiConfidence: 7500,
  },
  {
    id: '2',
    question: 'Will ETH flip $5K before June 2025?',
    category: 'Crypto',
    status: 'voting',
    icon: 'Ξ',
    votes: 187,
    volumeUSD: 14200,
    yesPercentage: 58,
    noPercentage: 42,
    endDate: '01 Jun 2025',
    riskScore: 5800,
    aiConfidence: 7200,
  },
  {
    id: '3',
    question: 'Will SOL maintain above $200 in Q1?',
    category: 'Crypto',
    status: 'in-progress',
    icon: '◎',
    votes: 203,
    volumeUSD: 11200,
    yesPercentage: 45,
    noPercentage: 55,
    endDate: '31 Mar 2025',
    riskScore: 6500,
    aiConfidence: 6800,
  },
  {
    id: '4',
    question: 'Will Trump win 2024 US Election?',
    category: 'Politics',
    status: 'finished',
    icon: '🗳️',
    votes: 892,
    volumeUSD: 45600,
    yesPercentage: 52,
    noPercentage: 48,
    endDate: '05 Nov 2024',
    multiplier: 1.92,
    result: 'yes',
    riskScore: 4200,
    aiConfidence: 9100,
  },
  {
    id: '5',
    question: 'Will Fed cut rates by March 2025?',
    category: 'Politics',
    status: 'voting',
    icon: '🏦',
    votes: 312,
    volumeUSD: 15700,
    yesPercentage: 73,
    noPercentage: 27,
    endDate: '20 Mar 2025',
    riskScore: 3800,
    aiConfidence: 8200,
  },
  {
    id: '6',
    question: 'Will ADA break $1.50 in 2025?',
    category: 'Crypto',
    status: 'upcoming',
    icon: '₳',
    votes: 0,
    volumeUSD: 0,
    yesPercentage: 0,
    noPercentage: 0,
    endDate: '31 Dec 2025',
    riskScore: 7200,
    aiConfidence: 5500,
  },
  {
    id: '7',
    question: 'Will LINK reach $40 in 2025?',
    category: 'Crypto',
    status: 'voting',
    icon: '🔗',
    votes: 167,
    volumeUSD: 8900,
    yesPercentage: 61,
    noPercentage: 39,
    endDate: '31 Dec 2025',
    riskScore: 5400,
    aiConfidence: 7100,
  },
  {
    id: '8',
    question: 'Will DOT hit $15 by March 2025?',
    category: 'Crypto',
    status: 'freeze',
    icon: '●',
    votes: 91,
    volumeUSD: 5400,
    yesPercentage: 44,
    noPercentage: 56,
    endDate: '15 Mar 2025',
    riskScore: 6100,
    aiConfidence: 6500,
  },
];

export default function PoolsClient() {
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { toasts, dismissToast } = useToast();

  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [voteChoice, setVoteChoice] = useState<'yes' | 'no' | null>(null);
  const [voteAmount, setVoteAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MarketStatus | 'all'>('all');

  // Fetch markets from API
  useEffect(() => {
    async function fetchMarkets() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getMarkets();
        setMarkets(data);
      } catch (err) {
        console.error('Failed to fetch markets:', err);
        // Use fallback data if API is not available
        console.log('Using fallback markets:', FALLBACK_MARKETS.length, 'markets');
        setError('Backend API not running. Using demo data. Start backend with: cd backend && npm run dev');
        setMarkets(FALLBACK_MARKETS);
      } finally {
        setLoading(false);
      }
    }

    fetchMarkets();
    
    // Refresh every 30 seconds (only if API is working)
    const interval = setInterval(() => {
      if (!error) fetchMarkets();
    }, 30000);
    return () => clearInterval(interval);
  }, [error]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const matchesSearch =
        market.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || market.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [markets, searchQuery, statusFilter]);

  const getStatusBadge = (status: MarketStatus) => {
    const styles = {
      upcoming: 'bg-gray-100 text-gray-700 border border-gray-300',
      voting: 'bg-blue-50 text-blue-700 border border-blue-200',
      freeze: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      'in-progress': 'bg-purple-50 text-purple-700 border border-purple-200',
      finished: 'bg-green-50 text-green-700 border border-green-200',
    };
    return styles[status];
  };

  const handleVote = (market: Market, choice: 'yes' | 'no') => {
    setSelectedMarket(market);
    setVoteChoice(choice);
    setShowVoteModal(true);
  };

  if (!isConnected) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <VoteIcon className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to vote on prediction markets</p>
            <Button onClick={openConnectModal} size="lg">
              Connect Wallet
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Prediction Markets</h1>
            <p className="text-gray-600">Vote, earn rewards, protect with insurance</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <VoteIcon className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-gray-500">Markets</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{markets.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-purple-600" />
                <div className="text-xs text-gray-500">Votes</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(markets.reduce((sum, m) => sum + m.votes, 0))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div className="text-xs text-gray-500">Volume</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${formatNumber(markets.reduce((sum, m) => sum + m.volumeUSD, 0))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <div className="text-xs text-gray-500">Active</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {markets.filter((m) => m.status === 'voting').length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {(['all', 'voting', 'finished'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                      statusFilter === status
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="w-5 h-5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {/* Markets Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMarkets.map((market) => (
              <div
                key={market.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all overflow-hidden group"
              >
                {/* Card Content */}
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-md">
                        {market.icon}
                      </div>
                      <div>
                        <Badge className={cn('text-xs font-medium', getStatusBadge(market.status as MarketStatus))}>
                          {market.status === 'in-progress' ? 'In progress' : market.status}
                        </Badge>
                      </div>
                    </div>
                    {market.status === 'finished' && market.multiplier && (
                      <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                        <Award className="w-3 h-3" />
                        {market.multiplier}x
                      </div>
                    )}
                  </div>

                  {/* Question */}
                  <h3 className="text-base font-bold text-gray-900 mb-3 leading-snug min-h-[44px] group-hover:text-blue-600 transition-colors">
                    {market.question}
                  </h3>

                  {/* Stats Row */}
                  <div className="flex items-center justify-between text-xs mb-3">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="w-3.5 h-3.5" />
                      <span className="font-medium">{market.votes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span className="font-medium">${formatNumber(market.volumeUSD)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">{market.endDate.split(' ')[0]}</span>
                    </div>
                  </div>

                  {/* Voting Progress */}
                  {market.status !== 'upcoming' && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-green-600">{market.yesPercentage}% Yes</span>
                        <span className="text-red-600">{market.noPercentage}% No</span>
                      </div>
                      <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all"
                          style={{ width: `${market.yesPercentage}%` }}
                        />
                        <div
                          className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 transition-all"
                          style={{ width: `${market.noPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Finished Result */}
                  {market.status === 'finished' && market.result && (
                    <div
                      className={cn(
                        'mt-3 py-2.5 px-3 rounded-lg text-center font-bold text-sm shadow-sm',
                        market.result === 'yes'
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                          : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
                      )}
                    >
                      ✓ {market.result.toUpperCase()} WON
                    </div>
                  )}
                </div>

                {/* Action Footer */}
                {market.status === 'voting' && (
                  <div className="grid grid-cols-2 border-t border-gray-100">
                    <button
                      onClick={() => handleVote(market, 'yes')}
                      className="py-3.5 bg-green-50 hover:bg-green-100 text-green-700 text-sm font-bold transition-all border-r border-gray-100 active:scale-95"
                    >
                      Yes
                    </button>
                    <button
                      onClick={() => handleVote(market, 'no')}
                      className="py-3.5 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-bold transition-all active:scale-95"
                    >
                      No
                    </button>
                  </div>
                )}
                {market.status === 'upcoming' && (
                  <div className="py-3 bg-gray-50 border-t border-gray-100 text-center text-xs text-gray-500 font-medium">
                    Coming soon
                  </div>
                )}
                {(market.status === 'freeze' || market.status === 'in-progress') && (
                  <div className="py-3 bg-yellow-50 border-t border-yellow-100 text-center text-xs text-yellow-700 font-semibold">
                    Voting closed
                  </div>
                )}
                {market.status === 'finished' && (
                  <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 border-t border-gray-100 text-center text-xs text-gray-700 font-semibold transition-colors">
                    View details
                  </button>
                )}
              </div>
            ))}
            </div>
          )}

          {/* Empty State */}
          {filteredMarkets.length === 0 && (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No markets found</h3>
              <p className="text-gray-600 mb-6">Try different search terms or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Vote Modal */}
      {showVoteModal && selectedMarket && voteChoice && (
        <Modal
          isOpen={showVoteModal}
          onClose={() => {
            setShowVoteModal(false);
            setSelectedMarket(null);
            setVoteChoice(null);
            setVoteAmount('');
          }}
          title={`Vote ${voteChoice.toUpperCase()}`}
        >
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-xs text-blue-600 font-semibold mb-1">MARKET</div>
              <div className="font-bold text-sm text-gray-900">{selectedMarket.question}</div>
            </div>

            <div
              className={cn(
                'p-6 rounded-xl border-2',
                voteChoice === 'yes'
                  ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                  : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
              )}
            >
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Your vote</div>
                <div
                  className={cn(
                    'text-4xl font-black',
                    voteChoice === 'yes' ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {voteChoice.toUpperCase()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Bet Amount (USDT)
              </label>
              <input
                type="number"
                value={voteAmount}
                onChange={(e) => setVoteAmount(e.target.value)}
                placeholder="100"
                min="1"
                className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">Minimum: 1 USDT</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your bet</span>
                <span className="font-bold text-gray-900">${voteAmount || '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Potential return</span>
                <span className="font-bold text-green-600">
                  ${voteAmount ? (parseFloat(voteAmount) * 1.8).toFixed(2) : '0'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">Multiplier</span>
                <span className="text-lg font-black text-blue-600">1.8x</span>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <span className="font-bold">💡 Pro tip:</span> Protect your bet with insurance! Visit
                the Insurance page after voting.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button className="flex-1" disabled={!voteAmount || parseFloat(voteAmount) < 1}>
                Confirm Vote
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowVoteModal(false);
                  setSelectedMarket(null);
                  setVoteChoice(null);
                  setVoteAmount('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => dismissToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}
