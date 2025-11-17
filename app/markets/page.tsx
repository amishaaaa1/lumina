import { Metadata } from 'next';
import MarketDataClient from './MarketDataClient';

export const metadata: Metadata = {
  title: 'Live Market Data | Lumina',
  description: 'Real-time cryptocurrency market data and price charts',
};

export default function MarketsPage() {
  return <MarketDataClient />;
}
