'use client';
import { Button } from '@/components/Button';
import { formatEther } from 'viem';
import { validateAmount } from './utils';
import { SliderInput } from './SliderInput';
import { LockupSlider } from './LockupSlider';
import { useState, useEffect } from 'react';

interface StakingUIProps {
  lockupPeriod: number;
  setLockupPeriod: (period: number) => void;
  multiplier: string;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  unstakeAmount: string;
  setUnstakeAmount: (amount: string) => void;
  eaccBalance: bigint;
  eaxxBalance: bigint;
  eaxxToEACCRatio: string;
  isApproved: boolean;
  isApproving: boolean;
  isStaking: boolean;
  isUnstaking: boolean;
  isConfirming: boolean;
  handleApprove: () => void;
  handleStake: (amount: string) => void;
  handleUnstake: (amount: string) => void;
  handleMaxAmount: (type: 'stake' | 'unstake') => void;
  calculateAPY: () => string;
};

export const StakingUI = ({
  lockupPeriod,
  setLockupPeriod,
  multiplier,
  stakeAmount: externalStakeAmount,
  setStakeAmount: setExternalStakeAmount,
  unstakeAmount: externalUnstakeAmount,
  setUnstakeAmount: setExternalUnstakeAmount,
  eaccBalance,
  eaxxBalance,
  eaxxToEACCRatio,
  isApproved,
  isApproving,
  isStaking,
  isUnstaking,
  isConfirming,
  handleApprove,
  handleStake,
  handleUnstake,
  handleMaxAmount,
  calculateAPY
}: StakingUIProps) => {
  // Local state to prevent RPC calls during UI interactions
  const [localStakeAmount, setLocalStakeAmount] = useState(externalStakeAmount);
  const [localUnstakeAmount, setLocalUnstakeAmount] = useState(externalUnstakeAmount);

  // Sync with external state when it changes from outside
  useEffect(() => {
    setLocalStakeAmount(externalStakeAmount);
  }, [externalStakeAmount]);

  useEffect(() => {
    setLocalUnstakeAmount(externalUnstakeAmount);
  }, [externalUnstakeAmount]);

  // Helper function to format and parse amounts
  const formatAmount = (amount: bigint) => formatEther(amount);
  const parseAmount = (value: string) => BigInt(Math.floor(parseFloat(value || '0') * 10**18));

  // Handle MAX button clicks
  const handleMaxAmountWrapper = (type: 'stake' | 'unstake') => {
    handleMaxAmount(type);
  };

  // Submit functions that trigger RPC calls
  const submitStake = () => {
    // Update external state before submitting
    setExternalStakeAmount(localStakeAmount);
    handleStake(localStakeAmount);
  };

  const submitUnstake = () => {
    // Update external state before submitting
    setExternalUnstakeAmount(localUnstakeAmount);
    handleUnstake(localUnstakeAmount);
  };

  return (
    <div className="space-y-8">
      {/* Lockup Period with Visualization */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Lock Period</h3>

        <div className="mb-6">
          <LockupSlider
            lockupPeriod={lockupPeriod}
            setLockupPeriod={setLockupPeriod}
            min={52}
            max={208}
            ticks={[
              { value: 52, label: '1 Year' },
              { value: 104, label: '2 Years' },
              { value: 156, label: '3 Years' },
              { value: 208, label: '4 Years' }
            ]}
          />
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
            {/* SliderInput with local state management */}
            <SliderInput
              value={localStakeAmount}
              onChange={setLocalStakeAmount} // Only updates local UI state
              onMaxClick={() => handleMaxAmountWrapper('stake')}
              maxAmount={eaccBalance}
              formatAmount={formatAmount}
              parseAmount={parseAmount}
              label="Amount to Stake"
              placeholder="0.0"
              className=""
            />

            {/* Estimated returns preview */}
            {localStakeAmount && parseFloat(localStakeAmount) > 0 && (
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <h4 className="font-medium text-blue-800 mb-2">Your Estimated Returns</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">You stake:</span>
                    <span className="font-medium">{localStakeAmount} EACC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Multiplier:</span>
                    <span className="font-medium">{parseFloat(multiplier).toFixed(4)}x</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                    <span className="text-blue-800 font-medium">You receive:</span>
                    <span className="font-bold text-blue-800">
                      {(parseFloat(localStakeAmount || '0') * parseFloat(multiplier)).toFixed(4)} EAXX
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
                onClick={submitStake} // This now uses the local state value
                disabled={isStaking || isConfirming || !localStakeAmount || parseFloat(localStakeAmount) <= 0}
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
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-indigo-600">
                Rate: 1 EAXX ≈ {eaxxToEACCRatio} EACC
              </div>
            </div>

            {/* SliderInput with local state management */}
            <SliderInput
              value={localUnstakeAmount}
              onChange={setLocalUnstakeAmount} // Only updates local UI state
              onMaxClick={() => handleMaxAmountWrapper('unstake')}
              maxAmount={eaxxBalance}
              formatAmount={formatAmount}
              parseAmount={parseAmount}
              label="Amount to Unstake"
              placeholder="0.0"
              className=""
            />

            {/* Estimated return preview */}
            {localUnstakeAmount && parseFloat(localUnstakeAmount) > 0 && eaxxToEACCRatio && (
              <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                <h4 className="font-medium text-indigo-800 mb-2">Your Estimated Returns</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-indigo-700">You unstake:</span>
                    <span className="font-medium">{localUnstakeAmount} EAXX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-700">Exchange rate:</span>
                    <span className="font-medium">1 EAXX ≈ {eaxxToEACCRatio} EACC</span>
                  </div>
                  <div className="flex justify-between border-t border-indigo-200 pt-2 mt-2">
                    <span className="text-indigo-800 font-medium">You receive:</span>
                    <span className="font-bold text-indigo-800">
                      {(parseFloat(localUnstakeAmount || '0') * parseFloat(eaxxToEACCRatio)).toFixed(4)} EACC
                    </span>
                  </div>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              onClick={submitUnstake} // This now uses the local state value
              disabled={isUnstaking || isConfirming || !localUnstakeAmount || parseFloat(localUnstakeAmount) <= 0}
            >
              {isUnstaking || isConfirming ? 'Processing...' : 'Unstake EAXX'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
