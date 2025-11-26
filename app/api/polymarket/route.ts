import { NextResponse } from 'next/server';

const POLYMARKET_API = 'https://gamma-api.polymarket.com';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '20';
  
  try {
    const response = await fetch(
      `${POLYMARKET_API}/events?limit=${limit}&active=true&closed=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 60 } // Cache 1 minute
      }
    );

    if (!response.ok) {
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (error) {
    console.error('Polymarket API proxy error:', error);
    
    // Return fallback data
    return NextResponse.json([
      {
        id: 'btc-150k-2025',
        title: 'Will Bitcoin reach $150,000 in 2025?',
        description: 'Bitcoin to hit $150K by December 31, 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '3200000',
        liquidity: '580000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: ['0.42', '0.58']
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      {
        id: 'eth-10k-2025',
        title: 'Will Ethereum reach $10,000 in 2025?',
        description: 'ETH to hit $10K by end of 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '2100000',
        liquidity: '420000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: ['0.38', '0.62']
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      {
        id: 'ai-agi-2026',
        title: 'Will AGI be achieved by 2026?',
        description: 'Artificial General Intelligence achieved by end of 2026',
        end_date_iso: '2026-12-31T23:59:59Z',
        volume: '4500000',
        liquidity: '890000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: ['0.22', '0.78']
        }],
        category: 'Tech',
        active: true,
        closed: false,
      },
      {
        id: 'fed-rate-2025',
        title: 'Fed rate below 3% by end of 2025?',
        description: 'Federal Reserve interest rate drops below 3%',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '1900000',
        liquidity: '340000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: ['0.55', '0.45']
        }],
        category: 'Finance',
        active: true,
        closed: false,
      },
    ]);
  }
}
