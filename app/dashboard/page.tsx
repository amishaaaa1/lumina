import { Metadata } from 'next';
import LuminaDashboardClient from './LuminaDashboardClient';

export const metadata: Metadata = {
  title: 'Dashboard | Lumina Protocol - AI-Powered Prediction Market Insurance',
  description: 'Manage your policies, LP positions, and view AI-powered insights on BNB Chain',
};

export default function DashboardPage() {
  return <LuminaDashboardClient />;
}
