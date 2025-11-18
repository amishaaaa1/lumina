import PredictionsClient from './PredictionsClient';

export const metadata = {
  title: 'Crypto Risk Predictions | Lumina',
  description: 'Predict protocol risks and earn rewards on Lumina prediction markets',
};

export default function PredictionsPage() {
  return <PredictionsClient />;
}
