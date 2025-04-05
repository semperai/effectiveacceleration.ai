'use client';
import { Button } from '@/components/Button';
import { formatEther } from 'viem';
import { validateAmount } from './utils';

interface StakingUIProps {
  lockupPeriod: number;
  setLockupPeriod: (period: number) => void;
  multiplier: string;
  stakeAmount: string;
  setStakeAmount: (amount: string) => void;
  unstakeAmount: string;
  setUnstakeAmount: (amount: string) => void;
  eaccBalance: bigint;
  eaccxBalance: bigint;
  eaccxToEACCRatio: string;
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
  stakeAmount,
  setStakeAmount,
  unstakeAmount,
  setUnstakeAmount,
  eaccBalance,
  eaccxBalance,
  eaccxToEACCRatio,
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
  return (
    <div className="space-y-8">
      {/* Lockup Period with Visualization */}
      <div className="bg-gray-50 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Lock Period</h3>

        <div className="mb-6">
          <input
            type="range"
            min={52}
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
                disabled={isStaking || isConfirming}
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
  );
}
