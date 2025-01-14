import { useToast } from '@/hooks/useToast';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Address,
  decodeEventLog,
  DecodeEventLogReturnType,
  Log,
  TransactionReceipt,
} from 'viem';
import { useWaitForTransactionReceipt, useWriteContract, useConfig } from 'wagmi';
import { simulateContract, WriteContractErrorType } from "@wagmi/core";
import * as Sentry from '@sentry/nextjs';

import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { useApolloClient } from '@apollo/client';

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
        console.log('Skipping log:', error);
        continue;
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
  contracts?: {
    marketplaceAddress: Address;
    marketplaceDataAddress: Address;
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
  const config = useConfig()
  const client = useApolloClient();
  const { showError, showSuccess, showLoading, toast } = useToast();
  const [simulateError, setSimlateError] = useState<WriteContractErrorType | undefined>(undefined);
  const { data: hash, error, writeContract, isError } = useWriteContract();
  const onSuccessCallbackRef = useRef<
    ((receipt: TransactionReceipt, events: ParsedEvent[]) => void) | undefined
  >();
  const onReceiptCallbackRef = useRef<
    ((receipt: TransactionReceipt, events: ParsedEvent[]) => void) | undefined
  >();
  const contractsRef = useRef<WriteContractConfig['contracts']>();
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

    const contracts = [
      {
        address: contractsRef.current.marketplaceAddress,
        abi: MARKETPLACE_V1_ABI,
        name: 'MarketplaceV1',
      },
      {
        address: contractsRef.current.marketplaceDataAddress,
        abi: MARKETPLACE_DATA_V1_ABI,
        name: 'MarketplaceDataV1',
      },
    ];

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
            abi,
            address,
            functionName,
            args,
          });
        } catch (e: any) {
          setSimlateError(e);
          return
        }

        await writeContract({
          abi,
          address,
          functionName,
          args,
        });
      } catch (e: any) {
        Sentry.captureException(e);
        dismissLoadingToast();
        showError(`An error occurred: ${e?.message}`);
      }
    },
    [writeContract, showError, showLoading, toast, getRevertReason, setSimlateError]
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

      setTimeout(() => {
        console.log('Resetting gql cache');
        client.resetStore();
        setTimeout(() => {
          console.log('Resetting gql cache');
          client.resetStore();
        }, 3000);
      }, 3000);

      // Log parsed events to console
      console.group('Transaction Events');
      parsedEvents.forEach((event) => {
        console.group(`${event.contractName} - ${event.eventName}`);
        console.log('Contract Address:', event.address);
        console.log('Event Arguments:', event.args);
        console.groupEnd();
      });
      console.groupEnd();
    }
  }, [isConfirmed, receipt, parseEvents]);

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

      const { type, message } = getRevertReason((error || simulateError)!.message);

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
    loadingToastIdRef
  };
}
