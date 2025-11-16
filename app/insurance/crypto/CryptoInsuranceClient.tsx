'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { fetchTrendingMarkets, type PolymarketEvent, formatVolume, getDaysUntilClose, getRiskLevel } from '@/lib/polymarket';
// Icons replaced with emoji

type Category = 'all' | 'price' | 'etf' | 'protocol' | 'nft';
type Asset = 'all' | 'BTC' | 'ETH' | 'BNB' | 'SOL' | 'DOT' | 'AVAX';
type Timeframe = 'all' | '7d' | '30d' | '90d';
type Risk = 'all' | 'low' | 'medium' | 'high';

interface CryptoMarket {
  id: string;
  title: string;
  category: string;
  current?: string;
  target?: string;
  probability?: string;
  premium: string;
  coverage: string;
  featured?: boolean;
  asset: string;
  timeframe: string;
  risk: Risk;
}

const cryptoMarkets: CryptoMarket[] = [
  {
    id: '1',
    title: 'BTC > $70K by EOY',
    category: 'Price Prediction',
    current: '$58,240',
    target: '$70,000',
    premium: '3.2%',
    coverage: '$4.2M',
    featured: true,
    asset: 'BTC',
    timeframe: '30d',
    risk: 'medium',
  },
  {
    id: '2',
    title: 'ETH ETF Approval by Q1 2025',
    category: 'ETF/Regulation',
    probability: '68%',
    premium: '4.1%',
    coverage: '$3.8M',
    featured: true,
    asset: 'ETH',
    timeframe: '90d',
    risk: 'medium',
  },
  {
    id: '3',
    title: 'BNB > $700 by 2025',
    category: 'Price Prediction',
    current: '$520',
    target: '$700',
    premium: '5.3%',
    coverage: '$2.1M',
    featured: true,
    asset: 'BNB',
    timeframe: '90d',
    risk: 'high',
  },
  {
    id: '4',
    title: 'ETH > $4,000 by March',
    category: 'Price Prediction',
    current: '$3,200',
    target: '$4,000',
    premium: '4.8%',
    coverage: '$1.8M',
    asset: 'ETH',
    timeframe: '30d',
    risk: 'medium',
  },
  {
    id: '5',
    title: 'Solana Outage in Q1 2025',
    category: 'Protocol Events',
    probability: '22%',
    premium: '8.5%',
    coverage: '$890K',
    asset: 'SOL',
    timeframe: '90d',
    risk: 'high',
  },
  {
    id: '6',
    title: 'BlackRock BTC ETF Approval',
    category: 'ETF/Regulation',
    probability: '85%',
    premium: '2.1%',
    coverage: '$3.2M',
    asset: 'BTC',
    timeframe: '30d',
    risk: 'low',
  },
  {
    id: '7',
    title: 'Cardano Smart Contract TVL > $500M',
    category: 'Protocol Metrics',
    current: '$320M',
    target: '$500M',
    premium: '6.2%',
    coverage: '$720K',
    asset: 'DOT',
    timeframe: '90d',
    risk: 'high',
  },
  {
    id: '8',
    title: 'Polygon zkEVM Daily Txs > 1M',
    category: 'Usage Metrics',
    current: '420K',
    target: '1M',
    premium: '7.1%',
    coverage: '$550K',
    asset: 'AVAX',
    timeframe: '90d',
    risk: 'high',
  },
  {
    id: '9',
    title: 'NFT Trading Volume Recovery',
    category: 'NFT/Gaming',
    target: '+50% from current',
    premium: '5.9%',
    coverage: '$1.1M',
    asset: 'ETH',
    timeframe: '30d',
    risk: 'medium',
  },
];

export default function CryptoInsuranceClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<Category>('all');
  const [asset, setAsset] = useState<Asset>('all');
  const [timeframe, setTimeframe] = useState<Timeframe>('all');
  const [risk, setRisk] = useState<Risk>('all');

  const filteredMarkets = cryptoMarkets.filter((market) => {
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || market.category.toLowerCase().includes(category);
    const matchesAsset = asset === 'all' || market.asset === asset;
    const matchesTimeframe = timeframe === 'all' || market.timeframe === timeframe;
    const matchesRisk = risk === 'all' || market.risk === risk;
    
    return matchesSearch && matchesCategory && matchesAsset && matchesTimeframe && matchesRisk;
  });

  const featuredMarkets = filteredMarkets.filter((m) => m.featured);
  const regularMarkets = filteredMarkets.filter((m) => !m.featured);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <Container>
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Crypto Insurance Markets
            </h1>
            <p className="text-xl text-blue-100">
              Protect your bets on BTC, ETH, and other crypto events
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-blue-100">Total Coverage</div>
              <div className="text-2xl font-bold mt-1">$18.3M</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-blue-100">Avg Premium</div>
              <div className="text-2xl font-bold mt-1">3.8%</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-blue-100">Claims Paid</div>
              <div className="text-2xl font-bold mt-1">$1.4M</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-sm text-blue-100">Live Markets</div>
              <div className="text-2xl font-bold mt-1">32</div>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-12">
        {/* Search & Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <Input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Category:</span>
              {(['all', 'price', 'etf', 'protocol', 'nft'] as Category[]).map((cat) => (
                <Button
                  key={cat}
                  variant={category === cat ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setCategory(cat)}
                >
                  {cat === 'all' ? 'All' : cat === 'price' ? 'Price Predictions' : cat === 'etf' ? 'ETF/Regulation' : cat === 'protocol' ? 'Protocol Events' : 'NFT/Gaming'}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Asset:</span>
              {(['all', 'BTC', 'ETH', 'BNB', 'SOL', 'DOT', 'AVAX'] as Asset[]).map((a) => (
                <Button
                  key={a}
                  variant={asset === a ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setAsset(a)}
                >
                  {a === 'all' ? 'All' : a}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Timeframe:</span>
              {(['all', '7d', '30d', '90d'] as Timeframe[]).map((t) => (
                <Button
                  key={t}
                  variant={timeframe === t ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setTimeframe(t)}
                >
                  {t === 'all' ? 'All' : `<${t.replace('d', ' days')}`}
                </Button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">Risk:</span>
              {(['all', 'low', 'medium', 'high'] as Risk[]).map((r) => (
                <Button
                  key={r}
                  variant={risk === r ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setRisk(r)}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Markets */}
        {featuredMarkets.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Trending Markets
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {featuredMarkets.map((market) => (
                <CryptoMarketCard key={market.id} market={market} featured />
              ))}
            </div>
          </div>
        )}

        {/* Regular Markets Grid */}
        {regularMarkets.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">All Crypto Markets</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularMarkets.map((market) => (
                <CryptoMarketCard key={market.id} market={market} />
              ))}
            </div>
          </div>
        )}

        {filteredMarkets.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No markets found matching your filters.</p>
          </div>
        )}
      </Container>

      {/* Benefits Section */}
      <div className="bg-gray-50 dark:bg-gray-800 py-16 mt-12">
        <Container>
          <h2 className="text-3xl font-bold mb-8 text-center">Coverage Types</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <BenefitCard
              title="Price Protection"
              description="Hedge long or short positions"
            />
            <BenefitCard
              title="Event Risk"
              description="ETF decisions, regulatory changes"
            />
            <BenefitCard
              title="Protocol Risk"
              description="Network outages, exploits"
            />
            <BenefitCard
              title="Market Events"
              description="Exchange issues, liquidity crises"
            />
          </div>
        </Container>
      </div>

      {/* Data Sources */}
      <Container className="py-12">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-semibold mb-4">Data Sources</h3>
          <div className="flex flex-wrap gap-4">
            <Badge variant="default">Chainlink Oracles</Badge>
            <Badge variant="default">DeFi Llama</Badge>
            <Badge variant="default">UMA Oracle</Badge>
          </div>
        </div>
      </Container>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <Container>
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Start Trading Protected</h2>
            <p className="text-xl text-blue-100 mb-8">
              Crypto insurance on BNB Chain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                Browse Markets
              </Button>
              <Button size="lg" variant="ghost" className="border border-white text-white hover:bg-white/10">
                Learn More
              </Button>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
}

function CryptoMarketCard({ market, featured }: { market: CryptoMarket; featured?: boolean }) {
  return (
    <Card className={`p-6 ${featured ? 'border-2 border-orange-500' : ''}`}>
      {featured && (
        <Badge variant="warning" className="mb-3">
          Trending
        </Badge>
      )}
      <h3 className="text-lg font-bold mb-3">{market.title}</h3>
      <Badge variant="default" className="mb-4">
        {market.category}
      </Badge>
      
      <div className="space-y-2 mb-4">
        {market.current && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Current:</span>
            <span className="font-medium">{market.current}</span>
          </div>
        )}
        {market.target && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Target:</span>
            <span className="font-medium">{market.target}</span>
          </div>
        )}
        {market.probability && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Probability:</span>
            <span className="font-medium">{market.probability}</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Premium:</span>
          <span className="font-medium text-blue-600 dark:text-blue-400">{market.premium}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Total Coverage:</span>
          <span className="font-medium">{market.coverage}</span>
        </div>
      </div>

      <Button className="w-full" variant={featured ? 'primary' : 'secondary'}>
        Protect Position
      </Button>
    </Card>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="p-6">
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Card>
  );
}
