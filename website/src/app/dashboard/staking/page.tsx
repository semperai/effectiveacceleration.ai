'use client';
import { Layout } from '@/components/Dashboard/Layout';
import { Button } from '@/components/Button';
import { formatEther, parseEther } from 'viem';
import { useToast } from '@/hooks/useToast';
import { WelcomeScreen } from './WelcomeScreen';
import { NetworkSwitcher } from './NetworkSwitcher';
import { useStaking } from '@/hooks/wagmi/useStaking';
import { useEffect, useRef } from 'react';
import { StreamsPanel } from './StreamsPanel';

export default function StakingPage() {
  const { showError } = useToast();
  const streamInputRef = useRef<HTMLInputElement | null>(null);

  const {
    stakeAmount,
    setStakeAmount,
    unstakeAmount,
    setUnstakeAmount,
    lockupPeriod,
    setLockupPeriod,
    isEACCStaking,
    setIsEACCStaking,
    multiplier,
    isLoading,
    isStaking,           // New specific state for staking
    isUnstaking,         // New specific state for unstaking
    isApproving,
    isConfirming,
    isConfirmed,
    error,

    // Connection state
    isConnected,
    isArbitrumOne,
    isSwitchingNetwork,

    // Balances
    eaccBalance,
    eaccxBalance,
    isApproved,
    eaccxWorthInEACC,
    eaccxToEACCRatio,

    // Actions
    handleApprove,
    handleStake,
    handleUnstake,
    handleMaxAmount,
    handleSwitchToArbitrum,
  } = useStaking();

  // Input validation function
  const validateAmount = (value: string, maxAmount: bigint) => {
    // Remove non-numeric characters except decimal point
    const sanitizedValue = value.replace(/[^0-9.]/g, '');

    // Ensure only one decimal point
    const parts = sanitizedValue.split('.');
    const cleanValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');

    // Compare with max amount if provided
    if (maxAmount && cleanValue) {
      try {
        const inputAmount = parseFloat(cleanValue);
        const maxAmountFloat = parseFloat(formatEther(maxAmount));

        if (inputAmount > maxAmountFloat) {
          return maxAmountFloat.toString();
        }
      } catch (error) {
        console.error("Error comparing amounts:", error);
      }
    }

    return cleanValue;
  };

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

  // Adjust lockup period when switching between staking modes
  useEffect(() => {
    // If switching to EACC staking (which requires min 52 weeks) and current period is less than 52
    if (isEACCStaking && lockupPeriod < 52) {
      setLockupPeriod(52);
    }
  }, [isEACCStaking, lockupPeriod, setLockupPeriod]);

  // Handle toggling between staking modes
  interface ToggleStakingModeProps {
    stakeMode: boolean;
  }

  const handleToggleStakingMode = ({ stakeMode }: ToggleStakingModeProps): void => {
    // If we're switching to EACC staking and current period is less than 52 weeks
    if (stakeMode && lockupPeriod < 52) {
      setLockupPeriod(52); // Set to minimum for EACC staking
    }
    setIsEACCStaking(stakeMode);

    // If switching to stream creation mode, focus on the input after state update
    if (!stakeMode) {
      // Use setTimeout to ensure this runs after the component re-renders
      setTimeout(() => {
        if (streamInputRef.current) {
          streamInputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <Layout>
      <div className="relative mx-auto flex min-h-customHeader flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        {!isConnected ? (
          <WelcomeScreen />
        ) : !isArbitrumOne ? (
          <NetworkSwitcher
            onSwitchNetwork={handleSwitchToArbitrum}
            isSwitchingNetwork={isSwitchingNetwork}
          />
        ) : (
          <div className="mx-auto w-full max-w-3xl space-y-8">
            {/* Staking Section */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h1 className="text-3xl font-bold mb-6 text-center">EACC Finance</h1>

              {/* Staking Options Toggle */}
              <div className="flex justify-center mb-8">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    className={`px-4 py-2 rounded-md ${isEACCStaking ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                    onClick={() => handleToggleStakingMode({ stakeMode: true })}
                  >
                    Stake EACC
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${!isEACCStaking ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                    onClick={() => handleToggleStakingMode({ stakeMode: false })}
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
                    {eaccBalance && typeof eaccBalance === 'bigint'
                      ? parseFloat(formatEther(eaccBalance)).toFixed(4)
                      : '0.0000'}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500">EAXX Balance</p>
                  <p className="text-xl font-semibold">
                    {eaccxBalance && typeof eaccxBalance === 'bigint'
                      ? parseFloat(formatEther(eaccxBalance)).toFixed(4)
                      : '0.0000'}
                    {eaccxWorthInEACC && typeof eaccxWorthInEACC === 'bigint' && eaccxWorthInEACC > 0 && (
                      <span className="text-sm text-gray-500 ml-2">
                        (~{parseFloat(formatEther(eaccxWorthInEACC)).toFixed(4)} EACC)
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {isEACCStaking ? (
                <div className="space-y-6">
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
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum staking period is 52 weeks (1 year). Longer periods provide better multipliers.
                    </p>
                  </div>

                  {/* Multiplier Display */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Multiplier</p>
                    <p className="text-xl font-semibold">{parseFloat(multiplier).toFixed(4)}x</p>
                    <p className="text-xs text-gray-500">
                      {`You'll receive a stream of ${(parseFloat(stakeAmount || '0') * parseFloat(multiplier)).toFixed(4)} EAXX tokens`}
                    </p>
                  </div>

                  {/* Staking Section */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-700 mb-3">Stake EACC</h3>
                    <div className="space-y-3">
                      {/* Amount Input for Staking */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount to Stake
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(validateAmount(e.target.value, eaccBalance))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                            placeholder="0.0"
                          />
                          <button
                            type="button"
                            onClick={() => handleMaxAmount('stake')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm font-medium"
                          >
                            MAX
                          </button>
                        </div>
                      </div>

                      {/* Action Button for Staking */}
                      {!isApproved ? (
                        <Button
                          className="w-full"
                          onClick={handleApprove}
                          disabled={isApproving || isConfirming}
                        >
                          {isApproving ? 'Approving...' : 'Approve EACC'}
                        </Button>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleStake(stakeAmount)}
                          disabled={isStaking || isConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
                        >
                          {isStaking || isConfirming ? 'Processing...' : 'Stake EACC'}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Unstaking Section */}
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <h3 className="font-medium text-indigo-700 mb-3">Unstake EACC</h3>
                    <div className="space-y-3">
                      {/* EAXX to EACC Ratio Display */}
                      <div className="text-sm text-indigo-600 mb-2">
                        <span>Exchange Rate: 1 EAXX ≈ {eaccxToEACCRatio} EACC</span>
                      </div>

                      {/* Amount Input for Unstaking */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount to Unstake
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={unstakeAmount}
                            onChange={(e) => setUnstakeAmount(validateAmount(e.target.value, eaccxBalance))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                            placeholder="0.0"
                          />
                          <button
                            type="button"
                            onClick={() => handleMaxAmount('unstake')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 text-sm font-medium"
                          >
                            MAX
                          </button>
                        </div>
                        {unstakeAmount && eaccxToEACCRatio && parseFloat(eaccxToEACCRatio) > 0 && (
                          <p className="text-xs text-indigo-500 mt-1">
                            You'll receive approximately {(parseFloat(unstakeAmount) * parseFloat(eaccxToEACCRatio)).toFixed(4)} EACC
                          </p>
                        )}
                      </div>

                      {/* Action Button for Unstaking */}
                      <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                        onClick={() => handleUnstake(unstakeAmount)}
                        disabled={isUnstaking || isConfirming || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                      >
                        {isUnstaking || isConfirming ? 'Processing...' : 'Unstake EAXX'}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stream Creation Form */}
                  {/* Lockup Period Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stream Duration (weeks)
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min={1}
                        max={208}
                        value={lockupPeriod}
                        onChange={(e) => setLockupPeriod(parseInt(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-sm font-medium">{lockupPeriod} weeks</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum streaming period is 1 week. Longer periods provide better multipliers.
                    </p>
                  </div>

                  {/* Multiplier Display */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Multiplier</p>
                    <p className="text-xl font-semibold">{parseFloat(multiplier).toFixed(4)}x</p>
                    <p className="text-xs text-gray-500">
                      You'll receive a stream of {(parseFloat(stakeAmount || '0') * parseFloat(multiplier)).toFixed(4)} EACC tokens
                    </p>
                  </div>

                  {/* Create Stream Section */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-medium text-blue-700 mb-3">Create EACC Stream</h3>
                    <div className="space-y-3">
                      {/* Amount Input for Streaming */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount to Stream
                        </label>
                        <div className="relative">
                          <input
                            ref={streamInputRef}
                            type="text"
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(validateAmount(e.target.value, eaccBalance))}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                            placeholder="0.0"
                          />
                          <button
                            type="button"
                            onClick={() => handleMaxAmount('stake')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500 text-sm font-medium"
                          >
                            MAX
                          </button>
                        </div>
                      </div>

                      {/* Create Stream Button */}
                      <Button
                        className="w-full"
                        onClick={() => handleStake(stakeAmount)}
                        disabled={isStaking || isConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
                      >
                        {isStaking || isConfirming ? 'Processing...' : 'Create Stream'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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

            {/* My Streams Section */}
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <StreamsPanel />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
