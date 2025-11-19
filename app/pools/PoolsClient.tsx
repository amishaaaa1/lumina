'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks/useToast';
import { Toast } from '@/components/ui/Toast';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { cn } from '@/lib/utils';
import { Droplets, TrendingUp, DollarSign, Search, Shield, Percent, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';

interface InsurancePool {
  id: string;
  name: string;
  asset: string;
  icon: string;
  totalLiquidity: number;
  availableLiquidity: number;
  utilizationRate: number;
  apy: number;
  totalPremiums: number;
  totalClaims: number;
  lpCount: number;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'paused';
}

const FALLBACK_POOLS: InsurancePool[] = [
  {
    id: '1',
    name: 'USDT Insurance Pool',
    asset: 'USDT',
    icon: '💵',
    totalLiquidity: 2500000,
    availableLiquidity: 2100000,
    utilizationRate: 16,
    apy: 18.5,
    totalPremiums: 125000,
    totalClaims: 45000,
    lpCount: 234,
    riskLevel: 'low',
    status: 'active',
  },
  {
    id: '2',
    name: 'USDC Insurance Pool',
    asset: 'USDC',
    icon: '🔵',
    totalLiquidity: 1800000,
    availableLiquidity: 1500000,
    utilizationRate: 17,
    apy: 16.2,
    totalPremiums: 98000,
    totalClaims: 32000,
    lpCount: 187,
    riskLevel: 'low',
    status: 'active',
  },
  {
    id: '3',
    name: 'DAI Insurance Pool',
    asset: 'DAI',
    icon: '◈',
    totalLiquidity: 950000,
    availableLiquidity: 820000,
    utilizationRate: 14,
    apy: 14.8,
    totalPremiums: 52000,
    totalClaims: 18000,
    lpCount: 142,
    riskLevel: 'low',
    status: 'active',
  },
  {
    id: '4',
    name: 'ETH Insurance Pool',
    asset: 'ETH',
    icon: 'Ξ',
    totalLiquidity: 3200000,
    availableLiquidity: 2400000,
    utilizationRate: 25,
    apy: 22.4,
    totalPremiums: 185000,
    totalClaims: 78000,
    lpCount: 312,
    riskLevel: 'medium',
    status: 'active',
  },
  {
    id: '5',
    name: 'BTC Insurance Pool',
    asset: 'WBTC',
    icon: '₿',
    totalLiquidity: 4500000,
    availableLiquidity: 3200000,
    utilizationRate: 29,
    apy: 24.7,
    totalPremiums: 245000,
    totalClaims: 112000,
    lpCount: 428,
    riskLevel: 'medium',
    status: 'active',
  },
  {
    id: '6',
    name: 'BNB Insurance Pool',
    asset: 'BNB',
    icon: '🔶',
    totalLiquidity: 1200000,
    availableLiquidity: 850000,
    utilizationRate: 29,
    apy: 21.3,
    totalPremiums: 78000,
    totalClaims: 34000,
    lpCount: 156,
    riskLevel: 'medium',
    status: 'active',
  },
  {
    id: '7',
    name: 'SOL Insurance Pool',
    asset: 'SOL',
    icon: '◎',
    totalLiquidity: 890000,
    availableLiquidity: 580000,
    utilizationRate: 35,
    apy: 28.9,
    totalPremiums: 68000,
    totalClaims: 42000,
    lpCount: 98,
    riskLevel: 'high',
    status: 'active',
  },
  {
    id: '8',
    name: 'MATIC Insurance Pool',
    asset: 'MATIC',
    icon: '🟣',
    totalLiquidity: 650000,
    availableLiquidity: 480000,
    utilizationRate: 26,
    apy: 19.6,
    totalPremiums: 42000,
    totalClaims: 18000,
    lpCount: 87,
    riskLevel: 'medium',
    status: 'active',
  },
  {
    id: '9',
    name: 'AVAX Insurance Pool',
    asset: 'AVAX',
    icon: '🔺',
    totalLiquidity: 720000,
    availableLiquidity: 520000,
    utilizationRate: 28,
    apy: 23.1,
    totalPremiums: 48000,
    totalClaims: 22000,
    lpCount: 94,
    riskLevel: 'medium',
    status: 'active',
  },
  {
    id: '10',
    name: 'ARB Insurance Pool',
    asset: 'ARB',
    icon: '🔷',
    totalLiquidity: 580000,
    availableLiquidity: 420000,
    utilizationRate: 28,
    apy: 20.8,
    totalPremiums: 38000,
    totalClaims: 16000,
    lpCount: 76,
    riskLevel: 'medium',
    status: 'active',
  },
];

export default function PoolsClient() {
  const { isConnected, address } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { toasts, dismissToast, showToast } = useToast();

  const [pools, setPools] = useState<InsurancePool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPool, setSelectedPool] = useState<InsurancePool | null>(null);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  // Contract interactions
  const { writeContract: approveToken, data: approveHash, isPending: isApproving } = useWriteContract();
  const { writeContract: depositToPool, data: depositHash, isPending: isDepositing } = useWriteContract();
  const { writeContract: withdrawFromPool, data: withdrawHash, isPending: isWithdrawing } = useWriteContract();
  
  const { isLoading: isApproveTxLoading, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositTxLoading, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawTxLoading, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  const isProcessing = isApproving || isDepositing || isWithdrawing || isApproveTxLoading || isDepositTxLoading || isWithdrawTxLoading;

  // Fetch pools from API
  useEffect(() => {
    async function fetchPools() {
      try {
        setLoading(true);
        setError(null);
        // TODO: Create API endpoint for pools
        // const data = await api.getPools();
        // setPools(data);
        
        // Use fallback data for now
        console.log('Using fallback pools:', FALLBACK_POOLS.length, 'pools');
        setError('Backend API not running. Using demo data. Start backend with: cd backend && npm run dev');
        setPools(FALLBACK_POOLS);
      } catch (err) {
        console.error('Failed to fetch pools:', err);
        setError('Backend API not running. Using demo data.');
        setPools(FALLBACK_POOLS);
      } finally {
        setLoading(false);
      }
    }

    fetchPools();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      if (!error) fetchPools();
    }, 30000);
    return () => clearInterval(interval);
  }, [error]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const filteredPools = useMemo(() => {
    return pools.filter((pool) => {
      const matchesSearch =
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.asset.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRisk = riskFilter === 'all' || pool.riskLevel === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [pools, searchQuery, riskFilter]);

  const getRiskBadge = (risk: 'low' | 'medium' | 'high') => {
    const styles = {
      low: 'bg-green-50 text-green-700 border border-green-200',
      medium: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      high: 'bg-red-50 text-red-700 border border-red-200',
    };
    return styles[risk];
  };

  const handleDeposit = (pool: InsurancePool) => {
    setSelectedPool(pool);
    setShowDepositModal(true);
  };

  const handleWithdraw = (pool: InsurancePool) => {
    setSelectedPool(pool);
    setShowWithdrawModal(true);
  };

  // Handle successful transactions
  useEffect(() => {
    if (isDepositSuccess && depositAmount && selectedPool) {
      showToast(`✅ Successfully deposited ${depositAmount} ${selectedPool.asset}!`, 'success');
      setTimeout(() => {
        setShowDepositModal(false);
        setSelectedPool(null);
        setDepositAmount('');
      }, 1500);
    }
  }, [isDepositSuccess, depositAmount, selectedPool, showToast]);

  useEffect(() => {
    if (isWithdrawSuccess && withdrawAmount && selectedPool) {
      showToast(`✅ Successfully withdrew ${withdrawAmount} ${selectedPool.asset}!`, 'success');
      setTimeout(() => {
        setShowWithdrawModal(false);
        setSelectedPool(null);
        setWithdrawAmount('');
      }, 1500);
    }
  }, [isWithdrawSuccess, withdrawAmount, selectedPool, showToast]);

  const confirmDeposit = async () => {
    if (!selectedPool || !depositAmount || !address) return;
    
    try {
      const amount = parseUnits(depositAmount, 18); // Assuming 18 decimals
      
      // Step 1: Approve token spending
      showToast('Step 1/2: Approve token spending...', 'info');
      approveToken({
        ...ASSET_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.InsurancePool.address, amount],
      });
      
      // Wait for approval before depositing
      // The deposit will be triggered after approval success
    } catch (error) {
      console.error('Deposit failed:', error);
      showToast('❌ Transaction failed. Please try again.', 'error');
    }
  };

  // Trigger deposit after approval
  useEffect(() => {
    if (isApproveSuccess && depositAmount && selectedPool) {
      const amount = parseUnits(depositAmount, 18);
      showToast('Step 2/2: Depositing to pool...', 'info');
      depositToPool({
        ...CONTRACTS.InsurancePool,
        functionName: 'deposit',
        args: [amount],
      });
    }
  }, [isApproveSuccess, depositAmount, selectedPool, depositToPool, showToast]);

  const confirmWithdraw = async () => {
    if (!selectedPool || !withdrawAmount || !address) return;
    
    try {
      // For withdraw, we need shares amount, not token amount
      // In a real app, you'd calculate shares based on current share value
      // For now, we'll use the amount directly as shares
      const shares = parseUnits(withdrawAmount, 18);
      
      showToast('Please confirm withdrawal in MetaMask...', 'info');
      withdrawFromPool({
        ...CONTRACTS.InsurancePool,
        functionName: 'withdraw',
        args: [shares],
      });
    } catch (error) {
      console.error('Withdraw failed:', error);
      showToast('❌ Transaction failed. Please try again.', 'error');
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        
        {/* Background Effects */}
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl animate-orb-slow will-change-transform pointer-events-none" aria-hidden="true" />
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float-6s delay-0 will-change-transform pointer-events-none" aria-hidden="true" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float-8s delay-1s will-change-transform pointer-events-none" aria-hidden="true" />
          
          <div className="relative flex items-center justify-center px-4 py-32">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Droplets className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
              <p className="text-gray-600 mb-6">Connect your wallet to provide liquidity and earn APY</p>
              <Button onClick={openConnectModal} size="lg">
                Connect Wallet
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background Effects - Same as Landing Page */}
      <div className="relative">
        {/* Animated Gradient Orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl animate-orb-slow will-change-transform pointer-events-none" aria-hidden="true" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float-6s delay-0 will-change-transform pointer-events-none" aria-hidden="true" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float-8s delay-1s will-change-transform pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-float-7s delay-2s will-change-transform pointer-events-none" aria-hidden="true" />
        
        <main className="relative px-6 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance Pools</h1>
            <p className="text-gray-600">Provide liquidity, earn premiums, back prediction insurance</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Droplets className="w-4 h-4 text-blue-600" />
                <div className="text-xs text-gray-500">Total Pools</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">{pools.length}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <div className="text-xs text-gray-500">TVL</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ${formatNumber(pools.reduce((sum, p) => sum + p.totalLiquidity, 0))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="w-4 h-4 text-purple-600" />
                <div className="text-xs text-gray-500">Avg APY</div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {(pools.reduce((sum, p) => sum + p.apy, 0) / pools.length).toFixed(1)}%
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-orange-600" />
                <div className="text-xs text-gray-500">Total LPs</div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {formatNumber(pools.reduce((sum, p) => sum + p.lpCount, 0))}
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
                  placeholder="Search pools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto">
                {(['all', 'low', 'medium', 'high'] as const).map((risk) => (
                  <button
                    key={risk}
                    onClick={() => setRiskFilter(risk)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                      riskFilter === risk
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                    )}
                  >
                    {risk.charAt(0).toUpperCase() + risk.slice(1)} Risk
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

          {/* Pools Grid */}
          {!loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPools.map((pool) => (
              <div
                key={pool.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all overflow-hidden group"
              >
                {/* Card Content */}
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-md">
                        {pool.icon}
                      </div>
                      <div>
                        <Badge className={cn('text-xs font-medium', getRiskBadge(pool.riskLevel))}>
                          {pool.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm">
                      <TrendingUp className="w-3 h-3" />
                      {pool.apy}% APY
                    </div>
                  </div>

                  {/* Pool Name */}
                  <h3 className="text-base font-bold text-gray-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors">
                    {pool.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">{pool.asset}</p>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-blue-50 rounded-lg p-2.5">
                      <div className="text-xs text-blue-600 font-medium mb-0.5">TVL</div>
                      <div className="text-sm font-bold text-gray-900">${formatNumber(pool.totalLiquidity)}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2.5">
                      <div className="text-xs text-green-600 font-medium mb-0.5">Available</div>
                      <div className="text-sm font-bold text-gray-900">${formatNumber(pool.availableLiquidity)}</div>
                    </div>
                  </div>

                  {/* Utilization Bar */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-600 font-medium">Utilization</span>
                      <span className="font-bold text-gray-900">{pool.utilizationRate}%</span>
                    </div>
                    <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'absolute left-0 top-0 h-full transition-all',
                          pool.utilizationRate < 50 ? 'bg-gradient-to-r from-green-500 to-green-400' :
                          pool.utilizationRate < 75 ? 'bg-gradient-to-r from-yellow-500 to-yellow-400' :
                          'bg-gradient-to-r from-red-500 to-red-400'
                        )}
                        style={{ width: `${pool.utilizationRate}%` }}
                      />
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
                      <span className="font-medium">${formatNumber(pool.totalPremiums)} earned</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                      <span className="font-medium">${formatNumber(pool.totalClaims)} paid</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="grid grid-cols-2 border-t border-gray-100">
                  <button
                    onClick={() => handleDeposit(pool)}
                    className="py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold transition-all border-r border-gray-100 active:scale-95"
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => handleWithdraw(pool)}
                    className="py-3.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-bold transition-all active:scale-95"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Empty State */}
          {filteredPools.length === 0 && !loading && (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-200 shadow-sm">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No pools found</h3>
              <p className="text-gray-600 mb-6">Try different search terms or filters</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setRiskFilter('all');
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && selectedPool && (
        <Modal
          isOpen={showDepositModal}
          onClose={() => {
            setShowDepositModal(false);
            setSelectedPool(null);
            setDepositAmount('');
          }}
          title="Deposit Liquidity"
        >
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-xs text-blue-600 font-semibold mb-1">POOL</div>
              <div className="font-bold text-sm text-gray-900">{selectedPool.name}</div>
              <div className="text-xs text-gray-600 mt-1">{selectedPool.asset}</div>
            </div>

            <div className="p-6 rounded-xl border-2 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-2">Current APY</div>
                <div className="text-4xl font-black text-green-600">
                  {selectedPool.apy}%
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Deposit Amount ({selectedPool.asset})
              </label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="1000"
                min="1"
                className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">Minimum: 1 {selectedPool.asset}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Your deposit</span>
                <span className="font-bold text-gray-900">${depositAmount || '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Est. yearly earnings</span>
                <span className="font-bold text-green-600">
                  ${depositAmount ? (parseFloat(depositAmount) * selectedPool.apy / 100).toFixed(2) : '0'}
                </span>
              </div>
              <div className="pt-2 border-t border-gray-200 flex justify-between">
                <span className="text-sm font-semibold text-gray-700">APY</span>
                <span className="text-lg font-black text-blue-600">{selectedPool.apy}%</span>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900">
                <span className="font-bold">💡 Info:</span> Your funds will be used to back insurance policies. You earn premiums from policy holders.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                className="flex-1" 
                disabled={!depositAmount || parseFloat(depositAmount) < 1 || isProcessing}
                onClick={confirmDeposit}
              >
                {isProcessing ? 'Processing...' : 'Confirm Deposit'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDepositModal(false);
                  setSelectedPool(null);
                  setDepositAmount('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && selectedPool && (
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => {
            setShowWithdrawModal(false);
            setSelectedPool(null);
            setWithdrawAmount('');
          }}
          title="Withdraw Liquidity"
        >
          <div className="space-y-5">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-xs text-blue-600 font-semibold mb-1">POOL</div>
              <div className="font-bold text-sm text-gray-900">{selectedPool.name}</div>
              <div className="text-xs text-gray-600 mt-1">{selectedPool.asset}</div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700">
                Withdraw Amount ({selectedPool.asset})
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="1000"
                min="1"
                className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">Available: ${formatNumber(selectedPool.availableLiquidity)}</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl space-y-2.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Withdraw amount</span>
                <span className="font-bold text-gray-900">${withdrawAmount || '0'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Remaining balance</span>
                <span className="font-bold text-gray-900">
                  ${withdrawAmount ? Math.max(0, selectedPool.availableLiquidity - parseFloat(withdrawAmount)).toFixed(0) : formatNumber(selectedPool.availableLiquidity)}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-900">
                <span className="font-bold">⚠️ Note:</span> You can only withdraw available liquidity. Funds backing active policies are locked.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button 
                className="flex-1" 
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < 1 || parseFloat(withdrawAmount) > selectedPool.availableLiquidity || isProcessing}
                onClick={confirmWithdraw}
              >
                {isProcessing ? 'Processing...' : 'Confirm Withdraw'}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setSelectedPool(null);
                  setWithdrawAmount('');
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
    </div>
  );
}
