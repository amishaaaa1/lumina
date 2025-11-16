'use client';

import { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  isLoading?: boolean;
}

export function StatCard({ label, value, isLoading }: StatCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="group text-center cursor-default">
        <div className="h-12 w-24 mx-auto mb-2 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-20 mx-auto bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="group text-center cursor-default">
      <div 
        className={`text-4xl md:text-5xl font-bold text-gray-900 mb-2 transition-all duration-500 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
        } group-hover:scale-110`}
      >
        {value}
      </div>
      <div className="text-sm text-gray-500 group-hover:text-gray-900 transition-colors">
        {label}
      </div>
    </div>
  );
}
