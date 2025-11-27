

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const XAI_API_KEY = process.env.XAI_API_KEY || '';
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';
const COHERE_API_KEY = process.env.COHERE_API_KEY || '';
const COHERE_API_URL = 'https://api.cohere.ai/v1/chat';

interface MarketData {
  marketId: string;
  question: string;
  yesOdds: number;
  noOdds: number;
  totalVolume: number;
  liquidity: number;
  timeToExpiry: number; // in hours
  category: string;
}

interface RiskAssessment {
  riskScore: number; // 0-100
  premiumRate: number; // percentage (3-8%)
  payoutRate: number; // percentage (40-60%)
  confidence: number; // 0-100
  factors: {
    volatility: number;
    liquidity: number;
    timeDecay: number;
    marketSkew: number;
  };
  reasoning: string;
}

export async function calculateRiskScore(market: MarketData): Promise<RiskAssessment> {
  // Run all 3 AI models in parallel for combined assessment
  const results = await Promise.allSettled([
    calculateRiskScoreWithGemini(market),
    calculateRiskScoreWithGrok(market),
    calculateRiskScoreWithCohere(market),
  ]);

  const successfulResults: RiskAssessment[] = [];
  const aiNames: string[] = [];

  // Collect successful results
  if (results[0].status === 'fulfilled') {
    successfulResults.push(results[0].value);
    aiNames.push('Gemini 3 Pro');
  }
  if (results[1].status === 'fulfilled') {
    successfulResults.push(results[1].value);
    aiNames.push('Grok');
  }
  if (results[2].status === 'fulfilled') {
    successfulResults.push(results[2].value);
    aiNames.push('Cohere');
  }

  // If no AI succeeded, use fallback
  if (successfulResults.length === 0) {
    console.error('All AI models failed, using rule-based fallback');
    return calculateFallbackRisk(market);
  }

  // Combine results using weighted average based on confidence
  return combineAssessments(successfulResults, aiNames);
}

function combineAssessments(assessments: RiskAssessment[], aiNames: string[]): RiskAssessment {
  // Calculate total confidence weight
  const totalConfidence = assessments.reduce((sum, a) => sum + a.confidence, 0);
  
  // Weighted average for each metric
  const combinedRiskScore = assessments.reduce(
    (sum, a) => sum + (a.riskScore * a.confidence), 0
  ) / totalConfidence;
  
  const combinedPremiumRate = assessments.reduce(
    (sum, a) => sum + (a.premiumRate * a.confidence), 0
  ) / totalConfidence;
  
  const combinedPayoutRate = assessments.reduce(
    (sum, a) => sum + (a.payoutRate * a.confidence), 0
  ) / totalConfidence;
  
  const combinedConfidence = assessments.reduce(
    (sum, a) => sum + a.confidence, 0
  ) / assessments.length;
  
  // Combine factors
  const combinedFactors = {
    volatility: Math.round(
      assessments.reduce((sum, a) => sum + (a.factors.volatility * a.confidence), 0) / totalConfidence
    ),
    liquidity: Math.round(
      assessments.reduce((sum, a) => sum + (a.factors.liquidity * a.confidence), 0) / totalConfidence
    ),
    timeDecay: Math.round(
      assessments.reduce((sum, a) => sum + (a.factors.timeDecay * a.confidence), 0) / totalConfidence
    ),
    marketSkew: Math.round(
      assessments.reduce((sum, a) => sum + (a.factors.marketSkew * a.confidence), 0) / totalConfidence
    ),
  };
  
  // Create combined reasoning
  const aiList = aiNames.join(' + ');
  const reasoning = `Combined analysis from ${aiList} (${assessments.length} AI${assessments.length > 1 ? 's' : ''})`;
  
  return {
    riskScore: Math.round(combinedRiskScore),
    premiumRate: Math.round(combinedPremiumRate * 10) / 10, // 1 decimal
    payoutRate: Math.round(combinedPayoutRate * 10) / 10, // 1 decimal
    confidence: Math.round(combinedConfidence),
    factors: combinedFactors,
    reasoning,
  };
}

async function calculateRiskScoreWithGemini(market: MarketData): Promise<RiskAssessment> {
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-3-pro', // Latest Gemini 3 Pro - superior multimodal reasoning
    generationConfig: {
      temperature: 0.3,
      topP: 0.8,
      topK: 40,
    }
  });

  const prompt = `You are an AI risk analyst for prediction market insurance. Analyze this market and provide risk assessment.

Market Details:
- Question: ${market.question}
- Category: ${market.category}
- Current Odds: YES ${market.yesOdds}% / NO ${market.noOdds}%
- Total Volume: $${market.totalVolume.toLocaleString()}
- Liquidity: $${market.liquidity.toLocaleString()}
- Time to Expiry: ${market.timeToExpiry} hours

Calculate:
1. Risk Score (0-100): Overall risk level
   - 0-30: Low risk (stable, high liquidity)
   - 31-60: Medium risk (moderate volatility)
   - 61-100: High risk (volatile, low liquidity)

2. Premium Rate (3-8%): Insurance cost
   - Low risk: 3-4%
   - Medium risk: 4-6%
   - High risk: 6-8%

3. Payout Rate (40-60%): Refund if user loses
   - High risk: 55-60% (more protection)
   - Medium risk: 48-54%
   - Low risk: 40-47% (less protection)

4. Risk Factors (0-100 each):
   - Volatility: Price swing likelihood
   - Liquidity: Market depth
   - Time Decay: Urgency factor
   - Market Skew: Odds imbalance

5. Confidence (0-100): Your assessment confidence

Return ONLY valid JSON:
{
  "riskScore": number,
  "premiumRate": number,
  "payoutRate": number,
  "confidence": number,
  "factors": {
    "volatility": number,
    "liquidity": number,
    "timeDecay": number,
    "marketSkew": number
  },
  "reasoning": "brief explanation"
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid Gemini response format');
  }
  
  const assessment: RiskAssessment = JSON.parse(jsonMatch[0]);
  
  // Validate ranges
  assessment.riskScore = Math.max(0, Math.min(100, assessment.riskScore));
  assessment.premiumRate = Math.max(3, Math.min(8, assessment.premiumRate));
  assessment.payoutRate = Math.max(40, Math.min(60, assessment.payoutRate));
  assessment.confidence = Math.max(0, Math.min(100, assessment.confidence));
  
  return assessment;
}

async function calculateRiskScoreWithGrok(market: MarketData): Promise<RiskAssessment> {
  const prompt = `You are an AI risk analyst for prediction market insurance. Analyze this market and provide risk assessment.

Market Details:
- Question: ${market.question}
- Category: ${market.category}
- Current Odds: YES ${market.yesOdds}% / NO ${market.noOdds}%
- Total Volume: ${market.totalVolume.toLocaleString()}
- Liquidity: ${market.liquidity.toLocaleString()}
- Time to Expiry: ${market.timeToExpiry} hours

Calculate:
1. Risk Score (0-100): Overall risk level
2. Premium Rate (3-8%): Insurance cost
3. Payout Rate (40-60%): Refund if user loses
4. Risk Factors (0-100 each): volatility, liquidity, timeDecay, marketSkew
5. Confidence (0-100): Your assessment confidence

Return ONLY valid JSON:
{
  "riskScore": number,
  "premiumRate": number,
  "payoutRate": number,
  "confidence": number,
  "factors": {
    "volatility": number,
    "liquidity": number,
    "timeDecay": number,
    "marketSkew": number
  },
  "reasoning": "brief explanation"
}`;

  const response = await fetch(XAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are an expert AI risk analyst for prediction market insurance. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'grok-beta',
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`xAI API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices[0]?.message?.content || '';
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid Grok response format');
  }
  
  const assessment: RiskAssessment = JSON.parse(jsonMatch[0]);
  
  // Validate ranges
  assessment.riskScore = Math.max(0, Math.min(100, assessment.riskScore));
  assessment.premiumRate = Math.max(3, Math.min(8, assessment.premiumRate));
  assessment.payoutRate = Math.max(40, Math.min(60, assessment.payoutRate));
  assessment.confidence = Math.max(0, Math.min(100, assessment.confidence));
  
  return assessment;
}

async function calculateRiskScoreWithCohere(market: MarketData): Promise<RiskAssessment> {
  const prompt = `You are an AI risk analyst for prediction market insurance. Analyze this market and provide risk assessment.

Market Details:
- Question: ${market.question}
- Category: ${market.category}
- Current Odds: YES ${market.yesOdds}% / NO ${market.noOdds}%
- Total Volume: ${market.totalVolume.toLocaleString()}
- Liquidity: ${market.liquidity.toLocaleString()}
- Time to Expiry: ${market.timeToExpiry} hours

Calculate:
1. Risk Score (0-100): Overall risk level
2. Premium Rate (3-8%): Insurance cost
3. Payout Rate (40-60%): Refund if user loses
4. Risk Factors (0-100 each): volatility, liquidity, timeDecay, marketSkew
5. Confidence (0-100): Your assessment confidence

Return ONLY valid JSON:
{
  "riskScore": number,
  "premiumRate": number,
  "payoutRate": number,
  "confidence": number,
  "factors": {
    "volatility": number,
    "liquidity": number,
    "timeDecay": number,
    "marketSkew": number
  },
  "reasoning": "brief explanation"
}`;

  const response = await fetch(COHERE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${COHERE_API_KEY}`,
    },
    body: JSON.stringify({
      message: prompt,
      model: 'command-r',
      temperature: 0.3,
      preamble: 'You are an expert AI risk analyst for prediction market insurance. Always respond with valid JSON only.',
    }),
  });

  if (!response.ok) {
    throw new Error(`Cohere API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.text || '';
  
  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Invalid Cohere response format');
  }
  
  const assessment: RiskAssessment = JSON.parse(jsonMatch[0]);
  
  // Validate ranges
  assessment.riskScore = Math.max(0, Math.min(100, assessment.riskScore));
  assessment.premiumRate = Math.max(3, Math.min(8, assessment.premiumRate));
  assessment.payoutRate = Math.max(40, Math.min(60, assessment.payoutRate));
  assessment.confidence = Math.max(0, Math.min(100, assessment.confidence));
  
  return assessment;
}

function calculateFallbackRisk(market: MarketData): RiskAssessment {
  // Simple rule-based fallback
  const skew = Math.abs(market.yesOdds - market.noOdds);
  const liquidityScore = Math.min(100, (market.liquidity / 10000) * 100);
  const timeScore = Math.max(0, 100 - (market.timeToExpiry / 24) * 10);
  
  const riskScore = (skew * 0.4) + ((100 - liquidityScore) * 0.3) + (timeScore * 0.3);
  
  let premiumRate = 5;
  let payoutRate = 50;
  
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

// Batch processing for multiple markets
export async function batchCalculateRiskScores(markets: MarketData[]): Promise<Map<string, RiskAssessment>> {
  const results = new Map<string, RiskAssessment>();
  
  // Process in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < markets.length; i += batchSize) {
    const batch = markets.slice(i, i + batchSize);
    const promises = batch.map(market => 
      calculateRiskScore(market)
        .then(assessment => ({ marketId: market.marketId, assessment }))
    );
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(({ marketId, assessment }) => {
      results.set(marketId, assessment);
    });
    
    // Rate limiting delay
    if (i + batchSize < markets.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}
