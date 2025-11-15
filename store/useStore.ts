/**
 * Global state management with Zustand
 */

import { create } from 'zustand';
import type { Policy, PoolInfo, PredictionMarket } from '@/lib/types';

interface AppState {
  // User data
  userPolicies: Policy[];
  setUserPolicies: (policies: Policy[]) => void;
  
  // Pool data
  poolInfo: PoolInfo | null;
  setPoolInfo: (info: PoolInfo) => void;
  
  // Markets
  markets: PredictionMarket[];
  setMarkets: (markets: PredictionMarket[]) => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set) => ({
  // User data
  userPolicies: [],
  setUserPolicies: (policies) => set({ userPolicies: policies }),
  
  // Pool data
  poolInfo: null,
  setPoolInfo: (info) => set({ poolInfo: info }),
  
  // Markets
  markets: [],
  setMarkets: (markets) => set({ markets }),
  
  // UI state
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  error: null,
  setError: (error) => set({ error }),
}));
