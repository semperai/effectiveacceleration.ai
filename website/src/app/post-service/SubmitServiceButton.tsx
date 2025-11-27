import { ERC20_ABI } from '@/lib/constants';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { publishToIpfs } from '@effectiveacceleration/contracts';
import { SERVICE_MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/ServiceMarketplaceV1';
import { ZeroHash } from 'ethers';
import { Loader2, Send, Unlock, AlertCircle } from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';
import type { Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

interface SubmitServiceButtonProps {
  title: string;
  description: string;
  tags: string[];
  token: Address;
  amount: bigint;
  deadline: bigint;
  deliveryMethod: string;
  arbitrator: Address;
  onTransactionStart?: () => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const SubmitServiceButton = ({
  title,
  description,
  tags,
  token,
  amount,
  deadline,
  deliveryMethod,
  arbitrator,
  onTransactionStart,
  onSuccess,
  onError,
}: SubmitServiceButtonProps) => {
  const Config = useConfig();
  const router = useRouter();
  const { address } = useAccount();
  const { showError, showSuccess, showLoading, toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loadingToastIdRef = useRef<string | number | null>(null);
  const hasNavigatedRef = useRef(false);

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  // Check if token is approved
  const {
    data: allowanceData,
    isError: allowanceIsError,
    isLoading: allowanceIsLoading,
    refetch: refetchAllowance,
    error: allowanceError,
  } = useReadContract({
    address: token,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [
      address as `0x${string}`,
      (Config as any)?.serviceMarketplaceAddress as `0x${string}`,
    ],
    query: {
      enabled: !!address && !!token && !!(Config as any)?.serviceMarketplaceAddress,
    },
  });

  // Log allowance check details
  useEffect(() => {
    console.log('Allowance check:', {
      token,
      address,
      serviceMarketplaceAddress: (Config as any)?.serviceMarketplaceAddress,
      allowanceData,
      allowanceIsError,
      allowanceError,
      isLoading: allowanceIsLoading,
    });
  }, [token, address, Config, allowanceData, allowanceIsError, allowanceError, allowanceIsLoading]);

  const {
    writeContractWithNotifications,
    isConfirming,
    isConfirmed,
    error: writeError,
  } = useWriteContractWithNotifications();

  // Monitor transaction confirmation status
  useEffect(() => {
    if (isConfirmed && !hasNavigatedRef.current) {
      showSuccess('Service listing submitted successfully!');
      onSuccess?.();
      setIsSubmitting(false);

      setTimeout(() => {
        if (!hasNavigatedRef.current) {
          router.push('/services');
        }
      }, 1000);
    }
  }, [isConfirmed, onSuccess, router, showSuccess]);

  // Monitor for errors
  useEffect(() => {
    if (writeError) {
      setIsSubmitting(false);
      onError?.(writeError);
    }
  }, [writeError, onError]);

  // Handle service submission
  const handleSubmitService = async () => {
    try {
      if (!Config) {
        throw new Error('Config not found');
      }

      if (!(Config as any).serviceMarketplaceAddress) {
        throw new Error('Service marketplace address not found in config');
      }

      // Additional validation before submission
      if (tags.length === 0) {
        showError('No tags provided. At least one MECE tag is required.');
        return;
      }

      setIsSubmitting(true);
      hasNavigatedRef.current = false;

      // Notify parent that transaction is starting (shows loading modal)
      onTransactionStart?.();

      let contentHash = ZeroHash;

      if (description.length > 0) {
        dismissLoadingToast();
        loadingToastIdRef.current = showLoading(
          'Publishing service description to IPFS...'
        );
        try {
          const { hash } = await publishToIpfs(description);
          contentHash = hash;
        } catch (err) {
          Sentry.captureException(err);
          dismissLoadingToast();
          showError('Failed to publish service description to IPFS');
          setIsSubmitting(false);
          onError?.(err as Error);
          return;
        }
        dismissLoadingToast();
        showSuccess('Service description published to IPFS');
      }

      // Contract function signature:
      // createService(title_, contentHash_, tags_, token_, price_, deliveryTime_, deliveryMethod_, arbitrator_)
      const args = [
        title,
        contentHash as string,
        tags,
        token,
        amount,
        Number(deadline), // deliveryTime as uint32
        deliveryMethod,
        arbitrator,
      ];

      try {
        await writeContractWithNotifications({
          address: (Config as any).serviceMarketplaceAddress,
          abi: SERVICE_MARKETPLACE_V1_ABI,
          functionName: 'createService',
          args,
          onReceipt: (receipt, parsedEvents) => {
            showSuccess('Service listing submitted successfully!');
            onSuccess?.();
            hasNavigatedRef.current = true;

            for (const event of parsedEvents) {
              if (event.eventName === 'ServiceEvent') {
                router.push(`/services/${String(event.args.serviceId)}`);
                return;
              }
            }
            // Fallback if no service ID found in events
            router.push('/services');
          },
        });
      } catch (error: any) {
        const errorMessage = error.message || error.toString();
        if (errorMessage.includes('exactly one MECE tag is required')) {
          showError(
            'Error: Exactly one MECE category tag is required. Please ensure you have selected a category.'
          );
        } else if (errorMessage.includes('title too short or long')) {
          showError('Error: Title must be between 1 and 254 characters.');
        } else if (errorMessage.includes('amount must be greater than 0')) {
          showError('Error: Amount must be greater than 0.');
        } else if (errorMessage.includes('At least one tag is required')) {
          showError('Error: At least one tag is required.');
        } else {
          showError(`Transaction failed: ${errorMessage}`);
        }
        onError?.(error);
        throw error;
      }
    } catch (err) {
      Sentry.captureException(err);

      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('exactly one MECE tag is required')) {
        showError('Please select exactly one category for your service listing.');
      } else if (!errorMessage.includes('Transaction failed')) {
        showError(`Failed to submit service: ${errorMessage}`);
      }

      onError?.(err as Error);
    } finally {
      if (!isConfirmed) {
        setIsSubmitting(false);
      }
    }
  };

  // Show loading state while checking allowance
  if (allowanceIsLoading || Config === undefined) {
    return (
      <button
        disabled
        className='group relative min-w-[180px] cursor-not-allowed rounded-xl border border-gray-200/50 bg-gray-100/50 px-6 py-3 font-medium text-gray-400 backdrop-blur-sm transition-all duration-200 dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-500'
      >
        <span className='flex items-center justify-center gap-2'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Checking approval...
        </span>
      </button>
    );
  }

  // Show error state
  if (allowanceIsError) {
    console.error('Allowance check error:', allowanceError);
    return (
      <div className='flex flex-col gap-2'>
        <button className='group relative min-w-[180px] rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-3 font-medium text-red-600 backdrop-blur-sm transition-all duration-200 dark:text-red-400'>
          Error checking approval
        </button>
        <p className='text-xs text-red-600 dark:text-red-400'>
          {allowanceError?.message || 'Failed to check token approval'}
        </p>
      </div>
    );
  }

  // Show approve button if not approved
  if (!allowanceData || allowanceData === 0n) {
    return (
      <ApproveButton
        token={token}
        spender={(Config as any).serviceMarketplaceAddress}
        onApproveSuccess={async () => {
          await refetchAllowance();
        }}
        onApproveError={onError}
      />
    );
  }

  // Show submit button if approved
  return (
    <div className='flex flex-col items-end gap-2'>
      <button
        onClick={handleSubmitService}
        disabled={isSubmitting || isConfirming}
        className={`group relative rounded-xl border border-white/10 px-8 py-3 font-medium shadow-lg transition-all duration-200 ${
          isSubmitting || isConfirming
            ? 'cursor-not-allowed bg-gray-600'
            : 'bg-slate-800 hover:bg-slate-700'
        }`}
      >
        {isSubmitting || isConfirming ? (
          <span className='relative flex items-center justify-center gap-2 text-white'>
            <Loader2 className='h-4 w-4 animate-spin' />
            <span>Submitting Service...</span>
          </span>
        ) : (
          <span className='relative flex items-center justify-center gap-2 text-white'>
            <Send className='h-4 w-4' />
            <span className='text-white'>Submit Service Listing</span>
          </span>
        )}
      </button>
    </div>
  );
};

// ApproveButton component
export const ApproveButton = ({
  token,
  spender,
  onApproveSuccess,
  onApproveError,
}: {
  token: Address;
  spender: Address;
  onApproveSuccess: () => void | Promise<void>;
  onApproveError?: (error: Error) => void;
}) => {
  const { writeContractWithNotifications, isConfirming, isConfirmed } =
    useWriteContractWithNotifications();
  const [isApproving, setIsApproving] = useState(false);

  // Monitor approval confirmation
  useEffect(() => {
    if (isConfirmed && isApproving) {
      setTimeout(async () => {
        await onApproveSuccess();
        setIsApproving(false);
      }, 1000);
    }
  }, [isConfirmed, isApproving, onApproveSuccess]);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await writeContractWithNotifications({
        address: token,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [
          spender,
          BigInt(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          ),
        ],
        onReceipt: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await onApproveSuccess();
          setIsApproving(false);
        },
      });
    } catch (err) {
      setIsApproving(false);
      onApproveError?.(err as Error);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isApproving || isConfirming}
      className={`group relative min-w-[180px] rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
        isApproving || isConfirming
          ? 'cursor-not-allowed border border-gray-200/50 bg-gray-100/50 text-gray-400 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-500'
          : 'transform border border-green-500/50 bg-white/10 text-green-600 shadow-lg backdrop-blur-sm hover:scale-[1.02] hover:border-green-500/70 hover:bg-white/20 hover:shadow-xl active:scale-[0.98] dark:border-green-400/50 dark:bg-gray-800/50 dark:text-green-400 dark:hover:border-green-400/70 dark:hover:bg-gray-800/70'
      } `}
    >
      {!isApproving && !isConfirming && (
        <div className='absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
          <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-green-500/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full' />
        </div>
      )}

      {isApproving || isConfirming ? (
        <span className='relative flex items-center justify-center gap-2'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>Approving Token...</span>
        </span>
      ) : (
        <span className='relative flex items-center justify-center gap-2'>
          <Unlock className='h-4 w-4' />
          <span>Approve Token</span>
        </span>
      )}
    </button>
  );
};
