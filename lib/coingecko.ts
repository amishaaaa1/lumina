/**
 * CoinGecko API Integration
 * Free tier: 10-30 calls/minute
 */

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  high_24h: number;
  low_24h: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

export interface ChartData {
  timestamp: number;
  price: number;
}

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Coin IDs mapping
export const COIN_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  USDT: 'tether',
  USDC: 'usd-coin',
  ADA: 'cardano',
  MATIC: 'matic-network',
  DOT: 'polkadot',
  AVAX: 'avalanche-2',
  ASTR: 'astar',
  XRP: 'ripple',
  DOGE: 'dogecoin',
  LINK: 'chainlink',
} as const;

/**
 * Fetch current prices for multiple coins
 */
export async function fetchCoinPrices(
  coinIds: string[] = ['bitcoin', 'ethereum', 'binancecoin', 'solana']
): Promise<CoinPrice[]> {
  try {
    const ids = coinIds.join(',');
    const response = await fetch(
      `${COINGECKO_API}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching coin prices:', error);
    return getFallbackPrices();
  }
}

/**
 * Fetch historical chart data
 * @param coinId Coin ID (e.g., 'bitcoin')
 * @param days Number of days (1, 7, 30, 90, 365, max)
 */
export async function fetchChartData(
  coinId: string,
  days: number = 7
): Promise<ChartData[]> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days === 1 ? 'hourly' : 'daily'}`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 300 } // Cache 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price,
    }));
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return getFallbackChartData(days);
  }
}

/**
 * Fetch single coin details
 */
export async function fetchCoinDetails(coinId: string): Promise<CoinPrice | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    
    return {
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      current_price: data.market_data.current_price.usd,
      price_change_24h: data.market_data.price_change_24h,
      price_change_percentage_24h: data.market_data.price_change_percentage_24h,
      market_cap: data.market_data.market_cap.usd,
      total_volume: data.market_data.total_volume.usd,
      high_24h: data.market_data.high_24h.usd,
      low_24h: data.market_data.low_24h.usd,
      sparkline_in_7d: data.market_data.sparkline_7d,
    };
  } catch (error) {
    console.error('Error fetching coin details:', error);
    return null;
  }
}

/**
 * Fallback prices if API fails
 */
function getFallbackPrices(): CoinPrice[] {
  return [
    {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      current_price: 58240,
      price_change_24h: 1340,
      price_change_percentage_24h: 2.3,
      market_cap: 1140000000000,
      total_volume: 28000000000,
      high_24h: 59100,
      low_24h: 57200,
    },
    {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      current_price: 3210,
      price_change_24h: 57,
      price_change_percentage_24h: 1.8,
      market_cap: 385000000000,
      total_volume: 15000000000,
      high_24h: 3280,
      low_24h: 3150,
    },
    {
      id: 'binancecoin',
      symbol: 'BNB',
      name: 'BNB',
      current_price: 520,
      price_change_24h: -2.6,
      price_change_percentage_24h: -0.5,
      market_cap: 75000000000,
      total_volume: 1200000000,
      high_24h: 528,
      low_24h: 515,
    },
    {
      id: 'solana',
      symbol: 'SOL',
      name: 'Solana',
      current_price: 142,
      price_change_24h: 4.4,
      price_change_percentage_24h: 3.2,
      market_cap: 62000000000,
      total_volume: 2800000000,
      high_24h: 145,
      low_24h: 138,
    },
  ];
}

/**
 * Generate fallback chart data
 */
function getFallbackChartData(days: number): ChartData[] {
  const now = Date.now();
  const interval = days === 1 ? 3600000 : 86400000; // 1h or 24h
  const points = days === 1 ? 24 : days;
  const basePrice = 58000;
  
  return Array.from({ length: points }, (_, i) => ({
    timestamp: now - (points - i) * interval,
    price: basePrice + Math.random() * 5000 - 2500,
  }));
}

/**
 * Format large numbers
 */
export function formatMarketCap(value: number | null | undefined): string {
  if (!value || value === 0) return '$0';
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

/**
 * Format price with appropriate decimals
 */
export function formatPrice(price: number | null | undefined): string {
  if (!price || price === 0) return '$0.00';
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(4)}`;
}
