import { NextResponse } from 'next/server';

const POLYMARKET_API = 'https://gamma-api.polymarket.com';

// Helper to add realistic price fluctuations (smaller range to maintain variety)
function addPriceFluctuation(basePrice: number): number {
  // Add small fluctuation between -1.5% to +1.5% to maintain base variety
  const fluctuation = (Math.random() - 0.5) * 0.03;
  let newPrice = basePrice + fluctuation;
  
  // Keep price between 0.15 and 0.85 to show clear variation
  newPrice = Math.max(0.15, Math.min(0.85, newPrice));
  
  return parseFloat(newPrice.toFixed(3));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get('limit') || '100';
  const category = searchParams.get('category');
  
  console.log('🔄 API called at:', new Date().toISOString());
  
  try {
    const response = await fetch(
      `${POLYMARKET_API}/events?limit=${limit}&active=true&closed=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store' // Force no cache
      }
    );

    if (!response.ok) {
      console.log('❌ Polymarket API failed, using fallback');
      throw new Error(`Polymarket API error: ${response.status}`);
    }

    let data = await response.json();
    
    console.log('✅ Got data from Polymarket API, adding fluctuations...');
    
    // Add price fluctuations to simulate real-time changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = data.map((event: any) => {
      if (event.markets?.[0]?.outcome_prices) {
        const yesPrice = parseFloat(event.markets[0].outcome_prices[0]);
        const newYesPrice = addPriceFluctuation(yesPrice);
        const newNoPrice = parseFloat((1 - newYesPrice).toFixed(2));
        
        console.log(`📊 ${event.title}: ${yesPrice} -> ${newYesPrice}`);
        
        return {
          ...event,
          markets: [{
            ...event.markets[0],
            outcome_prices: [newYesPrice.toString(), newNoPrice.toString()]
          }]
        };
      }
      return event;
    });
    
    // Normalize categories first
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data = data.map((event: any) => {
      let normalizedCategory = event.category || 'Other';
      const categoryLower = normalizedCategory.toLowerCase();
      const titleLower = event.title?.toLowerCase() || '';
      
      // Normalize based on category and title
      if (categoryLower.includes('crypto') || categoryLower.includes('bitcoin') || categoryLower.includes('ethereum') ||
          titleLower.includes('bitcoin') || titleLower.includes('ethereum') || titleLower.includes('crypto')) {
        normalizedCategory = 'Crypto';
      } else if (categoryLower.includes('politic') || categoryLower.includes('election') ||
                 titleLower.includes('election') || titleLower.includes('president') || titleLower.includes('trump') || titleLower.includes('biden')) {
        normalizedCategory = 'Politics';
      } else if (categoryLower.includes('sport') || categoryLower.includes('football') || categoryLower.includes('soccer') || categoryLower.includes('basketball') ||
                 titleLower.includes('nba') || titleLower.includes('nfl') || titleLower.includes('lakers') || titleLower.includes('champions league') || 
                 titleLower.includes('premier league') || titleLower.includes('world cup')) {
        normalizedCategory = 'Sports';
      } else if (categoryLower.includes('tech') || categoryLower.includes('ai') || categoryLower.includes('technology') ||
                 titleLower.includes(' ai ') || titleLower.includes('artificial intelligence') || titleLower.includes('agi')) {
        normalizedCategory = 'Tech';
      } else if (categoryLower.includes('finance') || categoryLower.includes('business') || categoryLower.includes('economy') ||
                 titleLower.includes('fed ') || titleLower.includes('federal reserve') || titleLower.includes('interest rate') || 
                 titleLower.includes('stock') || titleLower.includes('market')) {
        normalizedCategory = 'Finance';
      } else if (categoryLower.includes('science') || titleLower.includes('fusion') || titleLower.includes('scientific')) {
        normalizedCategory = 'Science';
      } else if (categoryLower.includes('entertainment') || categoryLower.includes('pop culture') ||
                 titleLower.includes('oscar') || titleLower.includes('movie') || titleLower.includes('film')) {
        normalizedCategory = 'Entertainment';
      }
      
      return { ...event, category: normalizedCategory };
    });
    
    // Filter by category if specified
    if (category && category !== 'all') {
      console.log('🔍 Filtering by category:', category);
      const beforeCount = data.length;
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data = data.filter((event: any) => {
        const eventCategory = event.category?.toLowerCase() || '';
        const filterCategory = category.toLowerCase();
        
        const matches = eventCategory === filterCategory;
        if (!matches) {
          console.log(`❌ Filtered out: "${event.title}" (category: ${event.category})`);
        }
        return matches;
      });
      
      console.log(`✅ Filtered from ${beforeCount} to ${data.length} results`);
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('❌ Polymarket API proxy error:', error);
    console.log('🔄 Using fallback data with dynamic prices...');
    
    // Return fallback data with highly varied prices for better demo
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
    
    // Generate prices dynamically on each request
    const generatePrices = (id: string) => {
      const basePrice = basePrices[id] || 0.5;
      const yesPrice = addPriceFluctuation(basePrice);
      const noPrice = parseFloat((1 - yesPrice).toFixed(3));
      console.log(`📊 Fallback ${id}: Yes=${(yesPrice * 100).toFixed(1)}%, No=${(noPrice * 100).toFixed(1)}%`);
      return [yesPrice.toString(), noPrice.toString()];
    };
    
    let fallbackData = [
      // BNB Chain Ecosystem
      {
        id: 'bnb-500-2025',
        title: 'BNB reach $500 by end of 2025?',
        description: 'BNB token hits $500 by December 31, 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '2800000',
        liquidity: '520000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('bnb-500-2025')
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      {
        id: 'bnb-1000-2025',
        title: 'BNB reach $1000 in 2025?',
        description: 'BNB token reaches $1000 milestone',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '1900000',
        liquidity: '380000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('bnb-1000-2025')
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      {
        id: 'bsc-tvl-100b',
        title: 'BSC TVL exceed $100B in 2025?',
        description: 'BNB Smart Chain total value locked surpasses $100 billion',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '1500000',
        liquidity: '290000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('bsc-tvl-100b')
        }],
        category: 'Finance',
        active: true,
        closed: false,
      },
      {
        id: 'seedify-ido-10x',
        title: 'Next Seedify IDO oversubscribed 10x?',
        description: 'Upcoming Seedify launchpad IDO gets 10x oversubscription',
        end_date_iso: '2025-06-30T23:59:59Z',
        volume: '2200000',
        liquidity: '420000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('seedify-ido-10x')
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      {
        id: 'pancakeswap-v4',
        title: 'PancakeSwap V4 launch in Q2 2025?',
        description: 'PancakeSwap releases version 4 by June 2025',
        end_date_iso: '2025-06-30T23:59:59Z',
        volume: '1800000',
        liquidity: '340000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('pancakeswap-v4')
        }],
        category: 'Tech',
        active: true,
        closed: false,
      },
      {
        id: 'bnb-chain-dapps-1000',
        title: 'BNB Chain reach 1000+ active dApps?',
        description: 'BNB Chain ecosystem grows to over 1000 active dApps',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '1400000',
        liquidity: '270000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('bnb-chain-dapps-1000')
        }],
        category: 'Tech',
        active: true,
        closed: false,
      },
      // Crypto
      {
        id: 'btc-150k-2025',
        title: 'Bitcoin reach $150,000 in 2025?',
        description: 'Bitcoin to hit $150K by December 31, 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '3200000',
        liquidity: '580000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('btc-150k-2025')
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      {
        id: 'eth-10k-2025',
        title: 'Ethereum reach $10,000 in 2025?',
        description: 'ETH to hit $10K by end of 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '2100000',
        liquidity: '420000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('eth-10k-2025')
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      {
        id: 'solana-500-2025',
        title: 'Solana reach $500 in 2025?',
        description: 'SOL token hits $500 by end of 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '1800000',
        liquidity: '320000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('solana-500-2025')
        }],
        category: 'Crypto',
        active: true,
        closed: false,
      },
      // Politics
      {
        id: 'trump-2024',
        title: 'Trump win 2024 election?',
        description: 'Donald Trump wins the 2024 presidential election',
        end_date_iso: '2024-11-05T23:59:59Z',
        volume: '8900000',
        liquidity: '1200000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('trump-2024')
        }],
        category: 'Politics',
        active: true,
        closed: false,
      },
      {
        id: 'biden-reelection-2024',
        title: 'Biden win reelection in 2024?',
        description: 'Joe Biden wins the 2024 presidential election',
        end_date_iso: '2024-11-05T23:59:59Z',
        volume: '7500000',
        liquidity: '980000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('biden-reelection-2024')
        }],
        category: 'Politics',
        active: true,
        closed: false,
      },
      // Sports
      {
        id: 'lakers-championship-2025',
        title: 'Lakers win NBA Championship 2025?',
        description: 'Los Angeles Lakers win the 2024-25 NBA Championship',
        end_date_iso: '2025-06-30T23:59:59Z',
        volume: '1500000',
        liquidity: '280000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('lakers-championship-2025')
        }],
        category: 'Sports',
        active: true,
        closed: false,
      },
      {
        id: 'real-madrid-ucl-2025',
        title: 'Real Madrid win Champions League 2025?',
        description: 'Real Madrid wins the 2024-25 UEFA Champions League',
        end_date_iso: '2025-05-31T23:59:59Z',
        volume: '2200000',
        liquidity: '450000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('real-madrid-ucl-2025')
        }],
        category: 'Sports',
        active: true,
        closed: false,
      },
      {
        id: 'warriors-playoffs-2025',
        title: 'Warriors make NBA Playoffs 2025?',
        description: 'Golden State Warriors qualify for 2024-25 NBA Playoffs',
        end_date_iso: '2025-04-15T23:59:59Z',
        volume: '980000',
        liquidity: '180000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('warriors-playoffs-2025')
        }],
        category: 'Sports',
        active: true,
        closed: false,
      },
      {
        id: 'man-city-premier-league-2025',
        title: 'Man City win Premier League 2024-25?',
        description: 'Manchester City wins the 2024-25 Premier League',
        end_date_iso: '2025-05-25T23:59:59Z',
        volume: '1900000',
        liquidity: '380000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('man-city-premier-league-2025')
        }],
        category: 'Sports',
        active: true,
        closed: false,
      },
      // Tech
      {
        id: 'ai-agi-2026',
        title: 'AGI achieved by 2026?',
        description: 'Artificial General Intelligence achieved by end of 2026',
        end_date_iso: '2026-12-31T23:59:59Z',
        volume: '4500000',
        liquidity: '890000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('ai-agi-2026')
        }],
        category: 'Tech',
        active: true,
        closed: false,
      },
      {
        id: 'apple-vision-pro-success',
        title: 'Apple Vision Pro sells 5M+ units in 2025?',
        description: 'Apple Vision Pro reaches 5 million units sold by end of 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '2300000',
        liquidity: '450000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('apple-vision-pro-success')
        }],
        category: 'Tech',
        active: true,
        closed: false,
      },
      // Finance
      {
        id: 'fed-rate-2025',
        title: 'Fed rate below 3% by end of 2025?',
        description: 'Federal Reserve interest rate drops below 3%',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '1900000',
        liquidity: '340000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('fed-rate-2025')
        }],
        category: 'Finance',
        active: true,
        closed: false,
      },
      {
        id: 'sp500-6000-2025',
        title: 'S&P 500 reach 6000 in 2025?',
        description: 'S&P 500 index hits 6000 by end of 2025',
        end_date_iso: '2025-12-31T23:59:59Z',
        volume: '3100000',
        liquidity: '620000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('sp500-6000-2025')
        }],
        category: 'Finance',
        active: true,
        closed: false,
      },
      // Science
      {
        id: 'fusion-energy-2026',
        title: 'Commercial fusion energy by 2026?',
        description: 'First commercial fusion power plant operational by end of 2026',
        end_date_iso: '2026-12-31T23:59:59Z',
        volume: '3400000',
        liquidity: '620000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('fusion-energy-2026')
        }],
        category: 'Science',
        active: true,
        closed: false,
      },
      {
        id: 'mars-mission-2026',
        title: 'Humans land on Mars by 2026?',
        description: 'First crewed mission successfully lands on Mars',
        end_date_iso: '2026-12-31T23:59:59Z',
        volume: '2800000',
        liquidity: '520000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('mars-mission-2026')
        }],
        category: 'Science',
        active: true,
        closed: false,
      },
      // Entertainment
      {
        id: 'oscars-oppenheimer-2024',
        title: 'Oppenheimer win Best Picture at Oscars?',
        description: 'Oppenheimer wins Best Picture at the 2024 Academy Awards',
        end_date_iso: '2024-03-10T23:59:59Z',
        volume: '890000',
        liquidity: '150000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('oscars-oppenheimer-2024')
        }],
        category: 'Entertainment',
        active: true,
        closed: false,
      },
      {
        id: 'taylor-swift-tour-record',
        title: 'Taylor Swift Eras Tour breaks $2B revenue?',
        description: 'Taylor Swift Eras Tour becomes first tour to gross over $2 billion',
        end_date_iso: '2024-12-31T23:59:59Z',
        volume: '1200000',
        liquidity: '240000',
        markets: [{
          outcomes: ['Yes', 'No'],
          outcome_prices: generatePrices('taylor-swift-tour-record')
        }],
        category: 'Entertainment',
        active: true,
        closed: false,
      },
    ];
    
    // Filter fallback data by category if specified
    if (category && category !== 'all') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fallbackData = fallbackData.filter((event: any) => {
        const eventCategory = event.category?.toLowerCase() || '';
        const filterCategory = category.toLowerCase();
        
        if (eventCategory === filterCategory) return true;
        if (filterCategory === 'crypto' && eventCategory.includes('crypto')) return true;
        if (filterCategory === 'sports' && eventCategory.includes('sport')) return true;
        if (filterCategory === 'politics' && eventCategory.includes('politic')) return true;
        if (filterCategory === 'tech' && eventCategory.includes('tech')) return true;
        if (filterCategory === 'finance' && eventCategory.includes('finance')) return true;
        if (filterCategory === 'entertainment' && eventCategory.includes('entertainment')) return true;
        if (filterCategory === 'science' && eventCategory.includes('science')) return true;
        
        return false;
      });
    }
    
    console.log(`✅ Returning ${fallbackData.length} fallback markets with dynamic prices`);
    
    return NextResponse.json(fallbackData, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
