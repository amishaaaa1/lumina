'use client';

import { useState, useEffect, useRef } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  fetchCandlesticks, 
  createCandlestickWebSocket,
  getSymbolFromCoin,
  INTERVALS,
  type Candlestick 
} from '@/lib/binance';

interface CandlestickChartProps {
  coinSymbol: string;
  coinName: string;
}

type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export function CandlestickChart({ coinSymbol, coinName }: CandlestickChartProps) {
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [candles, setCandles] = useState<Candlestick[]>([]);
  const [loading, setLoading] = useState(true);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const wsRef = useRef<WebSocket | null>(null);

  const binanceSymbol = getSymbolFromCoin(coinSymbol);

  const loadCandles = async () => {
    setLoading(true);
    
    try {
      console.log(`📈 Loading ${coinSymbol} (${binanceSymbol}) chart...`);
      const data = await fetchCandlesticks(binanceSymbol, INTERVALS[timeframe], 100);
      console.log(`📊 Loaded ${data.length} candles`);
      setCandles(data);
      
      if (data.length > 0) {
        const latest = data[data.length - 1];
        console.log(`💰 Current ${coinSymbol} price: $${latest.close.toFixed(2)}`);
        setLivePrice(latest.close);
        
        if (data.length > 1) {
          const previous = data[data.length - 2];
          const change = ((latest.close - previous.close) / previous.close) * 100;
          setPriceChange(change);
          console.log(`📈 Price change: ${change.toFixed(2)}%`);
        }
      }
      
      // Setup WebSocket for real-time updates
      if (wsRef.current) {
        console.log('🔌 Closing previous WebSocket...');
        wsRef.current.close();
      }
      
      console.log(`🔌 Connecting WebSocket for ${binanceSymbol} ${INTERVALS[timeframe]}...`);
      wsRef.current = createCandlestickWebSocket(
        binanceSymbol,
        INTERVALS[timeframe],
        (newCandle) => {
          console.log(`🔄 WebSocket update: $${newCandle.close.toFixed(2)}`);
          
          setCandles(prev => {
            const updated = [...prev];
            const lastCandle = updated[updated.length - 1];
            
            // Update last candle if same time, otherwise add new
            if (lastCandle && lastCandle.time === newCandle.time) {
              updated[updated.length - 1] = newCandle;
            } else {
              updated.push(newCandle);
              if (updated.length > 100) {
                updated.shift();
              }
            }
            
            return updated;
          });
          
          setLivePrice(newCandle.close);
          
          // Calculate price change
          if (candles.length > 1) {
            const firstPrice = candles[0].close;
            const change = ((newCandle.close - firstPrice) / firstPrice) * 100;
            setPriceChange(change);
          }
        }
      );
      
    } catch (error) {
      console.error('Error loading candles:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCandles();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binanceSymbol, timeframe]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    if (timeframe === '1m' || timeframe === '5m' || timeframe === '15m') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    if (timeframe === '1h' || timeframe === '4h') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const isPositive = priceChange >= 0;

  // Prepare data for chart
  const chartData = candles.map(candle => ({
    time: candle.time,
    price: candle.close,
    volume: candle.volume,
    // For candlestick body
    candleColor: candle.close >= candle.open ? '#10b981' : '#ef4444',
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-bold">{coinSymbol}/USDT</h2>
            <span className="text-gray-600">{coinName}</span>
            <Badge variant="success" className="animate-pulse">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2" />
              Live
            </Badge>
          </div>
          
          {livePrice && (
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold">
                {formatPrice(livePrice)}
              </span>
              <Badge variant={isPositive ? 'success' : 'error'}>
                {isPositive ? '↑' : '↓'} {Math.abs(priceChange).toFixed(2)}%
              </Badge>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {(['1m', '5m', '15m', '1h', '4h', '1d', '1w'] as TimeFrame[]).map((tf) => (
            <Button
              key={tf}
              size="sm"
              variant={timeframe === tf ? 'primary' : 'ghost'}
              onClick={() => setTimeframe(tf)}
            >
              {tf.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[500px] flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="time"
                tickFormatter={formatXAxis}
                stroke="#999"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                yAxisId="price"
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                stroke="#999"
                style={{ fontSize: '12px' }}
                domain={['auto', 'auto']}
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                stroke="#999"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#666', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10b981' : '#ef4444'}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#94a3b8"
                opacity={0.3}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Open</div>
                <div className="font-semibold">
                  {candles.length > 0 ? formatPrice(candles[candles.length - 1].open) : '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">High</div>
                <div className="font-semibold text-green-600">
                  {candles.length > 0 ? formatPrice(candles[candles.length - 1].high) : '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Low</div>
                <div className="font-semibold text-red-600">
                  {candles.length > 0 ? formatPrice(candles[candles.length - 1].low) : '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Close</div>
                <div className="font-semibold">
                  {candles.length > 0 ? formatPrice(candles[candles.length - 1].close) : '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Volume</div>
                <div className="font-semibold">
                  {candles.length > 0 ? `${(candles[candles.length - 1].volume / 1000).toFixed(0)}K` : '-'}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: unknown[] }) {
  if (!active || !payload || !Array.isArray(payload) || payload.length === 0) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (payload[0] as any).payload;
  const isGreen = data.close >= data.open;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <div className="text-xs text-gray-500 mb-2">
        {new Date(data.time).toLocaleString()}
      </div>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Open:</span>
          <span className="font-semibold">${data.open.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">High:</span>
          <span className="font-semibold text-green-600">${data.high.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Low:</span>
          <span className="font-semibold text-red-600">${data.low.toFixed(2)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-600">Close:</span>
          <span className={`font-semibold ${isGreen ? 'text-green-600' : 'text-red-600'}`}>
            ${data.close.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between gap-4 pt-2 border-t border-gray-200">
          <span className="text-gray-600">Volume:</span>
          <span className="font-semibold">{(data.volume / 1000).toFixed(1)}K</span>
        </div>
      </div>
    </div>
  );
}
