import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import { Container } from '@/components/layout/Container';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50/30 to-white">
      <Navigation />

      {/* Hero Section */}
      <Container className="pt-20 pb-16">
        <div className="max-w-4xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-medium text-blue-700 mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Built on BNB Chain
          </div>
          
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Insurance for your
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              prediction market bets
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl">
            Hedge downside risk on Polymarket and other platforms. If your bet loses, 
            you get paid. LPs earn yield by backing the insurance pool.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link
              href="/insurance"
              className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 transition-all"
            >
              <span className="flex items-center gap-2">
                Get Started
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            
            <Link
              href="/pools"
              className="px-8 py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 font-semibold transition-all"
            >
              Earn Yield as LP
            </Link>
          </div>
        </div>
      </Container>

      {/* Stats Bar */}
      <Container className="py-12">
        <div className="grid grid-cols-3 gap-8 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">2-10%</div>
            <div className="text-sm text-gray-600 font-medium">Premium Rates</div>
          </div>
          <div className="text-center border-x border-gray-100">
            <div className="text-4xl font-bold text-gray-900 mb-2">80%</div>
            <div className="text-sm text-gray-600 font-medium">Max Utilization</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">NFT</div>
            <div className="text-sm text-gray-600 font-medium">Policy Format</div>
          </div>
        </div>
      </Container>

      {/* How it Works */}
      <Container className="py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How it works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Simple, transparent, and fully on-chain
          </p>
        </div>

        {/* For Traders */}
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm font-semibold text-blue-700 mb-8">
            FOR TRADERS
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Pick a market',
                description: 'Choose a prediction market you\'re betting on. Set your coverage amount based on your position size.',
              },
              {
                step: '02',
                title: 'Pay premium',
                description: 'Premium is calculated dynamically based on coverage and pool utilization. Typically 2-5% of coverage.',
              },
              {
                step: '03',
                title: 'Get paid if wrong',
                description: 'If the market resolves against you, claim your coverage amount. Automated via oracle verification.',
              },
            ].map((item) => (
              <div key={item.step} className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all">
                <div className="text-5xl font-bold text-blue-100 group-hover:text-blue-200 mb-4 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* For LPs */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full text-sm font-semibold text-green-700 mb-8">
            FOR LIQUIDITY PROVIDERS
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Deposit stables',
                description: 'Add USDT or USDC to the insurance pool. Receive LP shares representing your portion of the pool.',
              },
              {
                step: '02',
                title: 'Earn premiums',
                description: 'When traders buy insurance, premiums flow to the pool. Your share value grows automatically.',
              },
              {
                step: '03',
                title: 'Withdraw anytime',
                description: 'Burn your shares to withdraw principal plus earned premiums (minus any claims paid out).',
              },
            ].map((item) => (
              <div key={item.step} className="group p-8 bg-white rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all">
                <div className="text-5xl font-bold text-green-100 group-hover:text-green-200 mb-4 transition-colors">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>

      {/* Features Grid */}
      <Container className="py-20">
        <div className="grid md:grid-cols-2 gap-16">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full text-sm font-semibold text-purple-700 mb-2">
              TECHNICAL
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              Built for scale and security
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Low fees and fast transactions on BNB Chain. All contracts are open source 
              and verified on BscScan.
            </p>
            <div className="space-y-4 pt-4">
              {[
                'Dynamic pricing based on pool utilization',
                'Oracle-verified claims (no disputes)',
                'Share-based LP system for fair distribution',
                'ReentrancyGuard and SafeERC20 protection',
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full text-sm font-semibold text-orange-700 mb-2">
              RISK MANAGEMENT
            </div>
            <h3 className="text-3xl font-bold text-gray-900">
              Protected liquidity
            </h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Pool utilization is capped at 80% to ensure LPs can always withdraw. 
              Premiums increase as utilization rises, incentivizing more deposits.
            </p>
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
              <div className="text-sm font-semibold text-gray-700 mb-4">Premium Calculation</div>
              <div className="font-mono text-sm text-gray-900 space-y-1">
                <div>Base = 2% of coverage</div>
                <div className="text-gray-500">+ Utilization multiplier</div>
                <div className="text-gray-500">= Final premium (max 10%)</div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* CTA Section */}
      <Container className="py-20">
        <div className="relative overflow-hidden p-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl text-center">
          <div className="absolute inset-0 bg-grid-white/10"></div>
          <div className="relative z-10">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Connect your wallet and start hedging your prediction market positions in under a minute.
            </p>
            <Link
              href="/insurance"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 font-semibold shadow-xl transition-all"
            >
              Launch App
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </Container>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12 mt-20">
        <Container>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm text-gray-600">
              © 2024 Lumina Protocol. Built for BNB Chain.
            </div>
            <div className="flex gap-8 text-sm">
              <a href="https://github.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                GitHub
              </a>
              <a href="https://docs.lumina.finance" className="text-gray-600 hover:text-gray-900 transition-colors">
                Docs
              </a>
              <a href="https://twitter.com" className="text-gray-600 hover:text-gray-900 transition-colors">
                Twitter
              </a>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}
