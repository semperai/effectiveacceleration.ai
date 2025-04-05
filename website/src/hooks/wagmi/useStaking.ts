import { useState, useEffect, useMemo } from 'react';
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
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [lockupPeriod, setLockupPeriod] = useState(52); // Default to 52 weeks
  const [isEACCStaking, setIsEACCStaking] = useState(true);
  const [multiplier, setMultiplier] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // State for R and K constants
  const [eaccRValue, setEaccRValue] = useState(BigInt(6969696969)); // Default from EACCToken contract
  const [eaccKValue, setEaccKValue] = useState(BigInt(69)); // Default from EACCToken contract
  const [eaccxRValue, setEaccxRValue] = useState(BigInt(9696969696)); // Default from EACCBar contract
  const [eaccxKValue, setEaccxKValue] = useState(BigInt(33)); // Default from EACCBar contract

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

  // Read contracts data (excluding multiplier calculation)
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
      // Allowance - always fetch this regardless of mode
      {
        ...eaccContract,
        functionName: 'allowance',
        args: [address || '0x', Config?.EACCBarAddress || '0x'],
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Get R value from EACCToken
      {
        ...eaccContract,
        functionName: 'R',
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Get K value from EACCToken
      {
        ...eaccContract,
        functionName: 'K',
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Get R value from EACCBar
      {
        ...eaccBarContract,
        functionName: 'R',
        chainId: ARBITRUM_CHAIN_ID,
      },
      // Get K value from EACCBar
      {
        ...eaccBarContract,
        functionName: 'K',
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

  const allowance = contractsData?.[2]?.result && typeof contractsData[2].result === 'bigint'
    ? contractsData[2].result
    : BigInt(0);

  // Get R and K values from both contracts (fixed indices)
  const eaccRValueIndex = 3;
  const eaccKValueIndex = 4;
  const eaccxRValueIndex = 5;
  const eaccxKValueIndex = 6;

  // Update R and K values when data is fetched
  useEffect(() => {
    // Update EACCToken R and K values
    if (contractsData?.[eaccRValueIndex]?.result && typeof contractsData[eaccRValueIndex].result === 'bigint') {
      setEaccRValue(contractsData[eaccRValueIndex].result);
    }

    if (contractsData?.[eaccKValueIndex]?.result && typeof contractsData[eaccKValueIndex].result === 'bigint') {
      setEaccKValue(contractsData[eaccKValueIndex].result);
    }

    // Update EACCBar R and K values
    if (contractsData?.[eaccxRValueIndex]?.result && typeof contractsData[eaccxRValueIndex].result === 'bigint') {
      setEaccxRValue(contractsData[eaccxRValueIndex].result);
    }

    if (contractsData?.[eaccxKValueIndex]?.result && typeof contractsData[eaccxKValueIndex].result === 'bigint') {
      setEaccxKValue(contractsData[eaccxKValueIndex].result);
    }
  }, [contractsData, eaccRValueIndex, eaccKValueIndex, eaccxRValueIndex, eaccxKValueIndex]);

  // Check if approved - only relevant when staking EACC
  const isApproved = isEACCStaking ? (allowance ? BigInt(allowance) > BigInt(0) : false) : true;

  // Calculate multiplier using R and K values
  // This replaces the contract call to get the multiplier
  useEffect(() => {
    // Calculate the multiplier: M(t) = e^(R*t + K*t^2)
    const calculateMultiplier = () => {
      try {
        // Convert lockupPeriod from weeks to seconds
        const tSeconds = BigInt(lockupPeriod * 7 * 24 * 60 * 60);

        // Select the appropriate R and K values based on staking mode
        const rValue = isEACCStaking ? eaccxRValue : eaccRValue;
        const kValue = isEACCStaking ? eaccxKValue : eaccKValue;

        // Calculate R*t
        const rt = rValue * tSeconds;

        // Calculate K*t²
        const tSquared = tSeconds * tSeconds;
        const ktSquared = kValue * tSquared;

        // Calculate R*t + K*t²
        const exponent = rt + ktSquared;

        // Using Math.exp because JavaScript can't directly handle BigInt in exponential
        // Convert to Number for Math.exp, divide by appropriate factor since we're
        // simulating fixed-point math from the contract
        const expValue = Math.exp(Number(exponent) / 1e18);

        // Convert back to a string with appropriate precision
        const multiplierValue = expValue.toFixed(18);
        setMultiplier(multiplierValue);
      } catch (err) {
        console.error("Error calculating multiplier:", err);
        setMultiplier('0');
      }
    };

    // Only calculate if we have valid R and K values
    if ((isEACCStaking && eaccxRValue && eaccxKValue) ||
        (!isEACCStaking && eaccRValue && eaccKValue)) {
      calculateMultiplier();
    }
  }, [lockupPeriod, eaccRValue, eaccKValue, eaccxRValue, eaccxKValue, isEACCStaking]);

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
      console.log("Starting approval process...");
      // Use a pre-calculated max uint256 value to avoid overflow
      const MAX_UINT256 = BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

      await writeContractWithNotifications({
        abi: EACC_TOKEN_ABI,
        address: Config.EACCAddress,
        functionName: 'approve',
        args: [Config.EACCBarAddress, MAX_UINT256],
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
      console.log("Approval initiated successfully");
      // Refetch will be triggered automatically by the event watcher
    } catch (error) {
      Sentry.captureException(error);
      setError(error);
      console.error("Error approving tokens:", error);
      setIsApproving(false);
    }
  };

  // Handle staking
  const handleStake = async (amountToStake) => {
    if (!amountToStake || !isArbitrumOne) return;

    setIsLoading(true);
    try {
      const amountWei = parseEther(amountToStake);
      const tSeconds = BigInt(lockupPeriod * 7 * 24 * 60 * 60); // Convert weeks to seconds

      if (isEACCStaking) {
        await writeContractWithNotifications({
          address: Config!.EACCBarAddress,
          abi: EACC_BAR_ABI,
          functionName: 'enter',
          args: [amountWei, tSeconds],
          contracts: {
            eaccBarAddress: Config!.EACCBarAddress,
          },
          successMessage: 'Successfully staked EACC tokens!',
          customErrorMessages: {
            userDenied: 'Staking was denied by the user',
            default: 'Failed to stake tokens'
          },
          onSuccess: () => {
            // Reset amount after successful transaction
            setStakeAmount('');
          }
        });
      } else {
        await writeContractWithNotifications({
          address: Config!.EACCAddress,
          abi: EACC_TOKEN_ABI,
          functionName: 'depositForStream',
          args: [amountWei, tSeconds],
          contracts: {
            eaccAddress: Config!.EACCAddress,
          },
          successMessage: 'Successfully created new stream!',
          customErrorMessages: {
            userDenied: 'Stream creation was denied by the user',
            default: 'Failed to create new stream'
          },
          onSuccess: () => {
            // Reset amount after successful transaction
            setStakeAmount('');
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
  const handleUnstake = async (amountToUnstake) => {
    if (!amountToUnstake || !isArbitrumOne) return;

    setIsLoading(true);
    try {
      const amountWei = parseEther(amountToUnstake);

      await writeContractWithNotifications({
        address: Config!.EACCBarAddress,
        abi: EACC_BAR_ABI,
        functionName: 'leave',
        args: [amountWei],
        contracts: {
          eaccBarAddress: Config!.EACCBarAddress,
        },
        successMessage: 'Successfully unstaked tokens!',
        customErrorMessages: {
          userDenied: 'Unstaking was denied by the user',
          default: 'Failed to unstake tokens'
        },
        onSuccess: () => {
          // Reset amount after successful transaction
          setUnstakeAmount('');
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
  const handleMaxAmount = (operation: 'stake' | 'unstake') => {
    if (operation === 'stake' && eaccBalance) {
      setStakeAmount(formatEther(eaccBalance));
    } else if (operation === 'unstake' && eaccxBalance) {
      setUnstakeAmount(formatEther(eaccxBalance));
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
      eaccRValue,
      eaccKValue,
      eaccxRValue,
      eaccxKValue,
      multiplier,
      isApproved,
      isEACCStaking
    });
  }, [
    contractsData,
    eaccBalance,
    eaccxBalance,
    allowance,
    eaccRValue,
    eaccKValue,
    eaccxRValue,
    eaccxKValue,
    multiplier,
    isApproved,
    isEACCStaking
  ]);

  // Return values and functions
  return {
    // State
    stakeAmount,
    setStakeAmount,
    unstakeAmount,
    setUnstakeAmount,
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
