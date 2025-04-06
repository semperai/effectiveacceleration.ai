'use client';
import { Button } from '@/components/Button';
import { formatEther } from 'viem';
import { validateAmount } from './utils';
import { SliderInput } from './SliderInput';
import { useState, useEffect } from 'react';

interface StreamCreationUIProps {
  lockupPeriod: number;
  setLockupPeriod: (value: number) => void;
  multiplier: string;
  stakeAmount: string;
  setStakeAmount: (value: string) => void;
  eaccBalance: bigint;
  isStaking: boolean;
  isConfirming: boolean;
  handleStake: (amount: string) => void;
  handleMaxAmount: (type: 'stake' | 'unstake') => void;
  getTokensPerDay: (amount: string) => string;
  streamInputRef: React.RefObject<HTMLInputElement>;
}

export const StreamCreationUI = ({
  lockupPeriod,
  setLockupPeriod,
  multiplier,
  stakeAmount: externalStakeAmount,
  setStakeAmount: setExternalStakeAmount,
  eaccBalance,
  isStaking,
  isConfirming,
  handleStake,
  handleMaxAmount,
  getTokensPerDay,
  streamInputRef
}: StreamCreationUIProps) => {
  // Local state to prevent RPC calls during UI interactions
  const [localStakeAmount, setLocalStakeAmount] = useState(externalStakeAmount);

  // Sync with external state when it changes from outside
  useEffect(() => {
    setLocalStakeAmount(externalStakeAmount);
  }, [externalStakeAmount]);

  // Helper function to format and parse amounts
  const formatAmount = (amount: bigint) => formatEther(amount);
  const parseAmount = (value: string) => BigInt(Math.floor(parseFloat(value || '0') * 10**18));

  // Handle MAX button clicks
  const handleMaxAmountWrapper = (type: 'stake' | 'unstake') => {
    handleMaxAmount(type);
  };

  // Submit function that triggers RPC calls
  const submitStake = () => {
    // Update external state before submitting
    setExternalStakeAmount(localStakeAmount);
    handleStake(localStakeAmount);
  };

  return (
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
            {/* SliderInput with local state management */}
            <SliderInput
              value={localStakeAmount}
              onChange={setLocalStakeAmount} // Only updates local UI state
              onMaxClick={() => handleMaxAmountWrapper('stake')}
              maxAmount={eaccBalance}
              formatAmount={formatAmount}
              parseAmount={parseAmount}
              label="Amount to Stream"
              placeholder="0.0"
              className=""
            />

            {/* Visualization of stream with animations */}
            {localStakeAmount && parseFloat(localStakeAmount) > 0 && (
              <div className="rounded-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3">
                  <h4 className="font-medium text-white">Your Stream Preview</h4>
                </div>

                <div className="bg-blue-50 p-4 border border-blue-100">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-blue-700">Total amount:</span>
                      <span className="font-medium">{localStakeAmount} EACC</span>
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
                        {(parseFloat(localStakeAmount || '0') * parseFloat(multiplier)).toFixed(4)} EACC
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
                        {getTokensPerDay(localStakeAmount)} EACC per day
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={submitStake} // This now uses the local state value
              disabled={isStaking || isConfirming || !localStakeAmount || parseFloat(localStakeAmount) <= 0}
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
  );
};
