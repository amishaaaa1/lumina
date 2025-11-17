'use client';

import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Droplet, 
  BarChart3,
  Shield,
  Zap,
  Users,
  DollarSign,
  Activity,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface Pool {
  id: string;
  name: string;
  category: string;
  tvl: number;
  apy: number;
  apyChange: number;
  utilization: number;
  volume24h: number;
  providers: number;
  risk: 'low' | 'medium' | 'high';
  assets: string[];
  premiums30d: number;
  claims30d: number;
  apyHistory: number[];
}

const POOLS: Pool[] = [
  {
    id: '1',
    name: 'Crypto Markets',
    category: 'Crypto',
    tvl: 3800000,
    apy: 28.5,
    apyChange: 2.3,
    utilization: 71,
    volume24h: 284000,
    providers: 234,
    risk: 'medium',
    assets: ['USDT', 'USDC'],
    premiums30d: 108300,
    claims30d: 45200,
    apyHistory: [24.2, 25.8, 27.1, 26.5, 28.9, 27.3, 28.5],
  },
  {
    id: '2',
    name: 'Politics Markets',
    category: 'Politics',
    tvl: 2400000,
    apy: 35.2,
    apyChange: -1.8,
    utilization: 78,
    volume24h: 196000,
    providers: 187,
    risk: 'high',
    assets: ['USDT', 'USDC'],
    premiums30d: 84480,
    claims30d: 38900,
    apyHistory: [32.1, 33.5, 34.8, 36.2, 35.9, 34.7, 35.2],
  },
  {
    id: '3',
    name: 'Sports Markets',
    category: 'Sports',
    tvl: 1900000,
    apy: 31.8,
    apyChange: 4.1,
    utilization: 65,
    volume24h: 142000,
    providers: 156,
    risk: 'medium',
    assets: ['USDT', 'USDC'],
    premiums30d: 60420,
    claims30d: 28100,
    apyHistory: [29.5, 30.2, 31.1, 30.8, 32.3, 31.5, 31.8],
  },
  {
    id: '4',
    name: 'Stablecoin Markets',
    category: 'Stablecoins',
    tvl: 5200000,
    apy: 24.7,
    apyChange: 0.9,
    utilization: 58,
    volume24h: 318000,
    providers: 312,
    risk: 'low',
    assets: ['USDT', 'USDC', 'DAI'],
    premiums30d: 128440,
    claims30d: 52300,
    apyHistory: [23.1, 23.8, 24.5, 24.2, 25.1, 24.9, 24.7],
  },
];

export default function PoolsClient() {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { toasts, dismissToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'volume'>('apy');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const categories = ['all', ...Array.from(new Set(POOLS.map(p => p.category)))];

  const filteredPools = useMemo(() => {
    let filtered = POOLS;

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'apy') comparison = a.apy - b.apy;
      else if (sortBy === 'tvl') comparison = a.tvl - b.tvl;
      else comparison = a.volume24h - b.volume24h;
      
      return sortDirection === 'desc' ? -comparison : comparison;
    });
  }, [searchQuery, selectedCategory, sortBy, sortDirection]);

  const totalStats = useMemo(() => ({
    totalTVL: POOLS.reduce((sum, p) => sum + p.tvl, 0),
    avgAPY: POOLS.reduce((sum, p) => sum + p.apy, 0) / POOLS.length,
    totalVolume: POOLS.reduce((sum, p) => sum + p.volume24h, 0),
    totalProviders: POOLS.reduce((sum, p) => sum + p.providers, 0),
  }), []);

  const handleSort = (column: 'apy' | 'tvl' | 'volume') => {
    if (sortBy === column) {
      setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortDirection('desc');
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
    return `$${num.toFixed(0)}`;
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'low') return 'text-green-600 bg-green-50';
    if (risk === 'medium') return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const MiniChart = ({ data }: { data: number[] }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 60;
      const y = 20 - ((value - min) / range) * 15;
      return `${x},${y}`;
    }).join(' ');
    
    const isUp = data[data.length - 1] > data[0];
    
    return (
      <svg width="60" height="20" className="inline-block">
        <polyline
          points={points}
          fill="none"
          stroke={isUp ? '#10b981' : '#ef4444'}
          strokeWidth="2"
        />
      </svg>
    );
  };

  if (!isConnected) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-16">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Droplet className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect your wallet to view and manage liquidity pools
            </p>
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
      <main className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Liquidity Pools</h1>
            <p className="text-gray-600">Provide liquidity and earn yield from insurance premiums</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Value Locked</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(totalStats.totalTVL)}
              </div>
              <div className="text-xs text-green-600 mt-1">+12.5% this month</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average APY</span>
                <TrendingUp className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalStats.avgAPY.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">Across all pools</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">24h Volume</span>
                <Activity className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(totalStats.totalVolume)}
              </div>
              <div className="text-xs text-blue-600 mt-1">+8.3% vs yesterday</div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Liquidity Providers</span>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {totalStats.totalProviders}
              </div>
              <div className="text-xs text-gray-500 mt-1">Active providers</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search pools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    )}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pools Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pool
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('apy')}
                    >
                      <div className="flex items-center gap-1">
                        APY
                        {sortBy === 'apy' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('tvl')}
                    >
                      <div className="flex items-center gap-1">
                        TVL
                        {sortBy === 'tvl' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th 
                      className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700"
                      onClick={() => handleSort('volume')}
                    >
                      <div className="flex items-center gap-1">
                        24h Volume
                        {sortBy === 'volume' && (
                          sortDirection === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPools.map((pool) => (
                    <tr 
                      key={pool.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedPool(pool)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {pool.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{pool.name}</div>
                            <div className="text-sm text-gray-500">{pool.providers} providers</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-gray-900">{pool.apy.toFixed(1)}%</span>
                          <div className="flex items-center gap-1">
                            {pool.apyChange > 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-600" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600" />
                            )}
                            <span className={cn(
                              'text-xs font-medium',
                              pool.apyChange > 0 ? 'text-green-600' : 'text-red-600'
                            )}>
                              {Math.abs(pool.apyChange).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <MiniChart data={pool.apyHistory} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{formatNumber(pool.tvl)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden w-20">
                            <div
                              className={cn(
                                'h-full rounded-full',
                                pool.utilization < 70 ? 'bg-green-500' :
                                pool.utilization < 80 ? 'bg-yellow-500' : 'bg-red-500'
                              )}
                              style={{ width: `${pool.utilization}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700">{pool.utilization}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{formatNumber(pool.volume24h)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'px-3 py-1 rounded-full text-xs font-semibold',
                          getRiskColor(pool.risk)
                        )}>
                          {pool.risk.charAt(0).toUpperCase() + pool.risk.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedPool(pool);
                            setShowDepositModal(true);
                          }}
                        >
                          Deposit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Pool Details Modal */}
      {selectedPool && !showDepositModal && (
        <Modal
          isOpen={!!selectedPool}
          onClose={() => setSelectedPool(null)}
          title={selectedPool.name}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Current APY</div>
                <div className="text-2xl font-bold text-gray-900">{selectedPool.apy.toFixed(1)}%</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Total Value Locked</div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedPool.tvl)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">24h Volume</div>
                <div className="text-2xl font-bold text-gray-900">{formatNumber(selectedPool.volume24h)}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Utilization</div>
                <div className="text-2xl font-bold text-gray-900">{selectedPool.utilization}%</div>
              </div>
            </div>

            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Supported Assets</div>
              <div className="flex gap-2">
                {selectedPool.assets.map((asset) => (
                  <span key={asset} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                    {asset}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={() => setShowDepositModal(true)}
              >
                Deposit Liquidity
              </Button>
              <Button
                variant="secondary"
                onClick={() => setSelectedPool(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Deposit Modal */}
      {showDepositModal && selectedPool && (
        <Modal
          isOpen={showDepositModal}
          onClose={() => {
            setShowDepositModal(false);
            setDepositAmount('');
          }}
          title={`Deposit to ${selectedPool.name}`}
        >
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current APY</span>
                <span className="text-lg font-bold text-blue-600">{selectedPool.apy.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pool Utilization</span>
                <span className="text-sm font-semibold text-gray-900">{selectedPool.utilization}%</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Amount
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="text-lg"
              />
              <div className="flex gap-2 mt-2">
                {['25', '50', '75', '100'].map((pct) => (
                  <button
                    key={pct}
                    className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    onClick={() => setDepositAmount((1000 * parseInt(pct) / 100).toString())}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-sm font-medium text-gray-700 mb-3">Projected Earnings</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Daily</span>
                    <span className="font-semibold">${(parseFloat(depositAmount) * selectedPool.apy / 100 / 365).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly</span>
                    <span className="font-semibold">${(parseFloat(depositAmount) * selectedPool.apy / 100 / 12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Yearly</span>
                    <span className="font-bold text-purple-600">${(parseFloat(depositAmount) * selectedPool.apy / 100).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1"
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
              >
                Confirm Deposit
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDepositModal(false);
                  setDepositAmount('');
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
