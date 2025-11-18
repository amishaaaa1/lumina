import { Metadata } from 'next';
import PoolsClient from './PoolsClient';

export const metadata: Metadata = {
  title: 'Prediction Markets - Vote & Earn | Lumina Protocol',
  description: 'Vote on prediction markets on BNB Chain. Bet on crypto, politics, and more. Protect your bets with insurance. Built for Seedify Hackathon.',
};

export default function PoolsPage() {
  return <PoolsClient />;
}
