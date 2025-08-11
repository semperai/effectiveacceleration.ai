// src/app/dashboard/post-job/SubmitJobButton.tsx
import ERC20Abi from '@/abis/ERC20.json';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { ZeroHash } from 'ethers';
import { Loader2, Send, Unlock, AlertCircle } from 'lucide-react';
import { useCallback, useState, useRef, useEffect } from 'react';
import type { Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { useRouter } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';

interface SubmitJobButtonProps {
  title: string;
  description: string;
  multipleApplicants: boolean;
  tags: string[];
  token: Address;
  amount: bigint;
  deadline: bigint;
  deliveryMethod: string;
  arbitrator: Address;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export const SubmitJobButton = ({
  title,
  description,
  multipleApplicants,
  tags,
  token,
  amount,
  deadline,
  deliveryMethod,
  arbitrator,
  onSuccess,
  onError,
}: SubmitJobButtonProps) => {
  const Config = useConfig();
  const router = useRouter();
  const { address } = useAccount();
  const { showError, showSuccess, showLoading, toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const loadingToastIdRef = useRef<string | number | null>(null);

  // Helper function to safely stringify BigInt values
  const stringifyWithBigInt = (obj: any): string => {
    return JSON.stringify(obj, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );
  };

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
  } = useReadContract({
    address: token,
    abi: ERC20Abi,
    functionName: 'allowance',
    args: [address, Config?.marketplaceAddress],
    query: {
      enabled: !!address && !!token && !!Config?.marketplaceAddress,
    },
  });

  const { writeContractWithNotifications, isConfirming } =
    useWriteContractWithNotifications();

  // Handle job submission
  const handleSubmitJob = async () => {
    try {
      if (!Config) {
        throw new Error('Config not found');
      }

      // Additional validation before submission
      if (tags.length === 0) {
        showError('No tags provided. At least one MECE tag is required.');
        return;
      }

      setIsSubmitting(true);
      let contentHash = ZeroHash;

      if (description.length > 0) {
        dismissLoadingToast();
        loadingToastIdRef.current = showLoading(
          'Publishing job post to IPFS...'
        );
        try {
          const { hash } = await publishToIpfs(description);
          contentHash = hash;
        } catch (err) {
          Sentry.captureException(err);
          dismissLoadingToast();
          showError('Failed to publish job post to IPFS');
          setIsSubmitting(false);
          onError?.(err as Error);
          return;
        }
        dismissLoadingToast();
        showSuccess('Job post published to IPFS');
      }

      const args = [
        title,
        contentHash as string,
        multipleApplicants,
        tags,
        token,
        amount,
        deadline,
        deliveryMethod,
        arbitrator,
        [], // allowedWorkers - empty array
      ];

      try {
        await writeContractWithNotifications({
          address: Config.marketplaceAddress,
          abi: MARKETPLACE_V1_ABI,
          functionName: 'publishJobPost',
          args,
          contracts: {
            marketplaceAddress: Config.marketplaceAddress,
            marketplaceDataAddress: Config.marketplaceDataAddress,
          },
          onReceipt: (receipt, parsedEvents) => {
            showSuccess('Job post submitted successfully!');
            onSuccess?.();
            for (const event of parsedEvents) {
              if (event.eventName === 'JobEvent') {
                router.push(`/dashboard/jobs/${event.args.jobId}`);
                return;
              }
            }
          },
        });
      } catch (error: any) {
        // Parse the error message to provide more helpful feedback
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
        throw error; // Re-throw to be caught by outer try-catch
      }
    } catch (err) {
      Sentry.captureException(err);

      // Enhanced error handling
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('exactly one MECE tag is required')) {
        showError('Please select exactly one category for your job post.');
      } else if (!errorMessage.includes('Transaction failed')) {
        // Only show this if we haven't already shown a more specific error
        showError(`Failed to submit job: ${errorMessage}`);
      }

      onError?.(err as Error);
    } finally {
      setIsSubmitting(false);
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
    return (
      <button className='group relative min-w-[180px] rounded-xl border border-red-500/20 bg-red-500/10 px-6 py-3 font-medium text-red-600 backdrop-blur-sm transition-all duration-200 dark:text-red-400'>
        Error checking approval
      </button>
    );
  }

  // Show approve button if not approved
  if (!allowanceData || allowanceData === 0n) {
    return (
      <ApproveButton
        token={token}
        spender={Config.marketplaceAddress}
        onApproveSuccess={() => refetchAllowance()}
        onApproveError={onError}
      />
    );
  }

  // Show submit button if approved
  return (
    <div className='flex flex-col items-end gap-2'>
      <button
        onClick={handleSubmitJob}
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
            <span>Submitting Job...</span>
          </span>
        ) : (
          <span className='relative flex items-center justify-center gap-2 text-white'>
            <Send className='h-4 w-4' />
            <span className='text-white'>Submit Job Post</span>
          </span>
        )}
      </button>
    </div>
  );
};

// Updated ApproveButton component with glassmorphic design
export const ApproveButton = ({
  token,
  spender,
  onApproveSuccess,
  onApproveError,
}: {
  token: Address;
  spender: Address;
  onApproveSuccess: () => void;
  onApproveError?: (error: Error) => void;
}) => {
  const { writeContractWithNotifications, isConfirming } =
    useWriteContractWithNotifications();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await writeContractWithNotifications({
        address: token,
        abi: ERC20Abi,
        functionName: 'approve',
        args: [
          spender,
          BigInt(
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          ),
        ], // Max approval
        onReceipt: () => {
          onApproveSuccess();
        },
      });
    } catch (err) {
      onApproveError?.(err as Error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <button
      onClick={handleApprove}
      disabled={isApproving || isConfirming}
      className={`group relative min-w-[180px] rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
        isApproving || isConfirming
          ? 'cursor-not-allowed border border-gray-200/50 bg-gray-100/50 text-gray-400 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-500'
          : 'transform border border-blue-500/50 bg-white/10 text-blue-600 shadow-lg backdrop-blur-sm hover:scale-[1.02] hover:border-blue-500/70 hover:bg-white/20 hover:shadow-xl active:scale-[0.98] dark:border-blue-400/50 dark:bg-gray-800/50 dark:text-blue-400 dark:hover:border-blue-400/70 dark:hover:bg-gray-800/70'
      } `}
    >
      {/* Subtle shimmer effect on hover */}
      {!isApproving && !isConfirming && (
        <div className='absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
          <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full' />
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
