'use client';

import { useState } from 'react';

interface Market {
  id: string;
  token: string;
  symbol: string;
  question: string;
  votes: number;
  poolLiquidity: string;
  currentPrice: string;
  premium: string;
  coverage: string;
  coingeckoId: string;
}

const MARKETS: Market[] = [
  {
    id: '1',
    token: 'Bitcoin',
    symbol: 'BTC',
    question: 'BTC hits $120K by Q2 2025?',
    votes: 234,
    poolLiquidity: '$18.4M',
    currentPrice: '$91,234',
    premium: '2.8%',
    coverage: '$6.2M',
    coingeckoId: 'bitcoin'
  },
  {
    id: '2',
    token: 'Ethereum',
    symbol: 'ETH',
    question: 'ETH flips $5K before June?',
    votes: 187,
    poolLiquidity: '$14.2M',
    currentPrice: '$3,456',
    premium: '3.4%',
    coverage: '$4.8M',
    coingeckoId: 'ethereum'
  },
  {
    id: '3',
    token: 'Cardano',
    symbol: 'ADA',
    question: 'ADA breaks $1.50 in 2025?',
    votes: 142,
    poolLiquidity: '$9.8M',
    currentPrice: '$0.92',
    premium: '4.6%',
    coverage: '$2.3M',
    coingeckoId: 'cardano'
  },
  {
    id: '4',
    token: 'Astar Network',
    symbol: 'ASTR',
    question: 'ASTR reaches $0.35 this year?',
    votes: 78,
    poolLiquidity: '$3.4M',
    currentPrice: '$0.089',
    premium: '6.2%',
    coverage: '$890K',
    coingeckoId: 'astar'
  },
  {
    id: '5',
    token: 'Hyperliquid',
    symbol: 'HYPE',
    question: 'HYPE surpasses $75 in Q1?',
    votes: 156,
    poolLiquidity: '$7.6M',
    currentPrice: '$32.10',
    premium: '5.1%',
    coverage: '$3.1M',
    coingeckoId: 'hyperliquid'
  },
  {
    id: '6',
    token: 'Solana',
    symbol: 'SOL',
    question: 'SOL maintains above $200?',
    votes: 203,
    poolLiquidity: '$11.2M',
    currentPrice: '$178',
    premium: '3.9%',
    coverage: '$3.7M',
    coingeckoId: 'solana'
  },
  {
    id: '7',
    token: 'Polkadot',
    symbol: 'DOT',
    question: 'DOT hits $15 by March?',
    votes: 91,
    poolLiquidity: '$5.4M',
    currentPrice: '$7.23',
    premium: '5.4%',
    coverage: '$1.8M',
    coingeckoId: 'polkadot'
  },
  {
    id: '8',
    token: 'Chainlink',
    symbol: 'LINK',
    question: 'LINK reaches $40 in 2025?',
    votes: 167,
    poolLiquidity: '$8.9M',
    currentPrice: '$18.45',
    premium: '4.3%',
    coverage: '$2.9M',
    coingeckoId: 'chainlink'
  },
  {
    id: '9',
    token: 'Avalanche',
    symbol: 'AVAX',
    question: 'AVAX breaks $80 this quarter?',
    votes: 124,
    poolLiquidity: '$6.7M',
    currentPrice: '$42.30',
    premium: '4.8%',
    coverage: '$2.1M',
    coingeckoId: 'avalanche-2'
  },
  {
    id: '10',
    token: 'Polygon',
    symbol: 'MATIC',
    question: 'MATIC reaches $2 in 2025?',
    votes: 98,
    poolLiquidity: '$4.5M',
    currentPrice: '$0.87',
    premium: '5.7%',
    coverage: '$1.5M',
    coingeckoId: 'matic-network'
  },
  {
    id: '11',
    token: 'Cosmos',
    symbol: 'ATOM',
    question: 'ATOM hits $25 by summer?',
    votes: 112,
    poolLiquidity: '$5.8M',
    currentPrice: '$9.12',
    premium: '5.3%',
    coverage: '$1.9M',
    coingeckoId: 'cosmos'
  },
  {
    id: '12',
    token: 'Near Protocol',
    symbol: 'NEAR',
    question: 'NEAR surpasses $12 in Q2?',
    votes: 87,
    poolLiquidity: '$4.1M',
    currentPrice: '$4.56',
    premium: '6.1%',
    coverage: '$1.3M',
    coingeckoId: 'near'
  }
];

export function InsurableMarketsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerPage = 5;

  const visibleMarkets = MARKETS.slice(currentIndex, currentIndex + itemsPerPage);
  const canGoNext = currentIndex + itemsPerPage < MARKETS.length;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <section className="relative px-6 py-24 bg-white overflow-hidden">
      {/* Background Orbs - matching hero section */}
      <div className="absolute top-20 right-10 w-24 h-24 bg-blue-200/20 rounded-full blur-xl animate-float-7s delay-0 will-change-transform" aria-hidden="true" />
      <div className="absolute bottom-20 left-10 w-32 h-32 bg-purple-200/20 rounded-full blur-xl animate-float-9s delay-1s will-change-transform" aria-hidden="true" />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Insure Any Prediction Market
          </h2>
          <p className="text-xl text-gray-600">
            Live markets from Lumina and beyond
          </p>
        </div>

        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handlePrev}
              disabled={!canGoPrev}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous markets"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>

          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10">
            <button
              onClick={handleNext}
              disabled={!canGoNext}
              className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next markets"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Markets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 px-8">
            {visibleMarkets.map((market) => (
              <div 
                key={market.id} 
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-200 hover:border-gray-300"
              >
                <div className="space-y-4">
                  {/* Token Header */}
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={`https://cryptologos.cc/logos/${market.token.toLowerCase().replace(' ', '-')}-${market.symbol.toLowerCase()}-logo.png`}
                        alt={market.token}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback to a generic crypto icon
                          const target = e.target as HTMLImageElement;
                          target.src = `https://via.placeholder.com/40/3B82F6/FFFFFF?text=${market.symbol}`;
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-gray-900">{market.token}</h3>
                      <p className="text-xs text-gray-500">{market.symbol}</p>
                    </div>
                  </div>

                  {/* Question */}
                  <p className="text-sm font-semibold text-gray-900 min-h-[42px] leading-tight">
                    {market.question}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Votes</span>
                      <span className="text-xs font-bold text-gray-900">{market.votes}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Pool liquidity</span>
                      <span className="text-xs font-bold text-gray-900">{market.poolLiquidity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Current price</span>
                      <span className="text-xs font-bold text-gray-900">{market.currentPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Premium</span>
                      <span className="text-xs font-bold text-green-600">
                        {market.premium}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">Coverage</span>
                      <span className="text-xs font-bold text-gray-900">{market.coverage}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    className="w-full px-4 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors mt-2"
                    onClick={() => window.location.href = `/insurance?market=${market.id}`}
                  >
                    Insure Position
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: Math.ceil(MARKETS.length / itemsPerPage) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx * itemsPerPage)}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / itemsPerPage) === idx
                    ? 'bg-blue-600 w-8'
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
                aria-label={`Go to page ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

