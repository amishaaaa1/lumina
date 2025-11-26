import { NextRequest, NextResponse } from 'next/server';
import { calculateRiskScore, batchCalculateRiskScores } from '@/lib/gemini-risk-oracle';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Single market assessment
    if (body.marketId && !body.markets) {
      const assessment = await calculateRiskScore({
        marketId: body.marketId,
        question: body.question,
        yesOdds: body.yesOdds,
        noOdds: body.noOdds,
        totalVolume: body.totalVolume,
        liquidity: body.liquidity,
        timeToExpiry: body.timeToExpiry,
        category: body.category,
      });
      
      return NextResponse.json({ success: true, assessment });
    }
    
    // Batch assessment
    if (body.markets && Array.isArray(body.markets)) {
      const assessments = await batchCalculateRiskScores(body.markets);
      
      return NextResponse.json({ 
        success: true, 
        assessments: Object.fromEntries(assessments) 
      });
    }
    
    return NextResponse.json(
      { success: false, error: 'Invalid request format' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Risk oracle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate risk' },
      { status: 500 }
    );
  }
}
