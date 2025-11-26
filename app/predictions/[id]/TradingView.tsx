'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';

interface TradingViewProps {
  marketId: string;
}

interface MarketData {
  title: string;
  yesOdds: number;
  noOdds: number;
  volume: number;
  description: string;
  endDate: string;
}

export default function TradingView({ marketId }: TradingViewProps) {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [tradeType, setTradeType] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');

  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [prevOdds, setPrevOdds] = useState<{ yes: number; no: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const { showToast } = useToast();

  // Helper to manage timeout
  const clearTradeTimeout = () => {
    const w = window as typeof window & { __tradeTimeout?: NodeJS.Timeout };
    if (w.__tradeTimeout) {
      clearTimeout(w.__tradeTimeout);
      w.__tradeTimeout = undefined;
    }
  };

  // Contract interactions
  const { writeContract: placeTrade, data: tradeHash, isPending: isTradePending, error: tradeError } = useWriteContract();
  const { writeContract: approveToken, data: approveHash, isPending: isApprovePending, error: approveError } = useWriteContract();
  
  const { isLoading: isApproveConfirming, isSuccess: isApproveSuccess, isError: isApproveError } = useWaitForTransactionReceipt({
    hash: approveHash,
  });
  
  const { isLoading: isTradeConfirming, isSuccess: isTradeSuccess, isError: isTradeError } = useWaitForTransactionReceipt({
    hash: tradeHash,
  });

  // Calculate estimated shares (needed for useEffect)
  const currentPrice = tradeType === 'yes' ? (marketData?.yesOdds || 50) : (marketData?.noOdds || 50);
  const estimatedShares = amount ? (parseFloat(amount) / currentPrice * 100).toFixed(2) : '0';

  // Handle approval success - automatically place trade
  useEffect(() => {
    if (isApproveSuccess && !tradeHash && amount) {
      const amountParsed = parseUnits(amount, 18);
      showToast(`✅ Approved! Now placing ${activeTab === 'buy' ? 'buy' : 'sell'} order...`, 'info');
      
      // Small delay to ensure approval is confirmed
      setTimeout(() => {
        placeTrade({
          ...CONTRACTS.PredictionMarket,
          functionName: 'placeBet',
          args: [BigInt(1), tradeType === 'yes', amountParsed],
          gas: BigInt(300000),
        });
      }, 500);
    }
  }, [isApproveSuccess, tradeHash, amount, activeTab, tradeType, placeTrade, showToast]);

  // Handle trade success
  useEffect(() => {
    if (isTradeSuccess) {
      showToast(`✅ Successfully ${activeTab === 'buy' ? 'bought' : 'sold'} ${estimatedShares} shares!`, 'success');
      setAmount('');
      setTrading(false);
      clearTradeTimeout();
    }
  }, [isTradeSuccess, activeTab, estimatedShares, showToast]);

  // Handle errors
  useEffect(() => {
    if (approveError) {
      console.error('Approval error:', approveError);
      showToast('❌ Approval failed or rejected', 'error');
      setTrading(false);
      clearTradeTimeout();
    }
  }, [approveError, showToast]);

  useEffect(() => {
    if (tradeError) {
      console.error('Trade error:', tradeError);
      showToast('❌ Trade failed or rejected', 'error');
      setTrading(false);
      clearTradeTimeout();
    }
  }, [tradeError, showToast]);

  useEffect(() => {
    if (isApproveError) {
      showToast('❌ Approval transaction failed', 'error');
      setTrading(false);
      clearTradeTimeout();
    }
  }, [isApproveError, showToast]);

  useEffect(() => {
    if (isTradeError) {
      showToast('❌ Trade transaction failed', 'error');
      setTrading(false);
      clearTradeTimeout();
    }
  }, [isTradeError, showToast]);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        // Only show loading spinner on initial load
        if (!marketData) {
          setLoading(true);
        }
        
        const response = await fetch(`/api/polymarket?limit=20`);
        const data = await response.json();
        
        console.log('Fetched markets:', data);
        console.log('Looking for marketId:', marketId);
        
        // Find market by ID
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const market = data.find((m: any) => m.id === marketId);
        
        console.log('Found market:', market);
        
        if (market) {
          // Parse prices - they come as strings like "0.42"
          const yesPrice = market.markets?.[0]?.outcome_prices?.[0];
          const noPrice = market.markets?.[0]?.outcome_prices?.[1];
          
          console.log('Raw prices - yesPrice:', yesPrice, 'noPrice:', noPrice);
          console.log('Type of yesPrice:', typeof yesPrice);
          
          // Convert to percentage (multiply by 100)
          const yesOdds = yesPrice ? Math.round(parseFloat(yesPrice) * 100) : 50;
          const noOdds = noPrice ? Math.round(parseFloat(noPrice) * 100) : 50;
          
          console.log('Calculated odds - yesOdds:', yesOdds, 'noOdds:', noOdds);
          
          // Store previous odds for animation
          if (marketData) {
            setPrevOdds({ yes: marketData.yesOdds, no: marketData.noOdds });
          }
          
          setMarketData({
            title: market.title,
            yesOdds,
            noOdds,
            volume: parseFloat(market.volume || '0'),
            description: market.description || '',
            endDate: market.end_date_iso,
          });
        } else {
          console.warn('Market not found, using first market as fallback');
          // Use first market as fallback
          const fallbackMarket = data[0];
          if (fallbackMarket) {
            const yesPrice = fallbackMarket.markets?.[0]?.outcome_prices?.[0];
            const noPrice = fallbackMarket.markets?.[0]?.outcome_prices?.[1];
            
            const yesOdds = yesPrice ? Math.round(parseFloat(yesPrice) * 100) : 50;
            const noOdds = noPrice ? Math.round(parseFloat(noPrice) * 100) : 50;
            
            // Store previous odds for animation
            if (marketData) {
              setPrevOdds({ yes: marketData.yesOdds, no: marketData.noOdds });
            }
            
            setMarketData({
              title: fallbackMarket.title,
              yesOdds,
              noOdds,
              volume: parseFloat(fallbackMarket.volume || '0'),
              description: fallbackMarket.description || '',
              endDate: fallbackMarket.end_date_iso,
            });
          }
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    }

    // Initial fetch
    fetchMarketData();
    
    // Set up polling every 5 seconds for real-time updates
    const intervalId = setInterval(() => {
      fetchMarketData();
    }, 5000);
    
    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [marketData, marketId]);

  if (loading || !marketData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const { title, yesOdds, noOdds, volume } = marketData;
  const totalCost = parseFloat(amount || '0');

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) <= 0 || !address) return;

    try {
      setTrading(true);
      
      const totalAmountParsed = parseUnits(totalCost.toFixed(2), 18);
      
      // Approve USDC first
      showToast('🦊 Please approve USDC in MetaMask...', 'info');
      
      // Safety timeout - reset trading state after 60 seconds if nothing happens
      const timeoutId = setTimeout(() => {
        setTrading(false);
        showToast('⏱️ Transaction timeout. Please try again.', 'error');
      }, 60000);
      
      // Store timeout ID to clear it later
      (window as typeof window & { __tradeTimeout?: NodeJS.Timeout }).__tradeTimeout = timeoutId;
      
      approveToken({
        ...ASSET_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.PredictionMarket.address, totalAmountParsed],
        gas: BigInt(100000),
      });
      
      // The useEffect will handle placing the trade after approval
    } catch (error) {
      console.error('Trade failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Trade failed. Please try again.';
      showToast(errorMessage, 'error');
      setTrading(false);
      clearTradeTimeout();
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Header - Full Width */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>${(volume / 1000).toFixed(1)}K Vol.</span>
              <span>•</span>
              <span>Ends {new Date(marketData.endDate).toLocaleDateString()}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Live
              </span>
            </div>
          </div>
        </div>
        
        {/* Odds Display with Progress Bars */}
        <div className="space-y-3">
          {/* Progress Bar */}
          <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-1000 ease-out"
              style={{ width: `${yesOdds}%` }}
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 bg-green-50 rounded-lg p-3 border border-green-200 relative overflow-hidden">
              {prevOdds && prevOdds.yes !== yesOdds && (
                <div className="absolute inset-0 bg-green-200 animate-ping opacity-25" />
              )}
              <div className="text-xs font-medium text-green-700 mb-1">25+ bps decrease</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-green-700">Yes</span>
                <span className="text-2xl font-bold text-green-600 transition-all duration-500">
                  {(yesOdds / 100).toFixed(1)}¢
                </span>
                {prevOdds && prevOdds.yes < yesOdds && (
                  <span className="text-xs text-green-600 animate-bounce">↑</span>
                )}
                {prevOdds && prevOdds.yes > yesOdds && (
                  <span className="text-xs text-green-600 animate-bounce">↓</span>
                )}
              </div>
            </div>
            <div className="flex-1 bg-red-50 rounded-lg p-3 border border-red-200 relative overflow-hidden">
              {prevOdds && prevOdds.no !== noOdds && (
                <div className="absolute inset-0 bg-red-200 animate-ping opacity-25" />
              )}
              <div className="text-xs font-medium text-red-700 mb-1">No change / increase</div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-red-700">No</span>
                <span className="text-2xl font-bold text-red-600 transition-all duration-500">
                  {(noOdds / 100).toFixed(1)}¢
                </span>
                {prevOdds && prevOdds.no < noOdds && (
                  <span className="text-xs text-red-600 animate-bounce">↑</span>
                )}
                {prevOdds && prevOdds.no > noOdds && (
                  <span className="text-xs text-red-600 animate-bounce">↓</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price Chart */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-900 rounded-lg">Past</button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Dec 10</button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Jan 28, 2026</button>
              <button className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Mar 18, 2026</button>
            </div>
          </div>
          <div className="h-80 relative bg-gray-50 rounded-lg">
            {/* Simple SVG Chart */}
            <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="60" x2="600" y2="60" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="120" x2="600" y2="120" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="180" x2="600" y2="180" stroke="#e5e7eb" strokeWidth="1" />
              <line x1="0" y1="240" x2="600" y2="240" stroke="#e5e7eb" strokeWidth="1" />
              
              {/* Price line (simulated with more data points) - with animation */}
              <polyline
                points={`0,${280 - yesOdds * 2.5} 60,${280 - (yesOdds - 3) * 2.5} 120,${280 - (yesOdds + 2) * 2.5} 180,${280 - (yesOdds - 1) * 2.5} 240,${280 - (yesOdds + 5) * 2.5} 300,${280 - (yesOdds + 8) * 2.5} 360,${280 - (yesOdds + 6) * 2.5} 420,${280 - (yesOdds + 3) * 2.5} 480,${280 - (yesOdds - 2) * 2.5} 540,${280 - (yesOdds + 1) * 2.5} 600,${280 - yesOdds * 2.5}`}
                fill="none"
                stroke={tradeType === 'yes' ? '#10b981' : '#ef4444'}
                strokeWidth="2.5"
                className="transition-all duration-1000 ease-out"
              />
              
              {/* Area under line - with animation */}
              <polygon
                points={`0,300 0,${280 - yesOdds * 2.5} 60,${280 - (yesOdds - 3) * 2.5} 120,${280 - (yesOdds + 2) * 2.5} 180,${280 - (yesOdds - 1) * 2.5} 240,${280 - (yesOdds + 5) * 2.5} 300,${280 - (yesOdds + 8) * 2.5} 360,${280 - (yesOdds + 6) * 2.5} 420,${280 - (yesOdds + 3) * 2.5} 480,${280 - (yesOdds - 2) * 2.5} 540,${280 - (yesOdds + 1) * 2.5} 600,${280 - yesOdds * 2.5} 600,300`}
                fill={tradeType === 'yes' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)'}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-orange-500"></div>
                <span className="text-gray-600">25+ bps decrease 63%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-blue-500"></div>
                <span className="text-gray-600">No change 17%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-yellow-500"></div>
                <span className="text-gray-600">50+ bps decrease 1.1%</span>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Right: Trading Panel - Compact Style */}
      <div className="space-y-4">
        {/* Outcome Card with 50+ bps decrease */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200">
            <div className="text-sm font-semibold text-gray-900">50+ bps decrease</div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Buy/Sell Tabs - Compact */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('buy')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === 'buy'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Buy
              </button>
              <button
                onClick={() => setActiveTab('sell')}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === 'sell'
                    ? 'bg-gray-700 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Sell
              </button>
            </div>

            {/* Market Selector - Compact */}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Market</div>
              <button className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100">
                <span className="font-medium text-gray-900">Market</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            {/* Outcome Selection - Compact */}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Outcome</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeType('yes')}
                  className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    tradeType === 'yes'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Yes</span>
                    <span className="transition-all duration-500">{(yesOdds / 100).toFixed(1)}¢</span>
                  </div>
                </button>
                <button
                  onClick={() => setTradeType('no')}
                  className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 ${
                    tradeType === 'no'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>No</span>
                    <span className="transition-all duration-500">{(noOdds / 100).toFixed(1)}¢</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Amount Input - Compact */}
            <div>
              <div className="text-xs font-medium text-gray-600 mb-2">Amount</div>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-3xl font-bold text-gray-300">
                  ${amount || '0'}
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex gap-2 mt-2">
                {[1, 20, 100].map((val) => (
                  <button
                    key={val}
                    onClick={() => setAmount(val.toString())}
                    className="flex-1 px-2 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
                  >
                    +${val}
                  </button>
                ))}
                <button
                  onClick={() => setAmount('')}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Trade Button - Prominent */}
            <button
              onClick={handleTrade}
              disabled={!address || !amount || parseFloat(amount) <= 0 || trading || isApprovePending || isApproveConfirming || isTradePending || isTradeConfirming}
              className={`w-full py-3.5 rounded-lg font-semibold text-sm transition-all ${
                !address || !amount || parseFloat(amount) <= 0 || trading || isApprovePending || isApproveConfirming || isTradePending || isTradeConfirming
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isApprovePending || isApproveConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isApprovePending ? 'Approving...' : 'Confirming...'}
                </span>
              ) : isTradePending || isTradeConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  {isTradePending ? 'Trading...' : 'Confirming...'}
                </span>
              ) : trading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : !address ? (
                'Connect Wallet'
              ) : (
                'Trade'
              )}
            </button>

            {/* Disclaimer */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By trading, you agree to the{' '}
                <a href="#" className="text-blue-600 hover:underline">Terms of Use</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
