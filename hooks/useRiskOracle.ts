import { useState, useEffect, useRef } from 'react';

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

// Cache for risk assessments (in-memory)
const assessmentCache = new Map<string, { assessment: RiskAssessment; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useRiskOracle(market: MarketData | null) {
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!market) {
      setAssessment(null);
      setLoading(false);
      return;
    }

    // Check cache first
    const cacheKey = market.marketId;
    const cached = assessmentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setAssessment(cached.assessment);
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

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
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error('Failed to calculate risk');
        }

        const data = await response.json();
        
        if (!abortController.signal.aborted && data.success) {
          setAssessment(data.assessment);
          // Cache the result
          assessmentCache.set(market.marketId, {
            assessment: data.assessment,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        if (!abortController.signal.aborted) {
          if (err instanceof Error && err.name === 'AbortError') {
            return; // Ignore abort errors
          }
          console.error('Risk oracle error:', err);
          setError(err instanceof Error ? err.message : 'Failed to calculate risk');
          // Use fallback calculation
          const fallback = getFallbackAssessment(market);
          setAssessment(fallback);
          // Cache fallback too
          assessmentCache.set(market.marketId, {
            assessment: fallback,
            timestamp: Date.now(),
          });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    // Debounce: wait 300ms before fetching
    const timeoutId = setTimeout(() => {
      fetchRiskAssessment();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      abortController.abort();
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
  
  let premiumRate = 5; // 5% default (range: 3-8%)
  let payoutRate = 50; // 50% default (range: 40-60%)
  
  if (riskScore < 30) {
    premiumRate = 3.5;
    payoutRate = 45;
  } else if (riskScore > 60) {
    premiumRate = 7;
    payoutRate = 58;
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
