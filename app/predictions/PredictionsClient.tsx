'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits } from 'viem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';

interface PredictionMarket {
  id: string;
  marketId: number;
  protocol: string;
  question: string;
  icon: string;
  riskType: string;
  deadline: string;
  status: string;
  outcome: string;
  yesVotes: number;
  noVotes: number;
  yesPool: number;
  noPool: number;
  yesOdds: string;
  noOdds: string;
  totalVolume: number;
  participantCount: number;
  insuranceEnabled: boolean;
}

export default function PredictionsClient() {
  const { address } = useAccount();
  const { showToast } = useToast();
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');
  const [selectedMarket, setSelectedMarket] = useState<PredictionMarket | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [betOutcome, setBetOutcome] = useState<'Yes' | 'No'>('Yes');
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    loadMarkets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const statusParam = filter === 'all' ? '' : `?status=${filter === 'active' ? 'Active' : 'Resolved'}`;
      
      // Try to fetch from API, fallback to mock data
      try {
        const response = await fetch(`/api/predictions${statusParam}`);
        if (response.ok) {
          const data = await response.json();
          setMarkets(data);
          return;
        }
      } catch {
        console.log('API not available, using mock data');
      }
      
      // Fallback to mock data
      const mockMarkets: PredictionMarket[] = [
        {
          id: '1',
          marketId: 1,
          protocol: 'Uniswap',
          question: 'Will Uniswap V4 experience a critical exploit by Q2 2026?',
          riskType: 'Exploit',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesVotes: 105,
          noVotes: 129,
          yesPool: 45000,
          noPool: 55000,
          totalVolume: 100000,
          yesOdds: '45',
          noOdds: '55',
          participantCount: 234,
          insuranceEnabled: true,
          icon: '🦄',
        },
        {
          id: '2',
          marketId: 2,
          protocol: 'Circle',
          question: 'Will USDC depeg below $0.95 in the next 90 days?',
          riskType: 'Depeg',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesVotes: 68,
          noVotes: 499,
          yesPool: 12000,
          noPool: 88000,
          totalVolume: 100000,
          yesOdds: '12',
          noOdds: '88',
          participantCount: 567,
          insuranceEnabled: true,
          icon: '💵',
        },
        {
          id: '3',
          marketId: 3,
          protocol: 'Aave',
          question: 'Will Aave V3 suffer a security breach before end of 2026?',
          riskType: 'Security',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesVotes: 34,
          noVotes: 389,
          yesPool: 8000,
          noPool: 92000,
          totalVolume: 100000,
          yesOdds: '8',
          noOdds: '92',
          participantCount: 423,
          insuranceEnabled: true,
          icon: '👻',
        },
        {
          id: '4',
          marketId: 4,
          protocol: 'Curve',
          question: 'Will Curve Finance pools be exploited in Q1 2026?',
          riskType: 'Exploit',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesVotes: 66,
          noVotes: 123,
          yesPool: 35000,
          noPool: 65000,
          totalVolume: 100000,
          yesOdds: '35',
          noOdds: '65',
          participantCount: 189,
          insuranceEnabled: true,
          icon: '🌊',
        },
        {
          id: '5',
          marketId: 5,
          protocol: 'Lido',
          question: 'Will stETH lose its peg to ETH by more than 5%?',
          riskType: 'Depeg',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesVotes: 102,
          noVotes: 576,
          yesPool: 15000,
          noPool: 85000,
          totalVolume: 100000,
          yesOdds: '15',
          noOdds: '85',
          participantCount: 678,
          insuranceEnabled: true,
          icon: '🏛️',
        },
        {
          id: '6',
          marketId: 6,
          protocol: 'MakerDAO',
          question: 'Will MakerDAO smart contracts be compromised in 2026?',
          riskType: 'Security',
          deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesVotes: 45,
          noVotes: 847,
          yesPool: 5000,
          noPool: 95000,
          totalVolume: 100000,
          yesOdds: '5',
          noOdds: '95',
          participantCount: 892,
          insuranceEnabled: true,
          icon: '🏦',
        },
      ];
      
      setMarkets(filter === 'active' ? mockMarkets : filter === 'resolved' ? [] : mockMarkets);
    } catch (error) {
      console.error('Failed to load markets:', error);
      showToast('Failed to load prediction markets', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Contract interactions
  const { writeContract: approveToken, data: approveHash } = useWriteContract();
  const { writeContract: placeBet, data: betHash } = useWriteContract();
  
  useWaitForTransactionReceipt({ hash: approveHash });
  useWaitForTransactionReceipt({ hash: betHash });

  // Check allowance
  const { data: allowance } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'allowance',
    args: address && CONTRACTS.PredictionMarket.address 
      ? [address, CONTRACTS.PredictionMarket.address]
      : undefined,
  });

  const placePrediction = async () => {
    if (!selectedMarket || !betAmount || !address) return;

    try {
      setPlacing(true);
      
      const amount = parseUnits(betAmount, 18); // USDC has 18 decimals on testnet
      const marketId = BigInt(selectedMarket.marketId);
      
      // Check if approval needed
      const currentAllowance = allowance as bigint || 0n;
      if (currentAllowance < amount) {
        showToast('Approving USDC...', 'info');
        
        approveToken({
          ...ASSET_TOKEN,
          functionName: 'approve',
          args: [CONTRACTS.PredictionMarket.address, amount],
        });
        
        // Wait for approval
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      // Place bet
      showToast('Placing bet...', 'info');
      placeBet({
        ...CONTRACTS.PredictionMarket,
        functionName: 'placeBet',
        args: [marketId, betOutcome === 'Yes', amount],
      });
      
      // Wait for transaction
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      showToast(`✅ Placed ${betAmount} USDC on ${betOutcome}!`, 'success');
      
      setSelectedMarket(null);
      setBetAmount('');
      loadMarkets();
    } catch (error) {
      console.error('Failed to place prediction:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place prediction';
      showToast(errorMessage, 'error');
    } finally {
      setPlacing(false);
    }
  };

  const calculatePotentialPayout = () => {
    if (!selectedMarket || !betAmount) return 0;
    const amount = parseFloat(betAmount);
    const oppositePool = betOutcome === 'Yes' ? selectedMarket.noPool : selectedMarket.yesPool;
    const myPool = betOutcome === 'Yes' ? selectedMarket.yesPool : selectedMarket.noPool;
    
    if (myPool === 0) return amount * 2;
    const share = amount / (myPool + amount);
    return amount + (oppositePool * share);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Protocol Risk Markets
        </h1>
        <p className="text-lg text-gray-600">
          Predict DeFi protocol risks and earn rewards based on accurate forecasts
        </p>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex gap-3 mb-8 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 text-sm font-medium transition-all relative ${
            filter === 'all'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          All Markets
          {filter === 'all' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
          )}
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-3 text-sm font-medium transition-all relative ${
            filter === 'active'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Active
          {filter === 'active' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
          )}
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-6 py-3 text-sm font-medium transition-all relative ${
            filter === 'resolved'
              ? 'text-gray-900'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Resolved
          {filter === 'resolved' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900" />
          )}
        </button>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <div
            key={market.id}
            className="group bg-white rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Card Header with Icon */}
            <div className="p-6 bg-gradient-to-br from-gray-50 to-white border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl border border-gray-100">
                    {market.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{market.protocol}</h3>
                    <span className="text-xs text-gray-500 font-medium">{market.riskType} Risk</span>
                  </div>
                </div>
                {market.insuranceEnabled && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold border border-blue-100">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Insured
                  </div>
                )}
              </div>

              {/* Question */}
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                {market.question}
              </p>
            </div>

            {/* Market Stats */}
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              {/* Voting Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="font-medium">{market.participantCount} votes</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">${(market.totalVolume / 1000).toFixed(0)}K pool</span>
                </div>
              </div>

              {/* Odds Display */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                  <div className="text-xs font-semibold text-green-700 mb-1">YES</div>
                  <div className="text-2xl font-bold text-green-600">{market.yesOdds}%</div>
                  <div className="text-xs text-green-600 mt-1">${(market.yesPool / 1000).toFixed(1)}K</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-4 border border-red-100">
                  <div className="text-xs font-semibold text-red-700 mb-1">NO</div>
                  <div className="text-2xl font-bold text-red-600">{market.noOdds}%</div>
                  <div className="text-xs text-red-600 mt-1">${(market.noPool / 1000).toFixed(1)}K</div>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100 flex-grow">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Closes {formatDistanceToNow(new Date(market.deadline), { addSuffix: true })}</span>
              </div>

              {/* Action Button */}
              {market.status === 'Active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (address) setSelectedMarket(market);
                  }}
                  className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 ${
                    address
                      ? 'bg-gray-900 text-white hover:bg-gray-800 group-hover:shadow-lg'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                  disabled={!address}
                >
                  {address ? 'Vote' : 'Connect Wallet'}
                </button>
              )}

              {market.status === 'Resolved' && (
                <div className="text-center py-3">
                  <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${
                    market.outcome === 'Yes' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Resolved: {market.outcome}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Markets Available</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            {filter === 'resolved' 
              ? 'No resolved markets to display yet. Check back after markets close.' 
              : 'New prediction markets will appear here. Check back soon for opportunities.'}
          </p>
        </div>
      )}

      {/* Bet Modal */}
      {selectedMarket && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSelectedMarket(null)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200 my-8 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header - Fixed */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl border border-gray-100">
                    {selectedMarket.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selectedMarket.protocol}</h2>
                    <p className="text-xs text-gray-600">
                      {selectedMarket.riskType} Risk Market
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMarket(null)}
                  className="text-gray-400 hover:text-gray-900 transition-colors p-1 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Outcome Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Select Your Prediction
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBetOutcome('Yes')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      betOutcome === 'Yes'
                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-1">YES</div>
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {selectedMarket.yesOdds}%
                    </div>
                    <div className="text-xs text-gray-500">
                      ${(selectedMarket.yesPool / 1000).toFixed(1)}K pool
                    </div>
                  </button>
                  <button
                    onClick={() => setBetOutcome('No')}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      betOutcome === 'No'
                        ? 'border-red-500 bg-gradient-to-br from-red-50 to-rose-50 shadow-lg scale-[1.02]'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-1">NO</div>
                    <div className="text-2xl font-bold text-red-600 mb-1">
                      {selectedMarket.noOdds}%
                    </div>
                    <div className="text-xs text-gray-500">
                      ${(selectedMarket.noPool / 1000).toFixed(1)}K pool
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Amount (USDC)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-4 text-lg font-semibold text-gray-900 focus:border-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                    USDC
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {[10, 50, 100, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount.toString())}
                      className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Insurance Notice */}
              {selectedMarket.insuranceEnabled && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-blue-900 mb-0.5">Insurance Protection Available</div>
                      <div className="text-xs text-blue-700 leading-relaxed">
                        Get 40-60% back if wrong. Premium: 5-20% based on risk.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Potential Payout */}
              {betAmount && parseFloat(betAmount) > 0 && (
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">Your Stake</span>
                    <span className="text-sm text-gray-900 font-bold">
                      ${parseFloat(betAmount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-600 font-medium">Potential Payout</span>
                    <span className="text-sm text-gray-900 font-bold">
                      ${calculatePotentialPayout().toFixed(2)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700 font-semibold">Potential Profit</span>
                      <span className="text-base text-green-600 font-bold">
                        +${(calculatePotentialPayout() - parseFloat(betAmount || '0')).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={placePrediction}
                disabled={!betAmount || placing || parseFloat(betAmount) <= 0}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                  !betAmount || placing || parseFloat(betAmount) <= 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-xl active:scale-[0.98]'
                }`}
              >
                {placing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Place ${betAmount || '0'} USDC on ${betOutcome}`
                )}
              </button>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500 text-center leading-snug -mt-1">
                By placing this prediction, you acknowledge the risks involved.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
