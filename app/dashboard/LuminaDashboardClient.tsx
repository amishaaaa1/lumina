'use client';

import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Navigation } from '@/components/layout/Navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { useAccount, useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { PolicyStatus, PoolInfo } from '@/lib/types';
import { formatUnits } from 'viem';

interface DashboardStats {
  totalCoverage: bigint;
  totalPremiumsPaid: bigint;
  activePolicies: number;
  claimablePolicies: number;
  lpEarnings: bigint;
  lpShares: bigint;
  portfolioValue: bigint;
}

export default function LuminaDashboardClient() {
  const { address, isConnected } = useAccount();

  const { data: policyIds } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'getUserPolicies',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: poolInfo } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'getPoolInfo',
  });

  const { data: providerInfo } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'getProviderInfo',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const policyContracts = (policyIds as bigint[] || []).map((id) => ({
    ...CONTRACTS.PolicyManager,
    functionName: 'getPolicy' as const,
    args: [id],
  }));

  const { data: policiesData } = useReadContracts({
    contracts: policyContracts,
    query: { enabled: policyContracts.length > 0 },
  });

  const policies = (policiesData || [])
    .filter((p) => p.status === 'success')
    .map((p) => p.result as any);

  const stats: DashboardStats = {
    totalCoverage: policies.reduce((sum: bigint, p: any) => sum + (p?.coverageAmount || 0n), 0n),
    totalPremiumsPaid: policies.reduce((sum: bigint, p: any) => sum + (p?.premium || 0n), 0n),
    activePolicies: policies.filter((p: any) => p?.status === PolicyStatus.Active).length,
    claimablePolicies: policies.filter((p: any) => p?.status === PolicyStatus.Active && Date.now() / 1000 < Number(p?.expiryTime)).length,
    lpEarnings: (providerInfo as any)?.earnedPremiums || 0n,
    lpShares: (providerInfo as any)?.shares || 0n,
    portfolioValue: ((providerInfo as any)?.depositedAmount || 0n) + ((providerInfo as any)?.earnedPremiums || 0n),
  };

  const pool = poolInfo as PoolInfo | undefined;
  const utilizationRate = pool ? Number(pool.utilizationRate) / 100 : 0;

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

  const totalExposure = stats.totalCoverage + BigInt(50000) * BigInt(10**18);
  const coveragePercentage = Number((stats.totalCoverage * 100n) / totalExposure);
  const uninsuredAmount = totalExposure - stats.totalCoverage;

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
                  <div className="text-2xl font-bold">{formatUnits(totalExposure, 18)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Insured</div>
                  <div className="text-2xl font-bold text-green-600">{formatUnits(stats.totalCoverage, 18)}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Uninsured</div>
                  <div className="text-2xl font-bold text-red-600">{formatUnits(uninsuredAmount, 18)}</div>
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
                  {policies.slice(0, 5).map((policy: any) => (
                    <div key={policy.id?.toString()} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium mb-1">{policy?.marketId || 'Market'}</div>
                          <div className="text-sm text-gray-600">Policy #{policy?.id?.toString() || '0'}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">{formatUnits(policy?.coverageAmount || 0n, 18)}</div>
                          <div className="text-xs text-gray-500">coverage</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-gray-600 text-xs">Premium</div>
                          <div className="font-medium">{formatUnits(policy?.premium || 0n, 18)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Expires</div>
                          <div className="font-medium">
                            {Math.ceil((new Date(Number(policy?.expiryTime || 0) * 1000).getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-600 text-xs">Status</div>
                          <Badge variant={policy?.status === PolicyStatus.Active ? 'success' : 'default'} className="text-xs">
                            {policy?.status === PolicyStatus.Active ? 'Active' : 'Expired'}
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
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-sm">Insured BTC position</div>
                    <div className="text-xs text-gray-500">2 hours ago</div>
                  </div>
                  <div className="font-medium text-sm">$5,000</div>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <div className="font-medium text-sm">Claimed ETH policy</div>
                    <div className="text-xs text-gray-500">1 day ago</div>
                  </div>
                  <div className="font-medium text-sm text-green-600">+$2,500</div>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <div className="font-medium text-sm">LP deposit</div>
                    <div className="text-xs text-gray-500">3 days ago</div>
                  </div>
                  <div className="font-medium text-sm">$10,000</div>
                </div>
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
                  <div className="text-2xl font-bold">{formatUnits(stats.totalPremiumsPaid, 18)}</div>
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
              {stats.lpShares > 0n ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Portfolio Value</div>
                    <div className="text-2xl font-bold">{formatUnits(stats.portfolioValue, 18)}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-600">Shares</div>
                      <div className="font-medium">{formatUnits(stats.lpShares, 18)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Earned</div>
                      <div className="font-medium text-green-600">{formatUnits(stats.lpEarnings, 18)}</div>
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
                    <span className="font-medium">{formatUnits(pool.totalLiquidity, 18)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium text-green-600">{formatUnits(pool.availableLiquidity, 18)}</span>
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
