'use client';

interface LandingStats {
  totalProtected: string;
  avgAPY: string;
  activePolicies: string;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Landing page statistics hook
 * Uses mock data for demo purposes
 * TODO: Connect to real contract data when backend is ready
 */
export function useLandingStats(): LandingStats {
  // Mock data - consistent with pools and insurance pages
  return {
    totalProtected: '$16.2M',  // Total TVL across all pools
    avgAPY: '21.3%',           // Average APY from all pools
    activePolicies: '342',     // Active insurance policies
    isLoading: false,
    error: null,
  };
}
