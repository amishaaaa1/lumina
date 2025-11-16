'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatEther } from 'viem';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface EnhancedPolicyCardProps {
  policyId: string;
  marketId: string;
  coverageAmount: bigint;
  premium: bigint;
  expiryDate: number;
  isActive: boolean;
  isClaimed: boolean;
  onClaim?: () => void;
}

export function EnhancedPolicyCard({
  policyId,
  marketId,
  coverageAmount,
  premium,
  expiryDate,
  isActive,
  isClaimed,
  onClaim,
}: EnhancedPolicyCardProps) {
  const coverage = Number(formatEther(coverageAmount));
  const premiumAmount = Number(formatEther(premium));
  const expiryDateObj = new Date(expiryDate * 1000);
  const isExpired = Date.now() > expiryDate * 1000;
  const daysUntilExpiry = Math.ceil((expiryDate * 1000 - Date.now()) / (1000 * 60 * 60 * 24));

  const getStatusBadge = () => {
    if (isClaimed) return <Badge variant="success">Claimed</Badge>;
    if (isExpired) return <Badge variant="error">Expired</Badge>;
    if (isActive) return <Badge variant="info">Active</Badge>;
    return <Badge variant="default">Inactive</Badge>;
  };

  const getStatusColor = () => {
    if (isClaimed) return 'border-green-500';
    if (isExpired) return 'border-red-500';
    if (isActive) return 'border-blue-500';
    return 'border-neutral-300';
  };

  return (
    <Card variant="glass" hover className={clsx('group border-l-4', getStatusColor())}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              Policy #{policyId}
              {getStatusBadge()}
            </CardTitle>
            <CardDescription className="mt-1">
              Market: {marketId.slice(0, 8)}...{marketId.slice(-6)}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Coverage Amount */}
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Coverage Amount
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              ${coverage.toLocaleString()}
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Premium Paid
              </div>
              <div className="text-lg font-semibold">
                ${premiumAmount.toLocaleString()}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {((premiumAmount / coverage) * 100).toFixed(2)}% of coverage
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Expiry Date
              </div>
              <div className="text-lg font-semibold">
                {format(expiryDateObj, 'MMM dd, yyyy')}
              </div>
              {!isExpired && isActive && (
                <div className="text-xs text-neutral-500 mt-1">
                  {daysUntilExpiry} days left
                </div>
              )}
            </div>
          </div>

          {/* Time Progress */}
          {isActive && !isExpired && (
            <div>
              <div className="flex justify-between text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                <span>Time remaining</span>
                <span>{daysUntilExpiry} days</span>
              </div>
              <div className="h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: '100%' }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                  style={{
                    width: `${Math.max(0, (daysUntilExpiry / 30) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {isActive && !isClaimed && !isExpired && onClaim && (
        <CardFooter>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClaim}
            className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
          >
            Claim Insurance
          </motion.button>
        </CardFooter>
      )}

      {isClaimed && (
        <CardFooter>
          <div className="w-full p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-center font-medium">
            ✓ Claim Processed
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
