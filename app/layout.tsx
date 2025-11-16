import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Toaster } from 'sonner';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Lumina - Prediction Market Insurance Protocol',
    template: '%s | Lumina',
  },
  description: 'Hedge your prediction market positions with decentralized insurance on BNB Chain. Traders protect downside, LPs earn premiums.',
  keywords: ['prediction markets', 'insurance', 'DeFi', 'BNB Chain', 'crypto insurance', 'hedging', 'liquidity pools'],
  authors: [{ name: 'Lumina Protocol' }],
  creator: 'Lumina Protocol',
  publisher: 'Lumina Protocol',
  openGraph: {
    title: 'Lumina - Prediction Market Insurance',
    description: 'Decentralized insurance for prediction markets on BNB Chain',
    type: 'website',
    locale: 'en_US',
    siteName: 'Lumina Protocol',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lumina - Prediction Market Insurance',
    description: 'Hedge your bets. Earn from risk.',
    creator: '@LuminaProtocol',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-neutral-950 dark:to-neutral-900">
        <Providers>
          {children}
          <Toaster 
            position="top-right" 
            expand={false}
            richColors
            closeButton
            duration={4000}
          />
        </Providers>
      </body>
    </html>
  );
}
