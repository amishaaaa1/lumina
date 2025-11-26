# Lumina - Seedify x BNB Chain Hackathon Submission

## Project Overview

**Lumina Protocol** is the first decentralized insurance layer for prediction markets on BNB Chain. We enable traders to recover 20-70% of their losses, transforming high-risk prediction markets into risk-managed financial instruments.

## The Problem

Prediction markets suffer from low adoption because users fear total loss. This creates:
- 90% drop-off rate for new users
- Only high-confidence markets get liquidity
- Retail users stay away entirely

## Our Solution

An insurance layer that protects every trade:
- **Lose your bet?** Get 20-70% back automatically
- **Dynamic premiums** (5-20%) based on AI risk assessment
- **Built-in protection** - no separate purchase needed

## How It Works

### User Flow
1. Connect wallet to BNB Chain
2. Browse prediction markets (BNB price, Seedify IDOs, etc.)
3. Place bet with automatic insurance
4. If wrong: claim 20-70% refund
5. If right: win full payout

### Technical Architecture

```
User Bet: $100
├─ Prediction Market: $100
├─ Insurance Premium: $5-20
└─ If Loss: Refund $20-70
```

**Premium Calculation:**
- Balanced market (50/50): 5% premium → 20% refund
- Moderate skew (60/40): 10% premium → 40% refund
- High skew (70/30+): 20% premium → 70% refund

## Key Innovations

### 1. AI-Powered Risk Assessment
- Google Gemini 2.0 Flash integration
- Real-time premium calculation
- Market condition analysis

### 2. ERC-721 Policy NFTs
- Tradeable insurance policies
- Secondary market for risk transfer
- Composable with other DeFi protocols

### 3. Native AMM Integration
- Built-in prediction market
- Seamless insurance flow
- No external dependencies

### 4. Liquidity Pool Mechanics
- LPs earn from premiums
- Sustainable revenue model
- Concentration limits prevent whale manipulation

### 5. BNB Chain Optimization
- Low gas fees for small bets
- Fast finality for quick resolution
- Native BNB ecosystem markets

## Tech Stack

### Smart Contracts
- **Solidity 0.8.20** - Core logic
- **Foundry** - Development & testing
- **OpenZeppelin** - Security standards

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Wagmi v2** - Web3 hooks
- **Tailwind CSS** - Styling

### Backend
- **Node.js** - API server
- **PostgreSQL** - Database
- **Google Gemini 2.0** - AI risk assessment

### Infrastructure
- **BNB Chain Testnet** - Deployed contracts
- **Polymarket API** - Market data
- **Vercel** - Frontend hosting

## BNB Chain Integration

### Deployed Contracts
- PredictionMarket.sol
- InsurancePool.sol
- PolicyNFT.sol (ERC-721)

### BNB-Specific Markets
1. BNB reach $500 in 2025?
2. BNB reach $1000 in 2025?
3. BSC TVL exceed $100B?
4. Seedify IDO 10x oversubscribed?
5. PancakeSwap V4 launch Q2 2025?
6. BNB Chain 1000+ active dApps?

### Why BNB Chain?
- **Low fees** - Essential for small bets with insurance
- **Fast finality** - Quick bet placement and resolution
- **Growing ecosystem** - Natural market opportunities
- **Strong community** - Built-in user base

## Business Model

### Revenue Streams
1. **Insurance premiums** (5-20% of bet amount)
2. **Trading fees** (1-2% on prediction markets)
3. **LP performance fees** (10% of profits)

### Sustainability
- Premium pool covers payouts
- Dynamic pricing prevents insolvency
- Concentration limits reduce risk
- LP incentives ensure liquidity

## Competitive Advantages

### vs Traditional Prediction Markets
- ✅ 20-70% downside protection
- ✅ Lower psychological barrier
- ✅ Attracts risk-averse users

### vs Insurance Protocols
- ✅ Prediction market specific
- ✅ AI-powered pricing
- ✅ Instant claims (no disputes)

### vs Polymarket
- ✅ Built-in insurance
- ✅ Better UX for retail
- ✅ Can integrate as layer

## Market Opportunity

### TAM (Total Addressable Market)
- Prediction markets: $500M+ (growing)
- DeFi insurance: $2B+ market
- Combined: New category

### Target Users
1. **Risk-averse traders** - Want downside protection
2. **Retail users** - Small bets with insurance
3. **Liquidity providers** - Earn from premiums
4. **Other platforms** - Integrate our insurance layer

## Roadmap

### Phase 1: MVP (Current)
- ✅ Smart contracts deployed
- ✅ Frontend working
- ✅ BNB Chain integration
- ✅ Basic insurance mechanics

### Phase 2: AI Integration (Q1 2025)
- Google Gemini 2.0 Flash
- Dynamic premium calculation
- Risk assessment API

### Phase 3: NFT Policies (Q2 2025)
- ERC-721 implementation
- Secondary market
- Policy trading

### Phase 4: Open Protocol (Q3 2025)
- SDK for other platforms
- Polymarket integration
- Cross-chain expansion

## Team

[Your team info here - 150 words max]

## Demo

**Live Demo:** [URL]
**Video Demo:** [5 min video link]
**Contracts:** [BNB Testnet explorer links]

## Links

- **GitHub:** [Repo URL]
- **Documentation:** [Docs URL]
- **Twitter:** [Twitter handle]
- **Telegram:** [TG group]

---

**Built for Seedify x BNB Chain Prediction Markets Hackathon 2024**

Creating a new DeFi insurance category beyond traditional protocol coverage.
