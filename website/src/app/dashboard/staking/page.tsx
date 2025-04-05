'use client';
import { Layout } from '@/components/Dashboard/Layout';
import { useRef } from 'react';
import { useToast } from '@/hooks/useToast';
import { WelcomeScreen } from './WelcomeScreen';
import { NetworkSwitcher } from './NetworkSwitcher';
import { useStaking } from '@/hooks/wagmi/useStaking';
import { useEffect } from 'react';
import { StreamsPanel } from './StreamsPanel';
import { HeroSection } from './HeroSection';
import { BalanceDisplay } from './BalanceDisplay';
import { StakingUI } from './StakingUI';
import { StreamCreationUI } from './StreamCreationUI';
import { InformationBox } from './InformationBox';

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
            <HeroSection apy="63.57%" multiplier={multiplier} lockupPeriod={lockupPeriod} />

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
                <BalanceDisplay 
                  eaccBalance={eaccBalance} 
                  eaccxBalance={eaccxBalance} 
                  eaccxWorthInEACC={eaccxWorthInEACC} 
                />

                {isEACCStaking ? (
                  <StakingUI 
                    lockupPeriod={lockupPeriod}
                    setLockupPeriod={setLockupPeriod}
                    multiplier={multiplier}
                    stakeAmount={stakeAmount}
                    setStakeAmount={setStakeAmount}
                    unstakeAmount={unstakeAmount}
                    setUnstakeAmount={setUnstakeAmount}
                    eaccBalance={eaccBalance}
                    eaccxBalance={eaccxBalance}
                    eaccxToEACCRatio={eaccxToEACCRatio}
                    isApproved={isApproved}
                    isApproving={isApproving}
                    isStaking={isStaking}
                    isUnstaking={isUnstaking}
                    isConfirming={isConfirming}
                    handleApprove={handleApprove}
                    handleStake={handleStake}
                    handleUnstake={handleUnstake}
                    handleMaxAmount={handleMaxAmount}
                    calculateAPY={calculateAPY}
                  />
                ) : (
                  <StreamCreationUI 
                    lockupPeriod={lockupPeriod}
                    setLockupPeriod={setLockupPeriod}
                    multiplier={multiplier}
                    stakeAmount={stakeAmount}
                    setStakeAmount={setStakeAmount}
                    eaccBalance={eaccBalance}
                    isStaking={isStaking}
                    isConfirming={isConfirming}
                    handleStake={handleStake}
                    handleMaxAmount={handleMaxAmount}
                    getTokensPerDay={getTokensPerDay}
                    streamInputRef={streamInputRef}
                  />
                )}

                <InformationBox />
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
