'use client';

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useToast } from '@/hooks/useToast';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { PriceChart } from '@/components/charts/PriceChart';
import { AnimatedPrice } from '@/components/ui/AnimatedPrice';

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

interface PricePoint {
  t: number;
  p: number;
}

export default function TradingView({ marketId }: TradingViewProps) {
  const { address } = useAccount();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [tradeType, setTradeType] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [timeRange, setTimeRange] = useState<'past' | '1d' | '7d' | '30d' | 'all'>('past');

  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [prevOdds, setPrevOdds] = useState<{ yes: number; no: number } | null>(null);
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([]);
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

  // Calculate estimated shares
  const currentPrice = tradeType === 'yes' ? (marketData?.yesOdds || 50) : (marketData?.noOdds || 50);
  const estimatedShares = amount ? (parseFloat(amount) / currentPrice * 100).toFixed(2) : '0';

  // Handle approval success
  useEffect(() => {
    if (isApproveSuccess && !tradeHash && amount) {
      const amountParsed = parseUnits(amount, 18);
      showToast(`✅ Approved! Now placing ${activeTab === 'buy' ? 'buy' : 'sell'} order...`, 'info');
      
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

  // Generate mock price history based on time range
  useEffect(() => {
    function generateMockHistory() {
      // Map time range to hours
      const hoursMap = {
        'past': 24,    // 1 day
        '1d': 24,      // 1 day
        '7d': 168,     // 7 days
        '30d': 720,    // 30 days
        'all': 2160,   // 90 days
      };
      
      const hours = hoursMap[timeRange];
      const now = Date.now();
      
      // Generate base price from market ID hash for consistency
      const hash = marketId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const basePrice = 0.25 + (hash % 50) / 100; // Range: 0.25-0.75
      
      // Determine data points based on time range
      const dataPoints = Math.min(hours, 200); // Cap at 200 points
      
      // Create realistic price movement with trends
      const pattern = hash % 5;
      const history: PricePoint[] = Array.from({ length: dataPoints }, (_, i) => {
        const progress = i / dataPoints;
        
        // Add different trend patterns
        let trendFactor = 0;
        switch (pattern) {
          case 0: // Upward trend
            trendFactor = progress * 0.15;
            break;
          case 1: // Downward trend
            trendFactor = -progress * 0.15;
            break;
          case 2: // Volatile (up then down)
            trendFactor = Math.sin(progress * Math.PI) * 0.12;
            break;
          case 3: // Stable with small fluctuations
            trendFactor = Math.sin(progress * Math.PI * 4) * 0.03;
            break;
          case 4: // Sharp movement in middle
            trendFactor = progress < 0.5 ? progress * 0.2 : (1 - progress) * 0.2;
            break;
        }
        
        // Add random noise for realism
        const noise = (Math.random() - 0.5) * 0.04;
        
        // Calculate final price
        let price = basePrice + trendFactor + noise;
        
        // Keep within bounds
        price = Math.max(0.15, Math.min(0.85, price));
        
        // Calculate time interval
        const intervalMs = (hours * 3600000) / dataPoints;
        
        return {
          t: now - (dataPoints - 1 - i) * intervalMs,
          p: parseFloat(price.toFixed(3)),
        };
      });
      
      console.log(`📊 Generated mock history: ${history.length} points over ${hours}h, base: ${basePrice.toFixed(2)}, pattern: ${pattern}`);
      setPriceHistory(history);
    }

    generateMockHistory();
  }, [marketId, timeRange]);

  useEffect(() => {
    async function fetchMarketData() {
      try {
        if (!marketData) {
          setLoading(true);
        }
        
        const response = await fetch(`/api/polymarket?limit=100`);
        const data = await response.json();
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const market = data.find((m: any) => m.id === marketId);
        
        if (market) {
          const yesPrice = market.markets?.[0]?.outcome_prices?.[0];
          const noPrice = market.markets?.[0]?.outcome_prices?.[1];
          
          const yesOdds = yesPrice ? Math.round(parseFloat(yesPrice) * 100) : 50;
          const noOdds = noPrice ? Math.round(parseFloat(noPrice) * 100) : 50;
          
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
        }
      } catch (error) {
        console.error('Failed to fetch market data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMarketData();
    const intervalId = setInterval(() => {
      fetchMarketData();
    }, 30000);
    
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
      
      showToast('🦊 Please approve USDC in MetaMask...', 'info');
      
      const timeoutId = setTimeout(() => {
        setTrading(false);
        showToast('⏱️ Transaction timeout. Please try again.', 'error');
      }, 60000);
      
      (window as typeof window & { __tradeTimeout?: NodeJS.Timeout }).__tradeTimeout = timeoutId;
      
      approveToken({
        ...ASSET_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.PredictionMarket.address, totalAmountParsed],
        gas: BigInt(100000),
      });
    } catch (error) {
      console.error('Trade failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Trade failed. Please try again.';
      showToast(errorMessage, 'error');
      setTrading(false);
      clearTradeTimeout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-2xl">
              📊
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{title}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  ${(volume / 1000).toFixed(1)}K Vol.
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(marketData.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              {/* Time Range Selector */}
              <div className="flex items-center gap-2 mb-6">
                {[
                  { label: '1D', value: 'past' },
                  { label: '1W', value: '7d' },
                  { label: '1M', value: '30d' },
                  { label: 'All', value: 'all' },
                ].map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setTimeRange(range.value as typeof timeRange)}
                    className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                      timeRange === range.value
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {/* Outcome Legend */}
              <div className="flex items-center gap-4 mb-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-600">25 bps decrease 83%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">No change 17%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-gray-600">50+ bps decrease 1.0%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-600">25+ bps increase +1%</span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-80">
                <PriceChart 
                  data={priceHistory}
                  color={tradeType === 'yes' ? 'green' : 'red'}
                  currentPrice={tradeType === 'yes' ? yesOdds : noOdds}
                />
              </div>

              {/* Polymarket Branding */}
              <div className="flex justify-end mt-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5z"/>
                  </svg>
                  <span className="text-xs font-medium">Polymarket</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Trading Panel */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center text-sm">
                    📊
                  </div>
                  <span className="text-sm font-semibold text-gray-900">50+ bps decrease</span>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Buy/Sell Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('buy')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      activeTab === 'buy'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => setActiveTab('sell')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${
                      activeTab === 'sell'
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Sell
                  </button>
                  <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1">
                    Market
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Outcome Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setTradeType('yes')}
                    className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                      tradeType === 'yes'
                        ? 'bg-green-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-xs mb-1">Yes</div>
                    <div className="text-lg">
                      <AnimatedPrice value={yesOdds / 100} decimals={1} suffix="¢" />
                    </div>
                  </button>
                  <button
                    onClick={() => setTradeType('no')}
                    className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                      tradeType === 'no'
                        ? 'bg-gray-700 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-xs mb-1">No</div>
                    <div className="text-lg">
                      <AnimatedPrice value={noOdds / 100} decimals={1} suffix="¢" />
                    </div>
                  </button>
                </div>

                {/* Amount Input */}
                <div>
                  <div className="text-sm font-medium text-gray-700 mb-2">Amount</div>
                  <div className="relative">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-200 pointer-events-none">
                      ${amount || '0'}
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    {[1, 20, 100].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className="flex-1 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        +${val}
                      </button>
                    ))}
                    <button
                      onClick={() => setAmount('1000')}
                      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white text-xs font-medium rounded-lg transition-colors"
                    >
                      Max
                    </button>
                  </div>
                </div>

                {/* Trade Button */}
                <button
                  onClick={handleTrade}
                  disabled={!address || !amount || parseFloat(amount) <= 0 || trading || isApprovePending || isApproveConfirming || isTradePending || isTradeConfirming}
                  className={`w-full py-4 rounded-lg font-semibold text-sm transition-all ${
                    !address || !amount || parseFloat(amount) <= 0 || trading || isApprovePending || isApproveConfirming || isTradePending || isTradeConfirming
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
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
                <div className="text-center pt-2">
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
    </div>
  );
}
