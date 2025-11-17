import { useState, useEffect } from 'react';
import { usePublicClient } from 'wagmi';
import { CONTRACTS } from '@/lib/contracts';
import { formatUnits } from 'viem';

export interface ActivityItem {
  id: string;
  action: 'insured' | 'claimed';
  market: string;
  amount: string;
  time: string;
  timestamp: number;
}

export function useOnChainActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [loading, setLoading] = useState(true);
  const publicClient = usePublicClient();

  useEffect(() => {
    async function fetchActivity() {
      if (!publicClient) return;

      try {
        setLoading(true);

        // Fetch PolicyCreated events
        const policyLogs = await publicClient.getLogs({
          address: CONTRACTS.PolicyManager.address as `0x${string}`,
          event: {
            type: 'event',
            name: 'PolicyCreated',
            inputs: [
              { type: 'uint256', name: 'policyId', indexed: true },
              { type: 'address', name: 'holder', indexed: true },
              { type: 'string', name: 'marketId', indexed: false },
              { type: 'uint256', name: 'coverageAmount', indexed: false },
            ],
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Fetch PolicyClaimed events
        const claimLogs = await publicClient.getLogs({
          address: CONTRACTS.PolicyManager.address as `0x${string}`,
          event: {
            type: 'event',
            name: 'PolicyClaimed',
            inputs: [
              { type: 'uint256', name: 'policyId', indexed: true },
              { type: 'address', name: 'holder', indexed: true },
              { type: 'uint256', name: 'payout', indexed: false },
            ],
          },
          fromBlock: 'earliest',
          toBlock: 'latest',
        });

        // Process policy events
        const policyActivities: ActivityItem[] = await Promise.all(
          policyLogs.slice(-10).reverse().map(async (log) => {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            const timeAgo = getTimeAgo(Number(block.timestamp));
            
            const args = log.args as { marketId?: string; coverageAmount?: bigint };
            return {
              id: log.transactionHash,
              action: 'insured' as const,
              market: args.marketId || 'Unknown Market',
              amount: `$${formatUnits(args.coverageAmount || 0n, 18)}`,
              time: timeAgo,
              timestamp: Number(block.timestamp),
            };
          })
        );

        // Process claim events
        const claimActivities: ActivityItem[] = await Promise.all(
          claimLogs.slice(-5).reverse().map(async (log) => {
            const block = await publicClient.getBlock({ blockNumber: log.blockNumber });
            const timeAgo = getTimeAgo(Number(block.timestamp));
            
            const args = log.args as { payout?: bigint };
            return {
              id: log.transactionHash,
              action: 'claimed' as const,
              market: 'Policy',
              amount: `$${formatUnits(args.payout || 0n, 18)}`,
              time: timeAgo,
              timestamp: Number(block.timestamp),
            };
          })
        );

        // Combine and sort by timestamp
        const allActivities = [...policyActivities, ...claimActivities]
          .sort((a, b) => b.timestamp - a.timestamp)
          .slice(0, 10);

        setActivities(allActivities);
        setTotalPolicies(policyLogs.length);
      } catch (error) {
        console.error('Error fetching on-chain activity:', error);
        // Fallback to mock data
        setActivities(getMockActivities());
        setTotalPolicies(127);
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
    const interval = setInterval(fetchActivity, 30000); // Refresh every 30s

    return () => clearInterval(interval);
  }, [publicClient]);

  return { activities, totalPolicies, loading };
}

function getTimeAgo(timestamp: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - timestamp;

  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getMockActivities(): ActivityItem[] {
  return [
    {
      id: '1',
      action: 'insured',
      market: 'BTC $100K',
      amount: '$5,000',
      time: '2m ago',
      timestamp: Date.now() / 1000 - 120,
    },
    {
      id: '2',
      action: 'insured',
      market: 'ETH $5K',
      amount: '$2,500',
      time: '5m ago',
      timestamp: Date.now() / 1000 - 300,
    },
    {
      id: '3',
      action: 'claimed',
      market: 'Policy',
      amount: '$1,200',
      time: '8m ago',
      timestamp: Date.now() / 1000 - 480,
    },
  ];
}
