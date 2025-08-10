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
        className='group relative min-w-[180px] px-6 py-3 rounded-xl font-medium bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed transition-all duration-200'
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
      <button 
        className='group relative min-w-[180px] px-6 py-3 rounded-xl font-medium bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-600 dark:text-red-400 transition-all duration-200'
      >
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

  // Show submit button if approved - glassmorphic design
  return (
    <button
      onClick={handleSubmitJob}
      disabled={isSubmitting || isConfirming}
      className={`group relative px-8 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg border border-white/10 bg-slate-800`}
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
  const { writeContractWithNotifications, isConfirming } = useWriteContractWithNotifications();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await writeContractWithNotifications({
        address: token,
        abi: ERC20Abi,
        functionName: 'approve',
        args: [spender, BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')], // Max approval
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
      className={`
        group relative min-w-[180px] px-6 py-3 rounded-xl font-medium transition-all duration-200
        ${isApproving || isConfirming
          ? 'bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          : 'bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm border border-blue-500/50 dark:border-blue-400/50 text-blue-600 dark:text-blue-400 hover:bg-white/20 dark:hover:bg-gray-800/70 hover:border-blue-500/70 dark:hover:border-blue-400/70 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
        }
      `}
    >
      {/* Subtle shimmer effect on hover */}
      {!isApproving && !isConfirming && (
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
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
