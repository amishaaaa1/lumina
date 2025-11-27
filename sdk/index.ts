/**
 * @lumina/insurance-sdk
 * 
 * SDK for integrating Lumina Protocol insurance into external prediction markets
 * 
 * @example
 * ```typescript
 * import { LuminaInsurance } from '@lumina/insurance-sdk';
 * 
 * const insurance = new LuminaInsurance({
 *   chainId: 56, // BNB Chain
 *   rpcUrl: 'https://bsc-dataseed.binance.org',
 *   contracts: {
 *     policyManager: '0x...',
 *     insurancePool: '0x...',
 *     oracle: '0x...',
 *   }
 * });
 * 
 * // Create insurance policy
 * const policy = await insurance.createPolicy({
 *   marketId: 'btc-120k-q2',
 *   coverageAmount: '1000', // USDT
 *   duration: 30, // days
 *   userAddress: '0x...',
 * });
 * 
 * // Check if user can claim
 * const canClaim = await insurance.canClaim(policyId);
 * 
 * // Claim insurance payout
 * const payout = await insurance.claimPolicy(policyId);
 * ```
 */

import { createPublicClient, createWalletClient, http, parseUnits, formatUnits, type Address, type Hash } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';

export interface LuminaConfig {
  chainId: number;
  rpcUrl?: string;
  contracts: {
    policyManager: Address;
    insurancePool: Address;
    oracle: Address;
    assetToken: Address;
  };
  apiKey?: string; // For AI risk assessment
}

export interface CreatePolicyParams {
  marketId: string;
  coverageAmount: string; // in USDT
  duration: number; // in days
  userAddress: Address;
  prediction?: boolean; // true = Yes, false = No
}

export interface PolicyInfo {
  id: bigint;
  holder: Address;
  marketId: string;
  coverageAmount: bigint;
  premium: bigint;
  startTime: bigint;
  expiryTime: bigint;
  status: number;
  marketOutcomeHash: Hash;
}

export interface RiskAssessment {
  riskScore: number;
  premiumRate: number;
  payoutRate: number;
  confidence: number;
  estimatedPremium: string;
}

export class LuminaInsurance {
  private config: LuminaConfig;
  private publicClient: ReturnType<typeof createPublicClient>;
  private chain: typeof bsc | typeof bscTestnet;

  constructor(config: LuminaConfig) {
    this.config = config;
    this.chain = config.chainId === 56 ? bsc : bscTestnet;
    
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(config.rpcUrl),
    });
  }

  /**
   * Calculate premium for insurance policy
   */
  async calculatePremium(marketId: string, coverageAmount: string): Promise<string> {
    const amount = parseUnits(coverageAmount, 18);
    
    const premium = await this.publicClient.readContract({
      address: this.config.contracts.policyManager,
      abi: POLICY_MANAGER_ABI,
      functionName: 'calculatePremium',
      args: [marketId, amount],
    }) as bigint;

    return formatUnits(premium, 18);
  }

  /**
   * Get AI risk assessment for market
   */
  async getRiskAssessment(marketId: string, coverageAmount: string): Promise<RiskAssessment> {
    if (!this.config.apiKey) {
      throw new Error('API key required for risk assessment');
    }

    const response = await fetch('https://lumina-protocol.vercel.app/api/risk-oracle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        marketId,
        coverageAmount,
      }),
    });

    if (!response.ok) {
      throw new Error('Risk assessment failed');
    }

    const data = await response.json();
    return data.assessment;
  }

  /**
   * Create insurance policy
   * Note: User must approve USDT spending first
   */
  async createPolicy(params: CreatePolicyParams, walletClient: ReturnType<typeof createWalletClient>): Promise<Hash> {
    if (!walletClient.account) {
      throw new Error('Wallet account not connected');
    }

    const coverageAmount = parseUnits(params.coverageAmount, 18);
    const premium = await this.calculatePremium(params.marketId, params.coverageAmount);
    const premiumAmount = parseUnits(premium, 18);
    const duration = BigInt(params.duration * 24 * 60 * 60); // days to seconds

    const hash = await walletClient.writeContract({
      address: this.config.contracts.policyManager,
      abi: POLICY_MANAGER_ABI,
      functionName: 'createPolicy',
      chain: this.chain,
      account: walletClient.account,
      args: [
        params.userAddress,
        params.marketId,
        coverageAmount,
        premiumAmount,
        duration,
      ],
    });

    return hash;
  }

  /**
   * Get policy information
   */
  async getPolicy(policyId: bigint): Promise<PolicyInfo> {
    const policy = await this.publicClient.readContract({
      address: this.config.contracts.policyManager,
      abi: POLICY_MANAGER_ABI,
      functionName: 'getPolicy',
      args: [policyId],
    }) as any;

    return {
      id: policy.id,
      holder: policy.holder,
      marketId: policy.marketId,
      coverageAmount: policy.coverageAmount,
      premium: policy.premium,
      startTime: policy.startTime,
      expiryTime: policy.expiryTime,
      status: policy.status,
      marketOutcomeHash: policy.marketOutcomeHash,
    };
  }

  /**
   * Get all policies for user
   */
  async getUserPolicies(userAddress: Address): Promise<bigint[]> {
    const policyIds = await this.publicClient.readContract({
      address: this.config.contracts.policyManager,
      abi: POLICY_MANAGER_ABI,
      functionName: 'getUserPolicies',
      args: [userAddress],
    }) as bigint[];

    return policyIds;
  }

  /**
   * Check if user can claim policy
   */
  async canClaim(policyId: bigint): Promise<boolean> {
    try {
      const policy = await this.getPolicy(policyId);
      
      // Check if policy is active
      if (policy.status !== 0) return false;
      
      // Check if not expired
      if (BigInt(Date.now() / 1000) > policy.expiryTime) return false;
      
      // Check if market is resolved
      const isResolved = await this.publicClient.readContract({
        address: this.config.contracts.oracle,
        abi: ORACLE_ABI,
        functionName: 'isMarketResolved',
        args: [policy.marketId],
      }) as boolean;

      return isResolved;
    } catch {
      return false;
    }
  }

  /**
   * Claim insurance payout
   */
  async claimPolicy(policyId: bigint, walletClient: ReturnType<typeof createWalletClient>): Promise<Hash> {
    if (!walletClient.account) {
      throw new Error('Wallet account not connected');
    }

    const hash = await walletClient.writeContract({
      address: this.config.contracts.policyManager,
      abi: POLICY_MANAGER_ABI,
      functionName: 'claimPolicy',
      chain: this.chain,
      account: walletClient.account,
      args: [policyId],
    });

    return hash;
  }

  /**
   * Get pool statistics
   */
  async getPoolStats() {
    const poolInfo = await this.publicClient.readContract({
      address: this.config.contracts.insurancePool,
      abi: INSURANCE_POOL_ABI,
      functionName: 'getPoolInfo',
    }) as any;

    return {
      totalLiquidity: formatUnits(poolInfo.totalLiquidity, 18),
      availableLiquidity: formatUnits(poolInfo.availableLiquidity, 18),
      utilizationRate: Number(poolInfo.utilizationRate) / 100,
      activePolicies: Number(poolInfo.activePolicies),
      premiumsCollected: formatUnits(poolInfo.premiumsCollected, 18),
    };
  }

  /**
   * Approve USDT spending
   */
  async approveUSDT(amount: string, walletClient: ReturnType<typeof createWalletClient>): Promise<Hash> {
    if (!walletClient.account) {
      throw new Error('Wallet account not connected');
    }

    const account = walletClient.account;
    const amountBigInt = parseUnits(amount, 18);
    
    const hash = await walletClient.writeContract({
      address: this.config.contracts.assetToken,
      abi: ERC20_ABI,
      functionName: 'approve',
      chain: this.chain,
      account,
      args: [this.config.contracts.policyManager, amountBigInt],
    });

    return hash;
  }
}

// Minimal ABIs for SDK
const POLICY_MANAGER_ABI = [
  {
    name: 'createPolicy',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'holder', type: 'address' },
      { name: 'marketId', type: 'string' },
      { name: 'coverageAmount', type: 'uint256' },
      { name: 'premium', type: 'uint256' },
      { name: 'duration', type: 'uint256' },
    ],
    outputs: [{ name: 'policyId', type: 'uint256' }],
  },
  {
    name: 'claimPolicy',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'policyId', type: 'uint256' }],
    outputs: [{ name: 'payout', type: 'uint256' }],
  },
  {
    name: 'getPolicy',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'policyId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'holder', type: 'address' },
          { name: 'marketId', type: 'string' },
          { name: 'coverageAmount', type: 'uint256' },
          { name: 'premium', type: 'uint256' },
          { name: 'startTime', type: 'uint256' },
          { name: 'expiryTime', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'marketOutcomeHash', type: 'bytes32' },
        ],
      },
    ],
  },
  {
    name: 'getUserPolicies',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    name: 'calculatePremium',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'marketId', type: 'string' },
      { name: 'coverageAmount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;

const INSURANCE_POOL_ABI = [
  {
    name: 'getPoolInfo',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'totalLiquidity', type: 'uint256' },
          { name: 'availableLiquidity', type: 'uint256' },
          { name: 'utilizationRate', type: 'uint256' },
          { name: 'activePolicies', type: 'uint256' },
          { name: 'totalShares', type: 'uint256' },
          { name: 'premiumsCollected', type: 'uint256' },
        ],
      },
    ],
  },
] as const;

const ORACLE_ABI = [
  {
    name: 'isMarketResolved',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export default LuminaInsurance;
