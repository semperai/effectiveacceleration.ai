import { useToast } from '@/hooks/useToast';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  type Address,
  decodeEventLog,
  type DecodeEventLogReturnType,
  type Log,
  type TransactionReceipt,
} from 'viem';
import {
  useWaitForTransactionReceipt,
  useWriteContract,
  useConfig,
} from 'wagmi';
import { simulateContract, type WriteContractErrorType } from '@wagmi/core';
import * as Sentry from '@sentry/nextjs';

import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { E_A_C_C_TOKEN_ABI as EACC_TOKEN_ABI } from '@effectiveacceleration/contracts/wagmi/EACCToken';
import { useClient } from 'urql';
import { useCacheInvalidation } from '@/contexts/CacheInvalidationContext';

type ParsedEvent = {
  contractName: string;
  eventName: string;
  args: Record<string, any>;
  address: Address;
};

function parseContractEvents(
  logs: Log[],
  contracts: { address: Address; abi: any; name: string }[]
): ParsedEvent[] {
  const parsedEvents: ParsedEvent[] = [];

  for (const log of logs) {
    for (const contract of contracts) {
      try {
        // Check if the log is from this contract
        if (log.address.toLowerCase() === contract.address.toLowerCase()) {
          const decoded = decodeEventLog({
            abi: contract.abi,
            data: log.data,
            topics: log.topics,
          }) as DecodeEventLogReturnType<typeof contract.abi>;

          parsedEvents.push({
            contractName: contract.name,
            eventName: decoded.eventName,
            args: decoded.args as Record<string, any>,
            address: log.address,
          });
          break; // Found matching contract, move to next log
        }
      } catch (error) {
        // Skip if this log isn't from this contract's events
      }
    }
  }

  return parsedEvents;
}

type WriteContractConfig = {
  abi: any;
  address: Address;
  functionName: string;
  args: any[];
  value?: bigint;
  contracts?: {
    marketplaceAddress?: Address;
    marketplaceDataAddress?: Address;
    eaccAddress?: Address;
    eaccBarAddress?: Address;
    sablierLockupAddress?: Address;
  };
  onSuccess?: (
    receipt: TransactionReceipt,
    parsedEvents: ParsedEvent[]
  ) => void;
  onReceipt?: (
    receipt: TransactionReceipt,
    parsedEvents: ParsedEvent[]
  ) => void;
  customErrorMessages?: {
    userDenied?: string;
    default?: string;
  };
  successMessage?: string;
};

export function useWriteContractWithNotifications() {
  const config = useConfig();
  const urqlClient = useClient();
  const { invalidate } = useCacheInvalidation();
  const { showError, showSuccess, showLoading, toast } = useToast();
  const [simulateError, setSimulateError] = useState<
    WriteContractErrorType | undefined
  >(undefined);
  const { data: hash, error, writeContract, isError } = useWriteContract();
  const onSuccessCallbackRef = useRef<
    ((receipt: TransactionReceipt, events: ParsedEvent[]) => void) | undefined
  >(undefined);
  const onReceiptCallbackRef = useRef<
    ((receipt: TransactionReceipt, events: ParsedEvent[]) => void) | undefined
  >(undefined);
  const contractsRef = useRef<WriteContractConfig['contracts']>(undefined);
  const [customErrorMessages, setCustomErrorMessages] = useState<
    WriteContractConfig['customErrorMessages']
  >({});

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
    query: {
      enabled: !!hash,
    },
  });

  const loadingToastIdRef = useRef<string | number | null>(null);

  const parseEvents = useCallback((receipt: TransactionReceipt) => {
    if (!contractsRef.current) return [];

    const contracts = [];
    if (contractsRef.current.marketplaceAddress) {
      contracts.push({
        address: contractsRef.current.marketplaceAddress,
        abi: MARKETPLACE_V1_ABI,
        name: 'MarketplaceV1',
      });
    }
    if (contractsRef.current.marketplaceDataAddress) {
      contracts.push({
        address: contractsRef.current.marketplaceDataAddress,
        abi: MARKETPLACE_DATA_V1_ABI,
        name: 'MarketplaceDataV1',
      });
    }
    if (contractsRef.current.eaccAddress) {
      contracts.push({
        address: contractsRef.current.eaccAddress,
        abi: EACC_TOKEN_ABI,
        name: 'EACCToken',
      });
    }

    return parseContractEvents(receipt.logs, contracts);
  }, []);

  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  const getRevertReason = useCallback((errorMessage: string) => {
    const revertMatch = errorMessage.match(
      /The contract function ".*" reverted with the following reason:\n(.*)\n.*/
    );
    const deniedMatch = errorMessage.match(/User denied transaction signature/);
    if (revertMatch)
      return { type: 'revert' as const, message: revertMatch[1] };
    if (deniedMatch)
      return { type: 'denied' as const, message: deniedMatch[0] };
    return { type: 'unknown' as const, message: null };
  }, []);

  const writeContractWithNotifications = useCallback(
    async ({
      abi,
      address,
      functionName,
      args,
      value,
      contracts,
      onSuccess,
      onReceipt,
      customErrorMessages = {},
      successMessage,
    }: WriteContractConfig) => {
      dismissLoadingToast();
      setCustomErrorMessages(customErrorMessages);
      loadingToastIdRef.current = showLoading(
        'Please confirm the transaction in your wallet...'
      );

      // Store callbacks and contracts in refs
      onSuccessCallbackRef.current = onSuccess;
      onReceiptCallbackRef.current = onReceipt;
      contractsRef.current = contracts;

      try {
        try {
          await simulateContract(config, {
            abi: abi as any,
            address,
            functionName,
            args,
            value,
          });
        } catch (e: any) {
          setSimulateError(e);
          return;
        }

        await writeContract({
          abi: abi as any,
          address,
          functionName,
          args,
          value,
        });
      } catch (e: any) {
        Sentry.captureException(e);
        dismissLoadingToast();
        showError(`An error occurred: ${e?.message}`);
      }
    },
    [
      writeContract,
      showError,
      showLoading,
      toast,
      getRevertReason,
      setSimulateError,
    ]
  );

  // Handle receipt
  useEffect(() => {
    if (receipt) {
      const parsedEvents = parseEvents(receipt);
      onReceiptCallbackRef.current?.(receipt, parsedEvents);
    }
  }, [receipt, parseEvents]);

  // Handle confirmation success
  useEffect(() => {
    if (isConfirmed && receipt) {
      dismissLoadingToast();
      showSuccess('Transaction confirmed successfully!');
      const parsedEvents = parseEvents(receipt);
      onSuccessCallbackRef.current?.(receipt, parsedEvents);

      // Trigger cache invalidation after delay to allow Subsquid to index the data
      setTimeout(() => {
        invalidate();
      }, 3000);
    }
  }, [isConfirmed, receipt, parseEvents, invalidate]);

  // Handle confirmation and success
  useEffect(() => {
    if (isConfirming) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading('Confirming transaction...');
    }
  }, [isConfirming]);

  // Handle errors
  useEffect(() => {
    if (error || simulateError) {
      dismissLoadingToast();

      const { type, message } = getRevertReason(
        (error || simulateError)!.message
      );

      if (type === 'revert' && message) {
        showError(message);
      } else if (type === 'denied') {
        showError(
          customErrorMessages?.userDenied || 'User denied transaction signature'
        );
      } else {
        showError(customErrorMessages?.default || 'An unknown error occurred');
      }
    }
  }, [error, simulateError]);

  // Handle error cleanup
  useEffect(() => {
    if (isError) {
      dismissLoadingToast();
    }
  }, [isError, dismissLoadingToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dismissLoadingToast();
    };
  }, [dismissLoadingToast]);

  return {
    writeContractWithNotifications,
    hash,
    error,
    isError,
    isConfirming,
    isConfirmed,
    receipt,
    loadingToastIdRef,
  };
}
