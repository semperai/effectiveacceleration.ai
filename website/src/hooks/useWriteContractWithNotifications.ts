import { useToast } from '@/hooks/useToast';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Address, Hash } from 'viem';
import { useEffect, useCallback, useRef } from 'react';

type WriteContractConfig = {
  abi: any[];
  address: Address;
  functionName: string;
  args: any[];
  onSuccess?: () => void;
  // Optional custom error messages
  customErrorMessages?: {
    userDenied?: string;
    default?: string;
  };
};

export function useWriteContractWithNotifications() {
  const { showError, showSuccess, showLoading, toast } = useToast();
  const { data: hash, error, writeContract, isError } = useWriteContract();
  const loadingToastIdRef = useRef<string | number | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  // Extract revert reason from error message
  const getRevertReason = useCallback((errorMessage: string) => {
    const revertMatch = errorMessage.match(
      /The contract function ".*" reverted with the following reason:\n(.*)\n.*/
    );
    const deniedMatch = errorMessage.match(/User denied transaction signature/);

    if (revertMatch) return { type: 'revert' as const, message: revertMatch[1] };
    if (deniedMatch) return { type: 'denied' as const, message: deniedMatch[0] };
    return { type: 'unknown' as const, message: null };
  }, []);

  // Main write function
  const writeContractWithNotifications = useCallback(
    async ({
      abi,
      address,
      functionName,
      args,
      onSuccess,
      customErrorMessages = {},
    }: WriteContractConfig) => {
      // Dismiss any existing loading toast
      dismissLoadingToast();

      loadingToastIdRef.current = showLoading('Please confirm the transaction in your wallet...');

      try {
        await writeContract({
          abi,
          address,
          functionName,
          args,
        });
      } catch (e) {
        dismissLoadingToast();
        const error = e as Error;
        const { type, message } = getRevertReason(error.message);

        if (type === 'revert' && message) {
          showError(message);
        } else if (type === 'denied') {
          showError(customErrorMessages.userDenied || 'User denied transaction signature');
        } else {
          showError(customErrorMessages.default || 'An unknown error occurred');
        }
      }
    },
    [writeContract, showError, showLoading, toast, getRevertReason]
  );

  // Handle confirmation and success
  useEffect(() => {
    if (isConfirming) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading('Confirming transaction...');
    }
  }, [isConfirming]);

  // Handle success and cleanup
  useEffect(() => {
    if (isConfirmed) {
      dismissLoadingToast();
      showSuccess('Transaction confirmed successfully!');
    }
  }, [isConfirmed]);

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
  };
}
