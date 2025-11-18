/**
 * API Client for Lumina Backend
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface Market {
  id: string;
  question: string;
  category: string;
  status: string;
  icon: string;
  votes: number;
  volumeUSD: number;
  yesPercentage: number;
  noPercentage: number;
  endDate: string;
  multiplier?: number;
  result?: string;
  riskScore: number;
  aiConfidence: number;
  polymarketId?: string;
}

export interface Policy {
  id: number;
  policyId: string;
  holder: string;
  marketId: string;
  market?: Market;
  coverageAmount: number;
  premium: number;
  startTime: string;
  expiryTime: string;
  status: string;
  txHash?: string;
  claimTxHash?: string;
}

export interface PoolStats {
  totalLiquidity: number;
  availableLiquidity: number;
  totalPremiums: number;
  totalClaims: number;
  utilizationRate: number;
  apy: number;
}

export interface Analytics {
  totalMarkets: number;
  activeMarkets: number;
  totalVolume: number;
  totalPolicies: number;
  totalClaims: number;
  protocolRevenue: number;
}

class APIClient {
  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API fetch error for ${endpoint}:`, error);
      // Fallback to mock data for demo
      return this.getMockData<T>(endpoint);
    }
  }

  private getMockData<T>(endpoint: string): T {
    // Mock data for demo purposes
    if (endpoint.includes('/markets')) {
      return [
        {
          id: '1',
          question: 'Will Bitcoin reach $100k by end of 2024?',
          category: 'Crypto',
          status: 'active',
          icon: '₿',
          votes: 1250,
          volumeUSD: 125000,
          yesPercentage: 65,
          noPercentage: 35,
          endDate: new Date('2024-12-31').toISOString(),
          riskScore: 4500,
          aiConfidence: 7800,
        },
        {
          id: '2',
          question: 'Will Ethereum ETF be approved in 2024?',
          category: 'Crypto',
          status: 'active',
          icon: 'Ξ',
          votes: 890,
          volumeUSD: 89000,
          yesPercentage: 72,
          noPercentage: 28,
          endDate: new Date('2024-12-31').toISOString(),
          riskScore: 3200,
          aiConfidence: 8500,
        },
        {
          id: '3',
          question: 'Will BNB Chain TVL exceed $10B in 2024?',
          category: 'DeFi',
          status: 'active',
          icon: '🔶',
          votes: 650,
          volumeUSD: 65000,
          yesPercentage: 58,
          noPercentage: 42,
          endDate: new Date('2024-12-31').toISOString(),
          riskScore: 5500,
          aiConfidence: 6900,
        },
      ] as T;
    }

    if (endpoint.includes('/pool/stats')) {
      return {
        totalLiquidity: 1500000,
        availableLiquidity: 1200000,
        totalPremiums: 45000,
        totalClaims: 12000,
        utilizationRate: 20,
        apy: 12.5,
      } as T;
    }

    if (endpoint.includes('/analytics')) {
      return {
        totalMarkets: 24,
        activeMarkets: 18,
        totalVolume: 2500000,
        totalPolicies: 156,
        totalClaims: 23,
        protocolRevenue: 15000,
      } as T;
    }

    if (endpoint.includes('/policies')) {
      return [] as T;
    }

    return {} as T;
  }

  // Markets
  async getMarkets(params?: {
    status?: string;
    category?: string;
    search?: string;
  }): Promise<Market[]> {
    const query = new URLSearchParams(params as any).toString();
    return this.fetch<Market[]>(`/markets${query ? `?${query}` : ''}`);
  }

  async getMarket(id: string): Promise<Market> {
    return this.fetch<Market>(`/markets/${id}`);
  }

  async recordVote(marketId: string, data: {
    voter: string;
    choice: string;
    amount: number;
    txHash?: string;
  }): Promise<any> {
    return this.fetch(`/markets/${marketId}/vote`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Policies
  async getPoliciesByHolder(address: string): Promise<Policy[]> {
    return this.fetch<Policy[]>(`/policies/holder/${address}`);
  }

  async createPolicy(data: {
    policyId: string;
    holder: string;
    marketId: string;
    coverageAmount: number;
    premium: number;
    startTime: number;
    expiryTime: number;
    txHash?: string;
  }): Promise<Policy> {
    return this.fetch<Policy>('/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePolicy(policyId: string, data: {
    status: string;
    claimTxHash?: string;
  }): Promise<Policy> {
    return this.fetch<Policy>(`/policies/${policyId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Pool
  async getPoolStats(): Promise<PoolStats> {
    return this.fetch<PoolStats>('/pool/stats');
  }

  async getProviderInfo(address: string): Promise<any> {
    return this.fetch(`/pool/provider/${address}`);
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    return this.fetch<Analytics>('/analytics');
  }

  async getAnalyticsHistory(days: number = 30): Promise<unknown[]> {
    return this.fetch<unknown[]>(`/analytics/history?days=${days}`);
  }
}

export const api = new APIClient();
