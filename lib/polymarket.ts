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
const CLOB_API = 'https://clob.polymarket.com';

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
    const filtered = data.filter((event: any) => 
      event.title?.toLowerCase().includes(query.toLowerCase()) ||
      event.description?.toLowerCase().includes(query.toLowerCase())
    );

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
    const filtered = data.filter((event: any) => 
      event.category?.toLowerCase() === category.toLowerCase()
    );

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
      id: 'btc-100k-2024',
      title: 'Will Bitcoin reach $100,000 in 2024?',
      description: 'Bitcoin to hit $100K by December 31, 2024',
      endDate: '2024-12-31T23:59:59Z',
      volume: 2500000,
      liquidity: 450000,
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.35, 0.65],
      category: 'Crypto',
      active: true,
    },
    {
      id: 'eth-etf-2024',
      title: 'Ethereum ETF approved in 2024?',
      description: 'Will SEC approve spot Ethereum ETF in 2024?',
      endDate: '2024-12-31T23:59:59Z',
      volume: 1800000,
      liquidity: 320000,
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.72, 0.28],
      category: 'Crypto',
      active: true,
    },
    {
      id: 'trump-2024',
      title: 'Trump wins 2024 election?',
      description: 'Donald Trump wins 2024 US Presidential Election',
      endDate: '2024-11-05T23:59:59Z',
      volume: 15000000,
      liquidity: 2800000,
      outcomes: ['Yes', 'No'],
      outcomePrices: [0.48, 0.52],
      category: 'Politics',
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
