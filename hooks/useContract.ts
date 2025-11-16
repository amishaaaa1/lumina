import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState, useCallback } from 'react';

export function useContractWrite() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });
  const [localError, setLocalError] = useState<string | null>(null);

  const write = useCallback(
    async (config: Parameters<typeof writeContract>[0]) => {
      try {
        setLocalError(null);
        await writeContract(config);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Transaction failed';
        setLocalError(message);
        throw err;
      }
    },
    [writeContract]
  );

  return {
    write,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error: localError || error?.message,
  };
}
