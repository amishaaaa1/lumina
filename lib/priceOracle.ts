// Price Oracle for token conversion
// Uses Binance API for real-time prices

interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

const PRICE_CACHE = new Map<string, PriceData>();
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function getBNBPrice(): Promise<number> {
  const cached = PRICE_CACHE.get('BNBUSDT');
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    // Use Next.js API route to bypass CORS
    const apiUrl = typeof window !== 'undefined' 
      ? '/api/bnb-price'
      : 'https://api.binance.com/api/v3/ticker/price?symbol=BNBUSDT';
    
    const response = await fetch(apiUrl, {
      cache: 'no-store' // Force fresh data
    });
    
    if (!response.ok) {
      throw new Error(`BNB price API error: ${response.status}`);
    }
    
    const data = await response.json();
    const price = parseFloat(data.price);

    PRICE_CACHE.set('BNBUSDT', {
      symbol: 'BNBUSDT',
      price,
      timestamp: Date.now(),
    });

    return price;
  } catch (error) {
    console.error('Failed to fetch BNB price:', error);
    // Fallback price (approximate)
    return 600; // ~$600 per BNB
  }
}

export function convertUSDTtoBNB(usdtAmount: number, bnbPrice: number): number {
  return usdtAmount / bnbPrice;
}

export function convertBNBtoUSDT(bnbAmount: number, bnbPrice: number): number {
  return bnbAmount * bnbPrice;
}

export function formatTokenAmount(amount: number, decimals: number = 4): string {
  return amount.toFixed(decimals);
}
