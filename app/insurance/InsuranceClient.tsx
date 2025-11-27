'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { formatUSD } from '@/lib/utils';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { cn } from '@/lib/utils';
import { Shield, Search, TrendingUp, DollarSign } from 'lucide-react';
import { usePolymarketData } from '@/hooks/usePolymarketData';
import { useRiskOracle } from '@/hooks/useRiskOracle';
import { AnimatedPrice } from '@/components/ui/AnimatedPrice';
import { getBNBPrice, convertUSDTtoBNB, formatTokenAmount } from '@/lib/priceOracle';

// Helper function to get icon based on category and title
const getCategoryIcon = (category: string, title?: string): string => {
  const categoryLower = category.toLowerCase();
  const titleLower = title?.toLowerCase() || '';
  
  // Check title for specific icons first
  if (titleLower.includes('bitcoin') || titleLower.includes('btc')) return '₿';
  if (titleLower.includes('ethereum') || titleLower.includes('eth')) return '⟠';
  if (titleLower.includes('solana') || titleLower.includes('sol')) return '◎';
  if (titleLower.includes('fed') || titleLower.includes('federal reserve')) return '🏦';
  if (titleLower.includes('trump')) return '🇺🇸';
  if (titleLower.includes('biden')) return '🇺🇸';
  if (titleLower.includes('election')) return '🗳️';
  
  // Fallback to category icons
  const icons: Record<string, string> = {
    'crypto': '₿',
    'cryptocurrency': '₿',
    'politics': '🗳️',
    'sports': '⚽',
    'tech': '💻',
    'technology': '💻',
    'finance': '💰',
    'business': '💼',
    'science': '🔬',
    'entertainment': '🎬',
    'other': '📊',
  };
  return icons[categoryLower] || '📊';
};

const getLogoColor = (category: string): string => {
  const colors: Record<string, string> = {
    'crypto': 'from-orange-500 to-yellow-500',
    'cryptocurrency': 'from-blue-500 to-purple-500',
    'politics': 'from-red-500 to-blue-500',
    'sports': 'from-green-500 to-emerald-500',
    'tech': 'from-purple-500 to-pink-500',
    'technology': 'from-blue-600 to-indigo-600',
    'finance': 'from-green-600 to-emerald-600',
    'business': 'from-gray-600 to-slate-600',
    'science': 'from-cyan-500 to-blue-500',
    'entertainment': 'from-pink-500 to-rose-500',
  };
  return colors[category.toLowerCase()] || 'from-gray-500 to-slate-500';
};

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

interface MarketWithSentiment {
  id: string;
  title: string;
  category: string;
  sentiment: {
    bullish: number;
    bearish: number;
  };
  volume: number;
  liquidity: number;
  endDate: string;
  icon: string;
  logoColor: string;
  poolLiquidity: string;
  votes: number;
  premium: string;
  coverage: string;
}

interface InsuranceClientProps {
  marketParam?: string | null;
}

export default function InsuranceClient({ marketParam }: InsuranceClientProps) {
  const { address, isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const [selectedMarket, setSelectedMarket] = useState<MarketWithSentiment | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [coveragePercentage, setCoveragePercentage] = useState(50);
  const [duration, setDuration] = useState('30');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'premium-low' | 'premium-high' | 'liquidity'>('premium-low');
  const [validationError, setValidationError] = useState<string>('');
  const [paymentToken, setPaymentToken] = useState<'USDT' | 'BNB'>('USDT'); // USDT only for now
  const [bnbPrice, setBnbPrice] = useState<number>(600); // Default price

  // Fetch BNB price on mount
  useEffect(() => {
    getBNBPrice().then(setBnbPrice);
  }, []);

  // Use Polymarket data with category filter
  const { markets: polymarketData, loading: marketsLoading } = usePolymarketData(categoryFilter === 'all' ? undefined : categoryFilter);

  // Transform Polymarket data to display format
  const transformedMarkets = useMemo(() => {
    return polymarketData.map((market) => ({
      ...market,
      icon: getCategoryIcon(market.category, market.title),
      logoColor: getLogoColor(market.category),
      poolLiquidity: `$${(market.liquidity / 1000000).toFixed(1)}M`,
      votes: market.insuredCount,
      premium: market.premium,
      coverage: `$${(market.volume * 0.3 / 1000000).toFixed(1)}M`,
    }));
  }, [polymarketData]);

  // AI Risk Oracle for selected market - memoized to prevent re-renders
  const riskOracleData = useMemo(() => {
    if (!selectedMarket) return null;
    return {
      marketId: selectedMarket.id,
      question: selectedMarket.title,
      yesOdds: selectedMarket.sentiment.bullish,
      noOdds: selectedMarket.sentiment.bearish,
      totalVolume: selectedMarket.volume,
      liquidity: selectedMarket.liquidity,
      timeToExpiry: selectedMarket.endDate ? 
        Math.max(0, (new Date(selectedMarket.endDate).getTime() - Date.now()) / (1000 * 60 * 60)) : 24,
      category: selectedMarket.category,
    };
  }, [selectedMarket]);
  
  const { assessment: riskAssessment, loading: riskLoading } = useRiskOracle(riskOracleData);

  // Calculate coverage amount based on bet amount and percentage
  const coverageAmount = useMemo(() => {
    if (!betAmount || parseFloat(betAmount) <= 0) return '0';
    const bet = parseFloat(betAmount);
    const coverage = (bet * coveragePercentage) / 100;
    return coverage.toFixed(2);
  }, [betAmount, coveragePercentage]);

  // Handle URL parameter to open modal automatically
  useEffect(() => {
    if (marketParam && isConnected && transformedMarkets.length > 0) {
      const marketExists = transformedMarkets.find((m) => m.id === marketParam);
      if (marketExists) {
        setTimeout(() => {
          setSelectedMarket(marketExists);
          setShowPurchaseModal(true);
        }, 0);
      }
    }
  }, [marketParam, isConnected, transformedMarkets]);

  // Calculate premium from AI or fallback (in USDT)
  const calculatedPremiumUSDT = useMemo(() => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      console.log('❌ No bet amount:', betAmount);
      return 0;
    }
    const amount = parseFloat(betAmount);
    const coverage = (amount * coveragePercentage) / 100;
    
    let premiumRate = 5; // Default 5%
    
    // Use AI-calculated premium rate if available
    if (riskAssessment) {
      premiumRate = riskAssessment.premiumRate;
    }
    
    const premium = coverage * (premiumRate / 100);
    
    console.log('💰 Premium Calculation:', {
      betAmount,
      amount,
      coveragePercentage,
      coverage,
      premiumRate,
      premium,
      riskAssessment: riskAssessment ? 'Available' : 'Using fallback',
    });
    
    // While loading or if AI fails, use fallback: 5% premium (reasonable default)
    return premium;
  }, [betAmount, coveragePercentage, riskAssessment]);

  // Convert premium to selected token
  const calculatedPremiumInToken = useMemo(() => {
    if (paymentToken === 'BNB') {
      return convertUSDTtoBNB(calculatedPremiumUSDT, bnbPrice);
    }
    return calculatedPremiumUSDT;
  }, [calculatedPremiumUSDT, paymentToken, bnbPrice]);

  const premium = calculatedPremiumUSDT > 0 ? parseUnits(calculatedPremiumUSDT.toFixed(6), 18) : undefined;
  const premiumLoading = false; // Don't block UI while AI is calculating

  // Fetch USDT token balance
  const { data: usdtBalance, isLoading: isUsdtBalanceLoading } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Fetch USDT allowance
  const { data: usdtAllowance, refetch: refetchAllowance } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.PolicyManager.address] : undefined,
  });

  // Check if user can use faucet
  const { data: faucetStatus } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'canUseFaucet',
    args: address ? [address] : undefined,
  });

  // Fetch native BNB balance
  const { data: nativeBalance, isLoading: isNativeBalanceLoading } = useBalance({
    address: address,
  });

  const { showToast } = useToast();
  const { writeContract: approveToken, data: approveHash, error: approveError, isPending: isApprovePending } = useWriteContract();
  const { writeContract: createPolicy, data: policyHash, error: createError, isPending: isCreatePending } = useWriteContract();
  const { writeContract: requestFaucet, data: faucetHash, isPending: isFaucetPending } = useWriteContract();
  // Claim contract write - will be used when claim feature is implemented
  // const { writeContract: claimPolicy, data: claimHash } = useWriteContract();
  
  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isCreating, isSuccess: isCreateSuccess } = useWaitForTransactionReceipt({ hash: policyHash });
  const { isLoading: isFauceting, isSuccess: isFaucetSuccess } = useWaitForTransactionReceipt({ hash: faucetHash });
  // Claim transaction receipt - will be used when claim feature is implemented
  // const { isLoading: isClaiming } = useWaitForTransactionReceipt({ hash: claimHash });

  const error = approveError || createError;
  const isPending = isApprovePending || isCreatePending || isApproving;
  const isConfirming = isCreating;

  // Auto-create policy after approval success
  useEffect(() => {
    if (isApproveSuccess && selectedMarket && premium && address && betAmount && coverageAmount && calculatedPremiumUSDT > 0) {
      // Refetch allowance first
      refetchAllowance().then(() => {
        const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);
        const amount = parseUnits(coverageAmount, 18);
        // Use the same calculation as handleBuy for USDT
        const premiumAmount = parseUnits(Math.max(0.01, calculatedPremiumUSDT).toFixed(6), 18);
        // CRITICAL FIX: Ensure marketId is always a string
        const marketIdString = String(selectedMarket.id);

        console.log('📝 Auto-creating Policy after approval:', {
          premiumAmount: premiumAmount.toString(),
          calculatedPremiumUSDT,
        });

        showToast('Step 2/2: Creating insurance policy...', 'info');
        createPolicy({
          ...CONTRACTS.PolicyManager,
          functionName: 'createPolicy',
          args: [address, marketIdString, amount, premiumAmount, durationSeconds],
        });
      });
    }
  }, [isApproveSuccess, selectedMarket, premium, address, betAmount, coverageAmount, duration, calculatedPremiumUSDT, createPolicy, showToast, refetchAllowance]);
  const isSuccess = isCreateSuccess;

  // Fetch user's policy IDs - will be used when displaying user policies
  const { refetch: refetchPolicyIds } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'getUserPolicies',
    args: address ? [address] : undefined,
  });

  // Refetch balance after faucet success
  useEffect(() => {
    if (isFaucetSuccess) {
      showToast('✅ Received 1000 USDT from faucet!', 'success');
      // Refetch balance after a short delay
      setTimeout(() => {
        window.location.reload(); // Simple reload to refresh all balances
      }, 2000);
    }
  }, [isFaucetSuccess, showToast]);

  const handleFaucet = () => {
    if (!address) return;
    
    try {
      showToast('Requesting USDT from faucet...', 'info');
      requestFaucet({
        ...ASSET_TOKEN,
        functionName: 'faucet',
      });
    } catch (err) {
      console.error('Faucet failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Faucet request failed';
      showToast(errorMessage, 'error');
    }
  };

  // Transform Polymarket data to display format
  const filteredMarkets = useMemo(() => {
    const filtered = transformedMarkets.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    // Sorting
    filtered.sort((a, b) => {
      const premiumA = parseFloat(a.premium);
      const premiumB = parseFloat(b.premium);
      const liquidityA = a.liquidity;
      const liquidityB = b.liquidity;

      if (sortBy === 'premium-low') return premiumA - premiumB;
      if (sortBy === 'premium-high') return premiumB - premiumA;
      return liquidityB - liquidityA;
    });

    return filtered;
  }, [transformedMarkets, searchQuery, sortBy]);

  const categories = ['all', 'crypto', 'politics', 'sports', 'tech', 'finance', 'science', 'entertainment'];

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
    if (!selectedMarket || !premium || !address || !betAmount || !coverageAmount) {
      showToast('❌ Please fill in all required fields', 'error');
      return;
    }
    if (!validateBetAmount(betAmount)) return;

    // Validate premium is not too small
    if (calculatedPremiumUSDT < 0.01) {
      showToast('❌ Premium amount too small. Minimum bet is 1 USDT.', 'error');
      return;
    }

    // CRITICAL FIX: Validate marketId is a string
    if (!selectedMarket.id || typeof selectedMarket.id !== 'string') {
      showToast('❌ Invalid market ID. Please refresh and try again.', 'error');
      console.error('Invalid marketId:', selectedMarket.id, typeof selectedMarket.id);
      return;
    }

    const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);
    const amount = parseUnits(coverageAmount, 18);
    
    // Calculate premium in selected token with proper precision
    // Ensure minimum values to avoid 0 amounts
    const premiumUSDTValue = Math.max(0.01, calculatedPremiumUSDT);
    const premiumBNBValue = Math.max(0.000001, calculatedPremiumInToken);
    
    const premiumAmount = paymentToken === 'BNB' 
      ? parseUnits(premiumBNBValue.toFixed(8), 18) // BNB with 8 decimals
      : parseUnits(premiumUSDTValue.toFixed(6), 18); // USDT with 6 decimals
    
    console.log('💵 Premium Amount Calculation:', {
      paymentToken,
      calculatedPremiumUSDT,
      calculatedPremiumInToken,
      premiumUSDTValue,
      premiumBNBValue,
      premiumAmount: premiumAmount.toString(),
      premiumAmountInEther: formatUnits(premiumAmount, 18),
    });
    
    // Validate premium amount is not zero
    if (premiumAmount === 0n) {
      showToast('❌ Invalid premium amount. Please try again.', 'error');
      console.error('Premium amount is 0!', {
        calculatedPremiumUSDT,
        calculatedPremiumInToken,
        paymentToken,
      });
      return;
    }

    // Debug log
    console.log('🔍 Premium Debug:', {
      betAmount,
      coverageAmount,
      coveragePercentage,
      calculatedPremiumUSDT,
      calculatedPremiumInToken,
      premiumAmount: premiumAmount.toString(),
      premiumAmountInWei: premiumAmount.toString(),
      paymentToken,
      riskAssessment,
    });

    // Validate all values are correct
    if (calculatedPremiumUSDT === 0 || calculatedPremiumInToken === 0) {
      showToast('❌ Failed to calculate premium. Please try again.', 'error');
      console.error('Premium calculation failed:', {
        calculatedPremiumUSDT,
        calculatedPremiumInToken,
        betAmount,
        coveragePercentage,
        riskAssessment,
      });
      return;
    }

    try {
      // Smart payment: Auto-switch between BNB and USDT based on balance
      let finalPaymentToken = paymentToken;
      let finalPremiumAmount = premiumAmount;
      
      if (paymentToken === 'USDT') {
        // Check USDT balance first
        const currentBalance = usdtBalance || 0n;
        if (currentBalance < premiumAmount) {
          // Auto-switch to BNB if USDT insufficient
          const currentBNBBalance = nativeBalance ? parseFloat(formatUnits(nativeBalance.value, 18)) : 0;
          const requiredBNB = Math.max(0.000001, calculatedPremiumInToken);
          
          if (currentBNBBalance >= requiredBNB) {
            showToast('💡 Insufficient USDT, auto-switching to BNB payment...', 'info');
            finalPaymentToken = 'BNB';
            finalPremiumAmount = parseUnits(Math.max(0.000001, calculatedPremiumInToken).toFixed(8), 18);
            setPaymentToken('BNB'); // Update UI
          } else {
            showToast('❌ Insufficient balance in both USDT and BNB. Please get more tokens.', 'error');
            return;
          }
        } else {
          // Check if approval is needed
          const currentAllowance = usdtAllowance || 0n;
          console.log('💰 Allowance Check:', {
            currentAllowance: currentAllowance.toString(),
            premiumAmount: premiumAmount.toString(),
            needsApproval: currentAllowance < premiumAmount,
          });

          if (currentAllowance < premiumAmount) {
            showToast('Step 1/2: Approving USDT...', 'info');
            approveToken({
              ...ASSET_TOKEN,
              functionName: 'approve',
              args: [CONTRACTS.PolicyManager.address, premiumAmount],
            });
            return; // Will auto-create after approval in useEffect
          }
          // Already approved, proceed to create policy
          showToast('Creating insurance policy with USDT...', 'info');
        }
      } else {
        // Check BNB balance
        const currentBNBBalance = nativeBalance ? parseFloat(formatUnits(nativeBalance.value, 18)) : 0;
        const requiredBNB = Math.max(0.000001, calculatedPremiumInToken);
        
        if (currentBNBBalance < requiredBNB) {
          // Auto-switch to USDT if BNB insufficient
          const currentBalance = usdtBalance || 0n;
          const requiredUSDT = parseUnits(Math.max(0.01, calculatedPremiumUSDT).toFixed(6), 18);
          
          if (currentBalance >= requiredUSDT) {
            showToast('💡 Insufficient BNB, auto-switching to USDT payment...', 'info');
            finalPaymentToken = 'USDT';
            finalPremiumAmount = requiredUSDT;
            setPaymentToken('USDT'); // Update UI
            
            // Check if approval is needed for USDT
            const currentAllowance = usdtAllowance || 0n;
            if (currentAllowance < requiredUSDT) {
              showToast('Step 1/2: Approving USDT...', 'info');
              approveToken({
                ...ASSET_TOKEN,
                functionName: 'approve',
                args: [CONTRACTS.PolicyManager.address, requiredUSDT],
              });
              return;
            }
          } else {
            showToast('❌ Insufficient balance in both BNB and USDT. Please get more tokens.', 'error');
            return;
          }
        }
        showToast('Creating insurance policy with BNB...', 'info');
      }

      // CRITICAL FIX: Ensure marketId is always a string
      const marketIdString = String(selectedMarket.id);
      
      console.log('📝 Creating Policy:', {
        holder: address,
        marketId: marketIdString,
        marketIdType: typeof marketIdString,
        coverageAmount: amount.toString(),
        premium: premiumAmount.toString(),
        premiumInWei: premiumAmount.toString(),
        duration: durationSeconds.toString(),
        paymentToken,
      });

      // Create policy based on final payment token (after auto-switch)
      if (finalPaymentToken === 'BNB') {
        createPolicy({
          ...CONTRACTS.PolicyManager,
          functionName: 'createPolicy',
          args: [address, marketIdString, amount, finalPremiumAmount, durationSeconds],
          value: finalPremiumAmount, // Send BNB as value
        });
      } else {
        // USDT payment - no value field needed
        createPolicy({
          ...CONTRACTS.PolicyManager,
          functionName: 'createPolicy',
          args: [address, marketIdString, amount, finalPremiumAmount, durationSeconds],
        });
      }

      // Wait for transaction
      await new Promise(resolve => setTimeout(resolve, 3000));

      showToast(`✅ Insurance policy created! Paid ${finalPaymentToken === 'BNB' ? formatTokenAmount(calculatedPremiumInToken, 6) + ' BNB' : formatUSD(finalPremiumAmount)}`, 'success');
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
                <span className="text-sm text-gray-600">Your USDT Balance</span>
                <DollarSign className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {isUsdtBalanceLoading ? (
                  <LoadingSpinner size="sm" />
                ) : usdtBalance ? (
                  formatUSD(usdtBalance)
                ) : (
                  '$0.00'
                )}
              </div>
              <button
                onClick={handleFaucet}
                disabled={isFaucetPending || isFauceting || (faucetStatus && !faucetStatus[0])}
                className="text-xs text-blue-600 hover:text-blue-700 mt-1 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {isFaucetPending || isFauceting ? '⏳ Getting USDT...' : faucetStatus && !faucetStatus[0] ? `⏰ Cooldown: ${Math.ceil(Number(faucetStatus[1]) / 60)}m` : '🚰 Get 1000 USDT (Free)'}
              </button>
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
          ) : marketsLoading ? (
            <div className="flex justify-center items-center py-32">
              <LoadingSpinner size="lg" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMarkets.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setSelectedMarket(m);
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
                      {m.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900 truncate">{m.category}</h3>
                      <p className="text-xs text-gray-500">AI-Powered</p>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-semibold text-gray-900 min-h-[44px] leading-snug mb-4 line-clamp-2">
                    {m.title}
                  </p>

                  {/* Stats */}
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
                      <span className="text-gray-500">Yes / No</span>
                      <span className="font-semibold text-gray-900">
                        <AnimatedPrice value={m.sentiment.bullish} decimals={1} suffix="%" /> / <AnimatedPrice value={m.sentiment.bearish} decimals={1} suffix="%" />
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">AI Premium</span>
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
        </div>

      {/* Purchase Modal */}
      {showPurchaseModal && selectedMarket && (
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
                  selectedMarket.logoColor
                )}>
                  {selectedMarket.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm">{selectedMarket.title}</div>
                  <div className="text-xs text-gray-600 mt-0.5">{selectedMarket.category} • AI-Powered</div>
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

            {/* Payment Token Selector */}
            <div>
              <label className="block text-sm font-medium mb-2">Payment Token</label>
              <select
                value={paymentToken}
                onChange={(e) => setPaymentToken(e.target.value as 'USDT' | 'BNB')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white font-medium"
              >
                <option value="BNB">
                  BNB - Balance: {nativeBalance ? formatTokenAmount(parseFloat(formatUnits(nativeBalance.value, 18)), 4) : '0.0000'}
                </option>
                <option value="USDT">
                  USDT - Balance: {usdtBalance ? formatTokenAmount(parseFloat(formatUnits(usdtBalance, 18)), 2) : '0.00'}
                </option>
              </select>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>Selected: {paymentToken}</span>
                {paymentToken === 'BNB' && (
                  <span>1 BNB = ${bnbPrice.toFixed(2)}</span>
                )}
              </div>
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

            {/* AI Risk Assessment */}
            {riskLoading && (
              <div className="flex items-center justify-center py-4 bg-blue-50 rounded-lg border border-blue-100">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm text-blue-700 font-medium">Calculating risk assessment...</span>
              </div>
            )}

            {riskAssessment && !riskLoading && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span className="text-sm font-bold text-blue-900">AI Risk Analysis</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Risk Score:</span>
                    <span className="font-semibold text-blue-900">{riskAssessment.riskScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">AI Premium Rate:</span>
                    <span className="font-semibold text-blue-900">{riskAssessment.premiumRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Payout Rate:</span>
                    <span className="font-semibold text-blue-900">{riskAssessment.payoutRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Confidence:</span>
                    <span className="font-semibold text-blue-900">{riskAssessment.confidence}%</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-700 italic">
                    🤖 {riskAssessment.reasoning}
                  </p>
                </div>
              </div>
            )}

            {/* Summary */}
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
                  <span className="text-gray-600">AI Premium ({riskAssessment ? riskAssessment.premiumRate.toFixed(1) : '25'}%)</span>
                  <span className="font-semibold text-gray-900">
                    {paymentToken === 'BNB' ? (
                      <span>
                        {formatTokenAmount(calculatedPremiumInToken, 6)} BNB
                        <span className="text-xs text-gray-500 ml-1">(≈${calculatedPremiumUSDT.toFixed(2)})</span>
                      </span>
                    ) : (
                      formatUSD(premium)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold">{duration} days</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="font-semibold">You pay with {paymentToken}</span>
                  <span className="font-bold text-lg">
                    {paymentToken === 'BNB' ? (
                      <span className="text-blue-600">
                        {formatTokenAmount(calculatedPremiumInToken, 6)} BNB
                      </span>
                    ) : (
                      formatUSD(premium)
                    )}
                  </span>
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

              {/* Help message based on selected token */}
              {paymentToken === 'USDT' && !isUsdtBalanceLoading && (!usdtBalance || usdtBalance === 0n) && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-amber-600 mb-2">⚠️ Insufficient USDT balance</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPaymentToken('BNB')}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      💡 Pay with BNB instead
                    </button>
                    <button
                      onClick={handleFaucet}
                      disabled={isFaucetPending || isFauceting || (faucetStatus && !faucetStatus[0])}
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isFaucetPending || isFauceting ? '⏳ Getting...' : '🚰 Get 1000 USDT'}
                    </button>
                  </div>
                  {faucetStatus && !faucetStatus[0] && (
                    <p className="text-xs text-gray-500 mt-1">
                      Faucet cooldown: {Math.ceil(Number(faucetStatus[1]) / 60)} minutes left
                    </p>
                  )}
                </div>
              )}
              {paymentToken === 'BNB' && nativeBalance && parseFloat(formatUnits(nativeBalance.value, 18)) < calculatedPremiumInToken && (
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-amber-600">⚠️ Insufficient BNB balance for premium</p>
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
              <p className="text-xs text-gray-700 mb-2">
                <strong>How it works:</strong> Your premium goes to insurance pool. If you lose, you get paid from the pool (backed by LP stakes).
              </p>
              <p className="text-xs text-gray-500">
                Policy minted as NFT • Claim automatically if market resolves against you
              </p>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
