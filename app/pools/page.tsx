'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PoolCard } from '@/components/insurance/PoolCard';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { formatUSD, formatTokenAmount, parseTokenAmount } from '@/lib/utils';
import Link from 'next/link';

export default function PoolsPage() {
  const { address, isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawShares, setWithdrawShares] = useState('');
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');

  const { data: poolInfo } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'getPoolInfo',
  });

  const { data: providerInfo } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'getProviderInfo',
    args: address ? [address] : undefined,
  });

  const { data: balance } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: shareValue } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'calculateShareValue',
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  const handleDeposit = async () => {
    if (!depositAmount) return;

    const amount = parseTokenAmount(depositAmount);

    // First approve
    writeContract({
      ...ASSET_TOKEN,
      functionName: 'approve',
      args: [CONTRACTS.InsurancePool.address, amount],
    });

    // Then deposit (in real app, wait for approval first)
    setTimeout(() => {
      writeContract({
        ...CONTRACTS.InsurancePool,
        functionName: 'deposit',
        args: [amount],
      });
    }, 2000);
  };

  const handleWithdraw = async () => {
    if (!withdrawShares) return;

    writeContract({
      ...CONTRACTS.InsurancePool,
      functionName: 'withdraw',
      args: [parseTokenAmount(withdrawShares, 18)],
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect to provide liquidity</p>
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
              <Link href="/insurance" className="text-gray-700 hover:text-blue-600">
                Insurance
              </Link>
            </div>
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Liquidity Pools</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {poolInfo && <PoolCard poolInfo={poolInfo} />}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>How it works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-gray-600">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">1. Deposit stablecoins</h4>
                    <p>Add USDT/USDC to the pool and receive LP shares</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">2. Earn premiums</h4>
                    <p>When traders buy insurance, premiums flow to the pool</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">3. Share value grows</h4>
                    <p>Your shares become more valuable as premiums accumulate</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">4. Withdraw anytime</h4>
                    <p>Burn shares to withdraw your principal + earned premiums</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Position</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Your Shares</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {providerInfo ? formatTokenAmount(providerInfo.shares) : '0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deposited</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {providerInfo ? formatUSD(providerInfo.depositedAmount) : '$0.00'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className="text-lg font-semibold text-green-600">
                      {providerInfo && shareValue
                        ? formatUSD((providerInfo.shares * shareValue) / BigInt(1e18))
                        : '$0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex gap-2 border-b border-gray-200">
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'deposit'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    Deposit
                  </button>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className={`px-4 py-2 font-medium ${
                      activeTab === 'withdraw'
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600'
                    }`}
                  >
                    Withdraw
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'deposit' ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount (USDT)
                      </label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="1000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Balance: {balance ? formatUSD(balance) : '$0.00'}
                      </p>
                    </div>

                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || isPending || isConfirming}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isPending || isConfirming ? 'Processing...' : 'Deposit'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shares to Withdraw
                      </label>
                      <input
                        type="number"
                        value={withdrawShares}
                        onChange={(e) => setWithdrawShares(e.target.value)}
                        placeholder="100"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Your shares: {providerInfo ? formatTokenAmount(providerInfo.shares) : '0.00'}
                      </p>
                    </div>

                    <button
                      onClick={handleWithdraw}
                      disabled={!withdrawShares || isPending || isConfirming}
                      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isPending || isConfirming ? 'Processing...' : 'Withdraw'}
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
