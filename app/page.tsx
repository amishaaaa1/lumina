'use client';

import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { useState } from 'react';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { StatCard } from '@/components/landing/StatCard';
import { MarketCard } from '@/components/landing/MarketCard';
import { PoolCard } from '@/components/landing/PoolCard';
import { FAQAccordion } from '@/components/landing/FAQAccordion';
import { BackToTop } from '@/components/landing/BackToTop';
import { useLandingStats } from '@/hooks/useLandingStats';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

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
                ? 'bg-blue-600 text-white shadow-lg'
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
                ? 'bg-purple-400 text-white shadow-lg'
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
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
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
                    className="group inline-flex items-center gap-2 px-8 py-4 bg-purple-400 text-white rounded-full font-semibold hover:bg-purple-500 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
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
                Protect your trades on BNB Chain. First decentralized insurance protocol for crypto prediction markets.
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
                The Problem with Crypto Predictions
              </h2>
              <p className="text-xl text-gray-600">
                No insurance, no safety net, unlimited downside
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="Total Exposure"
                description="One bad prediction can wipe your portfolio"
                color="purple"
              />
              <FeatureCard
                title="No Traditional Coverage"
                description="Banks don't insure crypto predictions"
                color="purple"
              />
              <FeatureCard
                title="Inefficient Capital"
                description="You lock up excess funds just to sleep at night"
                color="purple"
              />
              <FeatureCard
                title="24/7 Stress"
                description="Constantly monitoring, always anxious"
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
                Trade with confidence, earn with peace of mind
              </h2>
              <p className="text-xl text-gray-600">
                Lumina brings institutional-grade risk management to every trader
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="Buy Insurance"
                description="Protect any prediction market position in seconds"
                color="blue"
              />
              <FeatureCard
                title="Provide Liquidity"
                description="Earn premium income as a coverage provider"
                color="blue"
              />
              <FeatureCard
                title="Automated Claims"
                description="Get instant payouts when markets resolve against you"
                color="purple"
              />
              <FeatureCard
                title="Dynamic Pricing"
                description="Fair premiums based on real-time risk assessment"
                color="pink"
              />
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative h-24 bg-white flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse delay-100"></div>
            <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse delay-200"></div>
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
        <section className="relative px-6 py-24 bg-white overflow-hidden">
          <div className="absolute top-20 right-10 w-24 h-24 bg-blue-200/20 rounded-full blur-xl animate-float-7s delay-0 will-change-transform" aria-hidden="true" />
          <div className="absolute bottom-20 left-10 w-32 h-32 bg-purple-200/20 rounded-full blur-xl animate-float-9s delay-1s will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Active Crypto Markets
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <MarketCard
                title="BTC > $70K by EOY"
                premium="3.2%"
                coverage="$2.4M"
                color="blue"
              />
              <MarketCard
                title="ETH ETF Approval"
                premium="4.8%"
                coverage="$1.8M"
                color="purple"
              />
              <MarketCard
                title="BNB Chain Upgrade"
                premium="5.1%"
                coverage="$1.2M"
                color="pink"
              />
            </div>

            <div className="text-center">
              <Link
                href="/insurance"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                View All Markets
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        <SectionDivider bgColor="bg-white" />

        {/* ============================================ */}
        {/* LIQUIDITY POOLS PREVIEW SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-24 bg-gray-50 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-[700px] h-[700px] bg-gradient-to-tr from-blue-400/25 via-purple-400/15 to-pink-400/20 rounded-full blur-3xl animate-orb-fast will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Earn Premium Income
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <PoolCard
                name="Stablecoin Pool"
                apy="38%"
                tvl="$850K"
                color="blue"
              />
              <PoolCard
                name="BNB Pool"
                apy="45%"
                tvl="$720K"
                color="purple"
              />
              <PoolCard
                name="Blue Chip Pool"
                apy="42%"
                tvl="$530K"
                color="pink"
              />
            </div>

            <div className="bg-gray-50 rounded-2xl p-8 mb-12 border-2 border-gray-200">
              <div className="grid md:grid-cols-2 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">$420K</div>
                  <div className="text-gray-600">Total Premiums Earned</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">42%</div>
                  <div className="text-gray-600">Average APY</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/pools"
                className="group inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
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
                Powered by BNB Chain
              </h2>
              <p className="text-xl text-gray-600">
                Built for scale, designed for trust
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <FeatureCard
                title="BNB Chain Native"
                description="Fast, secure, low-cost transactions"
                color="blue"
              />
              <FeatureCard
                title="Smart Contract Security"
                description="Audited, battle-tested code"
                color="blue"
              />
              <FeatureCard
                title="Dynamic Risk Modeling"
                description="Real-time premium calculation"
                color="blue"
              />
              <FeatureCard
                title="Non-Custodial"
                description="You control your funds always"
                color="blue"
              />
            </div>
          </div>
        </section>

        <SectionDivider bgColor="bg-white" />

        {/* ============================================ */}
        {/* PARTNERS SECTION */}
        {/* ============================================ */}
        <section className="relative px-6 py-24 bg-white overflow-hidden">
          <div className="absolute top-1/3 left-10 w-24 h-24 bg-cyan-200/20 rounded-full blur-xl animate-float-9s delay-1s will-change-transform" aria-hidden="true" />
          
          <div className="max-w-6xl mx-auto relative">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Built with Industry Leaders
              </h2>
              <p className="text-lg text-gray-600">
                Powered by the best infrastructure in Web3
              </p>
            </div>

            <div className="relative overflow-hidden">
              <div className="flex items-center">
                <div className="flex items-center gap-16 px-8 animate-scroll-left">
                  {/* BNB Chain */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 2500 2500" fill="none" aria-hidden="true">
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
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" aria-hidden="true">
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

                  {/* Chainlink */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 397 397" fill="none" aria-hidden="true">
                      <path d="M198.5 0L148.5 28.9L49.2 86.2L0 115.1V281.9L49.2 310.8L148.5 368.1L198.5 397L248.5 368.1L347.8 310.8L397 281.9V115.1L347.8 86.2L248.5 28.9L198.5 0Z" fill="#375BD2"/>
                      <path d="M198.5 116.7L148.5 145.6L99.8 173.8V223.2L148.5 251.4L198.5 280.3L248.5 251.4L297.2 223.2V173.8L248.5 145.6L198.5 116.7Z" fill="white"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">Chainlink</span>
                  </div>

                  {/* OpenZeppelin */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 100 100" fill="none" aria-hidden="true">
                      <path d="M50 5L10 27.5V72.5L50 95L90 72.5V27.5L50 5Z" fill="#4E5EE4"/>
                      <path d="M50 25L30 37.5V62.5L50 75L70 62.5V37.5L50 25Z" fill="white"/>
                      <circle cx="50" cy="50" r="8" fill="#4E5EE4"/>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">OpenZeppelin</span>
                  </div>

                  {/* Duplicate for seamless loop */}
                  <div className="flex items-center gap-4 px-10 py-6 bg-white rounded-2xl border-2 border-gray-200 shadow-sm whitespace-nowrap min-w-[240px]">
                    <svg className="w-12 h-12" viewBox="0 0 2500 2500" fill="none" aria-hidden="true">
                      <g clipPath="url(#clip2)">
                        <path d="M764.48 1050.52L1250 565L1735.52 1050.52L2020.6 765.44L1250 0L479.4 765.44L764.48 1050.52Z" fill="#F3BA2F"/>
                        <path d="M0 1250L285.08 964.92L570.16 1250L285.08 1535.08L0 1250Z" fill="#F3BA2F"/>
                        <path d="M764.48 1449.48L1250 1935L1735.52 1449.48L2020.6 1734.56L1250 2500L479.4 1734.56L764.48 1449.48Z" fill="#F3BA2F"/>
                        <path d="M1929.84 1250L2214.92 964.92L2500 1250L2214.92 1535.08L1929.84 1250Z" fill="#F3BA2F"/>
                        <path d="M1530.28 1250L1250 969.72L1025.52 1194.2L969.72 1250L1250 1530.28L1530.28 1250Z" fill="#F3BA2F"/>
                      </g>
                    </svg>
                    <span className="text-2xl font-bold text-gray-900">BNB Chain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SectionDivider bgColor="bg-white" />

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
