'use client';

import { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  fetchCandlesticks,
  createCandlestickWebSocket,
  getSymbolFromCoin,
  INTERVALS,
} from '@/lib/binance';

interface TradingViewChartProps {
  coinSymbol: string;
  coinName: string;
}

type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export function TradingViewChart({ coinSymbol, coinName }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [loading, setLoading] = useState(true);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [ohlc, setOhlc] = useState({ open: 0, high: 0, low: 0, close: 0, volume: 0 });

  const binanceSymbol = getSymbolFromCoin(coinSymbol);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#ffffff' },
        textColor: '#333',
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      grid: {
        vertLines: { color: '#f0f0f0' },
        horzLines: { color: '#f0f0f0' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: '#e0e0e0',
      },
      timeScale: {
        borderColor: '#e0e0e0',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const volumeSeries = (chart as any).addHistogramSeries({
      color: '#94a3b8',
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: '',
    });

    volumeSeriesRef.current = volumeSeries;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (chartRef.current) {
        chartRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    loadCandles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [binanceSymbol, timeframe]);

  const loadCandles = async () => {
    setLoading(true);

    try {
      console.log(`📈 Loading ${coinSymbol} (${binanceSymbol}) chart...`);
      const data = await fetchCandlesticks(binanceSymbol, INTERVALS[timeframe], 200);
      console.log(`📊 Loaded ${data.length} candles`);

      if (data.length > 0 && candlestickSeriesRef.current && volumeSeriesRef.current) {
        // Format data for lightweight-charts
        const candleData = data.map((candle) => ({
          time: (candle.time / 1000) as Time, // Convert to seconds
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        const volumeData = data.map((candle) => ({
          time: (candle.time / 1000) as Time,
          value: candle.volume,
          color: candle.close >= candle.open ? '#10b98180' : '#ef444480',
        }));

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (candlestickSeriesRef.current as any).setData(candleData);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (volumeSeriesRef.current as any).setData(volumeData);

        // Fit content
        if (chartRef.current) {
          chartRef.current.timeScale().fitContent();
        }

        const latest = data[data.length - 1];
        console.log(`💰 Current ${coinSymbol} price: $${latest.close.toFixed(2)}`);
        setLivePrice(latest.close);
        setOhlc({
          open: latest.open,
          high: latest.high,
          low: latest.low,
          close: latest.close,
          volume: latest.volume,
        });

        if (data.length > 1) {
          const first = data[0];
          const change = ((latest.close - first.close) / first.close) * 100;
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

          if (candlestickSeriesRef.current && volumeSeriesRef.current) {
            const candleData = {
              time: (newCandle.time / 1000) as Time,
              open: newCandle.open,
              high: newCandle.high,
              low: newCandle.low,
              close: newCandle.close,
            };

            const volumeData = {
              time: (newCandle.time / 1000) as Time,
              value: newCandle.volume,
              color: newCandle.close >= newCandle.open ? '#10b98180' : '#ef444480',
            };

            candlestickSeriesRef.current.update(candleData);
            volumeSeriesRef.current.update(volumeData);
          }

          setLivePrice(newCandle.close);
          setOhlc({
            open: newCandle.open,
            high: newCandle.high,
            low: newCandle.low,
            close: newCandle.close,
            volume: newCandle.volume,
          });
        }
      );
    } catch (error) {
      console.error('Error loading candles:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (value: number) => {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const isPositive = priceChange >= 0;

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
              <span className="text-3xl font-bold">{formatPrice(livePrice)}</span>
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
          <div ref={chartContainerRef} className="w-full" />

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <div className="text-gray-600 mb-1">Open</div>
                <div className="font-semibold">{formatPrice(ohlc.open)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">High</div>
                <div className="font-semibold text-green-600">{formatPrice(ohlc.high)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Low</div>
                <div className="font-semibold text-red-600">{formatPrice(ohlc.low)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Close</div>
                <div className="font-semibold">{formatPrice(ohlc.close)}</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Volume</div>
                <div className="font-semibold">
                  {(ohlc.volume / 1000).toFixed(0)}K {coinSymbol}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  );
}
