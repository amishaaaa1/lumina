'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'traders' | 'lps'>('traders');

  return (
    <section className="px-6 py-24">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-16 text-center">
          How it works
        </h2>

        {/* Simple Tab Buttons */}
        <div className="flex gap-3 mb-10 justify-center">
          <button
            onClick={() => setActiveTab('traders')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'traders'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            I want to hedge
          </button>
          <button
            onClick={() => setActiveTab('lps')}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === 'lps'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            I want to earn
          </button>
        </div>

        {/* Tab Content */}
        <div className="relative min-h-[400px]">
          {/* Traders Content */}
          <div
            className={`transition-opacity duration-200 ${
              activeTab === 'traders'
                ? 'opacity-100'
                : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            <div className="bg-white rounded-xl p-8 md:p-10 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Hedge your prediction market bets
              </h3>
              
              <p className="text-gray-600 mb-8 text-lg">
                Pay a small premium (2-10%) to insure your position. If your bet loses, you get paid out. Simple as that.
              </p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Pick a market</div>
                  <div className="text-gray-600">Crypto prices, elections, sports - whatever you're betting on</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Buy coverage</div>
                  <div className="text-gray-600">Premium is 2-10% based on risk. You get an NFT policy</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Claim if wrong</div>
                  <div className="text-gray-600">Lost your bet? Claim your insurance payout in seconds</div>
                </div>
              </div>
              
              <Link href="/insurance" className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Start hedging
              </Link>
            </div>
          </div>

          {/* LPs Content */}
          <div
            className={`transition-opacity duration-200 ${
              activeTab === 'lps'
                ? 'opacity-100'
                : 'opacity-0 absolute inset-0 pointer-events-none'
            }`}
          >
            <div className="bg-white rounded-xl p-8 md:p-10 border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Earn yield by providing liquidity
              </h3>
              
              <p className="text-gray-600 mb-8 text-lg">
                Deposit USDT or USDC into insurance pools. Earn premiums when traders buy coverage. Currently earning 40% APY.
              </p>
              
              <div className="space-y-6 mb-8">
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Deposit stablecoins</div>
                  <div className="text-gray-600">Add USDT or USDC to pools. Your capital backs insurance policies</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Earn premiums automatically</div>
                  <div className="text-gray-600">Get paid every time a trader buys coverage. Earnings compound</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Withdraw whenever</div>
                  <div className="text-gray-600">No lock-up. Pull your funds anytime (if liquidity available)</div>
                </div>
              </div>
              
              <Link href="/pools" className="inline-block px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                Start earning
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero */}
      <section className="relative px-6 pt-32 pb-24 overflow-hidden">
        {/* Animated Gradient Orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '0s', animationDuration: '6s' }} />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '1s', animationDuration: '8s' }} />
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '2s', animationDuration: '7s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8 hover:scale-105 transition-transform cursor-default">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700">Live on BNB Testnet</span>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="block text-gray-900">Insurance for</span>
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                Prediction Markets
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
              Hedge your bets. Earn yield. Built on BNB Chain.
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-20">
              <Link
                href="/insurance"
                className="group px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  Buy Insurance
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
              <Link
                href="/pools"
                className="group px-8 py-4 bg-white text-gray-900 rounded-full font-semibold border-2 border-gray-200 hover:border-gray-900 transition-all hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  Earn Yield
                  <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </Link>
            </div>

            {/* Stats with Hover Effects */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {[
                { label: 'Market Volume', value: '$500M+', color: 'blue' },
                { label: 'LP APY', value: '40%', color: 'green' },
                { label: 'Premium', value: '2-10%', color: 'purple' },
                { label: 'Payout', value: '<3s', color: 'orange' },
              ].map((stat) => (
                <div key={stat.label} className="group text-center cursor-default">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">{stat.label}</div>
                  <div className={`h-1 w-0 group-hover:w-full mx-auto mt-2 bg-${stat.color}-500 transition-all duration-300 rounded-full`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <HowItWorksSection />

      {/* Features */}
      <section className="px-6 py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Built different
            </h2>
            <p className="text-xl text-gray-600">
              No BS. Just solid tech.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: 'Fast & Cheap', desc: 'BNB Chain. 3s blocks. $0.10 gas.', icon: '⚡' },
              { title: 'Secure', desc: 'OpenZeppelin contracts. 100% test coverage.', icon: '🔒' },
              { title: 'Fair Pricing', desc: 'Dynamic rates based on pool utilization.', icon: '⚖️' },
              { title: 'Chainlink Oracles', desc: 'Decentralized price feeds for claims.', icon: '🔗' },
              { title: 'Policy NFTs', desc: 'Every policy is an ERC-721 token.', icon: '🎫' },
              { title: 'Non-Custodial', desc: 'Your keys, your funds. Always.', icon: '🔓' },
            ].map((feature, i) => (
              <div 
                key={feature.title} 
                className="group bg-white rounded-2xl p-8 border border-gray-100 hover:border-gray-300 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-default"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="text-5xl mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">{feature.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-6 py-32 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-20 text-center">
            Use cases
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { title: 'Crypto', desc: 'BTC/ETH price predictions', emoji: '₿', gradient: 'from-orange-400 to-yellow-400' },
              { title: 'Politics', desc: 'Election outcomes', emoji: '🗳️', gradient: 'from-blue-400 to-indigo-400' },
              { title: 'Sports', desc: 'Game results', emoji: '⚽', gradient: 'from-green-400 to-emerald-400' },
            ].map((useCase) => (
              <div key={useCase.title} className="group relative bg-white rounded-3xl p-12 text-center shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:scale-105 cursor-default">
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-all duration-300`} />
                <div className="relative">
                  <div className="text-7xl mb-8 group-hover:scale-125 group-hover:-rotate-12 transition-all duration-300">{useCase.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{useCase.title}</h3>
                  <p className="text-gray-600 text-lg">{useCase.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Ready to start?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands earning and hedging on BNB Chain.
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/insurance"
              className="px-10 py-5 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-xl"
            >
              Buy Insurance
            </Link>
            <Link
              href="/pools"
              className="px-10 py-5 bg-white text-gray-900 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-gray-900 transition-all hover:scale-105"
            >
              Provide Liquidity
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
