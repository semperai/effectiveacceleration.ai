import { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useSwitchChain, useWriteContract, useWatchContractEvent } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { E_A_C_C_TOKEN_ABI as EACC_TOKEN_ABI } from '@effectiveacceleration/contracts/wagmi/EACCToken';
import { E_A_C_C_BAR_ABI as EACC_BAR_ABI } from '@effectiveacceleration/contracts/wagmi/EACCBar';
import { useConfig } from '@/hooks/useConfig';
import * as Sentry from '@sentry/nextjs';

export const ETHEREUM_CHAIN_ID = 1;

export function useStaking() {
  const { address, isConnected, chain } = useAccount();
  const { switchChain, isPending: isSwitchingNetwork } = useSwitchChain();
  const Config = useConfig();

  // State
  const [amount, setAmount] = useState('');
  const [lockupPeriod, setLockupPeriod] = useState(52); // Default to 52 weeks
  const [isEACCStaking, setIsEACCStaking] = useState(true);
  const [multiplier, setMultiplier] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Check if user is on Ethereum mainnet
  const isEthereumMainnet = chain?.id === ETHEREUM_CHAIN_ID;

  // Setup write contract
  const { writeContractAsync, isPending: isConfirming, isSuccess: isConfirmed } = useWriteContract();

  // Combined contract read calls
  const {
    data: contractsData,
    isSuccess: isContractsSuccess,
    isLoading: isContractsLoading,
    refetch: refetchContracts
  } = useReadContracts({
    contracts: [
      // EACC Balance
      {
        address: Config?.EACCAddress,
        abi: EACC_TOKEN_ABI,
        functionName: 'balanceOf',
        args: [address || '0x'],
        chainId: ETHEREUM_CHAIN_ID,
      },
      // EAXX Balance
      {
        address: Config?.EACCBarAddress,
        abi: EACC_BAR_ABI,
        functionName: 'balanceOf',
        args: [address || '0x'],
        chainId: ETHEREUM_CHAIN_ID,
      },
      // Allowance
      {
        address: Config?.EACCAddress,
        abi: EACC_TOKEN_ABI,
        functionName: 'allowance',
        args: [address || '0x', Config?.EACCBarAddress || '0x'],
        chainId: ETHEREUM_CHAIN_ID,
      },
      // Multiplier
      {
        address: isEACCStaking ? Config?.EACCBarAddress : Config?.EACCAddress,
        abi: isEACCStaking ? EACC_BAR_ABI : EACC_TOKEN_ABI,
        functionName: 'M',
        args: [BigInt(lockupPeriod * 7 * 24 * 60 * 60)], // convert weeks to seconds
        chainId: ETHEREUM_CHAIN_ID,
      }
    ],
    allowFailure: true,
    multicallAddress: Config?.multicall3Address,
    query: {
      enabled: isConnected && !!address && !!Config?.EACCAddress && !!Config?.EACCBarAddress,
    }
  });

  // Extract data from results
  const eaccBalance = contractsData?.[0]?.result;
  const eaccxBalance = contractsData?.[1]?.result;
  const allowance = contractsData?.[2]?.result;
  const multiplierData = contractsData?.[3]?.result;

  // Check if approved
  const isApproved = allowance ? BigInt(allowance) > BigInt(0) : false;

  // Watch for token approval events to update state
  useWatchContractEvent({
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
    eventName: 'Approval',
    onLogs: () => {
      console.log("Approval event detected, refetching contracts");
      refetchContracts();
      setIsLoading(false);
    },
    enabled: isConnected && !!Config?.EACCAddress,
  });

  // Watch for token transfer events to update balances
  useWatchContractEvent({
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
    eventName: 'Transfer',
    onLogs: () => {
      console.log("Transfer event detected, refetching contracts");
      refetchContracts();
      setIsLoading(false);
    },
    enabled: isConnected && !!Config?.EACCAddress,
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

  // Handle approval
  const handleApprove = async () => {
    if (!Config?.EACCBarAddress || !isEthereumMainnet) return;

    setIsLoading(true);
    try {
      await writeContractAsync({
        address: Config.EACCAddress,
        abi: EACC_TOKEN_ABI,
        functionName: 'approve',
        args: [Config.EACCBarAddress, BigInt(2) ** BigInt(256) - BigInt(1)], // max uint256
      });

      // Refetch will be triggered automatically by the event watcher
    } catch (error) {
      Sentry.captureException(error);
      setError(error as unknown);
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

      if (isEACCStaking) {
        await writeContractAsync({
          address: Config!.EACCBarAddress,
          abi: EACC_BAR_ABI,
          functionName: 'enter',
          args: [amountWei, tSeconds],
        });
      } else {
        await writeContractAsync({
          address: Config!.EACCAddress,
          abi: EACC_TOKEN_ABI,
          functionName: 'depositForStream',
          args: [amountWei, tSeconds],
        });
      }

      // Reset amount after successful transaction
      setAmount('');
      // Refetch will be triggered by event watchers
    } catch (error) {
      Sentry.captureException(error);
      setError(error);
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

      await writeContractAsync({
        address: Config!.EACCBarAddress,
        abi: EACC_BAR_ABI,
        functionName: 'leave',
        args: [amountWei],
      });

      // Reset amount after successful transaction
      setAmount('');
      // Refetch will be triggered by event watchers
    } catch (error) {
      Sentry.captureException(error);
      setError(error);
      console.error("Error unstaking tokens:", error);
      setIsLoading(false);
    }
  };

  // Handle max amount
  const handleMaxAmount = () => {
    if (isEACCStaking && eaccBalance) {
      setAmount(formatEther(eaccBalance));
    } else if (!isEACCStaking && eaccxBalance) {
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

  // Force refetch all data
  const refetchAll = () => {
    refetchContracts();
  };

  // Debug logging
  useEffect(() => {
    console.log('Contract Data:', {
      eaccBalance,
      eaccxBalance,
      allowance,
      multiplierData,
      isApproved
    });
  }, [contractsData, eaccBalance, eaccxBalance, allowance, multiplierData, isApproved]);

  // Return values and functions
  return {
    // State
    amount,
    setAmount,
    lockupPeriod,
    setLockupPeriod,
    isEACCStaking,
    setIsEACCStaking,
    multiplier,
    isLoading: isLoading || isContractsLoading,
    isConfirming,
    isConfirmed,
    error,
    isContractsSuccess,

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
    refetchAll,
  };
}
