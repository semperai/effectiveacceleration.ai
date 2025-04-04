'use client';
import { useState, useEffect } from 'react';
import DefaultNavBar from '@/components/DefaultNavBar';
import { useAccount, useReadContract } from 'wagmi';
import ConnectWallet from '../register/ConnectWallet';
import StreamsComponent from '@/components/StreamsComponent';
import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { formatEther, parseEther } from 'viem';
import { E_A_C_C_TOKEN_ABI as EACC_TOKEN_ABI } from '@effectiveacceleration/contracts/wagmi/EACCToken';
import { E_A_C_C_BAR_ABI as EACC_BAR_ABI } from '@effectiveacceleration/contracts/wagmi/EACCBar';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useToast } from '@/hooks/useToast';
import * as Sentry from '@sentry/nextjs';

export default function EACCPage() {
  const { address, isConnected } = useAccount();
  const Config = useConfig();
  const [activeTab, setActiveTab] = useState<'stake' | 'streams'>('stake');
  const [amount, setAmount] = useState<string>('');
  const [lockupPeriod, setLockupPeriod] = useState<number>(52); // Default to 52 weeks
  const [isDirectStaking, setIsDirectStaking] = useState<boolean>(true);
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } = useWriteContractWithNotifications();
  const { showError } = useToast();

  // Read EACC balance
  const { data: eaccBalance } = useReadContract({
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: isConnected && !!address && !!Config,
    },
  });

  // Read EACCx balance
  const { data: eaccxBalance } = useReadContract({
    address: Config?.EACCBarAddress,
    abi: EACC_BAR_ABI,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: isConnected && !!address && !!Config,
    },
  });

  // Check allowance
  const { data: allowance } = useReadContract({
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
    functionName: 'allowance',
    args: [address || '0x', Config?.EACCBarAddress || '0x'],
    query: {
      enabled: isConnected && !!address && !!Config,
    },
  });

  // Calculate multiplier based on lockup period
  const { data: multiplierData } = useReadContract({
    address: isDirectStaking ? Config?.EACCBarAddress : Config?.EACCAddress,
    abi: isDirectStaking ? EACC_BAR_ABI : EACC_TOKEN_ABI,
    functionName: 'M',
    args: [BigInt(lockupPeriod * 7 * 24 * 60 * 60)], // convert weeks to seconds
    query: {
      enabled: isConnected && !!address && !!Config,
    },
  });

  // Format multiplier for display
  const multiplier = multiplierData ? formatEther(multiplierData) : '0';

  // Check if approved
  const isEaccApproved = allowance ? BigInt(allowance) > BigInt(0) : false;

  // Track global loading state
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (error) {
      setIsLoading(false);
    }
  }, [error]);

  // Handle approval
  const handleApprove = async () => {
    if (!Config?.EACCBarAddress) return;

    setIsLoading(true);
    try {
      await writeContractWithNotifications({
        address: Config.EACCAddress,
        abi: EACC_TOKEN_ABI,
        functionName: 'approve',
        args: [Config.EACCBarAddress, BigInt(2) ** BigInt(256) - BigInt(1)], // max uint256
      });
    } catch (error) {
      Sentry.captureException(error);
      showError("Error approving tokens. Please try again.");
      console.error("Error approving tokens:", error);
      setIsLoading(false);
    }
  };

  // Handle staking
  const handleStake = async () => {
    if (!amount) return;

    setIsLoading(true);
    try {
      const amountWei = parseEther(amount);
      const tSeconds = BigInt(lockupPeriod * 7 * 24 * 60 * 60); // Convert weeks to seconds

      if (isDirectStaking) {
        await writeContractWithNotifications({
          address: Config!.EACCBarAddress,
          abi: EACC_BAR_ABI,
          functionName: 'enter',
          args: [amountWei, tSeconds],
        });
      } else {
        await writeContractWithNotifications({
          address: Config!.EACCAddress,
          abi: EACC_TOKEN_ABI,
          functionName: 'depositForStream',
          args: [amountWei, tSeconds],
        });
      }

      // Reset amount after successful transaction
      if (isConfirmed) {
        setAmount('');
      }
    } catch (error) {
      Sentry.captureException(error);
      showError(isDirectStaking ? "Error staking tokens. Please try again." : "Error creating stream. Please try again.");
      console.error("Error staking tokens:", error);
      setIsLoading(false);
    }
  };

  // Handle unstaking
  const handleUnstake = async () => {
    if (!amount) return;

    setIsLoading(true);
    try {
      const amountWei = parseEther(amount);

      await writeContractWithNotifications({
        address: Config!.EACCBarAddress,
        abi: EACC_BAR_ABI,
        functionName: 'leave',
        args: [amountWei],
      });

      // Reset amount after successful transaction
      if (isConfirmed) {
        setAmount('');
      }
    } catch (error) {
      Sentry.captureException(error);
      showError("Error unstaking tokens. Please try again.");
      console.error("Error unstaking tokens:", error);
      setIsLoading(false);
    }
  };

  // Handle max amount
  const handleMaxAmount = () => {
    if (isDirectStaking && eaccBalance) {
      setAmount(formatEther(eaccBalance));
    } else if (!isDirectStaking && eaccxBalance) {
      setAmount(formatEther(eaccxBalance));
    }
  };

  return (
    <>
      <DefaultNavBar />
      <div className="relative w-full py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">EACC Finance</h1>
            <p className="text-gray-600">Stake your EACC tokens and earn streaming rewards</p>
          </div>

          {isConnected ? (
            <>
              {/* Balance Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold">E</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">EACC Balance</h3>
                      <p className="text-gray-500 text-sm">Available for staking</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {eaccBalance ? parseFloat(formatEther(eaccBalance)).toFixed(4) : '0.0000'} EACC
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-bold">Ex</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">EACCx Balance</h3>
                      <p className="text-gray-500 text-sm">Staked EACC tokens</p>
                    </div>
                  </div>
                  <div className="text-2xl font-bold">
                    {eaccxBalance ? parseFloat(formatEther(eaccxBalance)).toFixed(4) : '0.0000'} EACCx
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-6 border-b border-gray-200">
                <div className="flex">
                  <button
                    className={`py-3 px-6 ${activeTab === 'stake' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('stake')}
                  >
                    Stake & Stream
                  </button>
                  <button
                    className={`py-3 px-6 ${activeTab === 'streams' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('streams')}
                  >
                    Your Streams
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              {activeTab === 'stake' ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2">
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                      <h2 className="text-xl font-bold mb-6">Stake Your EACC</h2>

                      {/* Staking Options Toggle */}
                      <div className="flex justify-center mb-8">
                        <div className="flex bg-gray-100 rounded-lg p-1">
                          <button
                            className={`px-4 py-2 rounded-md ${isDirectStaking ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                            onClick={() => setIsDirectStaking(true)}
                          >
                            Stake EACC
                          </button>
                          <button
                            className={`px-4 py-2 rounded-md ${!isDirectStaking ? 'bg-blue-500 text-white' : 'text-gray-700'}`}
                            onClick={() => setIsDirectStaking(false)}
                          >
                            Create Stream
                          </button>
                        </div>
                      </div>

                      {/* Staking Form */}
                      <div className="space-y-6">
                        {/* Amount Input */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {isDirectStaking ? 'Amount to Stake' : 'Amount to Stream'}
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
                          <div className="mb-2">
                            <input
                              type="range"
                              min={isDirectStaking ? 52 : 1}
                              max={208}
                              value={lockupPeriod}
                              onChange={(e) => setLockupPeriod(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{isDirectStaking ? '52 weeks' : '1 week'}</span>
                            <span>{lockupPeriod} weeks</span>
                            <span>208 weeks</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div>
                          {!isEaccApproved ? (
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
                                {isLoading || isConfirming ? 'Processing...' : isDirectStaking ? 'Stake EACC' : 'Create Stream'}
                              </Button>
                              {isDirectStaking && (
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
                    </div>
                  </div>

                  {/* Info Side Panel */}
                  <div className="md:col-span-1">
                    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100 mb-6">
                      <h3 className="font-medium text-lg mb-4">Reward Multiplier</h3>
                      <div className="text-3xl font-bold text-blue-600 mb-3">{parseFloat(multiplier).toFixed(2)}x</div>
                      <p className="text-sm text-gray-600 mb-4">
                        Lock your tokens for longer periods to earn higher rewards.
                      </p>

                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">You will receive:</h4>
                        <div className="text-lg font-semibold">
                          {(parseFloat(amount || '0') * parseFloat(multiplier || '0')).toFixed(4)}
                          {isDirectStaking ? ' EACCx tokens' : ' EACC tokens (streamed)'}
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-6">
                      <h3 className="font-medium text-blue-700 mb-3">How it works</h3>
                      <p className="text-sm text-blue-600 mb-4">
                        {isDirectStaking
                          ? 'When you stake EACC, you receive EACCx tokens based on your lockup period. The longer you lock, the more EACCx you receive. You can unstake at any time after your lockup period ends.'
                          : 'Create a stream of EACC tokens that will gradually vest to you over time. The longer the stream duration, the higher the multiplier. Your tokens will be streamed linearly over the specified period.'}
                      </p>

                      <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Minimum lock period: {isDirectStaking ? '52 weeks' : '1 week'}</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Maximum lock period: 208 weeks</span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>Streams are non-cancelable</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <StreamsComponent />
              )}
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto my-16">
              <div className="text-center mb-6">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 text-2xl font-bold">E</span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
                <p className="text-gray-600 mb-6">Connect your wallet to stake EACC tokens and earn streaming rewards</p>
              </div>
              <ConnectWallet />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
