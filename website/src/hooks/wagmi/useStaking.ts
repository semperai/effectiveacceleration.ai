import { useState, useEffect } from 'react';
import { useAccount, useReadContracts, useSwitchChain, useWatchContractEvent } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { E_A_C_C_TOKEN_ABI as EACC_TOKEN_ABI } from '@effectiveacceleration/contracts/wagmi/EACCToken';
import { E_A_C_C_BAR_ABI as EACC_BAR_ABI } from '@effectiveacceleration/contracts/wagmi/EACCBar';
import { useConfig } from '@/hooks/useConfig';
import * as Sentry from '@sentry/nextjs';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';

// Change from Ethereum to Arbitrum One
export const ARBITRUM_CHAIN_ID = 42161;

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
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Check if user is on Arbitrum One
  const isArbitrumOne = chain?.id === ARBITRUM_CHAIN_ID;

  // Replace useWriteContract with useWriteContractWithNotifications
  const {
    writeContractWithNotifications,
    isConfirming,
    isConfirmed,
    hash,
    receipt,
    error: writeError
  } = useWriteContractWithNotifications();

  const eaccContract = {
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
  } as const;
  const eaccBarContract = {
    address: Config?.EACCBarAddress,
    abi: EACC_BAR_ABI,
  } as const;
  const {
    data: contractsData,
    isSuccess: isContractsSuccess,
    isLoading: isContractsLoading,
    refetch: refetchContracts
  } = useReadContracts({
    contracts: [
      // EACC Balance
      {
        ...eaccContract,
        functionName: 'balanceOf',
        args: [address || '0x'],
        chainId: ARBITRUM_CHAIN_ID,
      },
      // EAXX Balance
      {
        ...eaccBarContract,
        functionName: 'balanceOf',
        args: [address || '0x'],
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Allowance
      ...(isEACCStaking ? [{
        ...eaccContract,
        functionName: 'allowance',
        args: [address || '0x', Config?.EACCBarAddress || '0x'],
        chainId: ARBITRUM_CHAIN_ID,
      }] : []),
      // Multiplier
      {
        address: isEACCStaking ? Config?.EACCBarAddress : Config?.EACCAddress,
        abi: isEACCStaking ? EACC_BAR_ABI : EACC_TOKEN_ABI,
        functionName: 'M',
        args: [BigInt(lockupPeriod * 7 * 24 * 60 * 60)], // convert weeks to seconds
        chainId: ARBITRUM_CHAIN_ID,
      }
    ],
    allowFailure: true,
    multicallAddress: Config?.multicall3Address,
    query: {
      enabled: isConnected && !!address && !!Config?.EACCAddress && !!Config?.EACCBarAddress,
    }
  });

  const eaccBalance = contractsData?.[0]?.result && typeof contractsData[0].result === 'bigint'
    ? contractsData[0].result
    : BigInt(0);

  const eaccxBalance = contractsData?.[1]?.result && typeof contractsData[1].result === 'bigint'
    ? contractsData[1].result
    : BigInt(0);

  const allowance = isEACCStaking
    ? (contractsData?.[2]?.result && typeof contractsData[2].result === 'bigint'
       ? contractsData[2].result
       : BigInt(0))
    : BigInt(0);

  const multiplierIndex = isEACCStaking ? 3 : 2;
  const multiplierData = contractsData?.[multiplierIndex]?.result &&
    typeof contractsData[multiplierIndex].result === 'bigint'
    ? contractsData[multiplierIndex].result
    : BigInt(0);

  // Update multiplier when data changes
  useEffect(() => {
    if (multiplierData && typeof multiplierData === 'bigint') {
      setMultiplier(formatEther(multiplierData));
    } else {
      setMultiplier('0');
    }
  }, [multiplierData]);

  // Check if approved - only relevant when staking EACC
  const isApproved = isEACCStaking ? (allowance ? BigInt(allowance) > BigInt(0) : false) : true;

  // Watch for token approval events to update state
  useWatchContractEvent({
    address: Config?.EACCAddress,
    abi: EACC_TOKEN_ABI,
    eventName: 'Approval',
    onLogs: () => {
      console.log("Approval event detected, refetching contracts");
      refetchContracts();
      setIsApproving(false);  // Reset approval loading state
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

  // Update error state when write error occurs
  useEffect(() => {
    if (writeError) {
      setError(writeError);
      setIsLoading(false);
      setIsApproving(false);
    }
  }, [writeError]);

  // Reset loading state on confirmation
  useEffect(() => {
    if (isConfirmed) {
      setIsLoading(false);
      setIsApproving(false);
    }
  }, [isConfirmed]);

  // Handle approval
  const handleApprove = async () => {
    if (!Config?.EACCBarAddress || !isArbitrumOne) return;

    setIsApproving(true);
    try {
      await writeContractWithNotifications({
        abi: EACC_TOKEN_ABI,
        address: Config.EACCAddress,
        functionName: 'approve',
        args: [Config.EACCBarAddress, BigInt(2) ** BigInt(256) - BigInt(1)], // max uint256
        contracts: {
          marketplaceAddress: Config.marketplaceAddress,
          marketplaceDataAddress: Config.marketplaceDataAddress,
          eaccAddress: Config.EACCAddress,
          eaccBarAddress: Config.EACCBarAddress,
        },
        successMessage: 'Approval successful!',
        customErrorMessages: {
          userDenied: 'Approval was denied by the user',
          default: 'Failed to approve tokens'
        }
      });
      // Refetch will be triggered automatically by the event watcher
    } catch (error) {
      Sentry.captureException(error);
      setError(error);
      console.error("Error approving tokens:", error);
      setIsApproving(false);
    }
  };

  // Handle staking
  const handleStake = async () => {
    if (!amount || !isArbitrumOne) return;

    setIsLoading(true);
    try {
      const amountWei = parseEther(amount);
      const tSeconds = BigInt(lockupPeriod * 7 * 24 * 60 * 60); // Convert weeks to seconds

      if (isEACCStaking) {
        await writeContractWithNotifications({
          address: Config!.EACCBarAddress,
          abi: EACC_BAR_ABI,
          functionName: 'enter',
          args: [amountWei, tSeconds],
          contracts: {
            marketplaceAddress: Config!.marketplaceAddress,
            marketplaceDataAddress: Config!.marketplaceDataAddress,
            eaccAddress: Config!.EACCAddress,
            eaccBarAddress: Config!.EACCBarAddress,
          },
          successMessage: 'Successfully staked EACC tokens!',
          customErrorMessages: {
            userDenied: 'Staking was denied by the user',
            default: 'Failed to stake tokens'
          },
          onSuccess: () => {
            // Reset amount after successful transaction
            setAmount('');
          }
        });
      } else {
        await writeContractWithNotifications({
          address: Config!.EACCAddress,
          abi: EACC_TOKEN_ABI,
          functionName: 'depositForStream',
          args: [amountWei, tSeconds],
          contracts: {
            marketplaceAddress: Config!.marketplaceAddress,
            marketplaceDataAddress: Config!.marketplaceDataAddress,
            eaccAddress: Config!.EACCAddress,
            eaccBarAddress: Config!.EACCBarAddress,
          },
          successMessage: 'Successfully created new stream!',
          customErrorMessages: {
            userDenied: 'Stream creation was denied by the user',
            default: 'Failed to create new stream'
          },
          onSuccess: () => {
            // Reset amount after successful transaction
            setAmount('');
          }
        });
      }
    } catch (error) {
      Sentry.captureException(error);
      setError(error);
      console.error("Error staking tokens:", error);
      setIsLoading(false);
    }
  };

  // Handle unstaking
  const handleUnstake = async () => {
    if (!amount || !isArbitrumOne) return;

    setIsLoading(true);
    try {
      const amountWei = parseEther(amount);

      await writeContractWithNotifications({
        address: Config!.EACCBarAddress,
        abi: EACC_BAR_ABI,
        functionName: 'leave',
        args: [amountWei],
        contracts: {
          marketplaceAddress: Config!.marketplaceAddress,
          marketplaceDataAddress: Config!.marketplaceDataAddress,
          eaccAddress: Config!.EACCAddress,
          eaccBarAddress: Config!.EACCBarAddress,
        },
        successMessage: 'Successfully unstaked tokens!',
        customErrorMessages: {
          userDenied: 'Unstaking was denied by the user',
          default: 'Failed to unstake tokens'
        },
        onSuccess: () => {
          // Reset amount after successful transaction
          setAmount('');
        }
      });
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

  // Switch to Arbitrum One
  const handleSwitchToArbitrum = () => {
    if (switchChain) {
      switchChain({
        chainId: ARBITRUM_CHAIN_ID,
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
    isApproving,
    isConfirming,
    isConfirmed,
    error,
    isContractsSuccess,

    // Connection state
    isConnected,
    isArbitrumOne,
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
    handleSwitchToArbitrum,
    refetchAll,
  };
}
