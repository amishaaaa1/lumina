'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { formatDistanceToNow } from 'date-fns';

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
      const response = await fetch(`/api/predictions${statusParam}`);
      const data = await response.json();
      setMarkets(data);
    } catch (error) {
      console.error('Failed to load markets:', error);
      showToast('Failed to load prediction markets', 'error');
    } finally {
      setLoading(false);
    }
  };

  const placePrediction = async () => {
    if (!selectedMarket || !betAmount || !address) return;

    try {
      setPlacing(true);
      
      // TODO: Call smart contract to place prediction
      // For now, just show success
      showToast(`Placed ${betAmount} on ${betOutcome} for ${selectedMarket.protocol}`, 'success');
      
      setSelectedMarket(null);
      setBetAmount('');
      loadMarkets();
    } catch (error) {
      console.error('Failed to place prediction:', error);
      showToast('Failed to place prediction', 'error');
    } finally {
      setPlacing(false);
    }
  };

  const getRiskVariant = (riskType: string): 'error' | 'warning' | 'info' | 'default' => {
    switch (riskType) {
      case 'Hack': return 'error';
      case 'Depeg': return 'warning';
      case 'Exploit': return 'warning';
      case 'Rug': return 'error';
      default: return 'default';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Crypto Risk Predictions</h1>
          <p className="text-gray-400 mt-2">
            Predict protocol risks and earn rewards
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'secondary'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'secondary'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
          <Button
            variant={filter === 'resolved' ? 'primary' : 'secondary'}
            onClick={() => setFilter('resolved')}
          >
            Resolved
          </Button>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market) => (
          <Card key={market.id} className="p-6 hover:border-blue-500 transition-colors">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{market.protocol}</h3>
                  <Badge variant={getRiskVariant(market.riskType)}>
                    {market.riskType}
                  </Badge>
                </div>
                <Badge variant={market.status === 'Active' ? 'success' : 'default'}>
                  {market.status}
                </Badge>
              </div>

              {/* Question */}
              <p className="text-sm text-gray-400">
                Will {market.protocol} experience a {market.riskType.toLowerCase()} before{' '}
                {formatDistanceToNow(new Date(market.deadline), { addSuffix: true })}?
              </p>

              {/* Odds */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-400">YES</div>
                  <div className="text-2xl font-bold text-green-400">
                    {market.yesOdds}%
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <div className="text-xs text-gray-400">NO</div>
                  <div className="text-2xl font-bold text-red-400">
                    {market.noOdds}%
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm text-gray-400">
                <span>Volume: ${market.totalVolume.toFixed(0)}</span>
                <span>{market.participantCount} traders</span>
              </div>

              {/* Action */}
              {market.status === 'Active' && (
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setSelectedMarket(market)}
                  disabled={!address}
                >
                  {address ? 'Place Prediction' : 'Connect Wallet'}
                </Button>
              )}

              {market.status === 'Resolved' && (
                <div className="text-center py-2">
                  <Badge variant={market.outcome === 'Yes' ? 'success' : 'error'}>
                    Resolved: {market.outcome}
                  </Badge>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {markets.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No prediction markets found
        </div>
      )}

      {/* Bet Modal */}
      {selectedMarket && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold">{selectedMarket.protocol}</h2>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedMarket.riskType} Risk Prediction
                </p>
              </div>
              <button
                onClick={() => setSelectedMarket(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Outcome Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setBetOutcome('Yes')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  betOutcome === 'Yes'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-sm text-gray-400">YES</div>
                <div className="text-2xl font-bold text-green-400">
                  {selectedMarket.yesOdds}%
                </div>
              </button>
              <button
                onClick={() => setBetOutcome('No')}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  betOutcome === 'No'
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
              >
                <div className="text-sm text-gray-400">NO</div>
                <div className="text-2xl font-bold text-red-400">
                  {selectedMarket.noOdds}%
                </div>
              </button>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Bet Amount (USDC)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white"
              />
            </div>

            {/* Potential Payout */}
            {betAmount && (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Potential Payout</span>
                  <span className="text-white font-bold">
                    ${calculatePotentialPayout().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Potential Profit</span>
                  <span className="text-green-400 font-bold">
                    +${(calculatePotentialPayout() - parseFloat(betAmount || '0')).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              variant="primary"
              fullWidth
              onClick={placePrediction}
              disabled={!betAmount || placing}
            >
              {placing ? 'Placing...' : `Bet ${betAmount || '0'} USDC on ${betOutcome}`}
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
