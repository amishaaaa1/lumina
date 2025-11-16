'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';

function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'traders' | 'lps'>('traders');

  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            How it works
          </h2>
          <p className="text-xl text-gray-600">
            Two ways to play
          </p>
        </div>

        {/* Simple Tab Buttons */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => setActiveTab('traders')}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 ${
              activeTab === 'traders'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            I want to hedge
          </button>
          <button
            onClick={() => setActiveTab('lps')}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 ${
              activeTab === 'lps'
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
          >
            I want to earn
          </button>
        </div>

        {/* Content */}
        <div className="relative">
          {activeTab === 'traders' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl p-10 md:p-12 shadow-lg">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Hedge your prediction market bets
                  </h3>
                  <p className="text-lg text-gray-600">
                    Pay 2-10% premium. If you lose, get paid out. That&apos;s it.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-all">
                    <div className="text-sm font-semibold text-blue-600 mb-2">STEP 1</div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Pick a market</h4>
                    <p className="text-gray-600 text-sm">
                      Crypto prices, elections, sports - whatever you&apos;re betting on
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-all">
                    <div className="text-sm font-semibold text-purple-600 mb-2">STEP 2</div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Buy coverage</h4>
                    <p className="text-gray-600 text-sm">
                      Premium is 2-10% based on risk. You get an NFT policy
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-all">
                    <div className="text-sm font-semibold text-green-600 mb-2">STEP 3</div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Claim if wrong</h4>
                    <p className="text-gray-600 text-sm">
                      Lost your bet? Claim your insurance payout in seconds
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/insurance" 
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start hedging
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lps' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl p-10 md:p-12 shadow-lg">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Earn yield on your stablecoins
                  </h3>
                  <p className="text-lg text-gray-600">
                    Deposit USDT/USDC. Collect premiums. Earn up to 40% APY.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-all">
                    <div className="text-sm font-semibold text-green-600 mb-2">STEP 1</div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Deposit funds</h4>
                    <p className="text-gray-600 text-sm">
                      Add USDT or USDC to any insurance pool
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-all">
                    <div className="text-sm font-semibold text-emerald-600 mb-2">STEP 2</div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Collect premiums</h4>
                    <p className="text-gray-600 text-sm">
                      Earn fees every time someone buys insurance
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-300 hover:shadow-lg transition-all">
                    <div className="text-sm font-semibold text-teal-600 mb-2">STEP 3</div>
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">Withdraw anytime</h4>
                    <p className="text-gray-600 text-sm">
                      No lock-up periods. Pull out whenever you want
                    </p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/pools" 
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start earning
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          )}
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
              Protect your trades, amplify your gains. First decentralized insurance protocol for prediction markets on BNB Chain
            </p>

            <div className="flex flex-wrap gap-4 justify-center mb-20">
              <Link
                href="/insurance"
                className="group px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center gap-2">
                  Get Protected
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
                { label: 'Total Value Locked', value: '$125K' },
                { label: 'APY for LPs', value: 'Up to 35%' },
                { label: 'Active Policies', value: '23' },
                { label: 'Coverage', value: 'Instant' },
              ].map((stat) => (
                <div key={stat.label} className="group text-center cursor-default">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
        {/* Animated Gradient Orb */}
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-red-400/20 via-orange-400/15 to-yellow-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Trading prediction markets is risky business
            </h2>
            <p className="text-xl text-gray-600">
              Without protection, one wrong prediction can wipe out weeks of gains
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-400 hover:shadow-xl hover:shadow-red-400/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Unlimited Downside</h3>
              <p className="text-gray-600">You bear 100% of the risk on every trade</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-400 hover:shadow-xl hover:shadow-red-400/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Hedging Tools</h3>
              <p className="text-gray-600">Traditional insurance doesn&apos;t cover prediction markets</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-400 hover:shadow-xl hover:shadow-red-400/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Capital Inefficient</h3>
              <p className="text-gray-600">You over-collateralize just to manage risk</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-red-400 hover:shadow-xl hover:shadow-red-400/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Sleepless Nights</h3>
              <p className="text-gray-600">Constantly worrying about market moves</p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="relative px-6 py-24 bg-white overflow-hidden">
        {/* Animated Gradient Orb */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-green-400/20 via-blue-400/15 to-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Trade with confidence, earn with peace of mind
            </h2>
            <p className="text-xl text-gray-600">
              Lumina brings institutional-grade risk management to every trader
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Buy Insurance</h3>
              <p className="text-gray-600">Protect any prediction market position in seconds</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Provide Liquidity</h3>
              <p className="text-gray-600">Earn premium income as a coverage provider</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Automated Claims</h3>
              <p className="text-gray-600">Get instant payouts when markets resolve against you</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Dynamic Pricing</h3>
              <p className="text-gray-600">Fair premiums based on real-time risk assessment</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <HowItWorksSection />

      {/* Marketplace Preview */}
      <section className="relative px-6 py-24 bg-white overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-20 right-10 w-24 h-24 bg-blue-200/20 rounded-full blur-xl animate-float" style={{ animationDelay: '0.5s', animationDuration: '7s' }} />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-purple-200/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s', animationDuration: '9s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Active Insurance Markets
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">BTC &gt; $50K by Dec 31</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-semibold text-gray-900">3.2%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-semibold text-gray-900">$2.4M</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-purple-500 hover:shadow-xl hover:shadow-purple-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">ETH ETF Approval</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-semibold text-gray-900">4.8%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-semibold text-gray-900">$1.8M</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Trump Election Win</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Premium:</span>
                  <span className="font-semibold text-gray-900">6.1%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage:</span>
                  <span className="font-semibold text-gray-900">$3.2M</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/insurance"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              View All Markets
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Liquidity Pools Preview */}
      <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
        {/* Animated Gradient Orb */}
        <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-green-400/25 via-emerald-400/15 to-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Earn Premium Income
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Stablecoin Pool</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">APY:</span>
                  <span className="text-3xl font-bold text-green-600">18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVL:</span>
                  <span className="font-semibold text-gray-900">$52K</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">BNB Pool</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">APY:</span>
                  <span className="text-3xl font-bold text-green-600">22%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVL:</span>
                  <span className="font-semibold text-gray-900">$38K</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-green-500 hover:shadow-xl hover:shadow-green-500/10 transition-all hover:scale-105">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Blue Chip Pool</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">APY:</span>
                  <span className="text-3xl font-bold text-green-600">16%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">TVL:</span>
                  <span className="font-semibold text-gray-900">$35K</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-8 mb-12 border-2 border-blue-100">
            <div className="grid md:grid-cols-2 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">$8.2K</div>
                <div className="text-gray-600">Total Premiums Earned</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-gray-900 mb-2">18.5%</div>
                <div className="text-gray-600">Average APY</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/pools"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Earning
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="relative px-6 py-24 bg-white overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-10 left-20 w-20 h-20 bg-blue-200/25 rounded-full blur-xl animate-float" style={{ animationDelay: '0s', animationDuration: '8s' }} />
        <div className="absolute bottom-10 right-20 w-28 h-28 bg-indigo-200/25 rounded-full blur-xl animate-float" style={{ animationDelay: '2s', animationDuration: '10s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Built for scale, designed for trust
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-400/10 transition-all hover:scale-105">
              <h3 className="text-xl font-bold text-gray-900 mb-3">BNB Chain Native</h3>
              <p className="text-gray-600">Optimized for speed and low fees</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-400/10 transition-all hover:scale-105">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Contract Security</h3>
              <p className="text-gray-600">Audited, battle-tested code</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-400/10 transition-all hover:scale-105">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Dynamic Risk Modeling</h3>
              <p className="text-gray-600">Real-time premium calculation</p>
            </div>
            
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-400/10 transition-all hover:scale-105">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Non-Custodial</h3>
              <p className="text-gray-600">You control your funds always</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
        {/* Animated Gradient Orb */}
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-purple-400/20 via-pink-400/15 to-blue-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl transition-all hover:scale-105">
              <p className="text-lg text-gray-900 mb-6">
                &quot;Lumina saved me $15K when BTC crashed unexpectedly&quot;
              </p>
              <div className="text-sm font-semibold text-gray-600">Prediction Market Trader</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl transition-all hover:scale-105">
              <p className="text-lg text-gray-900 mb-6">
                &quot;Earning 35% APY providing insurance is a game-changer&quot;
              </p>
              <div className="text-sm font-semibold text-gray-600">Liquidity Provider</div>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl transition-all hover:scale-105">
              <p className="text-lg text-gray-900 mb-6">
                &quot;We use Lumina to hedge our prediction market exposure&quot;
              </p>
              <div className="text-sm font-semibold text-gray-600">DAO Treasury Manager</div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners */}
      <section className="relative px-6 py-24 bg-white overflow-hidden">
        {/* Floating Elements */}
        <div className="absolute top-1/3 left-10 w-24 h-24 bg-cyan-200/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s', animationDuration: '9s' }} />
        
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Integrations
            </h2>
            <p className="text-xl text-gray-600">
              Built on industry-leading infrastructure
            </p>
          </div>

          {/* Infinite Scroll Container */}
          <div className="relative">
            <div className="flex overflow-hidden">
              <div className="flex animate-scroll-left">
                {/* First set of logos */}
                <div className="flex items-center gap-16 px-8">
                  {/* BNB Chain - Official Logo */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 2500 2500" fill="none">
                      <g clipPath="url(#clip0)">
                        <path d="M764.48 1050.52L1250 565L1735.52 1050.52L2020.6 765.44L1250 0L479.4 765.44L764.48 1050.52Z" fill="#F3BA2F"/>
                        <path d="M0 1250L285.08 964.92L570.16 1250L285.08 1535.08L0 1250Z" fill="#F3BA2F"/>
                        <path d="M764.48 1449.48L1250 1935L1735.52 1449.48L2020.6 1734.56L1250 2500L479.4 1734.56L764.48 1449.48Z" fill="#F3BA2F"/>
                        <path d="M1929.84 1250L2214.92 964.92L2500 1250L2214.92 1535.08L1929.84 1250Z" fill="#F3BA2F"/>
                        <path d="M1530.28 1250L1250 969.72L1025.52 1194.2L969.72 1250L1250 1530.28L1530.28 1250Z" fill="#F3BA2F"/>
                      </g>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">BNB Chain</span>
                  </div>

                  {/* Polymarket - Official Style */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" rx="20" fill="url(#polyGradient)"/>
                      <path d="M30 35h15c8 0 15 7 15 15s-7 15-15 15H30V35z" fill="white"/>
                      <defs>
                        <linearGradient id="polyGradient" x1="0" y1="0" x2="100" y2="100">
                          <stop offset="0%" stopColor="#6366F1"/>
                          <stop offset="100%" stopColor="#8B5CF6"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Polymarket</span>
                  </div>

                  {/* Chainlink - Official Logo */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 397 397" fill="none">
                      <path d="M198.5 0L148.5 28.9L49.2 86.2L0 115.1V281.9L49.2 310.8L148.5 368.1L198.5 397L248.5 368.1L347.8 310.8L397 281.9V115.1L347.8 86.2L248.5 28.9L198.5 0Z" fill="#375BD2"/>
                      <path d="M198.5 116.7L148.5 145.6L99.8 173.8V223.2L148.5 251.4L198.5 280.3L248.5 251.4L297.2 223.2V173.8L248.5 145.6L198.5 116.7Z" fill="white"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Chainlink</span>
                  </div>

                  {/* OpenZeppelin - Official Logo */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                      <path d="M50 5L10 27.5V72.5L50 95L90 72.5V27.5L50 5Z" fill="#4E5EE4"/>
                      <path d="M50 25L30 37.5V62.5L50 75L70 62.5V37.5L50 25Z" fill="white"/>
                      <circle cx="50" cy="50" r="8" fill="#4E5EE4"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">OpenZeppelin</span>
                  </div>
                </div>

                {/* Duplicate set for seamless loop */}
                <div className="flex items-center gap-16 px-8">
                  {/* BNB Chain */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 2500 2500" fill="none">
                      <g clipPath="url(#clip1)">
                        <path d="M764.48 1050.52L1250 565L1735.52 1050.52L2020.6 765.44L1250 0L479.4 765.44L764.48 1050.52Z" fill="#F3BA2F"/>
                        <path d="M0 1250L285.08 964.92L570.16 1250L285.08 1535.08L0 1250Z" fill="#F3BA2F"/>
                        <path d="M764.48 1449.48L1250 1935L1735.52 1449.48L2020.6 1734.56L1250 2500L479.4 1734.56L764.48 1449.48Z" fill="#F3BA2F"/>
                        <path d="M1929.84 1250L2214.92 964.92L2500 1250L2214.92 1535.08L1929.84 1250Z" fill="#F3BA2F"/>
                        <path d="M1530.28 1250L1250 969.72L1025.52 1194.2L969.72 1250L1250 1530.28L1530.28 1250Z" fill="#F3BA2F"/>
                      </g>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">BNB Chain</span>
                  </div>

                  {/* Polymarket */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" rx="20" fill="url(#polyGradient2)"/>
                      <path d="M30 35h15c8 0 15 7 15 15s-7 15-15 15H30V35z" fill="white"/>
                      <defs>
                        <linearGradient id="polyGradient2" x1="0" y1="0" x2="100" y2="100">
                          <stop offset="0%" stopColor="#6366F1"/>
                          <stop offset="100%" stopColor="#8B5CF6"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Polymarket</span>
                  </div>

                  {/* Chainlink */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 397 397" fill="none">
                      <path d="M198.5 0L148.5 28.9L49.2 86.2L0 115.1V281.9L49.2 310.8L148.5 368.1L198.5 397L248.5 368.1L347.8 310.8L397 281.9V115.1L347.8 86.2L248.5 28.9L198.5 0Z" fill="#375BD2"/>
                      <path d="M198.5 116.7L148.5 145.6L99.8 173.8V223.2L148.5 251.4L198.5 280.3L248.5 251.4L297.2 223.2V173.8L248.5 145.6L198.5 116.7Z" fill="white"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Chainlink</span>
                  </div>

                  {/* OpenZeppelin */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none">
                      <path d="M50 5L10 27.5V72.5L50 95L90 72.5V27.5L50 5Z" fill="#4E5EE4"/>
                      <path d="M50 25L30 37.5V62.5L50 75L70 62.5V37.5L50 25Z" fill="white"/>
                      <circle cx="50" cy="50" r="8" fill="#4E5EE4"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">OpenZeppelin</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
        {/* Animated Gradient Orb */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo-400/20 via-blue-400/15 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How are premiums calculated?</h3>
              <p className="text-gray-600">
                Premiums are dynamically calculated based on pool utilization, market risk, and coverage duration. Typically ranges from 2-10% of coverage amount.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">What happens if insurance pool runs out of funds?</h3>
              <p className="text-gray-600">
                Each pool has a maximum capacity. When utilization is high, premiums increase to attract more liquidity providers and balance risk.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">How quickly are claims processed?</h3>
              <p className="text-gray-600">
                Claims are processed automatically via smart contracts when Chainlink oracles confirm market resolution. Payouts typically complete in under 3 seconds.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 hover:shadow-xl transition-all">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Can I cancel my insurance policy?</h3>
              <p className="text-gray-600">
                Policies are active until market resolution. You can transfer your policy NFT to another wallet, but premiums are non-refundable once paid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative px-6 py-32 bg-white overflow-hidden">
        {/* Animated Gradient Orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '0s', animationDuration: '7s' }} />
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float" style={{ animationDelay: '1.5s', animationDuration: '9s' }} />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Ready to trade without fear?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            Join thousands of traders already protected by Lumina
          </p>
          <div className="flex flex-wrap gap-6 justify-center">
            <Link
              href="/insurance"
              className="group px-10 py-5 bg-gray-900 text-white rounded-full font-semibold text-lg hover:bg-gray-800 transition-all hover:scale-105 shadow-xl inline-flex items-center gap-2"
            >
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <Link
              href="/docs"
              className="group px-10 py-5 bg-white text-gray-900 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-gray-900 transition-all hover:scale-105 inline-flex items-center gap-2"
            >
              Read Documentation
              <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
