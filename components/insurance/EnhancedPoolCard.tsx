'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import { formatEther } from 'viem';

interface EnhancedPoolCardProps {
  poolId: string;
  name: string;
  totalLiquidity: bigint;
  availableLiquidity: bigint;
  totalPremiums: bigint;
  totalClaims: bigint;
  utilizationRate: number;
  apy: number;
  isActive: boolean;
}

export function EnhancedPoolCard({
  poolId,
  name,
  totalLiquidity,
  availableLiquidity,
  totalPremiums,
  totalClaims,
  utilizationRate,
  apy,
  isActive,
}: EnhancedPoolCardProps) {
  const available = Number(formatEther(availableLiquidity));
  const total = Number(formatEther(totalLiquidity));

  return (
    <Card variant="glass" hover className="group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {name}
              {isActive && (
                <Badge variant="success" size="sm">
                  Active
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">Pool #{poolId}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-6">
          {/* APY Highlight */}
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
              Current APY
            </div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {apy.toFixed(2)}%
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Total Liquidity
              </div>
              <div className="text-lg font-semibold">
                ${total.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Available
              </div>
              <div className="text-lg font-semibold">
                ${available.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Premiums Earned
              </div>
              <div className="text-lg font-semibold text-green-600">
                ${Number(formatEther(totalPremiums)).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 mb-1">
                Claims Paid
              </div>
              <div className="text-lg font-semibold text-red-600">
                ${Number(formatEther(totalClaims)).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Utilization */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-neutral-600 dark:text-neutral-400">
                Utilization
              </span>
              <span className="font-medium">
                {utilizationRate.toFixed(1)}%
              </span>
            </div>
            <Progress
              value={utilizationRate}
              max={100}
              variant={
                utilizationRate > 70
                  ? 'warning'
                  : utilizationRate > 50
                  ? 'default'
                  : 'success'
              }
            />
            {utilizationRate > 70 && (
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
                ⚠️ High utilization - premiums are elevated
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Deposit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-4 py-3 border-2 border-neutral-200 dark:border-neutral-800 hover:border-blue-600 dark:hover:border-blue-400 rounded-lg font-medium transition-colors"
            >
              Withdraw
            </motion.button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
