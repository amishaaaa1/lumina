/**
 * Core type definitions for Lumina Protocol
 */

export enum PolicyStatus {
  Active = 0,
  Claimed = 1,
  Expired = 2,
  Cancelled = 3,
}

export enum MarketStatus {
  Active = 0,
  Resolved = 1,
  Disputed = 2,
  Cancelled = 3,
}

export interface Policy {
  id: string;
  holder: `0x${string}`;
  marketId: string;
  coverageAmount: bigint;
  premium: bigint;
  startTime: bigint;
  expiryTime: bigint;
  status: PolicyStatus;
  marketOutcomeHash: `0x${string}`;
}

export interface PoolInfo {
  totalLiquidity: bigint;
  availableLiquidity: bigint;
  totalPremiums: bigint;
  totalClaims: bigint;
  utilizationRate: bigint;
  isActive: boolean;
}

export interface ProviderInfo {
  shares: bigint;
  depositedAmount: bigint;
  earnedPremiums: bigint;
  lastUpdateTime: bigint;
}

export interface MarketOutcome {
  marketId: string;
  isResolved: boolean;
  outcomeHash: `0x${string}`;
  resolvedAt: bigint;
  status: MarketStatus;
}

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  endDate: Date;
  volume: bigint;
  liquidity: bigint;
  outcomes: string[];
  currentOdds: number[];
}
