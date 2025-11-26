# Lumina - Protected Prediction Markets

The first AI prediction market platform with built-in insurance. Trade with confidence knowing you get 20-70% back if you're wrong.

## The Problem

Prediction markets have a fundamental UX problem - users hesitate to participate because losing means losing everything. This creates:
- Low participation rates, especially from retail users
- Concentrated liquidity in only high-confidence markets
- Risk-averse users staying away entirely

Traditional prediction markets force you to choose between sitting out or going all-in. There's no middle ground.

## Our Solution

Lumina introduces an insurance layer on top of prediction markets. Every bet is automatically protected:

- **Lose your bet?** Get 20-70% of your stake back
- **Dynamic premiums** based on market conditions (5-20% of stake)
- **No extra steps** - insurance is built into the trading flow

This changes the risk/reward calculation. Instead of risking $100 to win $150, you're risking $30-80 to win $150. Much more attractive.

The insurance pool is funded by premiums and generates sustainable revenue while making markets more accessible.

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

## BNB Chain Integration

Lumina is built specifically for BNB Chain:

### Markets on BNB Ecosystem
- BNB price predictions ($500, $1000 milestones)
- BSC TVL growth targets
- New project launches on BNB Chain
- Seedify IDO outcomes
- PancakeSwap volume predictions

### Why BNB Chain?
- **Low fees** - Essential for small bets with insurance
- **Fast finality** - Quick bet placement and resolution
- **Growing ecosystem** - Natural market opportunities
- **Strong community** - Built-in user base

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
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

Get WalletConnect ID: https://cloud.walletconnect.com

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

## Key Features

### 1. Protected Trading
Every bet includes insurance. No separate purchase needed.

### 2. Real-time Updates
Prices update every 1-3 seconds with smooth animations.

### 3. Multiple Categories
- Crypto (BTC, ETH, BNB, SOL)
- Politics (elections, policy)
- Sports (NBA, soccer, NFL)
- Tech (AI, product launches)
- Finance (Fed rates, markets)

### 4. Leaderboard
Track top traders and their performance.

### 5. Portfolio Dashboard
View your active bets, insurance coverage, and history.

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