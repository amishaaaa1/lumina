'use client';

import { formatEther } from 'viem';

interface PoolCardProps {
  poolId: string;
  name: string;
  totalLiquidity: bigint;
  availableLiquidity: bigint;
  totalPremiums: bigint;
  totalClaims: bigint;
  utilizationRate: number;
  apy: number;
  isActive: boolean;
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

export function PoolCard({
  poolId,
  name,
  totalLiquidity,
  availableLiquidity,
  totalPremiums,
  totalClaims,
  utilizationRate,
  apy,
  isActive,
  onDeposit,
  onWithdraw,
}: PoolCardProps) {
  const total = Number(formatEther(totalLiquidity));
  const available = Number(formatEther(availableLiquidity));
  const premiums = Number(formatEther(totalPremiums));
  const claims = Number(formatEther(totalClaims));

  return (
    <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 hover:border-blue-600 dark:hover:border-blue-400 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">{name}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Pool #{poolId}</p>
        </div>
        {isActive && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-medium rounded">
            Active
          </span>
        )}
      </div>

      {/* APY Highlight */}
      <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Current APY</div>
        <div className="text-3xl font-bold text-green-600">{apy.toFixed(2)}%</div>
      </div>

      {/* Stats */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Liquidity</span>
          <span className="text-sm font-semibold">${total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Available</span>
          <span className="text-sm font-semibold">${available.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Premiums Earned</span>
          <span className="text-sm font-semibold text-green-600">${premiums.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Claims Paid</span>
          <span className="text-sm font-semibold text-red-600">${claims.toLocaleString()}</span>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-neutral-600 dark:text-neutral-400">Utilization</span>
          <span className="font-medium">{utilizationRate.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              utilizationRate > 70
                ? 'bg-yellow-500'
                : utilizationRate > 50
                ? 'bg-blue-500'
                : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(utilizationRate, 100)}%` }}
          />
        </div>
        {utilizationRate > 70 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
            High utilization - premiums are elevated
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onDeposit}
          className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Deposit
        </button>
        <button
          onClick={onWithdraw}
          className="flex-1 px-4 py-2.5 border border-neutral-300 dark:border-neutral-700 hover:border-blue-600 dark:hover:border-blue-400 text-sm font-medium rounded-lg transition-colors"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}
