'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Tabs } from '@/components/ui/Tabs';
import { useAccount } from 'wagmi';
import { TrendingUp, Shield, Droplet, Activity, ChevronRight, Info, AlertCircle, CheckCircle2, Wallet, ArrowUpRight, ArrowDownRight, DollarSign, Percent, Users, Zap } from 'lucide-react';

interface Pool {
  id: string;
  name: string;
  tvl: string;
  apy: string;
  yourShare: string;
  yourValue: string;
  utilization: number;
  premiums30d: string;
  assets: string[];
  risk: 'low' | 'medium' | 'high';
  hasPosition: boolean;
}

interface Position {
  poolId: string;
  poolName: string;
  share: string;
  value: string;
  earnings30d: string;
  apy: string;
}

const pools: Pool[] = [
  {
    id: '1',
    name: 'Stablecoin Pool',
    tvl: '$4.2M',
    apy: '24.3%',
    yourShare: '1.2%',
    yourValue: '$50,400',
    utilization: 68,
    premiums30d: '$84,200',
    assets: ['USDT', 'USDC', 'BUSD'],
    risk: 'low',
    hasPosition: true,
  },
  {
    id: '2',
    name: 'BNB Pool',
    tvl: '$1.8M',
    apy: '31.5%',
    yourShare: '0%',
    yourValue: '$0',
    utilization: 72,
    premiums30d: '$56,100',
    assets: ['BNB'],
    risk: 'medium',
    hasPosition: false,
  },
  {
    id: '3',
    name: 'Blue Chip Pool',
    tvl: '$2.1M',
    apy: '22.8%',
    yourShare: '0%',
    yourValue: '$0',
    utilization: 61,
    premiums30d: '$47,800',
    assets: ['BTC', 'ETH', 'SOL'],
    risk: 'low',
    hasPosition: false,
  },
  {
    id: '4',
    name: 'Altcoin Pool',
    tvl: '$890K',
    apy: '35.2%',
    yourShare: '0%',
    yourValue: '$0',
    utilization: 78,
    premiums30d: '$31,200',
    assets: ['DOT', 'AVAX', 'MATIC'],
    risk: 'high',
    hasPosition: false,
  },
];

const positions: Position[] = [
  {
    poolId: '1',
    poolName: 'Stablecoin Pool',
    share: '1.2%',
    value: '$50,400',
    earnings30d: '$1,020',
    apy: '24.3%',
  },
  {
    poolId: '2',
    poolName: 'BNB Pool',
    share: '0.8%',
    value: '$14,400',
    earnings30d: '$378',
    apy: '31.5%',
  },
];

const activities = [
  { id: '1', text: 'User47 deposited $25,000 to Stablecoin Pool', time: '2m ago' },
  { id: '2', text: 'Claim paid: $12,000 from BNB Pool', time: '15m ago' },
  { id: '3', text: 'User23 withdrew $8,400 from Blue Chip Pool', time: '1h ago' },
  { id: '4', text: 'Premium collected: $4,200 to Altcoin Pool', time: '2h ago' },
  { id: '5', text: 'User89 deposited $15,000 to BNB Pool', time: '3h ago' },
];

export default function PoolsClient() {
  const { isConnected } = useAccount();
  const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
  const [showAddLiquidity, setShowAddLiquidity] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedToken, setSelectedToken] = useState('USDT');
  const [filterRisk, setFilterRisk] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [sortBy, setSortBy] = useState<'apy' | 'tvl' | 'utilization'>('apy');

  const userPositions = positions;
  const hasPositions = userPositions.length > 0;

  const filteredPools = useMemo(() => {
    let filtered = pools;
    if (filterRisk !== 'all') {
      filtered = filtered.filter(p => p.risk === filterRisk);
    }
    return filtered.sort((a, b) => {
      if (sortBy === 'apy') return parseFloat(b.apy) - parseFloat(a.apy);
      if (sortBy === 'tvl') return parseFloat(b.tvl.replace(/[$M,K]/g, '')) - parseFloat(a.tvl.replace(/[$M,K]/g, ''));
      return b.utilization - a.utilization;
    });
  }, [filterRisk, sortBy]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 dark:text-green-400';
      case 'medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'high': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600';
    }
  };

  const getUtilizationColor = (util: number) => {
    if (util < 70) return 'bg-green-500';
    if (util < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-teal-950/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-600 to-cyan-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        
        <Container className="relative py-20">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <Droplet className="w-4 h-4" />
              <span className="text-sm font-medium">Earn Passive Income</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
              Liquidity Pools
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Provide liquidity, earn premiums. Simple, transparent, profitable.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 mx-auto">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-sm text-blue-100 mb-1">Total TVL</div>
                <div className="text-3xl font-bold">$8.4M</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 mx-auto">
                  <Percent className="w-6 h-6" />
                </div>
                <div className="text-sm text-blue-100 mb-1">Avg APY</div>
                <div className="text-3xl font-bold">26.8%</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 mx-auto">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-sm text-blue-100 mb-1">Premiums</div>
                <div className="text-3xl font-bold">$1.2M</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div className="text-sm text-blue-100 mb-1">LPs</div>
                <div className="text-3xl font-bold">1,842</div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        {/* Your Positions */}
        {isConnected && hasPositions && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Your Positions</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage your liquidity positions</p>
              </div>
              <Badge variant="success" className="text-lg px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-2" />
                Total: $64,800
              </Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {userPositions.map((position) => (
                <Card key={position.poolId} className="p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{position.poolName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Your share: {position.share}</p>
                    </div>
                    <Badge variant="success" className="text-lg">
                      {position.apy}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 rounded-xl p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Position Value</div>
                      <div className="text-2xl font-bold">{position.value}</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-xl p-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Earnings (30d)</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {position.earnings30d}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button className="flex-1" size="lg">
                      <ArrowUpRight className="w-4 h-4 mr-2" />
                      Add More
                    </Button>
                    <Button variant="secondary" className="flex-1" size="lg">
                      <ArrowDownRight className="w-4 h-4 mr-2" />
                      Withdraw
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Pools */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Available Pools</h2>
              <p className="text-gray-600 dark:text-gray-400">Choose a pool that matches your risk appetite</p>
            </div>
            <div className="flex gap-3">
              <select 
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 font-medium"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value as any)}
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
              <select 
                className="px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 font-medium"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as unknown)}
              >
                <option value="apy">Sort by APY</option>
                <option value="tvl">Sort by TVL</option>
                <option value="utilization">Sort by Utilization</option>
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPools.map((pool) => (
              <Card key={pool.id} className="group hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-teal-500/10 rounded-bl-full -z-10" />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold text-xl">
                          {pool.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold">{pool.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Shield className={`w-4 h-4 ${getRiskColor(pool.risk)}`} />
                            <span className={`text-sm font-semibold ${getRiskColor(pool.risk)}`}>
                              {pool.risk.charAt(0).toUpperCase() + pool.risk.slice(1)} Risk
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">APY</div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        {pool.apy}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Liquidity</div>
                      <div className="text-lg font-bold">{pool.tvl}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Premiums (30d)</div>
                      <div className="text-lg font-bold text-green-600">{pool.premiums30d}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Pool Utilization</span>
                      <span className="font-bold">{pool.utilization}%</span>
                    </div>
                    <div className="relative h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all ${getUtilizationColor(pool.utilization)}`}
                        style={{ width: `${pool.utilization}%` }}
                      />
                    </div>
                    {pool.utilization > 70 && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                        <Zap className="w-3 h-3" />
                        <span>High demand - elevated premiums</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-6">
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">Supported Assets</div>
                    <div className="flex flex-wrap gap-2">
                      {pool.assets.map((asset) => (
                        <span key={asset} className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-semibold">
                          {asset}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 group-hover:scale-105 transition-transform" 
                      size="lg"
                      onClick={() => {
                        setSelectedPool(pool);
                        setShowAddLiquidity(true);
                      }}
                    >
                      <Droplet className="w-4 h-4 mr-2" />
                      Deposit
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="lg"
                      onClick={() => setSelectedPool(pool)}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Start earning in 4 simple steps</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4 mx-auto text-white font-bold text-2xl shadow-lg">
                1
              </div>
              <h3 className="font-bold text-lg mb-3">Deposit Assets</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Add USDT, USDC, or other supported tokens to insurance pools
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 mx-auto text-white font-bold text-2xl shadow-lg">
                2
              </div>
              <h3 className="font-bold text-lg mb-3">Earn Premiums</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Receive your share of insurance premiums automatically
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 mx-auto text-white font-bold text-2xl shadow-lg">
                3
              </div>
              <h3 className="font-bold text-lg mb-3">Share Risk</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Pool covers claims, diversified across hundreds of policies
              </p>
            </Card>
            
            <Card className="p-6 text-center hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-500/50">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center mb-4 mx-auto text-white font-bold text-2xl shadow-lg">
                4
              </div>
              <h3 className="font-bold text-lg mb-3">Withdraw Anytime</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                24-hour withdrawal period. Get your share plus earnings
              </p>
            </Card>
          </div>
        </div>

        {/* Pool Comparison */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Pool Comparison</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Compare key metrics across all pools</p>
          </div>
          
          <Card className="overflow-hidden border-2">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30">
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Metric</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Stablecoin</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">BNB</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Blue Chip</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 dark:text-gray-300">Altcoin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">APY</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-bold">24.3%</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-bold">31.5%</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-bold">22.8%</td>
                    <td className="px-6 py-4 text-green-600 dark:text-green-400 font-bold">35.2%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Risk Level</td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Low</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">Medium</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success">Low</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="destructive">High</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Utilization</td>
                    <td className="px-6 py-4 font-medium">68%</td>
                    <td className="px-6 py-4 font-medium">72%</td>
                    <td className="px-6 py-4 font-medium">61%</td>
                    <td className="px-6 py-4 font-medium">78%</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Min Deposit</td>
                    <td className="px-6 py-4">$100</td>
                    <td className="px-6 py-4">0.1 BNB</td>
                    <td className="px-6 py-4">$500</td>
                    <td className="px-6 py-4">$200</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-semibold">Assets</td>
                    <td className="px-6 py-4">
                      <span className="text-sm">USDT, USDC, BUSD</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">BNB</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">BTC, ETH, SOL</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">DOT, AVAX, MATIC</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">Recent Activity</h2>
              <p className="text-gray-600 dark:text-gray-400">Live pool transactions</p>
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <Activity className="w-3 h-3 mr-1 animate-pulse" />
              Live
            </Badge>
          </div>
          
          <Card className="p-6 border-2">
            <div className="space-y-3">
              {activities.map((activity, idx) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-transparent hover:border-blue-500/30"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.text.includes('deposited') 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : activity.text.includes('withdrew')
                      ? 'bg-red-100 dark:bg-red-900/30'
                      : activity.text.includes('Claim')
                      ? 'bg-yellow-100 dark:bg-yellow-900/30'
                      : 'bg-blue-100 dark:bg-blue-900/30'
                  }`}>
                    {activity.text.includes('deposited') && <ArrowUpRight className="w-5 h-5 text-green-600" />}
                    {activity.text.includes('withdrew') && <ArrowDownRight className="w-5 h-5 text-red-600" />}
                    {activity.text.includes('Claim') && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                    {activity.text.includes('Premium') && <DollarSign className="w-5 h-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.text}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Risk Metrics */}
        <div className="mb-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">Understanding Risks</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Know what you're getting into</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-yellow-500/50">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Utilization Risk</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                High utilization means higher returns but more capital at risk
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-red-500/50">
              <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Claim Risk</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Large claims can temporarily reduce pool value and liquidity
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500/50">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Asset Risk</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Pool value fluctuates with underlying asset prices
              </p>
            </Card>
            
            <Card className="p-6 hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500/50">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">Protocol Risk</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Smart contract vulnerabilities and oracle failures
              </p>
            </Card>
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-teal-600 to-cyan-600" />
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
          
          <div className="relative p-12 md:p-16 text-center text-white">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Trusted by 1,842 LPs</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Earn Yield?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of liquidity providers earning passive income on BNB Chain
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-6">
                <Wallet className="w-5 h-5 mr-2" />
                Connect Wallet
              </Button>
              <Button size="lg" variant="secondary" className="bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 text-white text-lg px-8 py-6">
                <Info className="w-5 h-5 mr-2" />
                Learn More
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-8 border-t border-white/20">
              <div>
                <div className="text-3xl font-bold mb-1">$8.4M</div>
                <div className="text-sm text-blue-100">Total Locked</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">26.8%</div>
                <div className="text-sm text-blue-100">Avg APY</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-1">$1.2M</div>
                <div className="text-sm text-blue-100">Paid Out</div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Add Liquidity Modal */}
      {showAddLiquidity && selectedPool && (
        <Modal
          isOpen={showAddLiquidity}
          onClose={() => {
            setShowAddLiquidity(false);
            setDepositAmount('');
          }}
          title={`Deposit to ${selectedPool.name}`}
        >
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 rounded-2xl p-6 border-2 border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-600" />
                Pool Overview
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Share</div>
                  <div className="font-bold text-lg">{selectedPool.yourShare}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Pool APY</div>
                  <div className="font-bold text-lg text-green-600">{selectedPool.apy}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Utilization</div>
                  <div className="font-bold text-lg">{selectedPool.utilization}%</div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-3">Deposit Amount</label>
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="text-2xl font-bold h-16 pr-20"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    {selectedToken}
                  </div>
                </div>
                <select 
                  className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 font-semibold"
                  value={selectedToken}
                  onChange={(e) => setSelectedToken(e.target.value)}
                >
                  {selectedPool.assets.map((asset) => (
                    <option key={asset} value={asset}>{asset}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-3">
                {['25', '50', '75', '100'].map((pct) => (
                  <button
                    key={pct}
                    className="flex-1 px-3 py-2 text-sm font-medium border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                    onClick={() => setDepositAmount((1000 * parseInt(pct) / 100).toString())}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {depositAmount && parseFloat(depositAmount) > 0 && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Projected Earnings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Daily</span>
                    <span className="font-bold text-lg">~${(parseFloat(depositAmount) * 0.243 / 365).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly</span>
                    <span className="font-bold text-lg">~${(parseFloat(depositAmount) * 0.243 / 12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Yearly</span>
                    <span className="font-bold text-lg text-green-600">~${(parseFloat(depositAmount) * 0.243).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button 
                className="flex-1 h-14 text-lg" 
                disabled={!depositAmount || parseFloat(depositAmount) <= 0}
              >
                <Droplet className="w-5 h-5 mr-2" />
                Deposit {depositAmount ? `$${depositAmount}` : ''}
              </Button>
              <Button 
                variant="secondary" 
                className="h-14"
                onClick={() => {
                  setShowAddLiquidity(false);
                  setDepositAmount('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pool Details Modal */}
      {selectedPool && !showAddLiquidity && (
        <Modal
          isOpen={!!selectedPool}
          onClose={() => setSelectedPool(null)}
          title={selectedPool.name}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-950/30 dark:to-teal-950/30 rounded-xl">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current APY</div>
                <div className="text-3xl font-bold text-green-600">{selectedPool.apy}</div>
              </div>
              <Badge className={`text-lg ${getRiskColor(selectedPool.risk)}`}>
                {selectedPool.risk.charAt(0).toUpperCase() + selectedPool.risk.slice(1)} Risk
              </Badge>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-4">Pool Metrics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Liquidity</div>
                  <div className="font-bold text-xl">{selectedPool.tvl}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Utilization</div>
                  <div className="font-bold text-xl">{selectedPool.utilization}%</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Premiums (30d)</div>
                  <div className="font-bold text-xl text-green-600">{selectedPool.premiums30d}</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Your Share</div>
                  <div className="font-bold text-xl">{selectedPool.yourShare}</div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-3">Supported Assets</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPool.assets.map((asset) => (
                  <span key={asset} className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg font-semibold">
                    {asset}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border-2 border-yellow-200 dark:border-yellow-800">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-600" />
                Pool Rules
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>80% Maximum Utilization Cap</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>24-hour Withdrawal Period</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>10% Performance Fee on Earnings</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>BNB Chain Only</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button 
                className="flex-1 h-14 text-lg"
                onClick={() => {
                  setShowAddLiquidity(true);
                }}
              >
                <Droplet className="w-5 h-5 mr-2" />
                Deposit Now
              </Button>
              <Button 
                variant="secondary" 
                className="h-14"
                onClick={() => setSelectedPool(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
