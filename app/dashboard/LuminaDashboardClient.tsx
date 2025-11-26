'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useAccount } from 'wagmi';
import { useState } from 'react';

// Helper function to calculate days until expiry
const getDaysUntilExpiry = (expiryTime: number) => {
  const now = new Date().getTime();
  return Math.ceil((expiryTime - now) / (1000 * 60 * 60 * 24));
};

interface Policy {
  id: string;
  marketId: string;
  marketName: string;
  coverageAmount: string;
  premium: string;
  expiryTime: number;
  status: 'Active' | 'Expired' | 'Claimed';
}

interface Activity {
  type: 'insured' | 'claimed' | 'deposit' | 'withdraw';
  description: string;
  amount: string;
  timestamp: string;
  isPositive?: boolean;
}

interface DashboardStats {
  totalCoverage: string;
  totalPremiumsPaid: string;
  activePolicies: number;
  claimablePolicies: number;
  lpEarnings: string;
  lpShares: string;
  portfolioValue: string;
  totalExposure: string;
}

// Mock data for demo - consistent with other pages
const MOCK_POLICIES: Policy[] = [
  {
    id: '1',
    marketId: 'btc-120k-q2',
    marketName: 'BTC hits $120K by Q2 2025',
    coverageAmount: '$5,000',
    premium: '$140',
    expiryTime: Date.now() + 45 * 24 * 60 * 60 * 1000,
    status: 'Active',
  },
  {
    id: '2',
    marketId: 'eth-5k-june',
    marketName: 'ETH flips $5K before June',
    coverageAmount: '$3,000',
    premium: '$102',
    expiryTime: Date.now() + 60 * 24 * 60 * 60 * 1000,
    status: 'Active',
  },
  {
    id: '3',
    marketId: 'sol-200-q1',
    marketName: 'SOL maintains above $200',
    coverageAmount: '$2,000',
    premium: '$78',
    expiryTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
    status: 'Active',
  },
  {
    id: '4',
    marketId: 'ada-1.5-2025',
    marketName: 'ADA breaks $1.50 in 2025',
    coverageAmount: '$1,500',
    premium: '$69',
    expiryTime: Date.now() + 90 * 24 * 60 * 60 * 1000,
    status: 'Active',
  },
  {
    id: '5',
    marketId: 'link-40-2025',
    marketName: 'LINK reaches $40 in 2025',
    coverageAmount: '$1,000',
    premium: '$43',
    expiryTime: Date.now() + 75 * 24 * 60 * 60 * 1000,
    status: 'Active',
  },
];

const MOCK_ACTIVITIES: Activity[] = [
  {
    type: 'insured',
    description: 'Insured BTC position',
    amount: '$5,000',
    timestamp: '2 hours ago',
  },
  {
    type: 'claimed',
    description: 'Claimed ETH policy',
    amount: '$2,500',
    timestamp: '1 day ago',
    isPositive: true,
  },
  {
    type: 'deposit',
    description: 'LP deposit to USDT pool',
    amount: '$10,000',
    timestamp: '3 days ago',
  },
  {
    type: 'insured',
    description: 'Insured SOL position',
    amount: '$2,000',
    timestamp: '5 days ago',
  },
  {
    type: 'withdraw',
    description: 'LP withdrawal from ETH pool',
    amount: '$5,000',
    timestamp: '1 week ago',
  },
];

const MOCK_STATS: DashboardStats = {
  totalCoverage: '$12,500',
  totalPremiumsPaid: '$432',
  activePolicies: 5,
  claimablePolicies: 2,
  lpEarnings: '$1,847',
  lpShares: '$15,000',
  portfolioValue: '$16,847',
  totalExposure: '$50,000',
};

// Mock pool stats
const MOCK_POOL = {
  totalLiquidity: 16200000,
  availableLiquidity: 13500000,
  utilizationRate: 16.7,
};

export default function LuminaDashboardClient() {
  const { address, isConnected } = useAccount();

  // Use mock data for demo
  const policies = MOCK_POLICIES;
  const stats = MOCK_STATS;
  const activities = MOCK_ACTIVITIES;
  const pool = MOCK_POOL;
  const utilizationRate = pool.utilizationRate;

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Container className="py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              View your portfolio and manage your positions
            </p>
          </Card>
        </Container>
      </div>
    );
  }

  // Calculate coverage percentage (mock calculation)
  const totalExposureValue = 50000;
  const coverageValue = 12500;
  const coveragePercentage = (coverageValue / totalExposureValue) * 100;
  const uninsuredAmount = totalExposureValue - coverageValue;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Container className="py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            {address && (
              <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg font-mono text-sm text-gray-700">
                {formatAddress(address)}
              </div>
            )}
          </div>
          <p className="text-gray-600">Manage your insurance positions and liquidity</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Portfolio Summary */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-6">Portfolio Summary</h2>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Exposure</div>
                  <div className="text-2xl font-bold">{stats.totalExposure}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Insured</div>
                  <div className="text-2xl font-bold text-green-600">{stats.totalCoverage}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Uninsured</div>
                  <div className="text-2xl font-bold text-red-600">${uninsuredAmount.toLocaleString()}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Coverage</span>
                  <span className="font-medium">{coveragePercentage.toFixed(0)}%</span>
                </div>
                <Progress value={coveragePercentage} />
              </div>

              {coveragePercentage < 80 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-900">
                    Consider insuring your remaining exposure. Current average premium: 4.2%
                  </div>
                  <Link href="/insurance" className="inline-block mt-2">
                    <Button size="sm">View Markets</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Active Policies */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Active Policies</h2>
                <Badge variant="default">{stats.activePolicies}</Badge>
              </div>

              {policies.length > 0 ? (
                <div className="space-y-3">
                  {policies.slice(0, 5).map((policy) => (
                    <div key={policy.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium mb-1">{policy.marketName}</div>
                          <div className="text-sm text-gray-600">Policy #{policy.id}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{policy.coverageAmount}</div>
                          <div className="text-xs text-gray-500">coverage</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600 text-xs">Premium</div>
                          <div className="font-medium">{policy.premium}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Expires</div>
                          <div className="font-medium">
                            {getDaysUntilExpiry(policy.expiryTime)}d
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Status</div>
                          <Badge variant={policy.status === 'Active' ? 'success' : 'default'} className="text-xs">
                            {policy.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4 text-4xl">—</div>
                  <h3 className="font-medium mb-2">No active policies</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Start by insuring a prediction market position
                  </p>
                  <Link href="/insurance">
                    <Button>Browse Markets</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {activities.map((activity, idx) => (
                  <div key={idx} className={`flex items-center justify-between py-3 ${idx < activities.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div>
                      <div className="font-medium text-sm">{activity.description}</div>
                      <div className="text-xs text-gray-500">{activity.timestamp}</div>
                    </div>
                    <div className={`font-medium text-sm ${activity.isPositive ? 'text-green-600' : ''}`}>
                      {activity.isPositive ? '+' : ''}{activity.amount}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Active Policies</div>
                  <div className="text-2xl font-bold">{stats.activePolicies}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Total Premiums Paid</div>
                  <div className="text-2xl font-bold">{stats.totalPremiumsPaid}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Claimable Policies</div>
                  <div className="text-2xl font-bold text-green-600">{stats.claimablePolicies}</div>
                </div>
              </div>
            </Card>

            {/* LP Position */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Liquidity Position</h3>
              {stats.lpShares !== '$0' ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Portfolio Value</div>
                    <div className="text-2xl font-bold">{stats.portfolioValue}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600">Shares</div>
                      <div className="font-medium">{stats.lpShares}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Earned</div>
                      <div className="font-medium text-green-600">{stats.lpEarnings}</div>
                    </div>
                  </div>
                  <Link href="/pools">
                    <Button size="sm" variant="secondary" className="w-full">Manage Position</Button>
                  </Link>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-400 mb-3 text-3xl">—</div>
                  <h4 className="font-medium mb-2">No liquidity provided</h4>
                  <p className="text-gray-600 text-xs mb-4">
                    Earn premiums by providing liquidity
                  </p>
                  <Link href="/pools">
                    <Button size="sm">View Pools</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Market Insights */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Market Insights</h3>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="font-medium text-sm text-red-900 mb-1">High volatility</div>
                  <div className="text-xs text-red-700">BTC volatility up 45% this week</div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="font-medium text-sm text-blue-900 mb-1">Low premiums</div>
                  <div className="text-xs text-blue-700">ETH insurance at 3.2% (below average)</div>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-sm text-green-900 mb-1">Good coverage</div>
                  <div className="text-xs text-green-700">Your portfolio is well balanced</div>
                </div>
              </div>
            </Card>

            {/* Protocol Stats */}
            {pool && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Protocol Stats</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Pool Utilization</span>
                      <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={utilizationRate} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Liquidity</span>
                    <span className="font-medium">${(pool.totalLiquidity / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium text-green-600">${(pool.availableLiquidity / 1000000).toFixed(1)}M</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Container>
    </div>
  );
}
