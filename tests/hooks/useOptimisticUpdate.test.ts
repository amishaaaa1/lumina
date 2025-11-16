import { describe, it, expect, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticUpdate } from '@/hooks/useOptimisticUpdate';

describe('useOptimisticUpdate', () => {
  it('executes update successfully', async () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const mockFn = vi.fn().mockResolvedValue('success');
    
    await act(async () => {
      const res = await result.current.execute(mockFn);
      expect(res).toBe('success');
    });
    
    expect(mockFn).toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('handles errors correctly', async () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const mockError = new Error('Test error');
    const mockFn = vi.fn().mockRejectedValue(mockError);
    
    await act(async () => {
      try {
        await result.current.execute(mockFn);
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });
    
    expect(result.current.error).toBe(mockError);
    expect(result.current.isLoading).toBe(false);
  });

  it('calls success callback', async () => {
    const { result } = renderHook(() => useOptimisticUpdate());
    
    const onSuccess = vi.fn();
    const mockFn = vi.fn().mockResolvedValue('data');
    
    await act(async () => {
      await result.current.execute(mockFn, { onSuccess });
    });
    
    expect(onSuccess).toHaveBeenCalledWith('data');
  });
});
