/**
 * Polymarket API Integration
 * Fetches real market data from Polymarket
 */

export interface PolymarketEvent {
  id: string;
  title: string;
  description: string;
  endDate: string;
  volume: number;
  liquidity: number;
  outcomes: string[];
  outcomePrices: number[];
  category: string;
  active: boolean;
  image?: string;
}

export interface PolymarketMarket {
  id: string;
  question: string;
  description: string;
  end_date_iso: string;
  volume: string;
  liquidity: string;
  outcomes: string[];
  outcome_prices: string[];
  category: string;
  closed: boolean;
  image: string;
  slug: string;
}

const POLYMARKET_API = 'https://gamma-api.polymarket.com';

/**
 * Fetch trending markets from Polymarket
 */
export async function fetchTrendingMarkets(limit = 10): Promise<PolymarketEvent[]> {
  try {
    const response = await fetch(`${POLYMARKET_API}/events?limit=${limit}&active=true&closed=false`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      endDate: event.end_date_iso,
      volume: parseFloat(event.volume || '0'),
      liquidity: parseFloat(event.liquidity || '0'),
      outcomes: event.markets?.[0]?.outcomes || ['Yes', 'No'],
      outcomePrices: event.markets?.[0]?.outcome_prices?.map((p: string) => parseFloat(p)) || [0.5, 0.5],
      category: event.category || 'Other',
      active: event.active && !event.closed,
      image: event.image,
    }));
  } catch (error) {
    console.error('Error fetching Polymarket markets:', error);
    return getFallbackMarkets();
  }
}

/**
 * Fetch specific market by ID
 */
export async function fetchMarketById(marketId: string): Promise<PolymarketEvent | null> {
  try {
    const response = await fetch(`${POLYMARKET_API}/events/${marketId}`, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 }
    });

    if (!response.ok) return null;

    const event = await response.json();
    
    return {
      id: event.id,
      title: event.title,
      description: event.description || '',
      endDate: event.end_date_iso,
      volume: parseFloat(event.volume || '0'),
      liquidity: parseFloat(event.liquidity || '0'),
      outcomes: event.markets?.[0]?.outcomes || ['Yes', 'No'],
      outcomePrices: event.markets?.[0]?.outcome_prices?.map((p: string) => parseFloat(p)) || [0.5, 0.5],
      category: event.category || 'Other',
      active: event.active && !event.closed,
      image: event.image,
    };
  } catch (error) {
    console.error('Error fetching market:', error);
    return null;
  }
}

/**
 * Search markets by query
 */
export async function searchMarkets(query: string, limit = 20): Promise<PolymarketEvent[]> {
  try {
    const response = await fetch(
      `${POLYMARKET_API}/events?limit=${limit}&active=true&closed=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter by query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = data.filter((event: any) => 
      event.title?.toLowerCase().includes(query.toLowerCase()) ||
      event.description?.toLowerCase().includes(query.toLowerCase())
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return filtered.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      endDate: event.end_date_iso,
      volume: parseFloat(event.volume || '0'),
      liquidity: parseFloat(event.liquidity || '0'),
      outcomes: event.markets?.[0]?.outcomes || ['Yes', 'No'],
      outcomePrices: event.markets?.[0]?.outcome_prices?.map((p: string) => parseFloat(p)) || [0.5, 0.5],
      category: event.category || 'Other',
      active: event.active && !event.closed,
      image: event.image,
    }));
  } catch (error) {
    console.error('Error searching markets:', error);
    return [];
  }
}

/**
 * Get markets by category
 */
export async function fetchMarketsByCategory(category: string, limit = 20): Promise<PolymarketEvent[]> {
  try {
    const response = await fetch(
      `${POLYMARKET_API}/events?limit=${limit}&active=true&closed=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter by category
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filtered = data.filter((event: any) => 
      event.category?.toLowerCase() === category.toLowerCase()
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return filtered.map((event: any) => ({
      id: event.id,
      title: event.title,
      description: event.description || '',
      endDate: event.end_date_iso,
      volume: parseFloat(event.volume || '0'),
      liquidity: parseFloat(event.liquidity || '0'),
      outcomes: event.markets?.[0]?.outcomes || ['Yes', 'No'],
      outcomePrices: event.markets?.[0]?.outcome_prices?.map((p: string) => parseFloat(p)) || [0.5, 0.5],
      category: event.category || 'Other',
      active: event.active && !event.closed,
      image: event.image,
    }));
  } catch (error) {
    console.error('Error fetching category markets:', error);
    return [];
  }
}

/**
 * Fallback markets if API fails
 */
function getFallbackMarkets(): PolymarketEvent[] {
  return [
    {
      id: 'btc-150k-2025',
      title: 'Will Bitcoin reach $150,000 in 2025?',
      description: 'Bitcoin to hit $150K by December 31, 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 3200000,
      liquidity: 580000,
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.42, 0.58],
      category: 'Crypto',
      active: true,
    },
    {
      id: 'eth-10k-2025',
      title: 'Will Ethereum reach $10,000 in 2025?',
      description: 'ETH to hit $10K by end of 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 2100000,
      liquidity: 420000,
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.38, 0.62],
      category: 'Crypto',
      active: true,
    },
    {
      id: 'ai-agi-2026',
      title: 'Will AGI be achieved by 2026?',
      description: 'Artificial General Intelligence achieved by end of 2026',
      endDate: '2026-12-31T23:59:59Z',
      volume: 4500000,
      liquidity: 890000,
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.22, 0.78],
      category: 'Tech',
      active: true,
    },
    {
      id: 'fed-rate-2025',
      title: 'Fed rate below 3% by end of 2025?',
      description: 'Federal Reserve interest rate drops below 3%',
      endDate: '2025-12-31T23:59:59Z',
      volume: 1900000,
      liquidity: 340000,
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.55, 0.45],
      category: 'Finance',
      active: true,
    },
  ];
}

/**
 * Format volume/liquidity for display
 */
export function formatVolume(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount.toFixed(0)}`;
}

/**
 * Calculate days until market closes
 */
export function getDaysUntilClose(endDate: string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get risk level based on outcome prices
 */
export function getRiskLevel(outcomePrices: number[]): 'Low' | 'Medium' | 'High' {
  const maxPrice = Math.max(...outcomePrices);
  if (maxPrice >= 0.8) return 'Low';
  if (maxPrice >= 0.6) return 'Medium';
  return 'High';
}
