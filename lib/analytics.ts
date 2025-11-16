/**
 * Analytics and performance monitoring
 */

export const analytics = {
  // Track page views
  pageview: (url: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_path: url,
      });
    }
  },

  // Track events
  event: (action: string, params?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', action, params);
    }
  },

  // Track wallet connections
  walletConnected: (walletName: string) => {
    analytics.event('wallet_connected', {
      wallet_name: walletName,
    });
  },

  // Track policy purchases
  policyPurchased: (marketId: string, coverage: string, premium: string) => {
    analytics.event('policy_purchased', {
      market_id: marketId,
      coverage_amount: coverage,
      premium_amount: premium,
    });
  },

  // Track liquidity deposits
  liquidityDeposited: (amount: string) => {
    analytics.event('liquidity_deposited', {
      amount,
    });
  },

  // Track errors
  error: (error: Error, context?: string) => {
    analytics.event('error', {
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
    console.error('Analytics error:', error, context);
  },
};

// Web Vitals reporting
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    analytics.event('web_vitals', {
      name: metric.name,
      value: Math.round(metric.value),
      label: metric.id,
    });
  }
}

// Extend Window type for gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
