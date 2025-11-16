import { Metadata } from 'next';
import PoolsClient from './PoolsClient';

export const metadata: Metadata = {
  title: 'Liquidity Pools | Lumina',
  description: 'Earn yield by providing insurance coverage on BNB Chain',
};

export default function PoolsPage() {
  return <PoolsClient />;
}
