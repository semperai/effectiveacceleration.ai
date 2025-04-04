'use client';
import { Layout } from '@/components/Dashboard/Layout';
import { Button } from '@/components/Button';
import { formatEther } from 'viem';
import { useToast } from '@/hooks/useToast';
import { WelcomeScreen } from './WelcomeScreen';
import { NetworkSwitcher } from './NetworkSwitcher';
import { useStaking } from '@/hooks/wagmi/useStaking';
import { useEffect } from 'react';

export default function StakingPage() {
  const { showError } = useToast();

  const {
    amount,
    setAmount,
    lockupPeriod,
    setLockupPeriod,
    isEACCStaking,
    setIsEACCStaking,
    multiplier,
    isLoading,
    isConfirming,
    isConfirmed,
    error,

    // Connection state
    isConnected,
    isEthereumMainnet,
    isSwitchingNetwork,

    // Balances
    eaccBalance,
    eaccxBalance,
    isApproved,

    // Actions
    handleApprove,
    handleStake,
    handleUnstake,
    handleMaxAmount,
    handleSwitchToEthereum,
  } = useStaking();

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      showError(
        isEACCStaking
          ? "Error with staking operation. Please try again."
          : "Error creating stream. Please try again."
      );
    }
  }, [error, isEACCStaking, showError]);

  return (
    <Layout>
      <div className="relative mx-auto flex min-h-customHeader flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {!isConnected ? (
          <WelcomeScreen />
        ) : !isEthereumMainnet ? (
          <NetworkSwitcher
            onSwitchNetwork={handleSwitchToEthereum}
            isSwitchingNetwork={isSwitchingNetwork}
          />
        ) : (
          <div className="max-w-2xl mx-auto w-full bg-white p-8 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-center">EACC Staking</h1>

            {/* Staking Options Toggle */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  className={`px-4 py-2 rounded-md ${isEACCStaking ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  onClick={() => setIsEACCStaking(true)}
                >
                  Stake EACC
                </button>
                <button
                  className={`px-4 py-2 rounded-md ${!isEACCStaking ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                  onClick={() => setIsEACCStaking(false)}
                >
                  Create Stream
                </button>
              </div>
            </div>

            {/* Balance Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">EACC Balance</p>
                <p className="text-xl font-semibold">
                  {eaccBalance ? parseFloat(formatEther(eaccBalance)).toFixed(4) : '0.0000'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">EAXX Balance</p>
                <p className="text-xl font-semibold">
                  {eaccxBalance ? parseFloat(formatEther(eaccxBalance)).toFixed(4) : '0.0000'}
                </p>
              </div>
            </div>

            {/* Staking Form */}
            <div className="space-y-4">
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEACCStaking ? 'Amount to Stake' : 'Amount to Stream'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                    placeholder="0.0"
                  />
                  <button
                    type="button"
                    onClick={handleMaxAmount}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm font-medium"
                  >
                    MAX
                  </button>
                </div>
              </div>

              {/* Lockup Period Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lockup Period (weeks)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min={isEACCStaking ? 52 : 1}
                    max={208}
                    value={lockupPeriod}
                    onChange={(e) => setLockupPeriod(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm font-medium">{lockupPeriod} weeks</span>
                </div>
              </div>

              {/* Multiplier Display */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">Multiplier</p>
                <p className="text-xl font-semibold">{parseFloat(multiplier).toFixed(4)}x</p>
                <p className="text-xs text-gray-500">
                  {isEACCStaking
                    ? `You'll receive a stream of ${(parseFloat(amount || '0') * parseFloat(multiplier)).toFixed(4)} EAXX tokens`
                    : `You'll receive a stream of ${(parseFloat(amount || '0') * parseFloat(multiplier)).toFixed(4)} EACC tokens`}
                </p>
              </div>

              {/* Action Buttons */}
              <div>
                {!isApproved ? (
                  <Button
                    className="w-full"
                    onClick={handleApprove}
                    disabled={isLoading || isConfirming}
                  >
                    {isLoading || isConfirming ? 'Approving...' : 'Approve EACC'}
                  </Button>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className="w-full"
                      onClick={handleStake}
                      disabled={isLoading || isConfirming || !amount || parseFloat(amount) <= 0}
                    >
                      {isLoading || isConfirming ? 'Processing...' : isEACCStaking ? 'Stake EACC' : 'Create Stream'}
                    </Button>
                    {isEACCStaking && (
                      <Button
                        className="w-full"
                        onClick={handleUnstake}
                        disabled={isLoading || isConfirming || !amount || parseFloat(amount) <= 0}
                      >
                        {isLoading || isConfirming ? 'Processing...' : 'Unstake'}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Information Box */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-700 mb-2">How it works</h3>
              <p className="text-sm text-blue-600">
                {isEACCStaking
                  ? 'Staking EACC gives you a stream of EAXX tokens based on your lockup period. The longer you lock, the more EAXX you receive. EAXX accrues EACC from others multiplying their tokens.'
                  : 'Create a stream of EACC tokens. The longer the stream duration, the higher the multiplier. The EACC tokens will be streamed to you linearly over the specified period.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
