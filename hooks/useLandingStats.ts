'use client';

import { useState, useEffect } from 'react';

interface LandingStats {
  totalProtected: string;
  avgAPY: string;
  activePolicies: string;
  isLoading: boolean;
  error: Error | null;
}

export function useLandingStats(): LandingStats {
  const [stats, setStats] = useState<LandingStats>({
    totalProtected: '$2.1M',
    avgAPY: '42%',
    activePolicies: '127',
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        // TODO: Fetch real data from contracts when available
        // For now, use mock data for demo
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
        
        setStats({
          totalProtected: '$2.1M',
          avgAPY: '42%',
          activePolicies: '127',
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error('Error fetching landing stats:', error);
        setStats({
          totalProtected: '$2.1M',
          avgAPY: '42%',
          activePolicies: '127',
          isLoading: false,
          error: error as Error,
        });
      }
    }

    fetchStats();
  }, []);

  return stats;
}
