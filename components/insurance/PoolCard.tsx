'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { PoolInfo } from '@/lib/types';
import { formatUSD, formatPercentage } from '@/lib/utils';

interface PoolCardProps {
  poolInfo: PoolInfo;
}

export function PoolCard({ poolInfo }: PoolCardProps) {
  const apy = calculateAPY(poolInfo);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insurance Pool</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Liquidity</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatUSD(poolInfo.totalLiquidity)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">
                {formatUSD(poolInfo.availableLiquidity)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Utilization Rate</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatPercentage(poolInfo.utilizationRate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Est. APY</p>
              <p className="text-lg font-semibold text-blue-600">{apy}%</p>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Premiums</span>
              <span className="font-medium text-gray-900">
                {formatUSD(poolInfo.totalPremiums)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Total Claims</span>
              <span className="font-medium text-gray-900">
                {formatUSD(poolInfo.totalClaims)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Deposit
            </button>
            <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
              Withdraw
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function calculateAPY(poolInfo: PoolInfo): string {
  if (poolInfo.totalLiquidity === 0n) return '0.00';
  
  const premiumRate = Number(poolInfo.totalPremiums) / Number(poolInfo.totalLiquidity);
  const apy = premiumRate * 365 * 100; // Annualized
  
  return apy.toFixed(2);
}
