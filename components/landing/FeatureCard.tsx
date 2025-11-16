'use client';

interface FeatureCardProps {
  title: string;
  description: string;
  color?: 'blue' | 'purple' | 'pink';
  step?: string;
}

export function FeatureCard({ title, description, color = 'blue', step }: FeatureCardProps) {
  const colorClasses = {
    blue: 'border-blue-500 hover:shadow-blue-500/10',
    purple: 'border-purple-500 hover:shadow-purple-500/10',
    pink: 'border-pink-500 hover:shadow-pink-500/10',
  };

  const stepColorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    pink: 'text-pink-600',
  };

  return (
    <div className={`bg-white rounded-2xl p-8 border-2 border-gray-200 hover:${colorClasses[color]} hover:shadow-xl transition-all hover:scale-105`}>
      {step && (
        <div className={`text-sm font-semibold ${stepColorClasses[color]} mb-2`}>
          {step}
        </div>
      )}
      <h3 className="text-2xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
