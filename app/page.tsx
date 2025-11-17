'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { StatCard } from '@/components/landing/StatCard';
import { PoolCard } from '@/components/landing/PoolCard';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { BackToTop } from '@/components/landing/BackToTop';
import { useLandingStats } from '@/hooks/useLandingStats';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { InsurableMarketsSection } from '@/components/landing/InsurableMarketsSection';

function HowItWorksSection() {
  const [activeTab, setActiveTab] = useState<'traders' | 'lps'>('traders');

  return (
    <section className="px-6 py-24 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Two Ways to Use Lumina
          </h2>
          <p className="text-xl text-gray-600">
            Protect trades or earn yield
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex justify-center gap-4 mb-16">
          <button
            onClick={() => setActiveTab('traders')}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 ${
              activeTab === 'traders'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
            aria-pressed={activeTab === 'traders'}
          >
            For Traders
          </button>
          <button
            onClick={() => setActiveTab('lps')}
            className={`px-8 py-4 rounded-full font-semibold text-lg transition-all hover:scale-105 ${
              activeTab === 'lps'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
            }`}
            aria-pressed={activeTab === 'lps'}
          >
            For LPs
          </button>
        </div>

        {/* Content */}
        <div className="relative">
          {activeTab === 'traders' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl p-10 md:p-12 shadow-lg">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    Hedge Your Crypto Predictions
                  </h3>
                  <p className="text-lg text-gray-600">
                    Pay 2-10% premium. If you lose, get paid out.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <FeatureCard
                    step="STEP 1"
                    title="Pick market"
                    description="BTC, ETH, BNB - any crypto prediction"
                    color="blue"
                  />
                  <FeatureCard
                    step="STEP 2"
                    title="Buy coverage"
                    description="Premium 2-10% based on risk"
                    color="purple"
                  />
                  <FeatureCard
                    step="STEP 3"
                    title="Claim if wrong"
                    description="Lost your bet? Get paid instantly"
                    color="pink"
                  />
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/insurance" 
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Get Protected
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                    Earn Yield on Stablecoins
                  </h3>
                  <p className="text-lg text-gray-600">
                    Deposit USDT/USDC. Collect premiums. Earn up to 42% APY.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <FeatureCard
                    step="STEP 1"
                    title="Deposit funds"
                    description="Add USDT or USDC to any pool"
                    color="purple"
                  />
                  <FeatureCard
                    step="STEP 2"
                    title="Earn premiums"
                    description="Collect fees from every policy sold"
                    color="pink"
                  />
                  <FeatureCard
                    step="STEP 3"
                    title="Withdraw anytime"
                    description="No lock-ups, pull out whenever"
                    color="blue"
                  />
                </div>
                
                <div className="text-center">
                  <Link 
                    href="/pools" 
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    Start Earning
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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

// Section Divider Component
function SectionDivider({ bgColor = 'bg-white' }: { bgColor?: string }) {
  return (
    <div className={`relative h-24 ${bgColor} flex items-center justify-center`}>
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}

export default function Home() {
  const stats = useLandingStats();

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <Navigation />

        {/* ============================================ */}
        {/* HERO SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 pt-32 pb-24 overflow-hidden">
          {/* Animated Gradient Orb */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl animate-orb-slow will-change-transform" aria-hidden="true" />
          
          {/* Floating Elements */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float-6s delay-0 will-change-transform" aria-hidden="true" />
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float-8s delay-1s will-change-transform" aria-hidden="true" />
          <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-float-7s delay-2s will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-8 hover:scale-105 transition-transform cursor-default border-2 border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" aria-hidden="true" />
                <span className="text-sm font-medium text-blue-700">Live on BNB Chain Testnet</span>
              </div>

              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
                <span className="block text-gray-900">Crypto Prediction</span>
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                  Insurance
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
                Hedge your Polymarket bets on BNB Chain. First risk management infrastructure for prediction markets.
              </p>

              <div className="flex flex-wrap gap-4 justify-center mb-20">
                <Link
                  href="/insurance"
                  className="group px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center gap-2">
                    Get Protected
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
                    <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </Link>
              </div>

              {/* Stats with Real Data */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                <StatCard label="Total Protected" value={stats.totalProtected} isLoading={stats.isLoading} />
                <StatCard label="Avg LP APY" value={stats.avgAPY} isLoading={stats.isLoading} />
                <StatCard label="Active Policies" value={stats.activePolicies} isLoading={stats.isLoading} />
                <StatCard label="Claims" value="Instant" isLoading={false} />
              </div>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative h-24 bg-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-200"></div>
          </div>
        </div>

        {/* ============================================ */}
        {/* PROBLEM SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
          <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-pink-400/20 rounded-full blur-3xl animate-orb-medium will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Why Prediction Markets Need Insurance
              </h2>
              <p className="text-xl text-gray-600">
                Bet wrong on Polymarket? You lose everything.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="All or Nothing"
                description="Wrong prediction = total loss of capital"
                color="purple"
              />
              <FeatureCard
                title="No Hedging Tools"
                description="Can't protect downside like in TradFi"
                color="purple"
              />
              <FeatureCard
                title="Limits Bet Sizes"
                description="Traders stay small to manage risk"
                color="purple"
              />
              <FeatureCard
                title="Blocks Institutions"
                description="Funds need risk management to participate"
                color="purple"
              />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative h-24 bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-200"></div>
          </div>
        </div>

        {/* ============================================ */}
        {/* SOLUTION SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-24 bg-white overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-pink-400/20 rounded-full blur-3xl animate-orb-medium will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                How Lumina Works
              </h2>
              <p className="text-xl text-gray-600">
                Two-sided marketplace for prediction market risk
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="Traders Buy Coverage"
                description="Pay 2-10% premium to hedge your bet"
                color="blue"
              />
              <FeatureCard
                title="LPs Provide Capital"
                description="Deposit stables, earn from premiums"
                color="blue"
              />
              <FeatureCard
                title="Chainlink Resolves"
                description="Oracle verifies market outcomes"
                color="purple"
              />
              <FeatureCard
                title="Auto Payouts"
                description="Claims processed in seconds"
                color="pink"
              />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative h-24 bg-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse delay-200"></div>
          </div>
        </div>

        {/* ============================================ */}
        {/* HOW IT WORKS SECTION */}
        {/* ============================================ */}
        <HowItWorksSection />

        <SectionDivider bgColor="bg-gray-50" />

        {/* ============================================ */}
        {/* MARKETPLACE PREVIEW SECTION */}
        {/* ============================================ */}
        <InsurableMarketsSection />

        <SectionDivider bgColor="bg-white" />

        {/* ============================================ */}
        {/* LIQUIDITY POOLS PREVIEW SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-blue-400/25 via-purple-400/15 to-pink-400/20 rounded-full blur-3xl animate-orb-fast will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Earn Yield by Backing Traders
              </h2>
              <p className="text-xl text-gray-600">
                Deposit stablecoins, collect premiums, withdraw anytime
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <PoolCard
                name="BTC Price Predictions"
                apy="42%"
                tvl="$3.2M"
                color="blue"
              />
              <PoolCard
                name="ETH & Altcoin Markets"
                apy="38%"
                tvl="$2.1M"
                color="purple"
              />
              <PoolCard
                name="DeFi Protocol Events"
                apy="45%"
                tvl="$1.8M"
                color="pink"
              />
            </div>

            <div className="bg-white rounded-2xl p-8 mb-12 border-2 border-gray-200 shadow-sm">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$7.1M</div>
                  <div className="text-gray-600">Total Value Locked</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$892K</div>
                  <div className="text-gray-600">Premiums Collected</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">41%</div>
                  <div className="text-gray-600">Average APY</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/pools"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Earning
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider bgColor="bg-gray-50" />

        {/* ============================================ */}
        {/* TECHNOLOGY SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-24 bg-white overflow-hidden">
          <div className="absolute top-10 left-20 w-20 h-20 bg-blue-200/25 rounded-full blur-xl animate-float-8s delay-0 will-change-transform" aria-hidden="true" />
          <div className="absolute bottom-10 right-20 w-28 h-28 bg-indigo-200/25 rounded-full blur-xl animate-float-9s delay-2s will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Built on BNB Chain
              </h2>
              <p className="text-xl text-gray-600">
                Low fees, fast finality, proven security
              </p>
            </div>

            <div className="relative overflow-hidden py-4">
              <div className="flex items-center">
                <div className="flex items-center gap-32 px-8 animate-scroll-left">
                  {/* BNB Chain */}
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <Image 
                      src="/image/bnb-chain/bnb/BNB Chain/BNB Chain_crypto-logo-svg_0.svg"
                      alt="BNB Chain"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="text-2xl font-bold text-gray-900">BNB Chain</span>
                  </div>

                  {/* OpenZeppelin */}
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <Image 
                      src="/image/openzeppelin/openzeppelin-seeklogo.svg"
                      alt="OpenZeppelin"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="text-2xl font-bold text-gray-900">OpenZeppelin</span>
                  </div>

                  {/* Chainlink */}
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <svg className="w-12 h-12" viewBox="0 0 397 397" fill="none" aria-hidden="true">
                      <path d="M198.5 0L148.5 28.9L49.2 86.2L0 115.1V281.9L49.2 310.8L148.5 368.1L198.5 397L248.5 368.1L347.8 310.8L397 281.9V115.1L347.8 86.2L248.5 28.9L198.5 0Z" fill="#375BD2"/>
                      <path d="M198.5 116.7L148.5 145.6L99.8 173.8V223.2L148.5 251.4L198.5 280.3L248.5 251.4L297.2 223.2V173.8L248.5 145.6L198.5 116.7Z" fill="white"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Chainlink</span>
                  </div>

                  {/* Polymarket */}
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <Image 
                      src="/image/polymarket/polymarket-seeklogo.svg"
                      alt="Polymarket"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="text-2xl font-bold text-gray-900">Polymarket</span>
                  </div>

                  {/* Duplicate for seamless loop */}
                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <Image 
                      src="/image/bnb-chain/bnb/BNB Chain/BNB Chain_crypto-logo-svg_0.svg"
                      alt="BNB Chain"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="text-2xl font-bold text-gray-900">BNB Chain</span>
                  </div>

                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <Image 
                      src="/image/openzeppelin/openzeppelin-seeklogo.svg"
                      alt="OpenZeppelin"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="text-2xl font-bold text-gray-900">OpenZeppelin</span>
                  </div>

                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <svg className="w-12 h-12" viewBox="0 0 397 397" fill="none" aria-hidden="true">
                      <path d="M198.5 0L148.5 28.9L49.2 86.2L0 115.1V281.9L49.2 310.8L148.5 368.1L198.5 397L248.5 368.1L347.8 310.8L397 281.9V115.1L347.8 86.2L248.5 28.9L198.5 0Z" fill="#375BD2"/>
                      <path d="M198.5 116.7L148.5 145.6L99.8 173.8V223.2L148.5 251.4L198.5 280.3L248.5 251.4L297.2 223.2V173.8L248.5 145.6L198.5 116.7Z" fill="white"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Chainlink</span>
                  </div>

                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <svg className="w-12 h-12" viewBox="0 0 397 397" fill="none" aria-hidden="true">
                      <path d="M198.5 0L148.5 28.9L49.2 86.2L0 115.1V281.9L49.2 310.8L148.5 368.1L198.5 397L248.5 368.1L347.8 310.8L397 281.9V115.1L347.8 86.2L248.5 28.9L198.5 0Z" fill="#375BD2"/>
                      <path d="M198.5 116.7L148.5 145.6L99.8 173.8V223.2L148.5 251.4L198.5 280.3L248.5 251.4L297.2 223.2V173.8L248.5 145.6L198.5 116.7Z" fill="white"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Chainlink</span>
                  </div>

                  <div className="flex items-center gap-4 whitespace-nowrap">
                    <Image 
                      src="/image/polymarket/polymarket-seeklogo.svg"
                      alt="Polymarket"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                    <span className="text-2xl font-bold text-gray-900">Polymarket</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>



        {/* ============================================ */}
        {/* FAQ SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-t from-indigo-400/20 via-blue-400/15 to-cyan-400/20 rounded-full blur-3xl animate-orb-fast will-change-transform" aria-hidden="true" />
          
          <div className="max-w-4xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
            </div>

            <FAQAccordion />
          </div>
        </section>

        <SectionDivider bgColor="bg-gray-50" />

        {/* ============================================ */}
        {/* FINAL CTA SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-32 bg-white overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl animate-orb-slow will-change-transform" aria-hidden="true" />
          
          <div className="absolute top-20 left-20 w-24 h-24 bg-blue-200/30 rounded-full blur-xl animate-float-7s delay-0 will-change-transform" aria-hidden="true" />
          <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float-9s delay-1s will-change-transform" aria-hidden="true" />
          
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
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/pools"
                className="group px-10 py-5 bg-white text-gray-900 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-gray-900 transition-all hover:scale-105 inline-flex items-center gap-2"
              >
                Explore Pools
                <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <Footer />
        <BackToTop />
      </div>
    </ErrorBoundary>
  );
}
