'use client';

import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { useState, useEffect } from 'react';

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Floating Nav */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrollY > 50 ? 'bg-white/80 backdrop-blur-xl shadow-sm' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Lumina
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-medium">
            <Link href="/insurance" className="text-gray-600 hover:text-black transition-colors">Insurance</Link>
            <Link href="/pools" className="text-gray-600 hover:text-black transition-colors">Pools</Link>
            <Link href="/dashboard" className="text-gray-600 hover:text-black transition-colors">Dashboard</Link>
          </div>
          <ConnectButton />
        </div>
      </nav>

      {/* Hero with animated gradient */}
      <section className="relative pt-32 pb-24 px-6 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-7xl mx-auto relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 mb-8 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span className="text-sm font-medium text-blue-700">Live on BNB Chain Testnet</span>
            </div>

            {/* Main heading */}
            <h1 className="text-7xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
              Insure your
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
                prediction bets
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Hedge downside risk on Polymarket. Pay a small premium, get full coverage if you're wrong. 
              LPs earn yield from premiums.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 justify-center mb-16">
              <Link
                href="/insurance"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href="/pools"
                className="px-8 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold hover:border-gray-300 hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Earn as LP
              </Link>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { label: 'Premium', value: '2-10%', color: 'blue' },
                { label: 'Max Utilization', value: '80%', color: 'purple' },
                { label: 'Policy Format', value: 'NFT', color: 'pink' },
              ].map((stat, i) => (
                <div
                  key={stat.label}
                  className="p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`text-3xl font-bold bg-gradient-to-r from-${stat.color}-600 to-${stat.color}-400 bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works - Interactive */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-5xl font-bold mb-4">Two ways to use Lumina</h2>
            <p className="text-xl text-gray-600">Choose your path: hedge risk or earn yield</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Traders card */}
            <div className="group p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl border-2 border-blue-100 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">For Traders</h3>
              <p className="text-gray-700 mb-6">
                Betting $1000 on Trump winning? Buy $1000 insurance for ~$30. 
                If he loses, you get your $1000 back. Net loss: just the premium.
              </p>
              <div className="space-y-3">
                {['Pick your market', 'Set coverage amount', 'Pay premium (~3%)', 'Claim if you lose'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* LPs card */}
            <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-100 hover:border-green-300 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4">For LPs</h3>
              <p className="text-gray-700 mb-6">
                Deposit $10,000 USDT into the pool. Earn premiums when traders buy insurance. 
                Withdraw anytime (if liquidity available).
              </p>
              <div className="space-y-3">
                {['Deposit stablecoins', 'Receive LP shares', 'Earn from premiums', 'Withdraw + profits'].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                      {i + 1}
                    </div>
                    <span className="text-gray-700">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">Why Lumina?</h2>
            <p className="text-xl text-gray-600">Built different from traditional insurance</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '⚡',
                title: 'Instant claims',
                desc: 'Oracle-verified payouts. No waiting for manual approval.',
              },
              {
                icon: '🎯',
                title: 'Fair pricing',
                desc: 'Dynamic premiums based on pool utilization. Transparent formula.',
              },
              {
                icon: '🔒',
                title: 'Your keys, your policy',
                desc: 'Policies are NFTs in your wallet. Full custody.',
              },
              {
                icon: '💎',
                title: 'Share-based LPing',
                desc: 'Your share value grows as premiums accumulate.',
              },
              {
                icon: '🛡️',
                title: 'Risk managed',
                desc: '80% utilization cap ensures liquidity for withdrawals.',
              },
              {
                icon: '⚙️',
                title: 'Open source',
                desc: 'All contracts verified on BscScan. Read the code yourself.',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live example */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">See it in action</h2>
            <p className="text-gray-600">Real example with actual numbers</p>
          </div>

          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Your Polymarket bet</span>
                <span className="text-2xl font-bold">$1,000</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Insurance coverage</span>
                <span className="text-2xl font-bold">$1,000</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-700">
                <span className="text-gray-400">Premium (3%)</span>
                <span className="text-2xl font-bold text-yellow-400">$30</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="font-semibold">If you lose, you get</span>
                <span className="text-3xl font-bold text-green-400">$1,000</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <p className="text-sm text-blue-200">
                💡 Your net loss is only $30 instead of $1,000. That's the power of insurance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6">Ready to try Lumina?</h2>
          <p className="text-xl mb-8 opacity-90">
            Connect your wallet and buy insurance in under 60 seconds
          </p>
          <Link
            href="/insurance"
            className="inline-block px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:scale-105 transition-transform shadow-2xl"
          >
            Launch App →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Lumina
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
            <div className="text-sm">
              Built for BNB Chain Hackathon 2024
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
