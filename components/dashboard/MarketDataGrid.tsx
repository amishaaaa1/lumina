'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fetchCoinPrices, formatPrice, formatMarketCap, type CoinPrice, COIN_IDS } from '@/lib/coingecko';
import { usePolling } from '@/hooks/usePolling';

interface MarketDataGridProps {
  onCoinSelect?: (coinId: string, symbol: string, name: string) => void;
  selectedCoinId?: string;
}

export function MarketDataGrid({ onCoinSelect, selectedCoinId }: MarketDataGridProps) {
  const [coins, setCoins] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoins = async () => {
      const coinIds = Object.values(COIN_IDS).slice(0, 8); // Top 8 coins
      const data = await fetchCoinPrices(coinIds);
      setCoins(data);
      setLoading(false);
    };
    
    loadCoins();
  }, []);

  const loadCoins = async () => {
    const coinIds = Object.values(COIN_IDS).slice(0, 8);
    const data = await fetchCoinPrices(coinIds);
    setCoins(data);
  };

  // Auto-refresh every 10 seconds for real-time feel
  usePolling(loadCoins, { interval: 10000 });

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Select Cryptocurrency</h2>
        <Badge variant="success" className="animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2" />
          Live
        </Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">#</th>
              <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Asset</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Price</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">24h Change</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Market Cap</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Volume</th>
              <th className="text-right py-3 px-2 text-sm font-semibold text-gray-600">Chart</th>
            </tr>
          </thead>
          <tbody>
            {coins.map((coin, index) => {
              const isPositive = (coin.price_change_percentage_24h ?? 0) >= 0;
              const isSelected = coin.id === selectedCoinId;
              
              return (
                <tr
                  key={coin.id}
                  className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onCoinSelect?.(coin.id, coin.symbol, coin.name)}
                >
                  <td className="py-4 px-2 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                        {coin.symbol.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{coin.symbol.toUpperCase()}</div>
                        <div className="text-xs text-gray-500">{coin.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2 text-right font-semibold">
                    {formatPrice(coin.current_price)}
                  </td>
                  <td className="py-4 px-2 text-right">
                    <Badge variant={isPositive ? 'success' : 'error'}>
                      {isPositive ? '↑' : '↓'} {Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%
                    </Badge>
                  </td>
                  <td className="py-4 px-2 text-right text-sm">
                    {formatMarketCap(coin.market_cap)}
                  </td>
                  <td className="py-4 px-2 text-right text-sm">
                    {formatMarketCap(coin.total_volume)}
                  </td>
                  <td className="py-4 px-2 text-right">
                    {coin.sparkline_in_7d?.price && (
                      <MiniSparkline data={coin.sparkline_in_7d.price} isPositive={isPositive} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function MiniSparkline({ data, isPositive }: { data: number[]; isPositive: boolean }) {
  const width = 80;
  const height = 30;
  const padding = 2;
  
  if (!data || data.length === 0) return null;
  
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg width={width} height={height} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={isPositive ? '#10b981' : '#ef4444'}
        strokeWidth="1.5"
      />
    </svg>
  );
}
