/**
 * Contract ABIs and addresses
 */

export const CONTRACTS = {
  PredictionMarket: {
    address: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS as `0x${string}`,
    abi: [
      {
        type: 'function',
        name: 'placeBet',
        inputs: [
          { name: 'marketId', type: 'uint256' },
          { name: 'outcome', type: 'bool' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [{ name: 'shares', type: 'uint256' }],
        stateMutability: 'nonpayable',
      },
      {
        type: 'function',
        name: 'claimWinnings',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [{ name: 'payout', type: 'uint256' }],
        stateMutability: 'nonpayable',
      },
      {
        type: 'function',
        name: 'getMarket',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [
          {
            name: '',
            type: 'tuple',
            components: [
              { name: 'marketId', type: 'string' },
              { name: 'question', type: 'string' },
              { name: 'protocol', type: 'string' },
              { name: 'riskType', type: 'string' },
              { name: 'deadline', type: 'uint256' },
              { name: 'yesPool', type: 'uint256' },
              { name: 'noPool', type: 'uint256' },
              { name: 'totalVolume', type: 'uint256' },
              { name: 'participantCount', type: 'uint256' },
              { name: 'resolved', type: 'bool' },
              { name: 'outcome', type: 'bool' },
              { name: 'insuranceEnabled', type: 'bool' },
            ],
          },
        ],
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'getPosition',
        inputs: [
          { name: 'marketId', type: 'uint256' },
          { name: 'user', type: 'address' },
        ],
        outputs: [
          {
            name: '',
            type: 'tuple',
            components: [
              { name: 'yesAmount', type: 'uint256' },
              { name: 'noAmount', type: 'uint256' },
              { name: 'claimed', type: 'bool' },
            ],
          },
        ],
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'calculatePayout',
        inputs: [
          { name: 'marketId', type: 'uint256' },
          { name: 'outcome', type: 'bool' },
          { name: 'amount', type: 'uint256' },
        ],
        outputs: [
          { name: 'shares', type: 'uint256' },
          { name: 'potentialPayout', type: 'uint256' },
        ],
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'getOdds',
        inputs: [{ name: 'marketId', type: 'uint256' }],
        outputs: [
          { name: 'yesOdds', type: 'uint256' },
          { name: 'noOdds', type: 'uint256' },
        ],
        stateMutability: 'view',
      },
    ] as const,
  },
  InsurancePool: {
    address: process.env.NEXT_PUBLIC_POOL_ADDRESS as `0x${string}`,
    abi: [
      {
        type: 'function',
        name: 'deposit',
        inputs: [{ name: 'amount', type: 'uint256' }],
        outputs: [{ name: 'shares', type: 'uint256' }],
        stateMutability: 'nonpayable',
      },
      {
        type: 'function',
        name: 'withdraw',
        inputs: [{ name: 'shares', type: 'uint256' }],
        outputs: [{ name: 'amount', type: 'uint256' }],
        stateMutability: 'nonpayable',
      },
      {
        type: 'function',
        name: 'getPoolInfo',
        inputs: [],
        outputs: [
          {
            name: '',
            type: 'tuple',
            components: [
              { name: 'totalLiquidity', type: 'uint256' },
              { name: 'availableLiquidity', type: 'uint256' },
              { name: 'totalPremiums', type: 'uint256' },
              { name: 'totalClaims', type: 'uint256' },
              { name: 'utilizationRate', type: 'uint256' },
              { name: 'isActive', type: 'bool' },
            ],
          },
        ],
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'getProviderInfo',
        inputs: [{ name: 'provider', type: 'address' }],
        outputs: [
          {
            name: '',
            type: 'tuple',
            components: [
              { name: 'shares', type: 'uint256' },
              { name: 'depositedAmount', type: 'uint256' },
              { name: 'earnedPremiums', type: 'uint256' },
              { name: 'lastUpdateTime', type: 'uint256' },
            ],
          },
        ],
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'calculateShareValue',
        inputs: [],
        outputs: [{ name: 'value', type: 'uint256' }],
        stateMutability: 'view',
      },
    ] as const,
  },
  PolicyManager: {
    address: process.env.NEXT_PUBLIC_POLICY_MANAGER_ADDRESS as `0x${string}`,
    abi: [
      {
        type: 'function',
        name: 'createPolicy',
        inputs: [
          { name: 'holder', type: 'address' },
          { name: 'marketId', type: 'string' },
          { name: 'coverageAmount', type: 'uint256' },
          { name: 'premium', type: 'uint256' },
          { name: 'duration', type: 'uint256' },
        ],
        outputs: [{ name: 'policyId', type: 'uint256' }],
        stateMutability: 'nonpayable',
      },
      {
        type: 'function',
        name: 'claimPolicy',
        inputs: [{ name: 'policyId', type: 'uint256' }],
        outputs: [{ name: 'payout', type: 'uint256' }],
        stateMutability: 'nonpayable',
      },
      {
        type: 'function',
        name: 'getPolicy',
        inputs: [{ name: 'policyId', type: 'uint256' }],
        outputs: [
          {
            name: '',
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
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'getUserPolicies',
        inputs: [{ name: 'user', type: 'address' }],
        outputs: [{ name: '', type: 'uint256[]' }],
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'calculatePremium',
        inputs: [
          { name: 'marketId', type: 'string' },
          { name: 'coverageAmount', type: 'uint256' },
        ],
        outputs: [{ name: '', type: 'uint256' }],
        stateMutability: 'view',
      },
    ] as const,
  },
  LuminaOracle: {
    address: process.env.NEXT_PUBLIC_ORACLE_ADDRESS as `0x${string}`,
    abi: [
      {
        type: 'function',
        name: 'getMarketOutcome',
        inputs: [{ name: 'marketId', type: 'string' }],
        outputs: [
          {
            name: '',
            type: 'tuple',
            components: [
              { name: 'marketId', type: 'string' },
              { name: 'isResolved', type: 'bool' },
              { name: 'outcomeHash', type: 'bytes32' },
              { name: 'resolvedAt', type: 'uint256' },
              { name: 'status', type: 'uint8' },
            ],
          },
        ],
        stateMutability: 'view',
      },
      {
        type: 'function',
        name: 'isMarketResolved',
        inputs: [{ name: 'marketId', type: 'string' }],
        outputs: [{ name: '', type: 'bool' }],
        stateMutability: 'view',
      },
    ] as const,
  },
} as const;

export const ASSET_TOKEN = {
  address: process.env.NEXT_PUBLIC_ASSET_TOKEN as `0x${string}`,
  abi: [
    {
      type: 'function',
      name: 'approve',
      inputs: [
        { name: 'spender', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
      outputs: [{ name: '', type: 'bool' }],
      stateMutability: 'nonpayable',
    },
    {
      type: 'function',
      name: 'balanceOf',
      inputs: [{ name: 'account', type: 'address' }],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
    },
    {
      type: 'function',
      name: 'allowance',
      inputs: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
      ],
      outputs: [{ name: '', type: 'uint256' }],
      stateMutability: 'view',
    },
  ] as const,
};
