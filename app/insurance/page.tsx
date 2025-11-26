import { Suspense } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import InsuranceWrapper from './InsuranceWrapper';

export const metadata = {
  title: 'Buy Insurance - Lumina',
  description: 'Protect your prediction market positions with decentralized insurance',
};

export default function InsurancePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Background Effects - Same as Landing Page */}
      <div className="relative">
        {/* Animated Gradient Orb */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/30 via-purple-400/20 to-pink-400/30 rounded-full blur-3xl animate-orb-slow will-change-transform pointer-events-none" aria-hidden="true" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-blue-200/30 rounded-full blur-xl animate-float-6s delay-0 will-change-transform pointer-events-none" aria-hidden="true" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-purple-200/30 rounded-full blur-xl animate-float-8s delay-1s will-change-transform pointer-events-none" aria-hidden="true" />
        <div className="absolute bottom-40 left-1/4 w-24 h-24 bg-pink-200/30 rounded-full blur-xl animate-float-7s delay-2s will-change-transform pointer-events-none" aria-hidden="true" />
        
        {/* Content */}
        <div className="relative px-6 py-24">
          <Suspense fallback={
            <div className="flex items-center justify-center py-32">
              <LoadingSpinner size="lg" />
            </div>
          }>
            <InsuranceWrapper />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
