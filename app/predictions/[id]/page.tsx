import { Navigation } from '@/components/layout/Navigation';
import TradingView from './TradingView';

export const metadata = {
  title: 'Trade with Insurance | Lumina',
  description: 'Trade prediction markets with optional insurance protection',
};

export default async function TradingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-6 py-12">
        <TradingView marketId={id} />
      </div>
    </div>
  );
}
