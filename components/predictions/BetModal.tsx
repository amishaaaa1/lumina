'use client';

import { useState } from 'react';

interface Market {
  id: string;
  protocol: string;
  question: string;
  icon: string;
  riskType: string;
  yesOdds: string;
  noOdds: string;
  yesPool: number;
  noPool: number;
  insuranceEnabled: boolean;
}

interface BetModalProps {
  market: Market;
  onClose: () => void;
  onConfirm: (outcome: 'Yes' | 'No', amount: string, withInsurance: boolean) => void;
  placing: boolean;
}

export function BetModal({ market, onClose, onConfirm, placing }: BetModalProps) {
  const [outcome, setOutcome] = useState<'Yes' | 'No'>('Yes');
  const [amount, setAmount] = useState('');
  const [withInsurance, setWithInsurance] = useState(false);

  const calculatePayout = () => {
    if (!amount) return 0;
    const amt = parseFloat(amount);
    const oppositePool = outcome === 'Yes' ? market.noPool : market.yesPool;
    const myPool = outcome === 'Yes' ? market.yesPool : market.noPool;
    
    if (myPool === 0) return amt * 2;
    const share = amt / (myPool + amt);
    return amt + (oppositePool * share);
  };

  const insurancePremium = parseFloat(amount) * 0.15 || 0; // 15% premium
  const insuranceRefund = parseFloat(amount) * 0.5 || 0; // 50% refund if lose

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-gray-50">
              {market.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{market.protocol}</h3>
              <p className="text-xs text-gray-500">{market.riskType}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Outcome Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Your prediction
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setOutcome('Yes')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  outcome === 'Yes'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600">YES</div>
                <div className="text-2xl font-bold text-green-600">{market.yesOdds}%</div>
                <div className="text-xs text-gray-500">${(market.yesPool / 1000).toFixed(0)}K</div>
              </button>
              <button
                onClick={() => setOutcome('No')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  outcome === 'No'
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-xs text-gray-600">NO</div>
                <div className="text-2xl font-bold text-red-600">{market.noOdds}%</div>
                <div className="text-xs text-gray-500">${(market.noPool / 1000).toFixed(0)}K</div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Amount (USDC)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-900 focus:border-gray-900 focus:outline-none"
            />
            <div className="flex gap-2 mt-2">
              {[10, 50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt.toString())}
                  className="flex-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded transition-colors"
                >
                  ${amt}
                </button>
              ))}
            </div>
          </div>

          {/* Insurance */}
          {market.insuranceEnabled && (
            <label className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-100 rounded-lg cursor-pointer">
              <input
                type="checkbox"
                checked={withInsurance}
                onChange={(e) => setWithInsurance(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900">Add insurance</div>
                <div className="text-xs text-blue-700 mt-0.5">
                  Get ${insuranceRefund.toFixed(2)} back if you lose • Premium: ${insurancePremium.toFixed(2)}
                </div>
              </div>
            </label>
          )}

          {/* Payout */}
          {amount && parseFloat(amount) > 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Your stake</span>
                <span className="font-medium">${parseFloat(amount).toFixed(2)}</span>
              </div>
              {withInsurance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Insurance premium</span>
                  <span className="font-medium text-blue-600">-${insurancePremium.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Potential payout</span>
                <span className="font-medium">${calculatePayout().toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-300 flex justify-between">
                <span className="font-medium text-gray-900">Potential profit</span>
                <span className="font-bold text-green-600">
                  +${(calculatePayout() - parseFloat(amount)).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={() => onConfirm(outcome, amount, withInsurance)}
            disabled={!amount || placing || parseFloat(amount) <= 0}
            className={`w-full py-3 rounded-lg font-medium transition-colors ${
              !amount || placing || parseFloat(amount) <= 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800'
            }`}
          >
            {placing ? 'Processing...' : `Place ${amount || '0'} USDC on ${outcome}`}
          </button>
        </div>
      </div>
    </div>
  );
}
