/**
 * Application constants
 */

export const APP_NAME = 'Lumina';
export const APP_DESCRIPTION = 'Prediction Market Insurance Protocol on BNB Chain';

// Network configuration
export const SUPPORTED_CHAINS = {
  BSC_TESTNET: 97,
  BSC_MAINNET: 56,
} as const;

export const DEFAULT_CHAIN_ID = SUPPORTED_CHAINS.BSC_TESTNET;

// Contract limits
export const POLICY_LIMITS = {
  MIN_COVERAGE: 0.01, // USDT
  MAX_COVERAGE: 100, // USDT
  MIN_DURATION: 7, // days
  MAX_DURATION: 90, // days
} as const;

export const POOL_LIMITS = {
  MIN_DEPOSIT: 1, // USDT
  MAX_UTILIZATION: 0.8, // 80%
} as const;

// Premium calculation
export const PREMIUM_CONFIG = {
  BASE_RATE: 0.02, // 2%
  MAX_RATE: 0.1, // 10%
  UTILIZATION_MULTIPLIER: 2,
} as const;

// UI constants
export const TOAST_DURATION = {
  SUCCESS: 5000,
  ERROR: 7000,
  INFO: 4000,
  WARNING: 6000,
} as const;

export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Polling intervals (ms)
export const POLLING_INTERVAL = {
  BALANCE: 10000,
  POOL_INFO: 15000,
  POLICY_STATUS: 20000,
} as const;

// Transaction confirmations
export const REQUIRED_CONFIRMATIONS = 2;

// External links
export const LINKS = {
  GITHUB: 'https://github.com/lumina-protocol',
  TWITTER: 'https://twitter.com/lumina_protocol',
  DISCORD: 'https://discord.gg/lumina',
  DOCS: 'https://docs.lumina.finance',
  BSCSCAN_TESTNET: 'https://testnet.bscscan.com',
  BSCSCAN_MAINNET: 'https://bscscan.com',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  TRANSACTION_REJECTED: 'Transaction was rejected',
  NETWORK_ERROR: 'Network error. Please try again',
  INVALID_INPUT: 'Invalid input value',
  CONTRACT_ERROR: 'Contract interaction failed',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  POLICY_CREATED: 'Insurance policy created successfully!',
  LIQUIDITY_ADDED: 'Liquidity added successfully!',
  LIQUIDITY_REMOVED: 'Liquidity removed successfully!',
  CLAIM_SUBMITTED: 'Claim submitted successfully!',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  THEME: 'lumina_theme',
  WALLET_PREFERENCE: 'lumina_wallet',
  DISMISSED_BANNERS: 'lumina_dismissed_banners',
} as const;

// Feature flags
export const FEATURES = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_TESTNET: process.env.NEXT_PUBLIC_ENABLE_TESTNET === 'true',
  ENABLE_NOTIFICATIONS: true,
} as const;
