import { useState, useEffect } from 'react';

interface RiskAssessment {
  riskScore: number;
  premiumRate: number;
  payoutRate: number;
  confidence: number;
  factors: {
    volatility: number;
    liquidity: number;
    timeDecay: number;
    marketSkew: number;
  };
  reasoning: string;
}

interface MarketData {
  marketId: string;
  question: string;
  yesOdds: number;
  noOdds: number;
  totalVolume: number;
  liquidity: number;
  timeToExpiry: number;
  category: string;
}

export function useRiskOracle(market: MarketData | null) {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!market) {
      setAssessment(null);
      return;
    }

    let isCancelled = false;

    async function fetchRiskAssessment() {
      if (!market) return;
      
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/risk-oracle', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(market),
        });

        if (!response.ok) {
          throw new Error('Failed to calculate risk');
        }

        const data = await response.json();
        
        if (!isCancelled && data.success) {
          setAssessment(data.assessment);
        }
      } catch (err) {
        if (!isCancelled && market) {
          console.error('Risk oracle error:', err);
          setError(err instanceof Error ? err.message : 'Failed to calculate risk');
          // Use fallback calculation
          setAssessment(getFallbackAssessment(market));
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchRiskAssessment();

    return () => {
      isCancelled = true;
    };
  }, [market]);

  return { assessment, loading, error };
}

// Fallback calculation if API fails
function getFallbackAssessment(market: MarketData): RiskAssessment {
  const skew = Math.abs(market.yesOdds - market.noOdds);
  const liquidityScore = Math.min(100, (market.liquidity / 10000) * 100);
  const timeScore = Math.max(0, 100 - (market.timeToExpiry / 24) * 10);
  
  const riskScore = (skew * 0.4) + ((100 - liquidityScore) * 0.3) + (timeScore * 0.3);
  
  let premiumRate = 25; // 25% default
  let payoutRate = 50; // 50% default
  
  if (riskScore < 30) {
    premiumRate = 20;
    payoutRate = 50;
  } else if (riskScore > 60) {
    premiumRate = 30;
    payoutRate = 70;
  }
  
  return {
    riskScore: Math.round(riskScore),
    premiumRate,
    payoutRate,
    confidence: 70,
    factors: {
      volatility: Math.round(skew),
      liquidity: Math.round(liquidityScore),
      timeDecay: Math.round(timeScore),
      marketSkew: Math.round(skew),
    },
    reasoning: 'Fallback calculation based on market metrics',
  };
}
