'use client';

import { useState } from 'react';

export type ResolutionTier = 'automated' | 'manual' | 'arbitration';

export interface DataSource {
  name: string;
  status: 'confirmed' | 'pending' | 'failed';
  confidence: number;
  timestamp: string;
}

export interface ResolutionStatusProps {
  tier: ResolutionTier;
  // Tier 1: Automated
  dataSources?: DataSource[];
  consensus?: number;
  // Tier 2: Manual
  proposer?: string;
  evidenceUrl?: string;
  disputeWindowEnd?: string;
  bondAmount?: string;
  // Tier 3: Arbitration
  arbitratorCount?: number;
  proposalEvidence?: string;
  disputeEvidence?: string;
  expectedResolution?: string;
}

export function MarketResolutionStatus({
  tier,
  dataSources,
  consensus,
  proposer,
  evidenceUrl,
  disputeWindowEnd,
  bondAmount,
  arbitratorCount,
  proposalEvidence,
  disputeEvidence,
  expectedResolution,
}: ResolutionStatusProps) {
  const [showEvidence, setShowEvidence] = useState(false);

  // Tier 1: Automated Resolution
  if (tier === 'automated') {
    const confirmedSources = dataSources?.filter(s => s.status === 'confirmed').length || 0;
    const totalSources = dataSources?.length || 0;
    
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-blue-900">🤖 Auto-Resolve</span>
              <span className="px-2 py-0.5 bg-blue-200 text-blue-800 text-xs font-semibold rounded-full">
                Tier 1
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-blue-700 font-medium">Data Sources</span>
                <span className="text-blue-900 font-bold">
                  {confirmedSources}/{totalSources} Confirmed
                </span>
              </div>
              
              {consensus && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-700 font-medium">Consensus</span>
                  <span className="text-blue-900 font-bold">{consensus}%</span>
                </div>
              )}
              
              {/* Data Sources List */}
              {dataSources && dataSources.length > 0 && (
                <div className="mt-3 space-y-2">
                  {dataSources.map((source, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        {source.status === 'confirmed' ? (
                          <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : source.status === 'pending' ? (
                          <svg className="w-4 h-4 text-yellow-600 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span className="text-xs font-medium text-gray-700">{source.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{source.confidence}%</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-3 flex items-center gap-2 text-xs text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Resolves instantly when criteria met</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tier 2: Manual Review
  if (tier === 'manual') {
    const timeRemaining = disputeWindowEnd ? new Date(disputeWindowEnd).getTime() - Date.now() : 0;
    const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));
    
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-amber-900">👤 Manual Review</span>
              <span className="px-2 py-0.5 bg-amber-200 text-amber-800 text-xs font-semibold rounded-full">
                Tier 2
              </span>
            </div>
            
            <div className="space-y-2">
              {proposer && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 font-medium">Resolver</span>
                  <span className="text-amber-900 font-mono text-xs">
                    {proposer.slice(0, 6)}...{proposer.slice(-4)}
                  </span>
                </div>
              )}
              
              {bondAmount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 font-medium">Bond Posted</span>
                  <span className="text-amber-900 font-bold">{bondAmount} USDC</span>
                </div>
              )}
              
              {disputeWindowEnd && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 font-medium">Dispute Window</span>
                  <span className={`font-bold ${hoursRemaining < 6 ? 'text-red-600' : 'text-amber-900'}`}>
                    {hoursRemaining}h remaining
                  </span>
                </div>
              )}
              
              {evidenceUrl && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowEvidence(!showEvidence)}
                    className="w-full flex items-center justify-between bg-white/50 hover:bg-white/80 rounded-lg px-3 py-2 transition-colors"
                  >
                    <span className="text-xs font-medium text-amber-900">📄 View Evidence</span>
                    <svg 
                      className={`w-4 h-4 text-amber-600 transition-transform ${showEvidence ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {showEvidence && (
                    <div className="mt-2 bg-white/50 rounded-lg p-3">
                      <a 
                        href={evidenceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline break-all"
                      >
                        {evidenceUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-100/50 rounded-lg p-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Anyone can dispute with counter-evidence until window closes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tier 3: Arbitration
  if (tier === 'arbitration') {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold text-purple-900">⚖️ Under Arbitration</span>
              <span className="px-2 py-0.5 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">
                Tier 3
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs font-bold text-red-900">Disputed - Outcome Contested</span>
                </div>
              </div>
              
              {arbitratorCount && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700 font-medium">Arbitrators</span>
                  <span className="text-purple-900 font-bold">{arbitratorCount} reviewing</span>
                </div>
              )}
              
              {expectedResolution && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-purple-700 font-medium">Expected Resolution</span>
                  <span className="text-purple-900 font-bold">{expectedResolution}</span>
                </div>
              )}
              
              {/* Evidence Links */}
              <div className="mt-3 grid grid-cols-2 gap-2">
                {proposalEvidence && (
                  <a
                    href={proposalEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg px-3 py-2 transition-colors"
                  >
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-green-900">Proposal</span>
                  </a>
                )}
                
                {disputeEvidence && (
                  <a
                    href={disputeEvidence}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg px-3 py-2 transition-colors"
                  >
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-xs font-medium text-red-900">Dispute</span>
                  </a>
                )}
              </div>
              
              <div className="mt-3 flex items-start gap-2 text-xs text-purple-700 bg-purple-100/50 rounded-lg p-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Multi-sig arbitrators will review evidence and make final binding decision</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
