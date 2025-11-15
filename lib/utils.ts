/**
 * Utility functions
 */

import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(amount: bigint, decimals: number = 18): string {
  const value = Number(amount) / Math.pow(10, decimals);
  
  if (value === 0) return '0.00';
  if (value < 0.01) return '<0.01';
  if (value > 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value > 1000) return `${(value / 1000).toFixed(2)}K`;
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value);
}

export function formatUSD(amount: bigint, decimals: number = 18): string {
  const value = Number(amount) / Math.pow(10, decimals);
  
  if (value === 0) return '$0.00';
  if (value < 0.01) return '<$0.01';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: bigint, basis: bigint = 10000n): string {
  const percentage = (Number(value) / Number(basis)) * 100;
  return `${percentage.toFixed(1)}%`;
}

export function parseTokenAmount(amount: string, decimals: number = 18): bigint {
  try {
    const value = parseFloat(amount);
    if (isNaN(value)) return 0n;
    return BigInt(Math.floor(value * Math.pow(10, decimals)));
  } catch {
    return 0n;
  }
}

export function timeUntil(timestamp: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const diff = Number(timestamp - now);
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  
  if (days > 7) return `${days} days`;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h`;
  return `<1h`;
}
