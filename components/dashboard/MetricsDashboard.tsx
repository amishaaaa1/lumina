'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';

interface ProtocolMetrics {
  tvl: number;
  totalVolume: number;
  activePolicies: number;
  totalClaims: number;
  claimsPaid: number;
  avgPremium: number;
  poolUtilization: number;
  lpCount: number;
  avgApy: number;
}

interface MarketMetrics {
  id: string;
  name: string;
  volume: number;
  policies: number;
  avgPremium: number;
  category: string;
}

export function MetricsDashboard() {
  const [metrics, setMetrics] = useState<ProtocolMetrics>({
    tvl: 2547893,
    totalVolume: 8934521,
    activePolicies: 1234,
    totalClaims: 156,
    claimsPaid: 450234,
    avgPremium: 3.2,
    poolUtilization: 67,
    lpCount: 89,
    avgApy: 42.5,
  });

  const [topMarkets, setTopMarkets] = useState<MarketMetrics[]>([
    {
      id: '1',
      name: 'BTC > $50K by Dec 31',
      volume: 2400000,
      policies: 342,
      avgPremium: 3.2,
      category: 'Crypto',
    },
    {
      id: '2',
      name: 'ETH ETF Approval 2024',
      volume: 1800000,
      policies: 289,
      avgPremium: 4.8,
      category: 'Crypto',
    },
    {
      id: '3',
      name: 'Trump Election Win',
      volume: 3200000,
      policies: 567,
      avgPremium: 6.1,
      category: 'Politics',
    },
    {
      id: '4',
      name: 'SOL > $200 by Q1 2025',
      volume: 950000,
      policies: 178,
      avgPremium: 5.4,
      category: 'Crypto',
    },
    {
      id: '5',
      name: 'AI Regulation Passed',
      volume: 584000,
      policies: 123,
      avgPremium: 7.2,
      category: 'Tech',
    },
  ]);

  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('7d');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        tvl: prev.tvl + Math.random() * 10000 - 5000,
        activePolicies: prev.activePolicies + Math.floor(Math.random() * 3 - 1),
        poolUtilization: Math.min(80, Math.max(50, prev.poolUtilization + Math.random() * 2 - 1)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Protocol Metrics</h2>
          <p className="text-gray-600 mt-1">Real-time analytics and performance data</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {(['24h', '7d', '30d', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range === 'all' ? 'All Time' : range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* TVL */}
        <Card className="p-6 hover-lift">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Value Locked</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(metrics.tvl)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">+12.5%</Badge>
            <span className="text-sm text-gray-500">vs last {timeRange}</span>
          </div>
        </Card>

        {/* Total Volume */}
        <Card className="p-6 hover-lift">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Volume</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(metrics.totalVolume)}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">+8.3%</Badge>
            <span className="text-sm text-gray-500">vs last {timeRange}</span>
          </div>
        </Card>

        {/* Active Policies */}
        <Card className="p-6 hover-lift">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {metrics.activePolicies.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🛡️</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="success">+15.2%</Badge>
            <span className="text-sm text-gray-500">vs last {timeRange}</span>
          </div>
        </Card>

        {/* Claims Paid */}
        <Card className="p-6 hover-lift">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm text-gray-600 font-medium">Claims Paid</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {formatCurrency(metrics.claimsPaid)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge>90% success rate</Badge>
          </div>
        </Card>
      </div>

      {/* Pool Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pool Utilization */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Pool Utilization</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Current Utilization</span>
                <span className="text-2xl font-bold text-blue-600">
                  {formatPercent(metrics.poolUtilization)}
                </span>
              </div>
              <Progress value={metrics.poolUtilization} max={100} />
              <p className="text-xs text-gray-500 mt-2">
                {metrics.poolUtilization < 60 && '🟢 Low utilization - Great time to buy insurance'}
                {metrics.poolUtilization >= 60 && metrics.poolUtilization < 75 && '🟡 Medium utilization - Normal premiums'}
                {metrics.poolUtilization >= 75 && '🔴 High utilization - Higher premiums'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <p className="text-sm text-gray-600">LP Count</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.lpCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg APY</p>
                <p className="text-2xl font-bold text-green-600">{formatPercent(metrics.avgApy)}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Premium Stats */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Premium Statistics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Average Premium</span>
                <span className="text-2xl font-bold text-purple-600">
                  {formatPercent(metrics.avgPremium)}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Based on {metrics.activePolicies} active policies
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-gray-600">Min</p>
                <p className="text-lg font-bold text-gray-900">2.0%</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Avg</p>
                <p className="text-lg font-bold text-gray-900">{formatPercent(metrics.avgPremium)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Max</p>
                <p className="text-lg font-bold text-gray-900">10.0%</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Premium Distribution</p>
              <div className="flex gap-2">
                <div className="flex-1 h-2 bg-green-500 rounded" style={{ width: '40%' }} title="Low (2-4%)" />
                <div className="flex-1 h-2 bg-yellow-500 rounded" style={{ width: '35%' }} title="Medium (4-7%)" />
                <div className="flex-1 h-2 bg-red-500 rounded" style={{ width: '25%' }} title="High (7-10%)" />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Markets */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Top Markets by Volume</h3>
        <div className="space-y-3">
          {topMarkets.map((market, index) => (
            <div
              key={market.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{market.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline">{market.category}</Badge>
                    <span className="text-sm text-gray-500">
                      {market.policies} policies
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(market.volume)}
                </p>
                <p className="text-sm text-gray-500">
                  {formatPercent(market.avgPremium)} avg premium
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Live Activity Feed */}
      <Card className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Live Activity
          <span className="ml-2 inline-flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
          </span>
        </h3>
        <div className="space-y-3">
          {[
            { type: 'policy', user: '0x742d...3f4a', action: 'bought insurance', market: 'BTC > $50K', amount: '$5,000', time: '2m ago' },
            { type: 'deposit', user: '0x8a3c...9b2e', action: 'deposited', market: 'Main Pool', amount: '$25,000', time: '5m ago' },
            { type: 'claim', user: '0x1f5d...7c8b', action: 'claimed payout', market: 'ETH ETF', amount: '$12,500', time: '8m ago' },
            { type: 'policy', user: '0x9e2a...4d1f', action: 'bought insurance', market: 'Trump Win', amount: '$8,000', time: '12m ago' },
            { type: 'withdraw', user: '0x3b7f...6a9c', action: 'withdrew', market: 'Main Pool', amount: '$15,000', time: '15m ago' },
          ].map((activity, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {activity.type === 'policy' && '🛡️'}
                  {activity.type === 'deposit' && '💰'}
                  {activity.type === 'claim' && '✅'}
                  {activity.type === 'withdraw' && '💸'}
                </span>
                <div>
                  <p className="text-sm text-gray-900">
                    <span className="font-mono font-semibold">{activity.user}</span>{' '}
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-600">{activity.market}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">{activity.amount}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
