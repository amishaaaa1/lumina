'use client';

interface MarketCardProps {
  title: string;
  premium: string;
  coverage: string;
  color?: 'blue' | 'purple' | 'pink';
}

export function MarketCard({ title, premium, coverage, color = 'blue' }: MarketCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 hover:shadow-blue-500/10',
    purple: 'border-purple-500 hover:shadow-purple-500/10',
    pink: 'border-pink-500 hover:shadow-pink-500/10',
  };

  return (
    <div className={`bg-white rounded-2xl p-8 border-2 border-gray-200 hover:${colorClasses[color]} hover:shadow-xl transition-all hover:scale-105`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">Premium:</span>
          <span className="font-semibold text-gray-900">{premium}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Coverage:</span>
          <span className="font-semibold text-gray-900">{coverage}</span>
        </div>
      </div>
    </div>
  );
}
