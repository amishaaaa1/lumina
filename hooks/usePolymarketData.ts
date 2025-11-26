import { useState, useEffect } from 'react';
import { fetchTrendingMarkets, PolymarketEvent, formatVolume } from '@/lib/polymarket';

export interface MarketWithSentiment extends PolymarketEvent {
  sentiment: {
    bullish: number;
    bearish: number;
  };
  premium: string;
  insuredCount: number;
}

export function usePolymarketData() {
  const [markets, setMarkets] = useState<MarketWithSentiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMarkets() {
      try {
        setLoading(true);
        console.log('🔄 Fetching markets from Polymarket API...');
        const data = await fetchTrendingMarkets(20);
        console.log('✅ Received markets:', data.length);
        
        const enriched = data.map(market => {
          const yesPrice = market.outcomePrices[0] || 0.5;
          const bullish = Math.round(yesPrice * 100);
          const bearish = 100 - bullish;
          
          const basePremium = 2 + (Math.abs(yesPrice - 0.5) * 10);
          const premium = `${basePremium.toFixed(1)}%`;
          
          const insuredCount = Math.floor(market.volume / 50000);
          
          return {
            ...market,
            sentiment: { bullish, bearish },
            premium,
            insuredCount,
          };
        });
        
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
    const interval = setInterval(loadMarkets, 60000); // Refresh every minute
    
    return () => clearInterval(interval);
  }, []);

  return { markets, loading, error };
}

export function formatMarketVolume(volume: number): string {
  return `$${formatVolume(volume)}`;
}
