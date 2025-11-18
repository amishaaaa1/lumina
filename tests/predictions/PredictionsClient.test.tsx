import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import PredictionsClient from '@/app/predictions/PredictionsClient';

// Mock wagmi hooks
vi.mock('wagmi', () => ({
  useAccount: () => ({ isConnected: false, address: undefined }),
  useConnect: () => ({ connect: vi.fn() }),
}));

vi.mock('@rainbow-me/rainbowkit', () => ({
  useConnectModal: () => ({ openConnectModal: vi.fn() }),
}));

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({
    toasts: [],
    addToast: vi.fn(),
    dismissToast: vi.fn(),
  }),
}));

describe('PredictionsClient', () => {
  it('renders prediction markets heading', () => {
    render(<PredictionsClient />);
    expect(screen.getByText(/prediction markets/i)).toBeInTheDocument();
  });
  
  it('shows connect wallet prompt when disconnected', () => {
    render(<PredictionsClient />);
    expect(screen.getByText(/connect wallet/i)).toBeInTheDocument();
  });
  
  it('displays market statistics', async () => {
    render(<PredictionsClient />);
    
    await waitFor(() => {
      // Should show stats cards
      expect(screen.getByText(/markets/i)).toBeInTheDocument();
      expect(screen.getByText(/votes/i)).toBeInTheDocument();
      expect(screen.getByText(/volume/i)).toBeInTheDocument();
    });
  });
  
  it('renders filter buttons', () => {
    render(<PredictionsClient />);
    
    expect(screen.getByText(/all/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/resolved/i)).toBeInTheDocument();
  });
  
  it('shows search input', () => {
    render(<PredictionsClient />);
    
    const searchInput = screen.getByPlaceholderText(/search markets/i);
    expect(searchInput).toBeInTheDocument();
  });
});
