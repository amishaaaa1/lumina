'use client';

import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
} from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { fetchChartData, formatPrice, type ChartData } from '@/lib/coingecko';

interface TradingChartProps {
  coinId: string;
  coinSymbol: string;
  coinName: string;
  currentPrice?: number;
  priceChange24h?: number;
}

type TimeRange = '1D' | '7D' | '30D' | '90D' | '1Y';
type ChartType = 'line' | 'area' | 'candle';

const TIME_RANGE_DAYS: Record<TimeRange, number> = {
  '1D': 1,
  '7D': 7,
  '30D': 30,
  '90D': 90,
  '1Y': 365,
};

interface CandleData extends ChartData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export function TradingChart({
  coinId,
  coinSymbol,
  coinName,
  currentPrice,
  priceChange24h,
}: TradingChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7D');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [chartData, setChartData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVolume, setShowVolume] = useState(true);
  const [showMA, setShowMA] = useState(true);

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

      // Convert to candle-like data with simulated OHLC
      const candleData: CandleData[] = data.map((point, index) => {
        const volatility = point.price * 0.02; // 2% volatility
        const open = index > 0 ? data[index - 1].price : point.price;
        const close = point.price;
        const high = Math.max(open, close) + Math.random() * volatility;
        const low = Math.min(open, close) - Math.random() * volatility;
        const volume = Math.random() * 1000000000; // Simulated volume

        return {
          ...point,
          open,
          high,
          low,
          close,
          volume,
        };
      });

      setChartData(candleData);
    } catch (err) {
      setError('Failed to load chart data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate Moving Average
  const calculateMA = (data: CandleData[], period: number = 20) => {
    return data.map((point, index) => {
      if (index < period - 1) return { ...point, ma: null };
      const sum = data
        .slice(index - period + 1, index + 1)
        .reduce((acc, p) => acc + p.close, 0);
      return { ...point, ma: sum / period };
    });
  };

  const dataWithMA = showMA ? calculateMA(chartData) : chartData;

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

  // Calculate 24h high/low from data
  const high24h = chartData.length > 0 ? Math.max(...chartData.map(d => d.high)) : 0;
  const low24h = chartData.length > 0 ? Math.min(...chartData.map(d => d.low)) : 0;
  const volume24h = chartData.length > 0 
    ? chartData.reduce((sum, d) => sum + d.volume, 0) 
    : 0;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{coinSymbol}</h2>
            <span className="text-gray-600">{coinName}</span>
            <Badge variant="success" className="animate-pulse">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2" />
              Live
            </Badge>
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

        {/* Controls */}
        <div className="flex flex-col gap-3">
          {/* Time Range */}
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

          {/* Chart Type & Indicators */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={chartType === 'line' ? 'primary' : 'ghost'}
              onClick={() => setChartType('line')}
              title="Line Chart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant={chartType === 'area' ? 'primary' : 'ghost'}
              onClick={() => setChartType('area')}
              title="Area Chart"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
            </Button>
            <Button
              size="sm"
              variant={showVolume ? 'primary' : 'ghost'}
              onClick={() => setShowVolume(!showVolume)}
              title="Toggle Volume"
            >
              Vol
            </Button>
            <Button
              size="sm"
              variant={showMA ? 'primary' : 'ghost'}
              onClick={() => setShowMA(!showMA)}
              title="Toggle MA(20)"
            >
              MA
            </Button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="h-[500px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="h-[500px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadChartData}>Retry</Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Main Price Chart */}
          <ResponsiveContainer width="100%" height={showVolume ? 350 : 450}>
            <ComposedChart data={dataWithMA} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
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

              {chartType === 'area' && (
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? '#10b981' : '#ef4444'}
                  fill={isPositive ? '#10b98120' : '#ef444420'}
                  strokeWidth={2}
                />
              )}

              {chartType === 'line' && (
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? '#10b981' : '#ef4444'}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              )}

              {showMA && (
                <Line
                  type="monotone"
                  dataKey="ma"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  dot={false}
                  strokeDasharray="5 5"
                  name="MA(20)"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

          {/* Volume Chart */}
          {showVolume && (
            <ResponsiveContainer width="100%" height={100}>
              <ComposedChart data={chartData} margin={{ top: 0, right: 5, left: 5, bottom: 5 }}>
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  stroke="#999"
                  style={{ fontSize: '10px' }}
                />
                <YAxis
                  tickFormatter={(value) => `${(value / 1e9).toFixed(1)}B`}
                  stroke="#999"
                  style={{ fontSize: '10px' }}
                />
                <Tooltip
                  formatter={(value: number) => `$${(value / 1e9).toFixed(2)}B`}
                  labelFormatter={formatTooltipLabel}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '8px',
                  }}
                />
                <Bar
                  dataKey="volume"
                  fill="#94a3b8"
                  opacity={0.6}
                  radius={[2, 2, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      )}

      {/* Stats Footer */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-600 mb-1">24h High</div>
            <div className="font-semibold text-green-600">
              {formatPrice(high24h)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">24h Low</div>
            <div className="font-semibold text-red-600">
              {formatPrice(low24h)}
            </div>
          </div>
          <div>
            <div className="text-gray-600 mb-1">24h Volume</div>
            <div className="font-semibold">
              ${(volume24h / 1e9).toFixed(2)}B
            </div>
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
