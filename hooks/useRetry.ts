import { useState, useCallback } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number) => void;
}

export function useRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const retry = useCallback(
    async <T>(
      fn: () => Promise<T>,
      options: RetryOptions = {}
    ): Promise<T> => {
      const {
        maxAttempts = 3,
        delay = 1000,
        backoff = true,
        onRetry,
      } = options;

      setIsRetrying(true);
      let lastError: Error;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          setAttempts(attempt);
          const result = await fn();
          setIsRetrying(false);
          setAttempts(0);
          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          
          if (attempt < maxAttempts) {
            onRetry?.(attempt);
            const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }

      setIsRetrying(false);
      setAttempts(0);
      throw lastError!;
    },
    []
  );

  return { retry, isRetrying, attempts };
}
