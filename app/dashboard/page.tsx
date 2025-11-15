'use client';

import { useAccount, useReadContract } from 'wagmi';
import { ConnectButton } from '@/components/wallet/ConnectButton';
import { PolicyCard } from '@/components/insurance/PolicyCard';
import { PoolCard } from '@/components/insurance/PoolCard';
import { CONTRACTS } from '@/lib/contracts';
import Link from 'next/link';

export default function Dashboard() {
  const { address, isConnected } = useAccount();

  const { data: poolInfo } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'getPoolInfo',
  });

  const { data: userPolicyIds } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'getUserPolicies',
    args: address ? [address] : undefined,
  });

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to view your dashboard</p>
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
            <ConnectButton />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Active Policies</p>
            <p className="text-3xl font-bold text-gray-900">
              {userPolicyIds?.length || 0}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Total Coverage</p>
            <p className="text-3xl font-bold text-gray-900">$0.00</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <p className="text-sm text-gray-600 mb-1">Premiums Paid</p>
            <p className="text-3xl font-bold text-gray-900">$0.00</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Your Policies</h2>
            {userPolicyIds && userPolicyIds.length > 0 ? (
              <div className="space-y-4">
                {userPolicyIds.map((policyId) => (
                  <PolicyDisplay key={policyId.toString()} policyId={policyId} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl p-8 text-center">
                <p className="text-gray-600 mb-4">No active policies</p>
                <Link
                  href="/insurance"
                  className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Buy Insurance
                </Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Pool Overview</h2>
            {poolInfo && <PoolCard poolInfo={poolInfo} />}
          </div>
        </div>
      </main>
    </div>
  );
}

function PolicyDisplay({ policyId }: { policyId: bigint }) {
  const { data: policy } = useReadContract({
    ...CONTRACTS.PolicyManager,
    functionName: 'getPolicy',
    args: [policyId],
  });

  if (!policy) return null;

  return (
    <PolicyCard
      policy={{
        id: policy.id.toString(),
        holder: policy.holder,
        marketId: policy.marketId,
        coverageAmount: policy.coverageAmount,
        premium: policy.premium,
        startTime: policy.startTime,
        expiryTime: policy.expiryTime,
        status: policy.status,
        marketOutcomeHash: policy.marketOutcomeHash,
      }}
    />
  );
}
