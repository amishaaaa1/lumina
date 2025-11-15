'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { formatUSD, parseTokenAmount } from '@/lib/utils';
import Link from 'next/link';

// Mock market data - in production, fetch from Polymarket API
const MOCK_MARKETS = [
  {
    id: 'btc-100k-2024',
    title: 'Will Bitcoin reach $100k in 2024?',
    description: 'Bitcoin price prediction for end of 2024',
    endDate: new Date('2024-12-31'),
    currentOdds: [0.65, 0.35],
  },
  {
    id: 'eth-5k-2024',
    title: 'Will Ethereum reach $5k in 2024?',
    description: 'Ethereum price prediction',
    endDate: new Date('2024-12-31'),
    currentOdds: [0.45, 0.55],
  },
  {
    id: 'trump-2024',
    title: 'Will Trump win 2024 election?',
    description: 'US Presidential election outcome',
    endDate: new Date('2024-11-05'),
    currentOdds: [0.52, 0.48],
  },
];

export default function InsurancePage() {
  const { address, isConnected } = useAccount();
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null);
  const [coverageAmount, setCoverageAmount] = useState('');
  const [duration, setDuration] = useState('30');

  const { data: premium } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'calculatePremium',
    args: selectedMarket && coverageAmount
      ? [selectedMarket, parseTokenAmount(coverageAmount)]
      : undefined,
  });

  const { data: balance } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleApprove = async () => {
    if (!premium) return;

    writeContract({
      ...ASSET_TOKEN,
      functionName: 'approve',
      args: [CONTRACTS.PolicyManager.address, premium],
    });
  };

  const handleBuyInsurance = async () => {
    if (!selectedMarket || !premium || !address) return;

    const durationSeconds = BigInt(parseInt(duration) * 24 * 60 * 60);

    writeContract({
      ...CONTRACTS.PolicyManager,
      functionName: 'createPolicy',
      args: [
        address,
        selectedMarket,
        parseTokenAmount(coverageAmount),
        premium,
        durationSeconds,
      ],
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect to buy insurance</p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Lumina
            </Link>
            <div className="flex gap-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                Dashboard
              </Link>
              <Link href="/pools" className="text-gray-700 hover:text-blue-600">
                Pools
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Buy Insurance</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Select Market</h2>
            <div className="space-y-4">
              {MOCK_MARKETS.map((market) => (
                <Card
                  key={market.id}
                  className={`cursor-pointer transition-all ${
                    selectedMarket === market.id
                      ? 'ring-2 ring-blue-600'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedMarket(market.id)}
                >
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{market.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{market.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        Ends: {market.endDate.toLocaleDateString()}
                      </span>
                      <span className="text-gray-500">
                        Odds: {(market.currentOdds[0] * 100).toFixed(0)}% / {(market.currentOdds[1] * 100).toFixed(0)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Insurance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coverage Amount (USDT)
                    </label>
                    <input
                      type="number"
                      value={coverageAmount}
                      onChange={(e) => setCoverageAmount(e.target.value)}
                      placeholder="100"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      disabled={!selectedMarket}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (days)
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      disabled={!selectedMarket}
                    >
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="30">30 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                    </select>
                  </div>

                  {premium && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Premium:</span>
                        <span className="font-semibold">{formatUSD(premium)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Coverage:</span>
                        <span className="font-semibold">${coverageAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Your balance:</span>
                        <span>{balance ? formatUSD(balance) : '$0.00'}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBuyInsurance}
                    disabled={!selectedMarket || !coverageAmount || isPending || isConfirming}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isPending || isConfirming ? 'Processing...' : 'Buy Insurance'}
                  </button>

                  {!selectedMarket && (
                    <p className="text-sm text-gray-500 text-center">
                      Select a market to continue
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
