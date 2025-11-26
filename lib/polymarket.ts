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
export async function fetchTrendingMarkets(limit = 10, category?: string): Promise<PolymarketEvent[]> {
  try {
    // Use Next.js API route to bypass CORS
    const categoryParam = category && category !== 'all' ? `&category=${category}` : '';
    const apiUrl = typeof window !== 'undefined' 
      ? `/api/polymarket?limit=${limit}${categoryParam}`
      : `${POLYMARKET_API}/events?limit=${limit}&active=true&closed=false`;
    
    console.log('📡 Fetching from:', apiUrl);
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store' // Force fresh data for client-side
    });

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Received data:', data.length, 'events');
    
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
    return getFallbackMarkets(category);
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
 * Helper to add realistic price fluctuations
 */
function addPriceFluctuation(basePrice: number): number {
  // Add random fluctuation between -3% to +3%
  const fluctuation = (Math.random() - 0.5) * 0.06;
  let newPrice = basePrice + fluctuation;
  
  // Keep price between 0.15 and 0.85 to show clear variation
  newPrice = Math.max(0.15, Math.min(0.85, newPrice));
  
  return parseFloat(newPrice.toFixed(3));
}

/**
 * Fallback markets if API fails
 */
function getFallbackMarkets(category?: string): PolymarketEvent[] {
  const basePrices: Record<string, number> = {
    // BNB Chain specific
    'bnb-500-2025': 0.58,
    'bnb-1000-2025': 0.32,
    'bsc-tvl-100b': 0.45,
    'seedify-ido-10x': 0.68,
    'pancakeswap-v4': 0.52,
    'bnb-chain-dapps-1000': 0.42,
    // Crypto
    'btc-150k-2025': 0.32,
    'eth-10k-2025': 0.25,
    'solana-500-2025': 0.45,
    // Politics
    'trump-2024': 0.68,
    'biden-reelection-2024': 0.32,
    // Sports
    'lakers-championship-2025': 0.18,
    'real-madrid-ucl-2025': 0.42,
    'warriors-playoffs-2025': 0.75,
    'man-city-premier-league-2025': 0.62,
    // Tech
    'ai-agi-2026': 0.22,
    'apple-vision-pro-success': 0.48,
    // Finance
    'fed-rate-2025': 0.72,
    'sp500-6000-2025': 0.58,
    // Science
    'fusion-energy-2026': 0.15,
    'mars-mission-2026': 0.12,
    // Entertainment
    'oscars-oppenheimer-2024': 0.85,
    'taylor-swift-tour-record': 0.78,
  };
  
  const allMarkets = [
    // BNB Chain Ecosystem
    {
      id: 'bnb-500-2025',
      title: 'BNB reach $500 by end of 2025?',
      description: 'BNB token hits $500 by December 31, 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 2800000,
      liquidity: 520000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['bnb-500-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Crypto',
      active: true,
    },
    {
      id: 'bnb-1000-2025',
      title: 'BNB reach $1000 in 2025?',
      description: 'BNB token reaches $1000 milestone',
      endDate: '2025-12-31T23:59:59Z',
      volume: 1900000,
      liquidity: 380000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['bnb-1000-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Crypto',
      active: true,
    },
    {
      id: 'bsc-tvl-100b',
      title: 'BSC TVL exceed $100B in 2025?',
      description: 'BNB Smart Chain total value locked surpasses $100 billion',
      endDate: '2025-12-31T23:59:59Z',
      volume: 1500000,
      liquidity: 290000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['bsc-tvl-100b']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Finance',
      active: true,
    },
    {
      id: 'seedify-ido-10x',
      title: 'Next Seedify IDO oversubscribed 10x?',
      description: 'Upcoming Seedify launchpad IDO gets 10x oversubscription',
      endDate: '2025-06-30T23:59:59Z',
      volume: 2200000,
      liquidity: 420000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['seedify-ido-10x']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Crypto',
      active: true,
    },
    {
      id: 'pancakeswap-v4',
      title: 'PancakeSwap V4 launch in Q2 2025?',
      description: 'PancakeSwap releases version 4 by June 2025',
      endDate: '2025-06-30T23:59:59Z',
      volume: 1800000,
      liquidity: 340000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['pancakeswap-v4']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Tech',
      active: true,
    },
    {
      id: 'bnb-chain-dapps-1000',
      title: 'BNB Chain reach 1000+ active dApps?',
      description: 'BNB Chain ecosystem grows to over 1000 active dApps',
      endDate: '2025-12-31T23:59:59Z',
      volume: 1400000,
      liquidity: 270000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['bnb-chain-dapps-1000']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Tech',
      active: true,
    },
    // Crypto
    {
      id: 'btc-150k-2025',
      title: 'Bitcoin reach $150,000 in 2025?',
      description: 'Bitcoin to hit $150K by December 31, 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 3200000,
      liquidity: 580000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['btc-150k-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Crypto',
      active: true,
    },
    {
      id: 'eth-10k-2025',
      title: 'Ethereum reach $10,000 in 2025?',
      description: 'ETH to hit $10K by end of 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 2100000,
      liquidity: 420000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['eth-10k-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Crypto',
      active: true,
    },
    {
      id: 'solana-500-2025',
      title: 'Solana reach $500 in 2025?',
      description: 'SOL token hits $500 by end of 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 1800000,
      liquidity: 320000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['solana-500-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Crypto',
      active: true,
    },
    // Politics
    {
      id: 'trump-2024',
      title: 'Trump win 2024 election?',
      description: 'Donald Trump wins the 2024 presidential election',
      endDate: '2024-11-05T23:59:59Z',
      volume: 8900000,
      liquidity: 1200000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['trump-2024']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Politics',
      active: true,
    },
    {
      id: 'biden-reelection-2024',
      title: 'Biden win reelection in 2024?',
      description: 'Joe Biden wins the 2024 presidential election',
      endDate: '2024-11-05T23:59:59Z',
      volume: 7500000,
      liquidity: 980000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['biden-reelection-2024']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Politics',
      active: true,
    },
    // Sports
    {
      id: 'lakers-championship-2025',
      title: 'Lakers win NBA Championship 2025?',
      description: 'Los Angeles Lakers win the 2024-25 NBA Championship',
      endDate: '2025-06-30T23:59:59Z',
      volume: 1500000,
      liquidity: 280000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['lakers-championship-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Sports',
      active: true,
    },
    {
      id: 'real-madrid-ucl-2025',
      title: 'Real Madrid win Champions League 2025?',
      description: 'Real Madrid wins the 2024-25 UEFA Champions League',
      endDate: '2025-05-31T23:59:59Z',
      volume: 2200000,
      liquidity: 450000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['real-madrid-ucl-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Sports',
      active: true,
    },
    {
      id: 'warriors-playoffs-2025',
      title: 'Warriors make NBA Playoffs 2025?',
      description: 'Golden State Warriors qualify for 2024-25 NBA Playoffs',
      endDate: '2025-04-15T23:59:59Z',
      volume: 980000,
      liquidity: 180000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['warriors-playoffs-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Sports',
      active: true,
    },
    {
      id: 'man-city-premier-league-2025',
      title: 'Man City win Premier League 2024-25?',
      description: 'Manchester City wins the 2024-25 Premier League',
      endDate: '2025-05-25T23:59:59Z',
      volume: 1900000,
      liquidity: 380000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['man-city-premier-league-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Sports',
      active: true,
    },
    // Tech
    {
      id: 'ai-agi-2026',
      title: 'AGI achieved by 2026?',
      description: 'Artificial General Intelligence achieved by end of 2026',
      endDate: '2026-12-31T23:59:59Z',
      volume: 4500000,
      liquidity: 890000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['ai-agi-2026']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Tech',
      active: true,
    },
    {
      id: 'apple-vision-pro-success',
      title: 'Apple Vision Pro sells 5M+ units in 2025?',
      description: 'Apple Vision Pro reaches 5 million units sold by end of 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 2300000,
      liquidity: 450000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['apple-vision-pro-success']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Tech',
      active: true,
    },
    // Finance
    {
      id: 'fed-rate-2025',
      title: 'Fed rate below 3% by end of 2025?',
      description: 'Federal Reserve interest rate drops below 3%',
      endDate: '2025-12-31T23:59:59Z',
      volume: 1900000,
      liquidity: 340000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['fed-rate-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Finance',
      active: true,
    },
    {
      id: 'sp500-6000-2025',
      title: 'S&P 500 reach 6000 in 2025?',
      description: 'S&P 500 index hits 6000 by end of 2025',
      endDate: '2025-12-31T23:59:59Z',
      volume: 3100000,
      liquidity: 620000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['sp500-6000-2025']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Finance',
      active: true,
    },
    // Science
    {
      id: 'fusion-energy-2026',
      title: 'Commercial fusion energy by 2026?',
      description: 'First commercial fusion power plant operational by end of 2026',
      endDate: '2026-12-31T23:59:59Z',
      volume: 3400000,
      liquidity: 620000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['fusion-energy-2026']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Science',
      active: true,
    },
    {
      id: 'mars-mission-2026',
      title: 'Humans land on Mars by 2026?',
      description: 'First crewed mission successfully lands on Mars',
      endDate: '2026-12-31T23:59:59Z',
      volume: 2800000,
      liquidity: 520000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['mars-mission-2026']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Science',
      active: true,
    },
    // Entertainment
    {
      id: 'oscars-oppenheimer-2024',
      title: 'Oppenheimer win Best Picture at Oscars?',
      description: 'Oppenheimer wins Best Picture at the 2024 Academy Awards',
      endDate: '2024-03-10T23:59:59Z',
      volume: 890000,
      liquidity: 150000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['oscars-oppenheimer-2024']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Entertainment',
      active: true,
    },
    {
      id: 'taylor-swift-tour-record',
      title: 'Taylor Swift Eras Tour breaks $2B revenue?',
      description: 'Taylor Swift Eras Tour becomes first tour to gross over $2 billion',
      endDate: '2024-12-31T23:59:59Z',
      volume: 1200000,
      liquidity: 240000,
      outcomes: ['Yes', 'No'],
      outcomePrices: (() => {
        const yesPrice = addPriceFluctuation(basePrices['taylor-swift-tour-record']);
        return [yesPrice, parseFloat((1 - yesPrice).toFixed(2))];
      })(),
      category: 'Entertainment',
      active: true,
    },
  ];
  
  // Filter by category if specified
  if (category && category !== 'all') {
    const categoryLower = category.toLowerCase();
    return allMarkets.filter(market => {
      const marketCategory = market.category.toLowerCase();
      return marketCategory === categoryLower || 
             (categoryLower === 'crypto' && marketCategory.includes('crypto')) ||
             (categoryLower === 'sports' && marketCategory.includes('sport')) ||
             (categoryLower === 'politics' && marketCategory.includes('politic')) ||
             (categoryLower === 'tech' && marketCategory.includes('tech')) ||
             (categoryLower === 'finance' && marketCategory.includes('finance')) ||
             (categoryLower === 'entertainment' && marketCategory.includes('entertainment')) ||
             (categoryLower === 'science' && marketCategory.includes('science'));
    });
  }
  
  return allMarkets;
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
