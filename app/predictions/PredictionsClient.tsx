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
  riskType: string;
  deadline: string;
  status: string;
  outcome: string;
  yesPool: number;
  noPool: number;
  totalVolume: number;
  yesOdds: string;
  noOdds: string;
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
          protocol: 'Uniswap V4',
          riskType: 'Exploit',
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesPool: 45000,
          noPool: 55000,
          totalVolume: 100000,
          yesOdds: '45',
          noOdds: '55',
          participantCount: 234,
          insuranceEnabled: true,
        },
        {
          id: '2',
          marketId: 2,
          protocol: 'USDC',
          riskType: 'Depeg',
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesPool: 12000,
          noPool: 88000,
          totalVolume: 100000,
          yesOdds: '12',
          noOdds: '88',
          participantCount: 567,
          insuranceEnabled: true,
        },
        {
          id: '3',
          marketId: 3,
          protocol: 'Aave V3',
          riskType: 'Hack',
          deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesPool: 8000,
          noPool: 92000,
          totalVolume: 100000,
          yesOdds: '8',
          noOdds: '92',
          participantCount: 423,
          insuranceEnabled: true,
        },
        {
          id: '4',
          marketId: 4,
          protocol: 'Curve Finance',
          riskType: 'Exploit',
          deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesPool: 35000,
          noPool: 65000,
          totalVolume: 100000,
          yesOdds: '35',
          noOdds: '65',
          participantCount: 189,
          insuranceEnabled: true,
        },
        {
          id: '5',
          marketId: 5,
          protocol: 'Lido',
          riskType: 'Depeg',
          deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesPool: 15000,
          noPool: 85000,
          totalVolume: 100000,
          yesOdds: '15',
          noOdds: '85',
          participantCount: 678,
          insuranceEnabled: true,
        },
        {
          id: '6',
          marketId: 6,
          protocol: 'MakerDAO',
          riskType: 'Hack',
          deadline: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'Active',
          outcome: 'Unresolved',
          yesPool: 5000,
          noPool: 95000,
          totalVolume: 100000,
          yesOdds: '5',
          noOdds: '95',
          participantCount: 892,
          insuranceEnabled: true,
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
      <div className="text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
          Crypto Risk Predictions
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Predict protocol risks and earn rewards. Get insurance protection on your predictions.
        </p>
      </div>
      
      {/* Filter Tabs */}
      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            filter === 'all'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-900'
          }`}
        >
          All Markets
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            filter === 'active'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-900'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-6 py-3 rounded-full font-semibold transition-all ${
            filter === 'resolved'
              ? 'bg-gray-900 text-white shadow-lg'
              : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-900'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <div
            key={market.id}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-gray-900 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => market.status === 'Active' && address && setSelectedMarket(market)}
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{market.protocol}</h3>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    market.riskType === 'Hack' ? 'bg-red-100 text-red-700' :
                    market.riskType === 'Depeg' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {market.riskType} Risk
                  </span>
                </div>
                {market.insuranceEnabled && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Insured
                  </span>
                )}
              </div>

              {/* Question */}
              <p className="text-sm text-gray-600">
                Will {market.protocol} experience a {market.riskType.toLowerCase()} before{' '}
                {formatDistanceToNow(new Date(market.deadline), { addSuffix: true })}?
              </p>

              {/* Odds */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                  <div className="text-xs text-gray-600 font-semibold">YES</div>
                  <div className="text-3xl font-bold text-green-600">
                    {market.yesOdds}%
                  </div>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <div className="text-xs text-gray-600 font-semibold">NO</div>
                  <div className="text-3xl font-bold text-red-600">
                    {market.noOdds}%
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
                <span className="font-semibold">Volume: ${(market.totalVolume / 1000).toFixed(0)}K</span>
                <span>{market.participantCount} traders</span>
              </div>

              {/* Action */}
              {market.status === 'Active' && (
                <button
                  className={`w-full py-3 rounded-xl font-semibold transition-all ${
                    address
                      ? 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 shadow-lg'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  disabled={!address}
                >
                  {address ? 'Place Prediction' : 'Connect Wallet'}
                </button>
              )}

              {market.status === 'Resolved' && (
                <div className="text-center py-3">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    market.outcome === 'Yes' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    Resolved: {market.outcome}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Markets Found</h3>
          <p className="text-gray-600">
            {filter === 'resolved' ? 'No resolved markets yet' : 'Check back soon for new prediction markets'}
          </p>
        </div>
      )}

      {/* Bet Modal */}
      {selectedMarket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 space-y-6 shadow-2xl border-2 border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedMarket.protocol}</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedMarket.riskType} Risk Prediction
                </p>
              </div>
              <button
                onClick={() => setSelectedMarket(null)}
                className="text-gray-400 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Outcome Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setBetOutcome('Yes')}
                className={`p-5 rounded-xl border-2 transition-all ${
                  betOutcome === 'Yes'
                    ? 'border-green-500 bg-green-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-xs text-gray-600 font-semibold">YES</div>
                <div className="text-3xl font-bold text-green-600">
                  {selectedMarket.yesOdds}%
                </div>
              </button>
              <button
                onClick={() => setBetOutcome('No')}
                className={`p-5 rounded-xl border-2 transition-all ${
                  betOutcome === 'No'
                    ? 'border-red-500 bg-red-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="text-xs text-gray-600 font-semibold">NO</div>
                <div className="text-3xl font-bold text-red-600">
                  {selectedMarket.noOdds}%
                </div>
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm text-gray-700 font-semibold mb-2">
                Bet Amount (USDC)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:border-gray-900 focus:outline-none"
              />
            </div>

            {/* Insurance Notice */}
            {selectedMarket.insuranceEnabled && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="text-sm font-semibold text-blue-900">Insurance Available</div>
                    <div className="text-xs text-blue-700 mt-1">
                      Get 40-60% back if you lose. Premium: 5-20% based on risk.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Potential Payout */}
            {betAmount && (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Potential Payout</span>
                  <span className="text-gray-900 font-bold">
                    ${calculatePotentialPayout().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Potential Profit</span>
                  <span className="text-green-600 font-bold">
                    +${(calculatePotentialPayout() - parseFloat(betAmount || '0')).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={placePrediction}
              disabled={!betAmount || placing}
              className={`w-full py-4 rounded-xl font-semibold transition-all ${
                !betAmount || placing
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-800 hover:scale-105 shadow-lg'
              }`}
            >
              {placing ? 'Placing...' : `Bet ${betAmount || '0'} USDC on ${betOutcome}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
