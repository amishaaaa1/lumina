import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useOptimisticUpdate<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (
      updateFn: () => Promise<T>,
      options?: OptimisticUpdateOptions<T>
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await updateFn();
        
        if (options?.successMessage) {
          toast.success(options.successMessage);
        }
        
        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        
        if (options?.errorMessage) {
          toast.error(options.errorMessage);
        } else {
          toast.error(error.message);
        }
        
        options?.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { execute, isLoading, error };
}
