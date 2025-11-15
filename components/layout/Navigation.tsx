import Link from 'next/link';
import { ConnectButton } from '@/components/wallet/ConnectButton';

export function Navigation() {
  return (
    <nav className="border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-12">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              Lumina
            </Link>
            <div className="hidden md:flex gap-8 text-sm">
              <Link href="/insurance" className="text-gray-600 hover:text-gray-900">
                Insurance
              </Link>
              <Link href="/pools" className="text-gray-600 hover:text-gray-900">
                Pools
              </Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
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
