// src/app/dashboard/post-job/SubmitJobButton.tsx
import ERC20Abi from '@/abis/ERC20.json';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { ZeroHash } from 'ethers';
import { Loader2, Send, CheckCircle, Lock, Unlock } from 'lucide-react';
import { useCallback, useState, useRef } from 'react';
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
        [],
      ];

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
          for (const event of parsedEvents) {
            if (event.eventName === 'JobEvent') {
              router.push(`/dashboard/jobs/${event.args.jobId}`);
              return;
            }
          }
        },
      });
    } catch (err) {
      Sentry.captureException(err);
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

  // Show submit button if approved - matching Continue to Review style
  return (
    <button
      onClick={handleSubmitJob}
      disabled={isSubmitting || isConfirming}
      className={`group relative min-w-[180px] rounded-xl px-6 py-3 font-medium transition-all duration-200 ${
        isSubmitting || isConfirming
          ? 'cursor-not-allowed border border-gray-200/50 bg-gray-100/50 text-gray-400 backdrop-blur-sm dark:border-gray-700/50 dark:bg-gray-800/50 dark:text-gray-500'
          : 'border border-white/10 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 shadow-lg hover:shadow-xl dark:border-gray-900/10 dark:from-white dark:via-purple-100/20 dark:to-white'
      } `}
    >
      {/* Subtle shimmer effect on hover */}
      {!isSubmitting && !isConfirming && (
        <div className='absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
          <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-full dark:via-purple-500/10' />
        </div>
      )}

      {isSubmitting || isConfirming ? (
        <span className='relative flex items-center justify-center gap-2'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>Submitting Job...</span>
        </span>
      ) : (
        <span className='relative flex items-center justify-center gap-2 text-white dark:text-gray-900'>
          <Send className='h-4 w-4' />
          <span className='text-white dark:text-gray-900'>Submit Job Post</span>
        </span>
      )}
    </button>
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
          : 'border border-purple-500/30 bg-white/5 text-purple-600 shadow-lg backdrop-blur-xl hover:border-purple-500/50 hover:bg-white/10 hover:shadow-xl dark:border-purple-400/30 dark:bg-gray-800/30 dark:text-purple-400 dark:hover:border-purple-400/50 dark:hover:bg-gray-800/50'
      } `}
    >
      {/* Subtle shimmer effect on hover */}
      {!isApproving && !isConfirming && (
        <div className='absolute inset-0 overflow-hidden rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100'>
          <div className='absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-purple-500/5 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full' />
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
