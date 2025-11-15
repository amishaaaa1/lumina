/**
 * Error handling utilities
 */

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Handle specific error types
    if (error.message.includes('User rejected')) {
      return 'Transaction cancelled';
    }
    if (error.message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (error.message.includes('execution reverted')) {
      // Try to extract revert reason
      const match = error.message.match(/reason="([^"]+)"/);
      if (match) {
        return match[1];
      }
      return 'Transaction failed';
    }
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Something went wrong';
}

export function isUserRejection(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('User rejected') || 
           error.message.includes('user rejected');
  }
  return false;
}

export function formatContractError(error: string): string {
  // Make contract errors more user-friendly
  const errorMap: Record<string, string> = {
    'Not enough shares': 'You don\'t have enough shares to withdraw',
    'Pool can\'t cover this': 'Pool doesn\'t have enough liquidity for this coverage',
    'Premium too low': 'Premium amount is too low',
    'Coverage out of range': 'Coverage amount must be between 0.01 and 100',
    'Pool not active': 'Insurance pool is currently inactive',
    'Cannot deposit zero': 'Deposit amount must be greater than zero',
    'Zero premium': 'Premium cannot be zero',
    'Not your policy': 'You don\'t own this policy',
    'Policy expired': 'This policy has expired',
    'Market not resolved yet': 'Market outcome hasn\'t been resolved yet',
  };

  return errorMap[error] || error;
}
