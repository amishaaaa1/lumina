/**
 * Input validation utilities
 */

import { POLICY_LIMITS, POOL_LIMITS } from './constants';

export const validation = {
  // Validate coverage amount
  coverageAmount: (value: string): { valid: boolean; error?: string } => {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { valid: false, error: 'Please enter a valid number' };
    }

    if (num < POLICY_LIMITS.MIN_COVERAGE) {
      return {
        valid: false,
        error: `Minimum coverage is ${POLICY_LIMITS.MIN_COVERAGE} USDT`,
      };
    }

    if (num > POLICY_LIMITS.MAX_COVERAGE) {
      return {
        valid: false,
        error: `Maximum coverage is ${POLICY_LIMITS.MAX_COVERAGE} USDT`,
      };
    }

    return { valid: true };
  },

  // Validate deposit amount
  depositAmount: (value: string, balance?: bigint): { valid: boolean; error?: string } => {
    const num = parseFloat(value);

    if (isNaN(num)) {
      return { valid: false, error: 'Please enter a valid number' };
    }

    if (num < POOL_LIMITS.MIN_DEPOSIT) {
      return {
        valid: false,
        error: `Minimum deposit is ${POOL_LIMITS.MIN_DEPOSIT} USDT`,
      };
    }

    if (balance !== undefined) {
      const balanceNum = Number(balance) / 1e6; // Assuming 6 decimals
      if (num > balanceNum) {
        return { valid: false, error: 'Insufficient balance' };
      }
    }

    return { valid: true };
  },

  // Validate duration
  duration: (days: number): { valid: boolean; error?: string } => {
    if (days < POLICY_LIMITS.MIN_DURATION) {
      return {
        valid: false,
        error: `Minimum duration is ${POLICY_LIMITS.MIN_DURATION} days`,
      };
    }

    if (days > POLICY_LIMITS.MAX_DURATION) {
      return {
        valid: false,
        error: `Maximum duration is ${POLICY_LIMITS.MAX_DURATION} days`,
      };
    }

    return { valid: true };
  },

  // Validate Ethereum address
  address: (address: string): { valid: boolean; error?: string } => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return { valid: false, error: 'Invalid Ethereum address' };
    }
    return { valid: true };
  },

  // Validate market ID
  marketId: (id: string): { valid: boolean; error?: string } => {
    if (!id || id.trim().length === 0) {
      return { valid: false, error: 'Market ID is required' };
    }

    if (id.length > 100) {
      return { valid: false, error: 'Market ID is too long' };
    }

    return { valid: true };
  },

  // Sanitize user input
  sanitize: (input: string): string => {
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .slice(0, 1000); // Limit length
  },
};

// Form validation helper
export function validateForm<T extends Record<string, unknown>>(
  values: T,
  validators: Partial<Record<keyof T, (value: unknown) => { valid: boolean; error?: string }>>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {};
  let valid = true;

  for (const [key, validator] of Object.entries(validators)) {
    if (!validator) continue;
    const result = validator(values[key as keyof T]);
    if (!result.valid) {
      errors[key as keyof T] = result.error;
      valid = false;
    }
  }

  return { valid, errors };
}
