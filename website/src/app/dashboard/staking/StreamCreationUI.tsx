'use client';
import { Button } from '@/components/Button';
import { formatEther } from 'viem';
import { validateAmount } from './utils';
import { SliderInput } from './SliderInput';
import { LockupSlider } from './LockupSlider';
import { BenefitsOfStreaming } from './BenefitsOfStreaming';
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
          <LockupSlider
            lockupPeriod={lockupPeriod}
            setLockupPeriod={setLockupPeriod}
            min={1}
            max={208}
            ticks={[
              { value: 1, label: '1 Year' },
              { value: 52, label: '1 Year' },
              { value: 104, label: '2 Years' },
              { value: 208, label: '4 Years' }
            ]}
          />
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
          <h3 className="text-xl font-bold text-blue-900 mb-4">Create Your EACC Cascade</h3>
          <div className="space-y-4">
            {/* SliderInput with local state management */}
            <SliderInput
              value={localStakeAmount}
              onChange={setLocalStakeAmount} // Only updates local UI state
              onMaxClick={() => handleMaxAmountWrapper('stake')}
              maxAmount={eaccBalance}
              formatAmount={formatAmount}
              parseAmount={parseAmount}
              label="Amount of EACC to Deposit"
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
      <BenefitsOfStreaming />
    </div>
  );
};
