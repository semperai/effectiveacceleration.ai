'use client';
import DefaultNavBar from '@/components/DefaultNavBar';
import { Button } from '@/components/Button';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useSwitchChain } from 'wagmi';
import { useConfig } from '@/hooks/useConfig';
import { formatEther, parseEther } from 'viem';
import { E_A_C_C_TOKEN_ABI as EACC_TOKEN_ABI } from '@effectiveacceleration/contracts/wagmi/EACCToken';
import { E_A_C_C_BAR_ABI as EACC_BAR_ABI } from '@effectiveacceleration/contracts/wagmi/EACCBar';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useToast } from '@/hooks/useToast';
import * as Sentry from '@sentry/nextjs';
import { ConnectButton } from '@/components/ConnectButton';
import { PiArrowsClockwise } from 'react-icons/pi';
import clsx from 'clsx';

// Ethereum Mainnet chain ID
const ETHEREUM_CHAIN_ID = 1;

export default function StakingPage() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const Config = useConfig();
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } = useWriteContractWithNotifications();
  const { showError } = useToast();

  const [amount, setAmount] = useState<string>('');
  const [lockupPeriod, setLockupPeriod] = useState<number>(52); // Default to 52 weeks
  const [isDirectStaking, setIsDirectStaking] = useState<boolean>(true);
  const [multiplier, setMultiplier] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is on Ethereum mainnet
  const isEthereumMainnet = chain?.id === ETHEREUM_CHAIN_ID;

  // Read EACC balance
  const { data: eaccBalance } = useReadContract({
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: isConnected && !!address && isEthereumMainnet,
    },
  });

  // Read EACCx balance
  const { data: eaccxBalance } = useReadContract({
    address: Config?.EACCBarAddress,
    abi: EACC_BAR_ABI,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: isConnected && !!address && isEthereumMainnet,
    },
  });

  // Check allowance
  const { data: allowance } = useReadContract({
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
    functionName: 'allowance',
    args: [address || '0x', Config?.EACCBarAddress || '0x'],
    query: {
      enabled: isConnected && !!address && !!Config?.EACCBarAddress && isEthereumMainnet,
    },
  });

  // Calculate multiplier based on lockup period
  const { data: multiplierData } = useReadContract({
    address: isDirectStaking ? Config?.EACCBarAddress : Config?.EACCAddress,
    abi: isDirectStaking ? EACC_BAR_ABI : EACC_TOKEN_ABI,
    functionName: 'M',
    args: [BigInt(lockupPeriod * 7 * 24 * 60 * 60)], // convert weeks to seconds
    query: {
      enabled: isConnected && !!address && !!Config && isEthereumMainnet,
    },
  });

  // Update multiplier when data changes
  useEffect(() => {
    if (multiplierData) {
      setMultiplier(formatEther(multiplierData));
    }
  }, [multiplierData]);

  // Reset loading state when error occurs
  useEffect(() => {
    if (error) {
      setIsLoading(false);
    }
  }, [error]);

  // Check if approved
  const isApproved = allowance ? BigInt(allowance) > BigInt(0) : false;

  // Handle approval
  const handleApprove = async () => {
    if (!Config?.EACCBarAddress || !isEthereumMainnet) return;

    setIsLoading(true);
    try {
      await writeContractWithNotifications({
        address: Config!.EACCAddress,
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
    if (!amount || !isEthereumMainnet) return;

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
    if (!amount || !isEthereumMainnet) return;

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

  // Switch to Ethereum Mainnet
  const handleSwitchToEthereum = () => {
    if (switchChain) {
      switchChain({
        chainId: ETHEREUM_CHAIN_ID,
      });
    }
  };

  // Network switcher component
  const NetworkSwitcher = () => (
    <div className="max-w-2xl mx-auto w-full bg-white p-8 rounded-2xl shadow-xl text-center">
      <div className="mb-6">
        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <PiArrowsClockwise className="h-8 w-8 text-orange-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Wrong Network</h2>
        <p className="text-gray-600 mb-6">
          EACC staking is only available on Ethereum Mainnet. Please switch your network to continue.
        </p>
      </div>

      <button
        onClick={handleSwitchToEthereum}
        disabled={isSwitchingNetwork}
        className={clsx(
          'group relative inline-flex items-center gap-2 bg-gradient-to-r px-6 py-2 w-full justify-center',
          'from-orange-500 to-amber-500 shadow-orange-500/25 hover:from-orange-400 hover:to-amber-400',
          'rounded-xl font-semibold text-white shadow-lg',
          'transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-xl',
          'active:translate-y-0 active:shadow-md',
          'disabled:opacity-70 disabled:hover:transform-none disabled:hover:shadow-lg'
        )}
      >
        {isSwitchingNetwork ? 'Switching...' : 'Switch to Ethereum Mainnet'}

        <div className='absolute inset-0 overflow-hidden rounded-xl'>
          <div className='absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]' />
        </div>
      </button>
    </div>
  );

  return (
    <>
      <DefaultNavBar />
      <div className="relative mx-auto flex min-h-customHeader flex-col justify-center">
        {!isConnected ? (
          <ConnectButton />
        ) : !isEthereumMainnet ? (
          <NetworkSwitcher />
        ) : (
          <div className="max-w-2xl mx-auto w-full bg-white p-8 rounded-2xl shadow-xl">
            <h1 className="text-3xl font-bold mb-6 text-center">EACC Staking</h1>

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

            {/* Balance Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">EACC Balance</p>
                <p className="text-xl font-semibold">
                  {eaccBalance ? parseFloat(formatEther(eaccBalance)).toFixed(4) : '0.0000'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-500">EACCx Balance</p>
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
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min={isDirectStaking ? 52 : 1}
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
                  {isDirectStaking
                    ? `You'll receive ${(parseFloat(amount || '0') * parseFloat(multiplier)).toFixed(4)} EACCx tokens`
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

            {/* Information Box */}
            <div className="mt-8 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-700 mb-2">How it works</h3>
              <p className="text-sm text-blue-600">
                {isDirectStaking
                  ? 'Staking EACC gives you EACCx tokens based on your lockup period. The longer you lock, the more EACCx you receive. You can unstake at any time after your lockup period ends.'
                  : 'Create a stream of EACC tokens. The longer the stream duration, the higher the multiplier. The tokens will be streamed to you linearly over the specified period.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
