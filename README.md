# Lumina Protocol

AI-powered insurance layer for prediction markets. We protect traders when they lose, making prediction markets accessible to everyone.

## The Problem

Prediction markets have a fundamental adoption problem:
- One wrong prediction = total loss
- Beginners are scared to participate
- No risk protection available
- This kills mass adoption

## Our Solution

Lumina is an **add-on insurance layer** that can plug into any prediction market:

**Works with:**
- Polymarket
- Hyperliquid Prediction
- HL Arena
- Seedify participants
- Any prediction market platform

**How it works:**
1. User places a bet (Yes/No)
2. Our AI calculates risk score for that market
3. System determines premium (3-8% of stake)
4. If user loses: automatic payout (20-70% of stake back)
5. If user wins: full payout as normal

**AI Risk Model factors:**
- Asset volatility
- Current odds
- Historical accuracy
- Pool liquidity

## Example

Bet $100 on "BNB reaches $500":
- AI calculates 5% premium
- You pay $105 total
- If wrong: get $40 back (40% protection)
- If right: win full payout

The insurance pool is funded by premiums and staking. AI adjusts rates to keep it sustainable.

## How It Works

### For Users

1. Connect wallet (MetaMask, Coinbase, WalletConnect)
2. Browse markets - crypto, politics, sports, etc.
3. Place your bet (Yes/No)
4. Insurance is automatically included
5. If wrong: get 20-70% refunded
6. If right: win full payout

### Technical Flow

```
User places $100 bet
├─ $100 goes to prediction market
├─ $5-20 premium to insurance pool
└─ If loses: $20-70 refunded from pool
```

Premium rates adjust based on market skew:
- Balanced market (50/50): 5% premium, 20% refund
- Moderate skew: 10% premium, 40% refund  
- High skew (70/30+): 20% premium, 70% refund

This keeps the insurance pool sustainable while protecting users.

## Tech Stack

### Frontend
- **Next.js 15** - React framework with app router
- **TypeScript** - Type safety throughout
- **Tailwind CSS** - Styling
- **Wagmi v2** - Web3 React hooks
- **Viem** - Ethereum interactions
- **Recharts** - Price charts

### Smart Contracts
- **Solidity 0.8.20** - Contract language
- **Foundry** - Development framework
- **OpenZeppelin** - Security standards

### AI & Backend
- **Google Gemini 3 Pro** - AI risk assessment (latest model with PhD-level reasoning)
- **Grok AI (xAI)** - Fallback AI for risk scoring
- **Cohere** - Secondary fallback AI
- **Node.js** - API server
- **Edge Runtime** - Fast API responses
- **Real-time AI Integration** - Live risk assessment in betting flow

### Infrastructure
- **BNB Chain** - Primary deployment
- **Polymarket API** - Market data source
- **Vercel** - Frontend hosting

## Project Structure

```
lumina/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── predictions/                # Market listings
│   │   ├── PredictionsClient.tsx   # Main market grid
│   │   └── [id]/                   # Individual market
│   │       ├── page.tsx
│   │       └── TradingView.tsx     # Trading interface
│   ├── insurance/                  # Insurance dashboard
│   └── api/
│       └── polymarket/             # Market data API
├── components/
│   ├── ui/                         # Reusable components
│   ├── charts/                     # Price charts
│   └── leaderboard/                # User rankings
├── contracts/
│   ├── src/
│   │   ├── PredictionMarket.sol    # Core betting logic
│   │   └── InsurancePool.sol       # Insurance mechanism
│   └── test/                       # Contract tests
└── lib/
    ├── contracts.ts                # Contract ABIs & addresses
    ├── wagmi.ts                    # Web3 configuration
    └── polymarket.ts               # API integration
```

## Key Features

### 1. Insurance Pools
- View liquidity and APR for LPs
- Track payout history
- See risk scores per market
- Stake to earn from premiums

### 2. Dual Mode Operation
- **Native markets**: Run our own prediction markets with built-in insurance
- **Add-on layer**: Integrate with external platforms (Polymarket, Hyperliquid, etc.)

### 3. AI Risk Oracle
- Real-time risk scoring
- Dynamic premium calculation
- Safe odds recommendations
- Learns from historical data

### 4. User Dashboard
- Active insurance policies
- Total protected amount
- Claim history
- Win/loss tracking with insurance coverage

## Why This Matters

We're not competing with prediction markets - we're making them safer:

- **For users**: Trade with confidence knowing you get partial refunds
- **For platforms**: Offer insurance without building it yourself
- **For builders**: Use our SDK to add insurance to your platform

This changes prediction markets from gambling to risk-managed trading.

## BNB Chain Integration

We're deployed on BNB Chain because:
- Low fees matter when you're adding insurance premiums on top of bets
- Fast finality means quick settlements
- Growing prediction market ecosystem (Seedify, PancakeSwap, etc.)

Markets we're running:
- BNB price milestones ($500, $1000)
- BSC TVL targets
- Seedify IDO outcomes
- PancakeSwap metrics
- New project launches

### Contract Deployment
```bash
cd contracts
forge build
forge script script/Deploy.s.sol --rpc-url $BNB_RPC --broadcast
```

Contracts deployed on BNB Chain testnet and ready for mainnet.

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet

### Installation

```bash
# Clone the repo
git clone <repo-url>
cd lumina

# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Add your WalletConnect project ID
```

### Environment Variables

```env
# Web3
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ENABLE_TESTNETS=true

# AI Risk Oracle
GEMINI_API_KEY=your_gemini_api_key

# Contracts (BNB Chain Testnet)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x...
NEXT_PUBLIC_POOL_ADDRESS=0x...
NEXT_PUBLIC_POLICY_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_ORACLE_ADDRESS=0x...
NEXT_PUBLIC_ASSET_TOKEN=0x...
```

Get API Keys:
- WalletConnect: https://cloud.walletconnect.com
- Gemini AI: https://aistudio.google.com/app/apikey

### Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### Build for Production

```bash
npm run build
npm start
```

## Smart Contracts

### Compile

```bash
cd contracts
forge build
```

### Test

```bash
forge test
forge test -vvv  # verbose output
```

### Deploy

```bash
# Deploy to BNB testnet
forge script script/Deploy.s.sol \
  --rpc-url https://data-seed-prebsc-1-s1.binance.org:8545 \
  --broadcast \
  --verify

# Deploy to BNB mainnet
forge script script/Deploy.s.sol \
  --rpc-url https://bsc-dataseed.binance.org \
  --broadcast \
  --verify
```

## Current Features

**Insurance Mechanics**
- Automatic protection on every bet
- Dynamic premium calculation (5-20%)
- Tiered protection based on market skew (20-70%)
- Sustainable pool economics

**Trading**
- Native prediction markets across crypto, politics, sports
- Real-time price updates
- Multiple outcome support
- Leaderboard and portfolio tracking

**Smart Contracts**
- ERC-721 insurance policies (tradeable)
- Separate insurance pool from market liquidity
- AI risk oracle integration
- Gasless transactions support

**Platform Integration (Roadmap)**
- SDK for external platforms
- Cross-platform policy management
- Unified insurance dashboard

## Configuration

### Update Contract Addresses

Edit `lib/contracts.ts`:

```typescript
export const CONTRACTS = {
  PredictionMarket: {
    address: '0x...',
    abi: PredictionMarketABI,
  },
  InsurancePool: {
    address: '0x...',
    abi: InsurancePoolABI,
  },
};
```

### Add Custom Markets

Edit `lib/polymarket.ts` to add BNB-specific markets:

```typescript
const bnbMarkets = [
  {
    id: 'bnb-500-2025',
    title: 'BNB reach $500 in 2025?',
    category: 'Crypto',
    // ...
  },
];
```

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Docker

```bash
docker build -t lumina .
docker run -p 3000:3000 lumina
```

### Manual

```bash
npm run build
npm start
```

## Testing

### Frontend Tests

```bash
npm test
```

### Contract Tests

```bash
cd contracts
forge test
```

### E2E Tests

```bash
npm run test:e2e
```

## Contributing

This is a hackathon project for Seedify x BNB Chain Prediction Markets Hackathon.

## License

MIT