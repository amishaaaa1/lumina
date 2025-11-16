import { Metadata } from 'next';
import CryptoInsuranceClient from './CryptoInsuranceClient';

export const metadata: Metadata = {
  title: 'Crypto Prediction Insurance | Lumina',
  description: 'Hedge your crypto market predictions on BNB Chain. Protect against price movements, ETF decisions, and protocol events.',
};

export default function CryptoInsurancePage() {
  return <CryptoInsuranceClient />;
}
