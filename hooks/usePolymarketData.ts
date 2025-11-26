import { useState, useEffect, useRef } from 'react';
import { fetchTrendingMarkets, PolymarketEvent, formatVolume } from '@/lib/polymarket';

export interface MarketWithSentiment extends PolymarketEvent {
  sentiment: {
    bullish: number;
    bearish: number;
  };
  premium: string;
  insuredCount: number;
}

// Add small random fluctuations to simulate real-time price movement
function addMicroFluctuation(price: number): number {
  // Add fluctuation between -1% to +1% for more visible movement
  const fluctuation = (Math.random() - 0.5) * 0.02;
  let newPrice = price + fluctuation;
  
  // Keep price between 0.15 and 0.85 to maintain variety
  newPrice = Math.max(0.15, Math.min(0.85, newPrice));
  
  return newPrice;
}

export function usePolymarketData(category?: string) {
  const [markets, setMarkets] = useState<MarketWithSentiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const baseMarketsRef = useRef<MarketWithSentiment[]>([]);

  useEffect(() => {
    async function loadMarkets() {
      try {
        setLoading(true);
        console.log('🔄 Fetching markets from Polymarket API...', category ? `Category: ${category}` : 'All categories');
        const data = await fetchTrendingMarkets(100, category);
        console.log('✅ Received markets:', data.length);
        console.log('📊 Sample market data:', data[0]);
        
        const enriched = data.map((market, index) => {
          // Generate consistent varied prices based on market ID
          const hash = market.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          
          // More diverse price ranges with better distribution
          const priceRanges = [
            0.18, 0.22, 0.25, 0.28, 0.32, 0.35, // Very low (18-35%)
            0.38, 0.42, 0.45, 0.48,             // Low-mid (38-48%)
            0.52, 0.55, 0.58, 0.62,             // Mid-high (52-62%)
            0.65, 0.68, 0.72, 0.75, 0.78, 0.82  // High (65-82%)
          ];
          
          const priceIndex = (hash + index) % priceRanges.length;
          const yesPrice = priceRanges[priceIndex];
          const noPrice = parseFloat((1 - yesPrice).toFixed(3));
          
          // Keep one decimal place for more precision
          const bullish = parseFloat((yesPrice * 100).toFixed(1));
          const bearish = parseFloat((noPrice * 100).toFixed(1));
          
          const basePremium = 2 + (Math.abs(yesPrice - 0.5) * 10);
          const premium = `${basePremium.toFixed(1)}%`;
          
          const insuredCount = Math.floor(market.volume / 50000);
          
          console.log(`✅ Market: ${market.title} | Yes: ${bullish}% | No: ${bearish}% | Category: ${market.category}`);
          
          return {
            ...market,
            outcomePrices: [yesPrice, noPrice],
            sentiment: { bullish, bearish },
            premium,
            insuredCount,
          };
        });
        
        console.log('✅ Enriched markets:', enriched.length);
        baseMarketsRef.current = enriched;
        setMarkets(enriched);
        setError(null);
      } catch (err) {
        console.error('❌ Failed to load markets from Polymarket:', err);
        setError('Failed to load markets');
      } finally {
        setLoading(false);
      }
    }

    loadMarkets();
    const fetchInterval = setInterval(loadMarkets, 30000); // Refresh from API every 30 seconds
    
    // Add continuous micro-fluctuations every 2-4 seconds for real-time feel
    const fluctuationInterval = setInterval(() => {
      if (baseMarketsRef.current.length > 0) {
        setMarkets(prevMarkets => {
          return prevMarkets.map(market => {
            // Use current price as base for smooth continuous movement
            const currentYesPrice = market.outcomePrices[0];
            
            // Add micro fluctuation (smaller to keep within reasonable bounds)
            const fluctuation = (Math.random() - 0.5) * 0.015; // ±0.75%
            let newYesPrice = currentYesPrice + fluctuation;
            
            // Keep within reasonable bounds based on original price
            const minPrice = Math.max(0.18, currentYesPrice - 0.05);
            const maxPrice = Math.min(0.82, currentYesPrice + 0.05);
            newYesPrice = Math.max(minPrice, Math.min(maxPrice, newYesPrice));
            
            const newNoPrice = parseFloat((1 - newYesPrice).toFixed(3));
            
            const bullish = parseFloat((newYesPrice * 100).toFixed(1));
            const bearish = parseFloat((newNoPrice * 100).toFixed(1));
            
            return {
              ...market,
              sentiment: { bullish, bearish },
              outcomePrices: [newYesPrice, newNoPrice],
            };
          });
        });
      }
    }, Math.random() * 2000 + 2000); // Random interval between 2-4 seconds
    
    return () => {
      clearInterval(fetchInterval);
      clearInterval(fluctuationInterval);
    };
  }, [category]);

  return { markets, loading, error };
}

export function formatMarketVolume(volume: number): string {
  return `$${formatVolume(volume)}`;
}
