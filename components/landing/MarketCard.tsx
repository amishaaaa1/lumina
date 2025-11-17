'use client';

interface MarketCardProps {
  title: string;
  premium: string;
  coverage: string;
  votes: number;
  pooled: string;
  currentPrice: string;
  color?: 'blue' | 'purple' | 'pink' | 'cyan' | 'indigo';
}

export function MarketCard({ 
  title, 
  premium, 
  coverage, 
  votes,
  pooled,
  currentPrice,
  color = 'blue' 
}: MarketCardProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'bg-blue-500',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:border-blue-400 hover:shadow-blue-500/20'
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'bg-purple-500',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:border-purple-400 hover:shadow-purple-500/20'
    },
    pink: {
      bg: 'bg-pink-50',
      icon: 'bg-pink-500',
      text: 'text-pink-600',
      border: 'border-pink-200',
      hover: 'hover:border-pink-400 hover:shadow-pink-500/20'
    },
    cyan: {
      bg: 'bg-cyan-50',
      icon: 'bg-cyan-500',
      text: 'text-cyan-600',
      border: 'border-cyan-200',
      hover: 'hover:border-cyan-400 hover:shadow-cyan-500/20'
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'bg-indigo-500',
      text: 'text-indigo-600',
      border: 'border-indigo-200',
      hover: 'hover:border-indigo-400 hover:shadow-indigo-500/20'
    }
  };

  const colors = colorClasses[color];

  return (
    <div className={`group relative bg-white rounded-2xl p-6 border-2 ${colors.border} ${colors.hover} hover:shadow-xl transition-all duration-300 cursor-pointer`}>
      {/* Icon Badge */}
      <div className={`inline-flex items-center justify-center w-12 h-12 ${colors.icon} rounded-xl mb-4`}>
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
        {title}
      </h3>

      {/* Metrics Grid */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Votes</span>
          <span className="font-semibold text-gray-900">{votes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">ORI pooled</span>
          <span className="font-semibold text-gray-900">{pooled}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Current price</span>
          <span className={`font-semibold ${colors.text}`}>{currentPrice}</span>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 my-4"></div>

      {/* Insurance Info */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Premium</span>
          <span className={`text-lg font-bold ${colors.text}`}>{premium}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Coverage</span>
          <span className="text-lg font-bold text-gray-900">{coverage}</span>
        </div>
      </div>

      {/* Vote Button */}
      <button className={`w-full mt-4 py-3 ${colors.bg} ${colors.text} rounded-xl font-semibold hover:opacity-80 transition-opacity`}>
        Insure Position
      </button>
    </div>
  );
}
