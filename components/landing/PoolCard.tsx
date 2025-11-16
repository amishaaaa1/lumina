'use client';

interface PoolCardProps {
  name: string;
  apy: string;
  tvl: string;
  color?: 'blue' | 'purple' | 'pink';
}

export function PoolCard({ name, apy, tvl, color = 'blue' }: PoolCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 hover:shadow-blue-500/10',
    purple: 'border-purple-500 hover:shadow-purple-500/10',
    pink: 'border-pink-500 hover:shadow-pink-500/10',
  };

  const apyColorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
  };

  return (
    <div className={`bg-white rounded-2xl p-8 border-2 border-gray-200 hover:${colorClasses[color]} hover:shadow-xl transition-all hover:scale-105`}>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">{name}</h3>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">APY:</span>
          <span className={`text-3xl font-bold ${apyColorClasses[color]}`}>
            {apy}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">TVL:</span>
          <span className="font-semibold text-gray-900">{tvl}</span>
        </div>
      </div>
    </div>
  );
}
