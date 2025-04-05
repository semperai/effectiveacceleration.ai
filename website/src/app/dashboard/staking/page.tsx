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
    isStaking,
    isUnstaking,
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

  // Calculate Annual Percentage Yield based on multiplier
  const calculateAPY = () => {
    return ((parseFloat(multiplier) - 1) * 100).toFixed(2);
  };

  // Calculate tokens per day for streams
  const getTokensPerDay = (amount: string) => {
    if (!amount || parseFloat(amount) <= 0 || !lockupPeriod || lockupPeriod <= 0) return "0";

    // Calculate tokens per day based on total amount and lockup period
    const totalTokens = parseFloat(amount) * parseFloat(multiplier);
    const days = lockupPeriod * 7; // weeks to days
    return (totalTokens / days).toFixed(4);
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
          <div className="mx-auto w-full max-w-4xl space-y-8">
            {/* Hero Section with Emphasis on Benefits */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl overflow-hidden shadow-2xl relative">
              <div className="p-8 md:p-12 text-white relative z-10">
                <h1 className="text-4xl md:text-5xl text-white font-extrabold mb-4">Maximize Your EACC</h1>
                <p className="text-xl md:text-2xl font-medium text-blue-100 mb-6">
                  Earn up to 716% more with longer staking periods
                </p>

                <div className="flex flex-wrap gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1">
                    <p className="text-blue-200 font-medium">Current APY</p>
                    <p className="text-3xl font-bold">63.57%</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1">
                    <p className="text-blue-200 font-medium">Your Multiplier</p>
                    <p className="text-3xl font-bold">7.1615x</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4 flex-1">
                    <p className="text-blue-200 font-medium">Lock Period</p>
                    <p className="text-3xl font-bold">208 weeks</p>
                  </div>
                </div>
              </div>

              {/* Animated Particles Background */}
              <div className="absolute inset-0 overflow-hidden opacity-20">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white"
                    style={{
                      width: `${Math.random() * 10 + 5}px`,
                      height: `${Math.random() * 10 + 5}px`,
                      top: `${Math.random() * 100}%`,
                      left: `${Math.random() * 100}%`,
                      opacity: Math.random() * 0.5 + 0.3,
                      animation: `float ${Math.random() * 10 + 10}s linear infinite`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Main Staking Interface */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              {/* Staking Options Toggle - Enhanced */}
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                <div className="flex justify-center">
                  <div className="bg-white/20 backdrop-blur rounded-xl p-1">
                    <button
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        isEACCStaking
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => handleToggleStakingMode({ stakeMode: true })}
                    >
                      Stake EACC
                    </button>
                    <button
                      className={`px-6 py-3 rounded-lg font-medium transition-all ${
                        !isEACCStaking
                          ? 'bg-white text-blue-600 shadow-lg'
                          : 'text-white hover:bg-white/10'
                      }`}
                      onClick={() => handleToggleStakingMode({ stakeMode: false })}
                    >
                      Create Stream
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {/* Balance Display - Enhanced */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-6">
                    <div className="flex items-center mb-1">
                      <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">EACC Balance</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {eaccBalance && typeof eaccBalance === 'bigint'
                            ? parseFloat(formatEther(eaccBalance)).toFixed(4)
                            : '0.0000'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-2xl p-6">
                    <div className="flex items-center mb-1">
                      <div className="w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-indigo-600 font-medium">EAXX Balance</p>
                        <p className="text-2xl font-bold text-indigo-900">
                          {eaccxBalance && typeof eaccxBalance === 'bigint'
                            ? parseFloat(formatEther(eaccxBalance)).toFixed(4)
                            : '0.0000'}
                          {eaccxWorthInEACC && typeof eaccxWorthInEACC === 'bigint' && eaccxWorthInEACC > 0 && (
                            <span className="text-sm text-indigo-500 ml-2">
                              (~{parseFloat(formatEther(eaccxWorthInEACC)).toFixed(4)} EACC)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {isEACCStaking ? (
                  <div className="space-y-8">
                    {/* Lockup Period with Visualization */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Lock Period</h3>

                      <div className="mb-6">
                        <input
                          type="range"
                          min={isEACCStaking ? 52 : 1}
                          max={208}
                          value={lockupPeriod}
                          onChange={(e) => setLockupPeriod(parseInt(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />

                        <div className="relative h-10 mt-1">
                          {/* Ticks for lockup period */}
                          <div className="absolute inset-x-0 flex justify-between">
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">1 Year</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">2 Years</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">3 Years</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">4 Years</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multiplier Visualization */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Current Selection</p>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-blue-600">{lockupPeriod}</span>
                            <span className="text-sm ml-1 text-gray-600">weeks</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.floor(lockupPeriod / 52)} years, {lockupPeriod % 52} weeks
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
                          <p className="text-sm opacity-90 mb-1">Your Multiplier</p>
                          <div className="flex items-baseline">
                            <span className="text-3xl text-white font-bold">{parseFloat(multiplier).toFixed(4)}x</span>
                            <span className="text-sm text-gray-200 ml-2 opacity-90">
                              +{((parseFloat(multiplier) - 1) * 100).toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs opacity-80 mt-1">
                            APY: {calculateAPY()}%
                          </p>
                        </div>
                      </div>

                      {/* Comparison with other periods */}
                      <div className="mt-6 bg-white rounded-xl p-4 shadow-sm">
                        <h4 className="font-medium text-gray-700 mb-3">Compare Periods</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">1 Year (52 weeks)</span>
                            <div className="flex items-baseline">
                              <span className="font-medium">1.401x</span>
                              <span className="text-xs text-blue-600 ml-2">+40.01%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">2 Years (104 weeks)</span>
                            <div className="flex items-baseline">
                              <span className="font-medium">2.097x</span>
                              <span className="text-xs text-blue-600 ml-2">+109.70%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">3 Years (156 weeks)</span>
                            <div className="flex items-baseline">
                              <span className="font-medium">3.349x</span>
                              <span className="text-xs text-blue-600 ml-2">+234.90%</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">4 Years (208 weeks)</span>
                            <div className="flex items-baseline">
                              <span className="font-medium">5.7093x</span>
                              <span className="text-xs text-blue-600 ml-2">+470.93%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Staking Box - Enhanced */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-1 shadow-xl">
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Stake Your EACC</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Amount to Stake
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={stakeAmount}
                                onChange={(e) => setStakeAmount(validateAmount(e.target.value, eaccBalance))}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border"
                                placeholder="0.0"
                              />
                              <button
                                type="button"
                                onClick={() => handleMaxAmount('stake')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded"
                              >
                                MAX
                              </button>
                            </div>
                          </div>

                          {/* Estimated returns preview */}
                          {stakeAmount && parseFloat(stakeAmount) > 0 && (
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                              <h4 className="font-medium text-blue-800 mb-2">Your Estimated Returns</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-blue-700">You stake:</span>
                                  <span className="font-medium">{stakeAmount} EACC</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-blue-700">Multiplier:</span>
                                  <span className="font-medium">{parseFloat(multiplier).toFixed(4)}x</span>
                                </div>
                                <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                                  <span className="text-blue-800 font-medium">You receive:</span>
                                  <span className="font-bold text-blue-800">
                                    {(parseFloat(stakeAmount || '0') * parseFloat(multiplier)).toFixed(4)} EAXX
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          {!isApproved ? (
                            <Button
                              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                              onClick={handleApprove}
                              disabled={isApproving || isConfirming}
                            >
                              {isApproving ? 'Approving...' : 'Approve EACC'}
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                              onClick={() => handleStake(stakeAmount)}
                              disabled={isStaking || isConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
                            >
                              {isStaking || isConfirming ? 'Processing...' : 'Stake EACC'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Unstaking Box - Enhanced */}
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-1 shadow-xl">
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="text-xl font-bold text-indigo-900 mb-4">Unstake Your EAXX</h3>
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium text-gray-700">
                                Amount to Unstake
                              </label>
                              <div className="text-sm text-indigo-600">
                                Rate: 1 EAXX ≈ {eaccxToEACCRatio} EACC
                              </div>
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={unstakeAmount}
                                onChange={(e) => setUnstakeAmount(validateAmount(e.target.value, eaccxBalance))}
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-4 border"
                                placeholder="0.0"
                              />
                              <button
                                type="button"
                                onClick={() => handleMaxAmount('unstake')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-indigo-100 text-indigo-700 text-sm font-medium px-2 py-1 rounded"
                              >
                                MAX
                              </button>
                            </div>
                          </div>

                          {/* Estimated return preview */}
                          {unstakeAmount && parseFloat(unstakeAmount) > 0 && eaccxToEACCRatio && (
                            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                              <h4 className="font-medium text-indigo-800 mb-2">Your Estimated Returns</h4>
                              <div className="space-y-2">
                                <div className="flex justify-between">
                                  <span className="text-indigo-700">You unstake:</span>
                                  <span className="font-medium">{unstakeAmount} EAXX</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-indigo-700">Exchange rate:</span>
                                  <span className="font-medium">1 EAXX ≈ {eaccxToEACCRatio} EACC</span>
                                </div>
                                <div className="flex justify-between border-t border-indigo-200 pt-2 mt-2">
                                  <span className="text-indigo-800 font-medium">You receive:</span>
                                  <span className="font-bold text-indigo-800">
                                    {(parseFloat(unstakeAmount || '0') * parseFloat(eaccxToEACCRatio)).toFixed(4)} EACC
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => handleUnstake(unstakeAmount)}
                            disabled={isUnstaking || isConfirming || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                          >
                            {isUnstaking || isConfirming ? 'Processing...' : 'Unstake EAXX'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Stream Creation UI */}
                    <div className="bg-gray-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Stream Duration</h3>

                      <div className="mb-6">
                        <input
                          type="range"
                          min={1}
                          max={208}
                          value={lockupPeriod}
                          onChange={(e) => setLockupPeriod(parseInt(e.target.value))}
                          className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />

                        <div className="relative h-10 mt-1">
                          {/* Ticks for lockup period */}
                          <div className="absolute inset-x-0 flex justify-between">
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">1 Week</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">1 Year</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">2 Years</span>
                            </div>
                            <div className="flex flex-col items-center">
                              <div className="h-3 w-1 bg-gray-300"></div>
                              <span className="text-xs text-gray-500 mt-1">4 Years</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Multiplier Visualization */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-sm text-gray-500 mb-1">Stream Duration</p>
                          <div className="flex items-baseline">
                            <span className="text-3xl font-bold text-blue-600">{lockupPeriod}</span>
                            <span className="text-sm ml-1 text-gray-600">weeks</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.floor(lockupPeriod / 52)} years, {lockupPeriod % 52} weeks
                          </p>
                        </div>

                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl p-4 text-white shadow-lg">
                          <p className="text-sm opacity-90 mb-1">Your Multiplier</p>
                          <div className="flex items-baseline">
                            <span className="text-3xl text-white font-bold">{parseFloat(multiplier).toFixed(4)}x</span>
                            <span className="text-sm text-gray-200 ml-2 opacity-90">
                              +{((parseFloat(multiplier) - 1) * 100).toFixed(2)}%
                            </span>
                          </div>
                          <p className="text-xs opacity-80 mt-1">
                            Boost: {((parseFloat(multiplier) - 1) * 100).toFixed(2)}% more tokens
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Stream Creation Box */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-1 shadow-xl">
                      <div className="bg-white rounded-xl p-6">
                        <h3 className="text-xl font-bold text-blue-900 mb-4">Create Your EACC Stream</h3>
                        <div className="space-y-4">
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
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-4 border"
                                placeholder="0.0"
                              />
                              <button
                                type="button"
                                onClick={() => handleMaxAmount('stake')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-100 text-blue-700 text-sm font-medium px-2 py-1 rounded"
                              >
                                MAX
                              </button>
                            </div>
                          </div>

                          {/* Visualization of stream with animations */}
                          {stakeAmount && parseFloat(stakeAmount) > 0 && (
                            <div className="rounded-xl overflow-hidden">
                              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
                                <h4 className="font-medium">Your Stream Preview</h4>
                              </div>

                              <div className="bg-blue-50 p-4 border border-blue-100">
                                <div className="space-y-3">
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Total amount:</span>
                                    <span className="font-medium">{stakeAmount} EACC</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Multiplier:</span>
                                    <span className="font-medium">{parseFloat(multiplier).toFixed(4)}x</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-blue-700">Stream duration:</span>
                                    <span className="font-medium">{lockupPeriod} weeks</span>
                                  </div>
                                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                                    <span className="text-blue-800 font-medium">Total stream value:</span>
                                    <span className="font-bold text-blue-800">
                                      {(parseFloat(stakeAmount || '0') * parseFloat(multiplier)).toFixed(4)} EACC
                                    </span>
                                  </div>
                                </div>

                                {/* Stream visualization */}
                                <div className="mt-4 bg-white rounded-lg p-3 border border-blue-100 relative overflow-hidden">
                                  <div className="flex justify-between mb-1">
                                    <span className="text-xs text-blue-600">Now</span>
                                    <span className="text-xs text-blue-600">{lockupPeriod} weeks</span>
                                  </div>
                                  <div className="h-4 w-full bg-blue-100 rounded-full relative overflow-hidden">
                                    {/* Animated stream visualization */}
                                    <div className="absolute top-0 left-0 h-full w-full flex">
                                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 animate-pulse-slow" style={{ width: '10%' }}></div>
                                      <div className="h-full bg-blue-300 animate-stream" style={{ width: '10%' }}></div>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-center">
                                    <span className="text-xs text-blue-700">
                                      {getTokensPerDay(stakeAmount)} EACC per day
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <Button
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                            onClick={() => handleStake(stakeAmount)}
                            disabled={isStaking || isConfirming || !stakeAmount || parseFloat(stakeAmount) <= 0}
                          >
                            {isStaking || isConfirming ? 'Processing...' : 'Create Stream'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Benefits of streaming */}
                    <div className="bg-indigo-50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-indigo-900 mb-4">Benefits of Streaming</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                          <div className="flex items-start">
                            <div className="bg-indigo-100 rounded-full p-2 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-indigo-800">Higher Multipliers</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Longer stream durations give you significantly higher token multipliers.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                          <div className="flex items-start">
                            <div className="bg-indigo-100 rounded-full p-2 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-indigo-800">Continuous Rewards</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Receive your tokens gradually over time instead of having to wait.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                          <div className="flex items-start">
                            <div className="bg-indigo-100 rounded-full p-2 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-indigo-800">Flexibility</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Withdraw available tokens at any time as they stream to your wallet.
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
                          <div className="flex items-start">
                            <div className="bg-indigo-100 rounded-full p-2 mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div>
                              <h4 className="font-medium text-indigo-800">Capital Efficiency</h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Plan your token flow to match your expected future needs.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Information Box - Enhanced */}
                <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="font-bold text-blue-800 mb-3">How It Works</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">1</div>
                      <div className="bg-white rounded-xl p-4 pl-6 shadow-sm min-h-full">
                        <h4 className="font-medium text-blue-800 mb-2">Choose Your Lock Period</h4>
                        <p className="text-sm text-gray-600">
                          Select how long you want to lock your tokens. Longer periods give you substantially higher multipliers.
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">2</div>
                      <div className="bg-white rounded-xl p-4 pl-6 shadow-sm min-h-full">
                        <h4 className="font-medium text-blue-800 mb-2">Stake or Create Stream</h4>
                        <p className="text-sm text-gray-600">
                          Choose your preferred method: direct staking for EAXX tokens or creating a token stream.
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="absolute -left-2 -top-2 w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">3</div>
                      <div className="bg-white rounded-xl p-4 pl-6 shadow-sm min-h-full">
                        <h4 className="font-medium text-blue-800 mb-2">Earn More EACC</h4>
                        <p className="text-sm text-gray-600">
                          Enjoy increased rewards based on your chosen multiplier. The longer you stake, the more you earn.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Streams Panel */}
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <StreamsPanel />
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes stream {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        .animate-stream {
          animation: stream 2s infinite linear;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </Layout>
  );
}
