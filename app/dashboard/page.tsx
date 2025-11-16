import { Metadata } from 'next';
import CryptoDashboardClient from './CryptoDashboardClient';

export const metadata: Metadata = {
  title: 'Your Crypto Protection Dashboard | Lumina',
  description: 'Manage your crypto insurance policies and liquidity positions on BNB Chain',
};

export default function DashboardPage() {
  return <CryptoDashboardClient />;
}
