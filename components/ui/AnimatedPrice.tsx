'use client';

import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';

interface AnimatedPriceProps {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

export function AnimatedPrice({ value, decimals = 1, suffix = '%', className = '' }: AnimatedPriceProps) {
  const animatedValue = useAnimatedNumber(value, 800); // Longer duration for smoother animation

  return (
    <span className={`inline-flex items-center gap-1 transition-all duration-500 ${className}`}>
      <span className="transition-all duration-500">
        {animatedValue.toFixed(decimals)}{suffix}
      </span>
    </span>
  );
}
