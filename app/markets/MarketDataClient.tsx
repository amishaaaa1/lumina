'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Navigation } from '@/components/layout/Navigation';
import { CandlestickChart } from '@/components/dashboard/CandlestickChart';
import { MarketDataGrid } from '@/components/dashboard/MarketDataGrid';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { usePolymarketData } from '@/hooks/usePolymarketData';
import { useOnChainActivity } from '@/hooks/useOnChainActivity';
import { formatVolume } from '@/lib/polymarket';

export default function MarketDataClient() {
  const [selectedCoin, setSelectedCoin] = useState({
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
  });
  
  const { markets, loading } = usePolymarketData();
  const { activities, totalPolicies, loading: activityLoading } = useOnChainActivity();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Container className="py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Market Intelligence</h1>
            <Badge variant="success" className="animate-pulse">
              <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2" />
              Live Data
            </Badge>
          </div>
          <p className="text-gray-600">
            Real-time market data, sentiment analysis, and actionable insights
          </p>
        </div>

        {/* Main Layout: Content + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trending Markets */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Trending Markets</h2>
                <span className="text-sm text-gray-500">Live from Polymarket</span>
              </div>
              {loading ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="h-4 bg-gray-200 rounded mb-3" />
                      <div className="h-2 bg-gray-200 rounded mb-2" />
                      <div className="h-2 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {markets.slice(0, 4).map(market => {
                    const trend = market.sentiment.bullish > 60 ? 'up' : market.sentiment.bullish < 40 ? 'down' : 'neutral';
                    return (
                      <TrendingMarketCard
                        key={market.id}
                        title={market.title}
                        sentiment={market.sentiment}
                        volume={`$${formatVolume(market.volume)}`}
                        premium={market.premium}
                        trend={trend}
                      />
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Live Chart */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Live Price Chart</h2>
              <CandlestickChart
                coinSymbol={selectedCoin.symbol}
                coinName={selectedCoin.name}
              />
            </Card>

            {/* Market Data Grid */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">All Markets</h2>
              <MarketDataGrid
                onCoinSelect={(id, symbol, name) => setSelectedCoin({ id, symbol, name })}
                selectedCoinId={selectedCoin.id}
              />
            </Card>

            {/* Market Overview Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-gray-600 mb-1">Total Market Cap</div>
                <div className="text-2xl font-bold">$2.14T</div>
                <div className="text-sm text-green-600 mt-1">+2.4% 24h</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600 mb-1">24h Volume</div>
                <div className="text-2xl font-bold">$89.2B</div>
                <div className="text-sm text-green-600 mt-1">+8.1% 24h</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-600 mb-1">BTC Dominance</div>
                <div className="text-2xl font-bold">53.2%</div>
                <div className="text-sm text-gray-500 mt-1">Stable</div>
              </Card>
            </div>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Live Activity Feed */}
            <Card className="p-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Live Activity
              </h3>
              {activityLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                      <div className="h-12 bg-gray-200 rounded" />
                    </div>
                  ))}
                </div>
              ) : activities.length > 0 ? (
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <ActivityItem
                      key={activity.id}
                      action={activity.action}
                      market={activity.market}
                      amount={activity.amount}
                      time={activity.time}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  No recent activity
                </div>
              )}
              <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{totalPolicies}</span> total policies
                </div>
              </div>
            </Card>

            {/* Top Movers */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Top Movers (24h)</h3>
              <div className="space-y-3">
                <MoverItem symbol="SOL" name="Solana" change={8.4} />
                <MoverItem symbol="AVAX" name="Avalanche" change={6.2} />
                <MoverItem symbol="MATIC" name="Polygon" change={5.1} />
                <MoverItem symbol="XRP" name="Ripple" change={-3.2} isNegative />
                <MoverItem symbol="ADA" name="Cardano" change={-2.8} isNegative />
              </div>
            </Card>

            {/* Market Insights */}
            <Card className="p-6">
              <h3 className="font-bold mb-4">Market Insights</h3>
              <div className="space-y-3">
                <InsightItem
                  title="BTC volatility up 45%"
                  description="Consider insurance before weekend"
                  urgency="high"
                />
                <InsightItem
                  title="ETH upgrade incoming"
                  description="Price may spike, hedge now"
                  urgency="medium"
                />
                <InsightItem
                  title="Altcoin season signals"
                  description="Diversify your coverage"
                  urgency="low"
                />
              </div>
            </Card>

            {/* CTA */}
            <Card className="p-6 bg-gray-900 text-white">
              <h3 className="font-bold mb-2">Start Trading Protected</h3>
              <p className="text-sm text-gray-300 mb-4">
                Hedge your positions with insurance
              </p>
              <Link
                href="/insurance"
                className="block w-full py-2.5 bg-white text-gray-900 rounded-lg font-medium text-center hover:bg-gray-100 transition-colors"
              >
                Buy Insurance
              </Link>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}

// Trending Market Card with Sentiment
function TrendingMarketCard({
  title,
  sentiment,
  volume,
  premium,
  trend,
}: {
  title: string;
  sentiment: { bullish: number; bearish: number };
  volume: string;
  premium: string;
  trend: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {trend === 'up' && <span className="text-green-600 text-xs">↗ Trending</span>}
        {trend === 'down' && <span className="text-red-600 text-xs">↘ Cooling</span>}
      </div>

      {/* Sentiment Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-600 mb-1">
          <span>Sentiment</span>
          <span>{sentiment.bullish}% bullish</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
          <div
            className="bg-green-500"
            style={{ width: `${sentiment.bullish}%` }}
          />
          <div
            className="bg-red-500"
            style={{ width: `${sentiment.bearish}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between text-sm mb-3">
        <div>
          <div className="text-gray-600 text-xs">Volume</div>
          <div className="font-semibold">{volume}</div>
        </div>
        <div className="text-right">
          <div className="text-gray-600 text-xs">Premium</div>
          <div className="font-semibold text-blue-600">{premium}</div>
        </div>
      </div>

      <Link
        href="/insurance"
        className="block w-full py-2 bg-gray-900 text-white rounded-lg text-sm font-medium text-center hover:bg-gray-800 transition-colors"
      >
        Insure Position
      </Link>
    </div>
  );
}

// Activity Feed Item
function ActivityItem({
  action,
  market,
  amount,
  time,
}: {
  action: 'insured' | 'claimed';
  market: string;
  amount: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <div
          className={`w-1.5 h-1.5 rounded-full ${
            action === 'insured' ? 'bg-blue-500' : 'bg-green-500'
          }`}
        />
        <div>
          <span className="text-gray-600">
            {action === 'insured' ? 'Insured' : 'Claimed'}
          </span>{' '}
          <span className="font-medium">{market}</span>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-gray-900">{amount}</div>
        <div className="text-xs text-gray-500">{time}</div>
      </div>
    </div>
  );
}

// Top Mover Item
function MoverItem({
  symbol,
  name,
  change,
  isNegative = false,
}: {
  symbol: string;
  name: string;
  change: number;
  isNegative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div
          className={`w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs ${
            isNegative
              ? 'bg-linear-to-br from-red-500 to-rose-600'
              : 'bg-linear-to-br from-green-500 to-emerald-600'
          }`}
        >
          {symbol.slice(0, 1)}
        </div>
        <div>
          <div className="font-semibold">{symbol}</div>
          <div className="text-xs text-gray-500">{name}</div>
        </div>
      </div>
      <Badge variant={isNegative ? 'error' : 'success'}>
        {isNegative ? '' : '+'}{change}%
      </Badge>
    </div>
  );
}

// Insight Item
function InsightItem({
  title,
  description,
  urgency,
}: {
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
}) {
  const urgencyColors = {
    high: 'bg-red-100 text-red-700 border-red-200',
    medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    low: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <div className={`p-3 rounded-lg border ${urgencyColors[urgency]}`}>
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-xs opacity-90">{description}</div>
    </div>
  );
}
