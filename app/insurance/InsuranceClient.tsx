'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseUnits } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatUSD, parseTokenAmount } from '@/lib/utils';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { Shield, Search, TrendingUp, DollarSign } from 'lucide-react';

const MARKETS = [
  {
    id: '1',
    token: 'Bitcoin',
    symbol: 'BTC',
    logo: '₿',
    logoColor: 'from-orange-500 to-yellow-500',
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
    logo: 'Ξ',
    logoColor: 'from-blue-500 to-purple-500',
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
    logo: '₳',
    logoColor: 'from-blue-600 to-cyan-500',
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
    logo: '◎',
    logoColor: 'from-purple-500 to-pink-500',
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
    logo: '●',
    logoColor: 'from-pink-500 to-rose-500',
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
    logo: '⬡',
    logoColor: 'from-blue-600 to-indigo-600',
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
    logo: '🗳',
    logoColor: 'from-red-500 to-blue-500',
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
    logo: '🏛',
    logoColor: 'from-green-600 to-emerald-600',
    question: 'Rate cut by March 2025?',
    votes: 312,
    poolLiquidity: '$15.7M',
    currentPrice: 'N/A',
    premium: '4.8%',
    coverage: '$5.1M',
    category: 'Politics',
  },
];

// Type definitions for future use when policies are displayed
// type PolicyStatus = 'Active' | 'Claimed' | 'Expired' | 'Claimable';

// interface UserPolicy {
//   id: bigint;
//   holder: string;
//   marketId: string;
//   coverageAmount: bigint;
//   premium: bigint;
//   startTime: bigint;
//   expiryTime: bigint;
//   status: number;
//   marketOutcomeHash: string;
// }

interface InsuranceClientProps {
  marketParam?: string | null;
}

export default function InsuranceClient({ marketParam }: InsuranceClientProps) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  // Removed my-policies tab - now in dashboard
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [coveragePercentage, setCoveragePercentage] = useState(50); // Default 50%
  const [duration, setDuration] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'premium-low' | 'premium-high' | 'liquidity'>('premium-low');
  const [validationError, setValidationError] = useState<string>('');
  // User policies will be fetched from backend when available
  // const [userPolicies, setUserPolicies] = useState<UserPolicy[]>([]);

  const market = MARKETS.find((m) => m.id === selectedMarket);

  // Calculate coverage amount based on bet amount and percentage
  const coverageAmount = useMemo(() => {
    if (!betAmount || parseFloat(betAmount) <= 0) return '0';
    const bet = parseFloat(betAmount);
    const coverage = (bet * coveragePercentage) / 100;
    return coverage.toFixed(2);
  }, [betAmount, coveragePercentage]);

  // Handle URL parameter to open modal automatically
  useEffect(() => {
    if (marketParam && isConnected) {
      const marketExists = MARKETS.find((m) => m.id === marketParam);
      if (marketExists) {
        // Use setTimeout to avoid setState during render
        setTimeout(() => {
          setSelectedMarket(marketParam);
          setShowPurchaseModal(true);
        }, 0);
      }
    }
  }, [marketParam, isConnected]);

  const { data: premium, isLoading: premiumLoading } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'calculatePremium',
    args:
      selectedMarket && coverageAmount && parseFloat(coverageAmount) > 0
        ? [selectedMarket, parseTokenAmount(coverageAmount)]
        : undefined,
  });

  // Fetch USDT token balance
  const { data: usdtBalance, isLoading: isUsdtBalanceLoading } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Fetch native BNB balance
  const { data: nativeBalance, isLoading: isNativeBalanceLoading } = useBalance({
    address: address,
  });

  const { showToast } = useToast();
  const { writeContract: approveToken, data: approveHash, error: approveError, isPending: isApprovePending } = useWriteContract();
  const { writeContract: createPolicy, data: policyHash, error: createError, isPending: isCreatePending } = useWriteContract();
  // Claim contract write - will be used when claim feature is implemented
  // const { writeContract: claimPolicy, data: claimHash } = useWriteContract();
  
  const { isLoading: isApproving } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isCreating, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ hash: policyHash });
  // Claim transaction receipt - will be used when claim feature is implemented
  // const { isLoading: isClaiming } = useWaitForTransactionReceipt({ hash: claimHash });

  const error = approveError || createError;
  const isPending = isApprovePending || isCreatePending || isApproving;
  const isConfirming = isCreating;
  const isSuccess = isCreateSuccess;

  // Fetch user's policy IDs - will be used when displaying user policies
  const { refetch: refetchPolicyIds } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'getUserPolicies',
    args: address ? [address] : undefined,
  });

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

  // Fetch individual policy details - will be implemented when backend is ready
  // useEffect(() => {
  //   const fetchPolicies = async () => {
  //     if (!policyIds || policyIds.length === 0) {
  //       setUserPolicies([]);
  //       return;
  //     }

  //     const policies: UserPolicy[] = [];
  //     for (const id of policyIds as bigint[]) {
  //       try {
  //         // In a real app, you'd batch these calls
  //         // For now, we'll just show the structure
  //         policies.push({
  //           id,
  //           holder: address || '',
  //           marketId: `market-${id}`,
  //           coverageAmount: BigInt(0),
  //           premium: BigInt(0),
  //           startTime: BigInt(0),
  //           expiryTime: BigInt(0),
  //           status: 0,
  //           marketOutcomeHash: '',
  //         });
  //       } catch (err) {
  //         console.error(`Failed to fetch policy ${id}:`, err);
  //       }
  //     }
  //     setUserPolicies(policies);
  //   };

  //   fetchPolicies();
  // }, [policyIds, address]);

  // Helper functions for policy status - will be used when policies are displayed
  // const currentTime = useMemo(() => BigInt(Math.floor(Date.now() / 1000)), []);

  // const getPolicyStatus = (policy: UserPolicy): PolicyStatus => {
  //   // Status from contract: 0 = Active, 1 = Claimed, 2 = Expired
  //   if (policy.status === 1) return 'Claimed';
  //   if (policy.status === 2) return 'Expired';
    
  //   // Check if expired
  //   if (currentTime > policy.expiryTime) return 'Expired';
    
  //   // Check if claimable (market resolved against user)
  //   // In production, check oracle for market resolution
  //   // For now, we'll mark as Active
  //   return 'Active';
  // };

  // const getStatusColor = (status: PolicyStatus) => {
  //   switch (status) {
  //     case 'Active':
  //       return 'text-blue-600 bg-blue-50 border-blue-200';
  //     case 'Claimable':
  //       return 'text-green-600 bg-green-50 border-green-200';
  //     case 'Claimed':
  //       return 'text-gray-600 bg-gray-50 border-gray-200';
  //     case 'Expired':
  //       return 'text-red-600 bg-red-50 border-red-200';
  //   }
  // };

  // const getStatusIcon = (status: PolicyStatus) => {
  //   switch (status) {
  //     case 'Active':
  //       return <Clock className="w-4 h-4" />;
  //     case 'Claimable':
  //       return <AlertCircle className="w-4 h-4" />;
  //     case 'Claimed':
  //       return <CheckCircle className="w-4 h-4" />;
  //     case 'Expired':
  //       return <XCircle className="w-4 h-4" />;
  //   }
  // };

  const validateBetAmount = (value: string) => {
    setValidationError('');
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) {
      setValidationError('Please enter a valid bet amount');
      return false;
    }
    if (num < 1) {
      setValidationError('Minimum bet amount is 1 USDT');
      return false;
    }
    if (num > 10000) {
      setValidationError('Maximum bet amount is 10,000 USDT');
      return false;
    }
    return true;
  };

  const handleBuy = async () => {
    if (!selectedMarket || !premium || !address || !betAmount || !coverageAmount) return;
    if (!validateBetAmount(betAmount)) return;
    if (!validateBetAmount(betAmount)) return;

    const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);
    const amount = parseUnits(coverageAmount, 18);
    const premiumAmount = premium as bigint;

    try {
      // Step 1: Approve premium
      showToast('Approving premium...', 'info');
      approveToken({
        ...ASSET_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.PolicyManager.address, premiumAmount],
      });

      // Wait for approval
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 2: Create policy
      showToast('Creating insurance policy...', 'info');
      createPolicy({
        ...CONTRACTS.PolicyManager,
        functionName: 'createPolicy',
        args: [address, selectedMarket, amount, premiumAmount, durationSeconds],
      });

      // Wait for transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      showToast('✅ Insurance policy created successfully!', 'success');
      setShowPurchaseModal(false);
      setBetAmount('');
      setCoveragePercentage(50);
      setValidationError('');
      refetchPolicyIds();
    } catch (err) {
      console.error('Transaction failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      showToast(errorMessage, 'error');
    }
  };

  // Claim function - will be used when claim feature is implemented
  // const handleClaim = async (policyId: bigint) => {
  //   if (!address) return;

  //   try {
  //     showToast('Submitting claim...', 'info');
  //     claimPolicy({
  //       ...CONTRACTS.PolicyManager,
  //       functionName: 'claimPolicy',
  //       args: [policyId],
  //     });

  //     // Wait for transaction
  //     await new Promise(resolve => setTimeout(resolve, 3000));

  //     showToast('✅ Claim successful! Payout sent to your wallet.', 'success');
  //     refetchPolicyIds();
  //   } catch (err) {
  //     console.error('Claim failed:', err);
  //     const errorMessage = err instanceof Error ? err.message : 'Claim failed';
  //     showToast(errorMessage, 'error');
  //   }
  // };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center px-4 py-32">
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
    );
  }

  return (
    <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Insurance</h1>
            <p className="text-gray-600">Protect your prediction market positions</p>
          </div>

          {/* Markets Section */}
          <>
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
                    <div className={cn(
                      "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform",
                      m.logoColor
                    )}>
                      {m.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900">{m.token}</h3>
                      <p className="text-xs text-gray-500">{m.symbol}</p>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-semibold text-gray-900 min-h-[44px] leading-snug mb-4">
                    {m.question}
                  </p>

                  {/* Stats - Simple List Style like reference */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Votes</span>
                      <span className="font-semibold text-gray-900">{m.votes}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Pool liquidity</span>
                      <span className="font-semibold text-gray-900">{m.poolLiquidity}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Current price</span>
                      <span className="font-semibold text-gray-900">{m.currentPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Premium</span>
                      <span className="font-bold text-green-600">{m.premium}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Coverage</span>
                      <span className="font-semibold text-gray-900">{m.coverage}</span>
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
            </>

        </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedMarket && market && (
        <Modal
          isOpen={showPurchaseModal}
          onClose={() => {
            setShowPurchaseModal(false);
            setSelectedMarket(null);
            setBetAmount('');
            setValidationError('');
          }}
          title="Purchase Insurance"
        >
          <div className="space-y-6">
            {/* Selected market */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="text-xs text-blue-600 font-medium mb-2">SELECTED MARKET</div>
              <div className="flex items-center gap-3 mb-2">
                <div className={cn(
                  "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg shadow-md",
                  market.logoColor
                )}>
                  {market.logo}
                </div>
                <div>
                  <div className="font-semibold text-sm">{market.question}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{market.token} ({market.symbol})</div>
                </div>
              </div>
            </div>

            {/* Bet Amount input */}
            <div>
              <label className="block text-sm font-medium mb-2">Your Bet Amount (USDT)</label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => {
                  setBetAmount(e.target.value);
                  if (e.target.value) validateBetAmount(e.target.value);
                }}
                placeholder="1000"
                min="1"
                max="10000"
                step="1"
                className={cn(
                  "w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors",
                  validationError ? "border-red-500" : "border-gray-300"
                )}
                aria-label="Bet amount"
                aria-invalid={!!validationError}
                aria-describedby={validationError ? "bet-error" : undefined}
              />
              {validationError ? (
                <p id="bet-error" className="text-xs text-red-600 mt-1">{validationError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Min: 1 USDT • Max: 10,000 USDT</p>
              )}
            </div>

            {/* Coverage Percentage Slider */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium">Coverage Level</label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-blue-600">{coveragePercentage}%</span>
                  {coveragePercentage === 50 && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                      Most Popular
                    </span>
                  )}
                </div>
              </div>
              
              {/* Slider */}
              <div className="relative">
                <input
                  type="range"
                  min="20"
                  max="70"
                  step="5"
                  value={coveragePercentage}
                  onChange={(e) => setCoveragePercentage(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #2563eb 0%, #2563eb ${((coveragePercentage - 20) / 50) * 100}%, #e5e7eb ${((coveragePercentage - 20) / 50) * 100}%, #e5e7eb 100%)`
                  }}
                  aria-label="Coverage percentage slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span className="flex flex-col items-start">
                    <span className="font-medium">20%</span>
                    <span className="text-[10px]">Lower cost</span>
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="font-medium">45%</span>
                    <span className="text-[10px]">Balanced</span>
                  </span>
                  <span className="flex flex-col items-end">
                    <span className="font-medium">70%</span>
                    <span className="text-[10px]">Max protection</span>
                  </span>
                </div>
              </div>

              {/* Coverage Info */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-semibold text-blue-900">
                        Protects ${coverageAmount} ({coveragePercentage}% of your bet)
                      </p>
                      <p className="text-xs text-blue-700">
                        If you lose, you&apos;ll get ${coverageAmount} back
                      </p>
                      <p className="text-xs text-blue-600">
                        Your max loss: ${(parseFloat(betAmount) - parseFloat(coverageAmount)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
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

            {premium && betAmount && !premiumLoading && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Your Bet</span>
                  <span className="font-semibold">${betAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coverage ({coveragePercentage}%)</span>
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
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              {/* Native BNB Balance */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Your BNB Balance:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {isNativeBalanceLoading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                    </span>
                  ) : nativeBalance ? (
                    <span>{parseFloat(nativeBalance.formatted).toFixed(4)} {nativeBalance.symbol}</span>
                  ) : (
                    <span className="text-gray-500">0.0000 BNB</span>
                  )}
                </span>
              </div>

              {/* USDT Balance */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Your USDT Balance:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {isUsdtBalanceLoading ? (
                    <span className="flex items-center gap-2">
                      <LoadingSpinner size="sm" />
                    </span>
                  ) : usdtBalance && usdtBalance > 0n ? (
                    formatUSD(usdtBalance)
                  ) : (
                    <span className="text-gray-500">$0.00</span>
                  )}
                </span>
              </div>

              {/* Help message if no USDT */}
              {!isUsdtBalanceLoading && (!usdtBalance || usdtBalance === 0n) && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-amber-600 mb-1">⚠️ You need USDT to purchase insurance</p>
                  <a
                    href="https://testnet.bnbchain.org/faucet-smart"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 underline"
                  >
                    Get testnet tokens →
                  </a>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error.message || 'Transaction failed'}</p>
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
                disabled={!betAmount || !!validationError || isPending || isConfirming || premiumLoading}
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
                  setBetAmount('');
                  setCoveragePercentage(50);
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
    </main>
  );
}
