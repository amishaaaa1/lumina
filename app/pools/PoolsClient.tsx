'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Container } from '@/components/layout/Container';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/hooks/useToast';
import { CONTRACTS, ASSET_TOKEN } from '@/lib/contracts';
import { TrendingUp, DollarSign, Shield, Users, Percent } from 'lucide-react';

export function PoolsClient() {
  const { address, isConnected } = useAccount();
  const { showToast } = useToast();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // Read pool info
  const { data: poolInfo, refetch: refetchPool } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'getPoolInfo',
  });

  // Read user LP balance
  const { data: userProviderInfo, refetch: refetchShares } = useReadContract({
    ...CONTRACTS.InsurancePool,
    functionName: 'getProviderInfo',
    args: address ? [address] : undefined,
  });
  
  const userShares = userProviderInfo ? userProviderInfo.shares : 0n;

  // Read USDT balance
  const { data: usdtBalance } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  // Read USDT allowance
  const { data: usdtAllowance } = useReadContract({
    ...ASSET_TOKEN,
    functionName: 'allowance',
    args: address ? [address, CONTRACTS.InsurancePool.address] : undefined,
  });

  // Write contracts
  const { writeContract: approveToken, data: approveHash, isPending: isApprovePending } = useWriteContract();
  const { writeContract: depositLP, data: depositHash, isPending: isDepositPending } = useWriteContract();
  const { writeContract: withdrawLP, data: withdrawHash, isPending: isWithdrawPending } = useWriteContract();

  const { isLoading: isApproving, isSuccess: isApproveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });
  const { isLoading: isDepositing, isSuccess: isDepositSuccess } = useWaitForTransactionReceipt({ hash: depositHash });
  const { isLoading: isWithdrawing, isSuccess: isWithdrawSuccess } = useWaitForTransactionReceipt({ hash: withdrawHash });

  // Auto-deposit after approval
  useEffect(() => {
    if (isApproveSuccess && depositAmount) {
      const amount = parseUnits(depositAmount, 18);
      depositLP({
        ...CONTRACTS.InsurancePool,
        functionName: 'deposit',
        args: [amount],
      });
    }
  }, [isApproveSuccess, depositAmount, depositLP]);

  // Success handlers
  useEffect(() => {
    if (isDepositSuccess) {
      showToast('✅ Deposit successful! You are now earning premiums', 'success');
      setShowDepositModal(false);
      setDepositAmount('');
      refetchPool();
      refetchShares();
    }
  }, [isDepositSuccess, showToast, refetchPool, refetchShares]);

  useEffect(() => {
    if (isWithdrawSuccess) {
      showToast('✅ Withdrawal successful!', 'success');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      refetchPool();
      refetchShares();
    }
  }, [isWithdrawSuccess, showToast, refetchPool, refetchShares]);

  // Calculate APR
  const calculateAPR = () => {
    if (!poolInfo) return 0;
    
    const totalLiquidity = Number(formatUnits(poolInfo.totalLiquidity, 18));
    const totalPremiums = Number(formatUnits(poolInfo.totalPremiums, 18));
    
    if (totalLiquidity === 0) return 0;
    
    // Annualized APR based on premiums collected
    const apr = (totalPremiums / totalLiquidity) * 365 * 100;
    return Math.min(apr, 150); // Cap at 150%
  };

  // Calculate user value (based on share of pool)
  const calculateUserValue = () => {
    if (!poolInfo || !userProviderInfo) return 0;
    
    const depositedAmount = Number(formatUnits(userProviderInfo.depositedAmount, 18));
    const earnedPremiums = Number(formatUnits(userProviderInfo.earnedPremiums, 18));
    
    // User value = deposited + earned premiums
    return depositedAmount + earnedPremiums;
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      showToast('Enter valid amount', 'error');
      return;
    }

    const amount = parseUnits(depositAmount, 18);
    const currentAllowance = usdtAllowance || 0n;

    if (currentAllowance < amount) {
      showToast('Step 1/2: Approving USDT...', 'info');
      approveToken({
        ...ASSET_TOKEN,
        functionName: 'approve',
        args: [CONTRACTS.InsurancePool.address, amount],
      });
    } else {
      showToast('Depositing to pool...', 'info');
      depositLP({
        ...CONTRACTS.InsurancePool,
        functionName: 'deposit',
        args: [amount],
      });
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      showToast('Enter valid amount', 'error');
      return;
    }

    const shares = parseUnits(withdrawAmount, 18);
    
    showToast('Withdrawing from pool...', 'info');
    withdrawLP({
      ...CONTRACTS.InsurancePool,
      functionName: 'withdraw',
      args: [shares],
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Container className="py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
            <p className="text-gray-600 mb-6">
              Connect to provide liquidity and earn premiums
            </p>
          </Card>
        </Container>
      </div>
    );
  }

  const apr = calculateAPR();
  const userValue = calculateUserValue();
  const utilizationRate = poolInfo ? Number(poolInfo.utilizationRate) / 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <Container className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Liquidity Pools</h1>
          <p className="text-gray-600">Provide liquidity and earn premiums from insurance policies</p>
        </div>

        {/* Pool Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Liquidity</span>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              ${poolInfo ? (Number(formatUnits(poolInfo.totalLiquidity, 18)) / 1000000).toFixed(2) : '0'}M
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current APR</span>
              <Percent className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-green-600">
              {apr.toFixed(1)}%
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Utilization</span>
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              {utilizationRate.toFixed(1)}%
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Total Claims</span>
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold">
              ${poolInfo ? (Number(formatUnits(poolInfo.totalClaims, 18)) / 1000).toFixed(1) : '0'}K
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Pool Card */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-6">USDT Insurance Pool</h2>
              
              <div className="space-y-6">
                {/* Pool Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Available Liquidity</div>
                    <div className="text-xl font-bold text-green-600">
                      ${poolInfo ? (Number(formatUnits(poolInfo.availableLiquidity, 18)) / 1000000).toFixed(2) : '0'}M
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Total Premiums Collected</div>
                    <div className="text-xl font-bold">
                      ${poolInfo ? (Number(formatUnits(poolInfo.totalPremiums, 18)) / 1000).toFixed(1) : '0'}K
                    </div>
                  </div>
                </div>

                {/* How it Works */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">How LP Staking Works</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Deposit USDT to provide insurance coverage</li>
                    <li>• Earn {apr.toFixed(1)}% APR from insurance premiums</li>
                    <li>• Payouts come from your staked liquidity</li>
                    <li>• Withdraw anytime (if liquidity available)</li>
                  </ul>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                  <Button 
                    onClick={() => setShowDepositModal(true)}
                    className="flex-1"
                  >
                    Deposit USDT
                  </Button>
                  <Button 
                    onClick={() => setShowWithdrawModal(true)}
                    variant="secondary"
                    className="flex-1"
                    disabled={!userShares || userShares === 0n}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* User Position */}
          <div>
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Your Position</h3>
              
              {userShares && userShares > 0n ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Your Liquidity</div>
                    <div className="text-2xl font-bold">
                      ${userValue.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">LP Shares</div>
                    <div className="text-lg font-medium">
                      {Number(formatUnits(userShares, 18)).toFixed(2)}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Est. Annual Earnings</div>
                    <div className="text-lg font-medium text-green-600">
                      ${(userValue * apr / 100).toFixed(2)}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      Pool Share: {poolInfo && userProviderInfo && Number(poolInfo.totalLiquidity) > 0 
                        ? ((Number(formatUnits(userProviderInfo.depositedAmount, 18)) / Number(formatUnits(poolInfo.totalLiquidity, 18))) * 100).toFixed(4)
                        : '0'}%
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm mb-4">
                    No liquidity provided yet
                  </p>
                  <Button 
                    size="sm"
                    onClick={() => setShowDepositModal(true)}
                  >
                    Start Earning
                  </Button>
                </div>
              )}
            </Card>

            {/* Risk Info */}
            <Card className="p-6 mt-6">
              <h3 className="font-semibold mb-3 text-sm">Risk Factors</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <p>• Smart contract risk</p>
                <p>• Impermanent loss from claims</p>
                <p>• Utilization affects withdrawals</p>
                <p>• APR varies with premium volume</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Deposit Modal */}
        <Modal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          title="Deposit USDT"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (USDT)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="1000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Balance: {usdtBalance ? Number(formatUnits(usdtBalance, 18)).toFixed(2) : '0'} USDT
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-600">Est. APR</span>
                <span className="font-semibold">{apr.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Est. Annual Earnings</span>
                <span className="font-semibold text-green-600">
                  ${depositAmount ? (parseFloat(depositAmount) * apr / 100).toFixed(2) : '0'}
                </span>
              </div>
            </div>

            <Button
              onClick={handleDeposit}
              disabled={isApprovePending || isApproving || isDepositPending || isDepositing}
              className="w-full"
            >
              {isApprovePending || isApproving || isDepositPending || isDepositing ? (
                <><LoadingSpinner size="sm" /> Processing...</>
              ) : (
                'Deposit'
              )}
            </Button>
          </div>
        </Modal>

        {/* Withdraw Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          title="Withdraw Liquidity"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount (LP Shares)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="100"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your shares: {userShares ? Number(formatUnits(userShares, 18)).toFixed(2) : '0'}
              </p>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">You will receive</span>
                <span className="font-semibold">
                  ~${withdrawAmount ? (parseFloat(withdrawAmount) * userValue / Number(formatUnits(userShares || 0n, 18))).toFixed(2) : '0'} USDT
                </span>
              </div>
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={isWithdrawPending || isWithdrawing}
              className="w-full"
              variant="secondary"
            >
              {isWithdrawPending || isWithdrawing ? (
                <><LoadingSpinner size="sm" /> Processing...</>
              ) : (
                'Withdraw'
              )}
            </Button>
          </div>
        </Modal>
      </Container>
    </div>
  );
}
