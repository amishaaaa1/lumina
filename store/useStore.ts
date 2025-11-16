/**
 * Global state management with Zustand
 * Enhanced with persistence, devtools, and optimistic updates
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Policy, PoolInfo, PredictionMarket } from '@/lib/types';

interface Transaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  type: string;
  timestamp: number;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
}

interface AppState {
  // User data
  userPolicies: Policy[];
  setUserPolicies: (policies: Policy[]) => void;
  addPolicy: (policy: Policy) => void;
  updatePolicy: (policyId: string, updates: Partial<Policy>) => void;
  removePolicy: (policyId: string) => void;
  
  // Pool data
  poolInfo: PoolInfo | null;
  setPoolInfo: (info: PoolInfo) => void;
  updatePoolInfo: (updates: Partial<PoolInfo>) => void;
  
  // Markets
  markets: PredictionMarket[];
  setMarkets: (markets: PredictionMarket[]) => void;
  addMarket: (market: PredictionMarket) => void;
  updateMarket: (marketId: string, updates: Partial<PredictionMarket>) => void;
  
  // Transactions
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
  clearTransactions: () => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // UI state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Theme
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  
  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // User data
        userPolicies: [],
        setUserPolicies: (policies) => set({ userPolicies: policies }),
        addPolicy: (policy) => set((state) => ({
          userPolicies: [...state.userPolicies, policy],
        })),
        updatePolicy: (policyId, updates) => set((state) => ({
          userPolicies: state.userPolicies.map((p) =>
            p.id === policyId ? { ...p, ...updates } : p
          ),
        })),
        removePolicy: (policyId) => set((state) => ({
          userPolicies: state.userPolicies.filter((p) => p.id !== policyId),
        })),
        
        // Pool data
        poolInfo: null,
        setPoolInfo: (info) => set({ poolInfo: info }),
        updatePoolInfo: (updates) => set((state) => ({
          poolInfo: state.poolInfo ? { ...state.poolInfo, ...updates } : null,
        })),
        
        // Markets
        markets: [],
        setMarkets: (markets) => set({ markets }),
        addMarket: (market) => set((state) => ({
          markets: [...state.markets, market],
        })),
        updateMarket: (marketId, updates) => set((state) => ({
          markets: state.markets.map((m) =>
            m.id === marketId ? { ...m, ...updates } : m
          ),
        })),
        
        // Transactions
        transactions: [],
        addTransaction: (tx) => set((state) => ({
          transactions: [tx, ...state.transactions].slice(0, 50), // Keep last 50
        })),
        updateTransaction: (hash, updates) => set((state) => ({
          transactions: state.transactions.map((tx) =>
            tx.hash === hash ? { ...tx, ...updates } : tx
          ),
        })),
        clearTransactions: () => set({ transactions: [] }),
        
        // Notifications
        notifications: [],
        addNotification: (notification) => set((state) => ({
          notifications: [
            {
              ...notification,
              id: Math.random().toString(36).substr(2, 9),
              timestamp: Date.now(),
            },
            ...state.notifications,
          ].slice(0, 10), // Keep last 10
        })),
        removeNotification: (id) => set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),
        clearNotifications: () => set({ notifications: [] }),
        
        // UI state
        isLoading: false,
        setIsLoading: (loading) => set({ isLoading: loading }),
        
        error: null,
        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),
        
        // Theme
        theme: 'system',
        setTheme: (theme) => set({ theme }),
        
        // Sidebar
        sidebarOpen: true,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      }),
      {
        name: 'lumina-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);
