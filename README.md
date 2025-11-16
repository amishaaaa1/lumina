# Frontend

Next.js 16

## Setup

```bash
npm i
cp .env.example .env.local
# add WalletConnect ID

npm run dev
```

WalletConnect: https://cloud.walletconnect.com

## Structure

```
app/
  page.tsx - landing
  insurance/ - buy
  pools/ - LP
  dashboard/ - portfolio

components/
  ui/ - buttons, cards
  layout/ - header, footer
  insurance/ - policy cards

lib/
  contracts.ts - ABIs
  wagmi.ts - web3
```

## Config

Edit `lib/contracts.ts` for addresses
Edit `lib/wagmi.ts` for chains

## Deploy

Vercel: `vercel`
Docker: `docker build -t lumina .`
