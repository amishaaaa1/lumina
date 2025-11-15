'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Policy, PolicyStatus } from '@/lib/types';
import { formatUSD, formatPercentage, timeUntil } from '@/lib/utils';

interface PolicyCardProps {
  policy: Policy;
  onClaim?: (policyId: string) => void;
}

const statusColors = {
  [PolicyStatus.Active]: 'bg-green-100 text-green-800',
  [PolicyStatus.Claimed]: 'bg-blue-100 text-blue-800',
  [PolicyStatus.Expired]: 'bg-gray-100 text-gray-800',
  [PolicyStatus.Cancelled]: 'bg-red-100 text-red-800',
};

const statusLabels = {
  [PolicyStatus.Active]: 'Active',
  [PolicyStatus.Claimed]: 'Claimed',
  [PolicyStatus.Expired]: 'Expired',
  [PolicyStatus.Cancelled]: 'Cancelled',
};

export function PolicyCard({ policy, onClaim }: PolicyCardProps) {
  const canClaim = policy.status === PolicyStatus.Active && 
    BigInt(Math.floor(Date.now() / 1000)) <= policy.expiryTime;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Policy #{policy.id}</CardTitle>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[policy.status]}`}>
            {statusLabels[policy.status]}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-gray-600">Market ID</p>
            <p className="font-medium text-gray-900">{policy.marketId}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Coverage</p>
              <p className="font-semibold text-gray-900">{formatUSD(policy.coverageAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Premium Paid</p>
              <p className="font-semibold text-gray-900">{formatUSD(policy.premium)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600">Time Remaining</p>
            <p className="font-medium text-gray-900">{timeUntil(policy.expiryTime)}</p>
          </div>

          {canClaim && onClaim && (
            <button
              onClick={() => onClaim(policy.id)}
              className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Claim Insurance
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
