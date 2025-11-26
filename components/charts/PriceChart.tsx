'use client';

import { useMemo } from 'react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface PricePoint {
  t: number;
  p: number;
}

interface PriceChartProps {
  data: PricePoint[];
  color?: 'green' | 'red';
  currentPrice?: number;
}

export function PriceChart({ data, color = 'green', currentPrice }: PriceChartProps) {
  const chartData = useMemo(() => {
    if (data.length === 0) return [];
    
    // Determine time format based on data range
    const timeSpan = data[data.length - 1]?.t - data[0]?.t;
    const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
    
    return data.map(point => {
      const date = new Date(point.t);
      let timeLabel = '';
      
      if (daysSpan <= 1) {
        // Less than 1 day: show hours
        timeLabel = date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } else if (daysSpan <= 7) {
        // 1-7 days: show day and hour
        timeLabel = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit'
        });
      } else {
        // More than 7 days: show date
        timeLabel = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric'
        });
      }
      
      return {
        time: timeLabel,
        price: (point.p * 100).toFixed(1),
        rawPrice: point.p,
      };
    });
  }, [data]);

  const strokeColor = color === 'green' ? '#10b981' : '#ef4444';

  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">Loading price history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-80 relative">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`colorPrice-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={strokeColor} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={strokeColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={50}
          />
          <YAxis 
            stroke="#9ca3af"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}¢`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: '#6b7280', fontSize: '12px', marginBottom: '4px' }}
            itemStyle={{ color: strokeColor, fontSize: '14px', fontWeight: 600 }}
            formatter={(value: number) => [`${value}¢`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={2.5}
            fill={`url(#colorPrice-${color})`}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Current Price Badge */}
      {currentPrice !== undefined && (
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-0.5">Current</div>
          <div className={`text-lg font-bold ${color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
            {(currentPrice / 100).toFixed(2)}¢
          </div>
        </div>
      )}
    </div>
  );
}
