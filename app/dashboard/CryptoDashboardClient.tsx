'use client';

import { useState } from 'react';
import { Container } from '@/components/layout/Container';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useAccount } from 'wagmi';
import { usePolling } from '@/hooks/usePolling';
import { TradingViewChart } from '@/components/dashboard/TradingViewChart';
import { MarketDataGrid } from '@/components/dashboard/MarketDataGrid';

interface Policy {
  id: string;
  market: string;
  type: string;
  coverage: string;
  premium: string;
  expires: string;
  status: 'protected' | 'claim-ready' | 'expired';
  asset: string;
}

interface Pool {
  id: string;
  name: string;
  share: string;
  sharePercent: string;
  tvl: string;
  apy: string;
  earnings30d: string;
  asset: string;
}

interface Activity {
  id: string;
  timestamp: string;
  type: 'claim' | 'policy' | 'deposit' | 'expired' | 'payout';
  description: string;
  amount?: string;
  status?: string;
}

interface CryptoPrice {
  symbol: string;
  current: number;
  target: number;
  change24h: number;
}

export default function CryptoDashboardClient() {
  const { address, isConnected } = useAccount();
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  const [selectedCoin, setSelectedCoin] = useState({
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
  });
  
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([
    { symbol: 'BTC', current: 58240, target: 70000, change24h: 2.3 },
    { symbol: 'ETH', current: 3210, target: 4000, change24h: 1.8 },
    { symbol: 'BNB', current: 520, target: 700, change24h: -0.5 },
    { symbol: 'SOL', current: 142, target: 200, change24h: 3.2 },
  ]);

  const policies: Policy[] = [
    {
      id: '1',
      market: 'BTC > $70K',
      type: 'Price',
      coverage: '$5,000',
      premium: '$200',
      expires: 'Dec 31',
      status: 'protected',
      asset: 'BTC',
    },
    {
      id: '2',
      market: 'ETH ETF Approval',
      type: 'Event',
      coverage: '$2,500',
      premium: '$150',
      expires: 'Mar 31',
      status: 'protected',
      asset: 'ETH',
    },
    {
      id: '3',
      market: 'SOL Network Outage',
      type: 'Risk',
      coverage: '$1,000',
      premium: '$70',
      expires: 'Jan 15',
      status: 'claim-ready',
      asset: 'SOL',
    },
  ];

  const pools: Pool[] = [
    {
      id: '1',
      name: 'Stablecoin Pool',
      share: '$7,500',
      sharePercent: '1.5%',
      tvl: '$500,000',
      apy: '24.3%',
      earnings30d: '$152',
      asset: 'USDT',
    },
    {
      id: '2',
      name: 'BNB Pool',
      share: '$800',
      sharePercent: '0.8%',
      tvl: '$100,000',
      apy: '31.2%',
      earnings30d: '$33',
      asset: 'BNB',
    },
  ];

  const activities: Activity[] = [
    {
      id: '1',
      timestamp: 'Today 14:30',
      type: 'claim',
      description: 'Claim submitted: "SOL Network Outage"',
      amount: '$900',
      status: 'Processing',
    },
    {
      id: '2',
      timestamp: 'Yesterday 09:15',
      type: 'policy',
      description: 'New policy: "ETH ETF Approval"',
      amount: '$2,500',
    },
    {
      id: '3',
      timestamp: 'Nov 12',
      type: 'deposit',
      description: 'Pool deposit: +$5,000 to Stablecoin Pool',
      amount: '$5,000',
    },
    {
      id: '4',
      timestamp: 'Nov 10',
      type: 'expired',
      description: 'Policy expired: "BTC < $60K"',
      status: 'No payout',
    },
    {
      id: '5',
      timestamp: 'Nov 8',
      type: 'payout',
      description: 'Claim paid: "ADA Upgrade Delay"',
      amount: '$1,800',
    },
  ];

  const alerts = [
    { id: '1', type: 'warning', message: 'Policy expiring: BTC > $70K (3 days)' },
    { id: '2', type: 'success', message: 'Claim ready: SOL Network Outage' },
    { id: '3', type: 'info', message: 'Pool APY increased: +2.1%' },
  ];

  usePolling(() => {
    setCryptoPrices(prev => prev.map(price => ({
      ...price,
      current: price.current * (1 + (Math.random() - 0.5) * 0.001),
      change24h: price.change24h + (Math.random() - 0.5) * 0.1,
    })));
  }, { interval: 5000 });

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  };

  const totalCoverage = policies.reduce((sum, p) => sum + parseFloat(p.coverage.replace(/[$,]/g, '')), 0);
  const totalPremiums = policies.reduce((sum, p) => sum + parseFloat(p.premium.replace(/[$,]/g, '')), 0);
  const totalEarnings = pools.reduce((sum, p) => sum + parseFloat(p.earnings30d.replace(/[$,]/g, '')), 0);

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <Container className="py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect to view your dashboard
            </p>
            <Button size="lg">Connect Wallet</Button>
          </Card>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {address ? formatAddress(address) : 'vitalik.eth'}
            </h1>
            {address && (
              <Button variant="ghost" size="sm" onClick={copyAddress} title="Copy address">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            )}
          </div>
          <p className="text-gray-600">Your portfolio overview</p>
        </div>

        {alerts.length > 0 && (
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Alerts <Badge variant="info">{alerts.length}</Badge>
                </h3>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-center gap-2 text-sm">
                      <span className={`w-2 h-2 rounded-full ${
                        alert.type === 'warning' ? 'bg-orange-500' : 
                        alert.type === 'success' ? 'bg-green-500' : 
                        'bg-blue-500'
                      }`} />
                      <span>{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Active Policies"
            value={policies.length.toString()}
            subtitle={`$${totalCoverage.toLocaleString()} protected`}
          />
          <StatCard
            label="Premiums Paid"
            value={`$${totalPremiums}`}
            subtitle="total spent"
          />
          <StatCard
            label="Pending Claims"
            value="1"
            subtitle="$2k payout"
          />
          <StatCard
            label="LP Earnings"
            value={`$${totalEarnings}`}
            subtitle="last 30 days"
          />
        </div>

        <div className="mb-6">
          <TradingViewChart
            coinSymbol={selectedCoin.symbol}
            coinName={selectedCoin.name}
          />
        </div>

        <div className="mb-6">
          <MarketDataGrid
            onCoinSelect={(id, symbol, name) => setSelectedCoin({ id, symbol, name })}
            selectedCoinId={selectedCoin.id}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-6">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Your Policies</h2>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">View All</Button>
                  <Button size="sm">Buy Protection</Button>
                </div>
              </div>

              <div className="space-y-3">
                {policies.map((policy) => (
                  <PolicyRow key={policy.id} policy={policy} />
                ))}
              </div>
            </Card>
          </div>

          <div>
            <Card className="p-6">
              <h2 className="text-lg font-bold mb-4">Market Watch</h2>
              <div className="space-y-4">
                {cryptoPrices.map((price) => (
                  <CryptoPriceCard key={price.symbol} price={price} />
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="font-semibold mb-3 text-sm">Trending Markets</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">BlackRock ETH ETF</span>
                    <span className="font-medium">3.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BNB Game Launch</span>
                    <span className="font-medium">5.1%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BTC Halving</span>
                    <span className="font-medium">4.8%</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Liquidity Pools</h2>
              <Button size="sm" variant="secondary">Deposit</Button>
            </div>

            {pools.length > 0 ? (
              <div className="space-y-3">
                {pools.map((pool) => (
                  <PoolCard key={pool.id} pool={pool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">No LP positions yet</p>
                <Button>Start earning yield</Button>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">65%</div>
            <div className="text-sm text-gray-600">Win Rate</div>
            <div className="text-xs text-gray-500 mt-1">didn&apos;t need to claim</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">+$765</div>
            <div className="text-sm text-gray-600">Net P&L</div>
            <div className="text-xs text-gray-500 mt-1">payouts minus premiums</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">$2,833</div>
            <div className="text-sm text-gray-600">Avg Coverage</div>
            <div className="text-xs text-gray-500 mt-1">per policy</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">BTC</div>
            <div className="text-sm text-gray-600">Top Asset</div>
            <div className="text-xs text-gray-500 mt-1">40% of coverage</div>
          </Card>
        </div>
      </Container>
    </div>
  );
}

function StatCard({ label, value, subtitle }: {
  label: string;
  value: string;
  subtitle: string;
}) {
  return (
    <Card className="p-4">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-xl font-bold mb-1">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </Card>
  );
}

function PolicyRow({ policy }: { policy: Policy }) {
  const statusConfig = {
    protected: { color: 'text-green-600', bg: 'bg-green-50', label: 'Protected' },
    'claim-ready': { color: 'text-orange-600', bg: 'bg-orange-50', label: 'Claim Ready' },
    expired: { color: 'text-gray-600', bg: 'bg-gray-50', label: 'Expired' },
  };

  const config = statusConfig[policy.status];

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center gap-3 flex-1">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg}`}>
          <div className={`w-3 h-3 rounded-full ${config.color.replace('text-', 'bg-')}`} />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm">{policy.market}</div>
          <div className="text-xs text-gray-600">
            {policy.type} • {policy.coverage} • {policy.premium}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-xs text-gray-500">Expires</div>
          <div className="text-sm font-medium">{policy.expires}</div>
        </div>
        <Badge variant={policy.status === 'protected' ? 'success' : policy.status === 'claim-ready' ? 'warning' : 'default'}>
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

function CryptoPriceCard({ price }: { price: CryptoPrice }) {
  const percentToTarget = ((price.target - price.current) / price.current * 100).toFixed(1);
  const progress = (price.current / price.target) * 100;

  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm">{price.symbol}</span>
          <span className={`text-xs flex items-center gap-1 ${price.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {price.change24h >= 0 ? '↑' : '↓'}
            {Math.abs(price.change24h).toFixed(1)}%
          </span>
        </div>
        <span className="text-xs text-gray-500">{percentToTarget}% to target</span>
      </div>
      <div className="flex items-center justify-between text-xs mb-2">
        <span className="text-gray-600">${price.current.toLocaleString()}</span>
        <span className="font-medium">→ ${price.target.toLocaleString()}</span>
      </div>
      <Progress value={Math.min(progress, 100)} className="h-1.5" />
    </div>
  );
}

function PoolCard({ pool }: { pool: Pool }) {
  return (
    <div className="p-3 border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">{pool.name}</h3>
        <Badge variant="success">{pool.apy} APY</Badge>
      </div>
      <div className="grid grid-cols-2 gap-3 text-sm mb-3">
        <div>
          <div className="text-gray-600">Your Share</div>
          <div className="font-medium">{pool.sharePercent}</div>
        </div>
        <div>
          <div className="text-gray-600">TVL</div>
          <div className="font-medium">{pool.tvl}</div>
        </div>
        <div className="col-span-2">
          <div className="text-gray-600">Earnings (30d)</div>
          <div className="font-medium text-green-600">{pool.earnings30d}</div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1">Manage</Button>
        <Button size="sm" className="flex-1">Add</Button>
      </div>
    </div>
  );
}

function ActivityItem({ activity }: { activity: Activity }) {
  const getColor = () => {
    switch (activity.type) {
      case 'claim': return 'bg-orange-500';
      case 'policy': return 'bg-blue-500';
      case 'deposit': return 'bg-green-500';
      case 'expired': return 'bg-gray-400';
      case 'payout': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-0 last:pb-0">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
        <div className={`w-3 h-3 rounded-full ${getColor()}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500">{activity.timestamp}</div>
        <div className="font-medium text-sm">{activity.description}</div>
        {activity.amount && (
          <div className="text-sm text-gray-600">{activity.amount}</div>
        )}
        {activity.status && (
          <Badge variant="default" className="mt-1">{activity.status}</Badge>
        )}
      </div>
    </div>
  );
}
