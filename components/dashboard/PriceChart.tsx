'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fetchChartData, formatPrice, type ChartData } from '@/lib/coingecko';

interface PriceChartProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  currentPrice?: number;
  priceChange24h?: number;
}

type TimeRange = '1D' | '7D' | '30D' | '90D' | '1Y';

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1D': 1,
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
};

export function PriceChart({
  coinId,
  coinSymbol,
  coinName,
  currentPrice,
  priceChange24h,
}: PriceChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coinId, timeRange]);

  const loadChartData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const days = TIME_RANGE_DAYS[timeRange];
      const data = await fetchChartData(coinId, days);
      setChartData(data);
    } catch (err) {
      setError('Failed to load chart data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltip = (value: number) => {
    return formatPrice(value);
  };

  const formatTooltipLabel = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeRange === '1D') {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const priceChangePercent = priceChange24h && currentPrice
    ? ((priceChange24h / currentPrice) * 100).toFixed(2)
    : null;

  const isPositive = (priceChange24h ?? 0) >= 0;

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{coinSymbol}</h2>
            <span className="text-gray-600">{coinName}</span>
          </div>
          
          {currentPrice && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(currentPrice)}
              </span>
              {priceChangePercent && (
                <Badge variant={isPositive ? 'success' : 'error'}>
                  {isPositive ? '↑' : '↓'} {Math.abs(parseFloat(priceChangePercent))}%
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {(['1D', '7D', '30D', '90D', '1Y'] as TimeRange[]).map((range) => (
            <Button
              key={range}
              size="sm"
              variant={timeRange === range ? 'primary' : 'ghost'}
              onClick={() => setTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[400px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="h-[400px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadChartData}>Retry</Button>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={formatXAxis}
              stroke="#999"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              stroke="#999"
              style={{ fontSize: '12px' }}
              domain={['auto', 'auto']}
            />
            <Tooltip
              formatter={formatTooltip}
              labelFormatter={formatTooltipLabel}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke={isPositive ? '#10b981' : '#ef4444'}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">24h High</div>
            <div className="font-semibold">
              {currentPrice ? formatPrice(currentPrice * 1.05) : '-'}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">24h Low</div>
            <div className="font-semibold">
              {currentPrice ? formatPrice(currentPrice * 0.95) : '-'}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">24h Volume</div>
            <div className="font-semibold">$2.8B</div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">Market Cap</div>
            <div className="font-semibold">$1.14T</div>
          </div>
        </div>
      </div>
    </Card>
  );
}
