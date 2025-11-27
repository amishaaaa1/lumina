# @lumina/insurance-sdk

Official SDK for integrating Lumina Protocol insurance into your prediction market platform.

## Installation

```bash
npm install @lumina/insurance-sdk viem
```

## Quick Start

```typescript
import { LuminaInsurance } from '@lumina/insurance-sdk';
import { createWalletClient, custom } from 'viem';
import { bsc } from 'viem/chains';

// Initialize SDK
const insurance = new LuminaInsurance({
  chainId: 56, // BNB Chain mainnet
  contracts: {
    policyManager: '0x...', // Deployed contract address
    insurancePool: '0x...',
    oracle: '0x...',
    assetToken: '0x...', // USDT address
  },
  apiKey: 'your-api-key', // For AI risk assessment
});

// Create wallet client
const walletClient = createWalletClient({
  chain: bsc,
  transport: custom(window.ethereum),
});

// Calculate premium
const premium = await insurance.calculatePremium('btc-120k-q2', '1000');
console.log(`Premium: ${premium} USDT`);

// Get AI risk assessment
const risk = await insurance.getRiskAssessment('btc-120k-q2', '1000');
console.log(`Risk Score: ${risk.riskScore}/100`);
console.log(`Premium Rate: ${risk.premiumRate}%`);

// Approve USDT
const approveHash = await insurance.approveUSDT('1050', walletClient);
await publicClient.waitForTransactionReceipt({ hash: approveHash });

// Create insurance policy
const policyHash = await insurance.createPolicy({
  marketId: 'btc-120k-q2',
  coverageAmount: '1000',
  duration: 30, // days
  userAddress: '0x...',
  prediction: true, // true = Yes, false = No
}, walletClient);

console.log(`Policy created: ${policyHash}`);
```

## API Reference

### Constructor

```typescript
new LuminaInsurance(config: LuminaConfig)
```

**Config:**
- `chainId`: Network ID (56 for BNB mainnet, 97 for testnet)
- `rpcUrl`: Optional custom RPC URL
- `contracts`: Contract addresses
- `apiKey`: Optional API key for AI features

### Methods

#### `calculatePremium(marketId, coverageAmount)`
Calculate insurance premium for a market.

```typescript
const premium = await insurance.calculatePremium('market-id', '1000');
// Returns: "42.50" (USDT)
```

#### `getRiskAssessment(marketId, coverageAmount)`
Get AI-powered risk assessment.

```typescript
const risk = await insurance.getRiskAssessment('market-id', '1000');
// Returns: { riskScore, premiumRate, payoutRate, confidence, estimatedPremium }
```

#### `createPolicy(params, walletClient)`
Create new insurance policy.

```typescript
const hash = await insurance.createPolicy({
  marketId: 'market-id',
  coverageAmount: '1000',
  duration: 30,
  userAddress: '0x...',
  prediction: true,
}, walletClient);
```

#### `getPolicy(policyId)`
Get policy details.

```typescript
const policy = await insurance.getPolicy(1n);
// Returns: PolicyInfo object
```

#### `getUserPolicies(userAddress)`
Get all policies for a user.

```typescript
const policyIds = await insurance.getUserPolicies('0x...');
// Returns: [1n, 2n, 3n]
```

#### `canClaim(policyId)`
Check if policy is claimable.

```typescript
const canClaim = await insurance.canClaim(1n);
// Returns: true/false
```

#### `claimPolicy(policyId, walletClient)`
Claim insurance payout.

```typescript
const hash = await insurance.claimPolicy(1n, walletClient);
```

#### `getPoolStats()`
Get insurance pool statistics.

```typescript
const stats = await insurance.getPoolStats();
// Returns: { totalLiquidity, availableLiquidity, utilizationRate, ... }
```

## Integration Examples

### Polymarket Integration

```typescript
// When user places bet on Polymarket
async function placeBetWithInsurance(marketId, amount, outcome) {
  // 1. Calculate insurance premium
  const premium = await insurance.calculatePremium(marketId, amount);
  
  // 2. Show user the option
  const wantsInsurance = await showInsuranceModal({
    betAmount: amount,
    premium: premium,
    coverage: amount * 0.5, // 50% coverage
  });
  
  if (wantsInsurance) {
    // 3. Approve USDT
    await insurance.approveUSDT(premium, walletClient);
    
    // 4. Create policy
    await insurance.createPolicy({
      marketId,
      coverageAmount: amount,
      duration: 30,
      userAddress: userAddress,
      prediction: outcome,
    }, walletClient);
  }
  
  // 5. Place bet on Polymarket
  await polymarket.placeBet(marketId, amount, outcome);
}
```

### Hyperliquid Integration

```typescript
// Add insurance to Hyperliquid predictions
async function createPredictionWithInsurance(params) {
  // Create prediction on Hyperliquid
  const predictionId = await hyperliquid.createPrediction(params);
  
  // Offer insurance
  const policy = await insurance.createPolicy({
    marketId: predictionId,
    coverageAmount: params.amount,
    duration: params.duration,
    userAddress: params.user,
  }, walletClient);
  
  return { predictionId, policyId: policy };
}
```

### Custom Platform Integration

```typescript
// Your own prediction market
class MyPredictionMarket {
  constructor() {
    this.insurance = new LuminaInsurance({
      chainId: 56,
      contracts: { /* ... */ },
    });
  }
  
  async createMarket(params) {
    // Create your market
    const marketId = await this.createMarketOnChain(params);
    
    // Enable insurance for this market
    await this.insurance.updateMarketRisk(marketId, params.riskScore);
    
    return marketId;
  }
  
  async placeBet(marketId, amount, outcome) {
    // Offer insurance automatically
    const premium = await this.insurance.calculatePremium(marketId, amount);
    
    // Create policy
    await this.insurance.createPolicy({
      marketId,
      coverageAmount: amount,
      duration: 30,
      userAddress: this.userAddress,
      prediction: outcome,
    }, this.walletClient);
    
    // Place bet
    await this.placeBetOnChain(marketId, amount, outcome);
  }
}
```

## React Hooks

```typescript
import { useLuminaInsurance } from '@lumina/insurance-sdk/react';

function InsuranceWidget({ marketId, betAmount }) {
  const { premium, risk, createPolicy, isLoading } = useLuminaInsurance({
    marketId,
    coverageAmount: betAmount,
  });
  
  return (
    <div>
      <h3>Protect Your Bet</h3>
      <p>Premium: {premium} USDT</p>
      <p>Risk Score: {risk?.riskScore}/100</p>
      <button onClick={createPolicy} disabled={isLoading}>
        Buy Insurance
      </button>
    </div>
  );
}
```

## Contract Addresses

### BNB Chain Mainnet
```
PolicyManager: 0x...
InsurancePool: 0x...
Oracle: 0x...
USDT: 0x55d398326f99059fF775485246999027B3197955
```

### BNB Chain Testnet
```
PolicyManager: 0x...
InsurancePool: 0x...
Oracle: 0x...
MockUSDT: 0x...
```

## Support

- Documentation: https://docs.lumina-protocol.com
- Discord: https://discord.gg/lumina
- Twitter: @LuminaProtocol

## License

MIT
