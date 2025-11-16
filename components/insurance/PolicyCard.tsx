'use client';

import { formatEther } from 'viem';
import { format } from 'date-fns';

interface PolicyCardProps {
  policyId: string;
  marketId: string;
  coverageAmount: bigint;
  premium: bigint;
  expiryDate: number;
  isActive: boolean;
  isClaimed: boolean;
  onClaim?: () => void;
}

export function PolicyCard({
  policyId,
  marketId,
  coverageAmount,
  premium,
  expiryDate,
  isActive,
  isClaimed,
  onClaim,
}: PolicyCardProps) {
  const coverage = Number(formatEther(coverageAmount));
  const premiumAmount = Number(formatEther(premium));
  const expiryDateObj = new Date(expiryDate * 1000);
  const isExpired = Date.now() > expiryDate * 1000;
  const daysUntilExpiry = Math.ceil((expiryDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

  const getStatus = () => {
    if (isClaimed) return { label: 'Claimed', color: 'green' };
    if (isExpired) return { label: 'Expired', color: 'red' };
    if (isActive) return { label: 'Active', color: 'blue' };
    return { label: 'Inactive', color: 'gray' };
  };

  const status = getStatus();

  return (
    <div className={`bg-white dark:bg-black border-l-4 rounded-xl p-6 ${
      status.color === 'green' ? 'border-l-green-500' :
      status.color === 'red' ? 'border-l-red-500' :
      status.color === 'blue' ? 'border-l-blue-500' :
      'border-l-neutral-300 dark:border-l-neutral-700'
    } border-t border-r border-b border-neutral-200 dark:border-neutral-800`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">Policy #{policyId}</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-mono">
            {marketId.slice(0, 10)}...{marketId.slice(-8)}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded ${
          status.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
          status.color === 'red' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
          status.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
          'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
        }`}>
          {status.label}
        </span>
      </div>

      {/* Coverage Amount */}
      <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
        <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Coverage Amount</div>
        <div className="text-3xl font-bold">${coverage.toLocaleString()}</div>
      </div>

      {/* Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Premium Paid</span>
          <div className="text-right">
            <div className="text-sm font-semibold">${premiumAmount.toLocaleString()}</div>
            <div className="text-xs text-neutral-500">
              {((premiumAmount / coverage) * 100).toFixed(2)}% of coverage
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Expiry Date</span>
          <div className="text-right">
            <div className="text-sm font-semibold">{format(expiryDateObj, 'MMM dd, yyyy')}</div>
            {!isExpired && isActive && (
              <div className="text-xs text-neutral-500">{daysUntilExpiry} days left</div>
            )}
          </div>
        </div>
      </div>

      {/* Time Progress */}
      {isActive && !isExpired && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2">
            <span>Time remaining</span>
            <span>{daysUntilExpiry} days</span>
          </div>
          <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${Math.max(0, Math.min(100, (daysUntilExpiry / 30) * 100))}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      {isActive && !isClaimed && !isExpired && onClaim && (
        <button
          onClick={onClaim}
          className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Claim Insurance
        </button>
      )}

      {isClaimed && (
        <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-center text-sm font-medium">
          ✓ Claim Processed
        </div>
      )}
    </div>
  );
}
