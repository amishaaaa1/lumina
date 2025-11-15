import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/ConnectButton';

export function Navigation() {
  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Lumina
            </Link>
            <div className="hidden md:flex gap-8 text-sm font-medium">
              <Link href="/insurance" className="text-gray-600 hover:text-gray-900 transition-colors">
                Insurance
              </Link>
              <Link href="/pools" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pools
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition-colors">
                Dashboard
              </Link>
            </div>
          </div>
          <ConnectButton />
        </div>
      </div>
    </nav>
  );
}
