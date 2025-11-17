import { useEffect, useRef, useCallback } from 'react';

interface UsePollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: UsePollingOptions = {}
) {
  const { interval = 10000, enabled = true, onError } = options;
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const poll = useCallback(async () => {
    try {
      await savedCallback.current();
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Polling error'));
    }
  }, [onError]);

  useEffect(() => {
    if (!enabled) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      return;
    }

    const runPolling = async () => {
      await poll();
      timeoutRef.current = setTimeout(runPolling, interval);
    };

    runPolling();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, interval, poll]);
}
