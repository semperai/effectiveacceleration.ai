import ERC20Abi from '@/abis/ERC20.json';
import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { ZeroHash } from 'ethers';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useCallback, useState, useRef } from 'react';
import type { Address } from 'viem';
import { useAccount, useReadContract } from 'wagmi';
import { ApproveButton } from './ApproveButton';
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
      <Button disabled className='min-w-[140px] px-6 py-3 rounded-xl bg-gray-200 text-gray-400'>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        Checking approval...
      </Button>
    );
  }

  // Show error state
  if (allowanceIsError) {
    return (
      <Button className='min-w-[140px] px-6 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200'>
        Error checking approval
      </Button>
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
    <Button
      onClick={handleSubmitJob}
      disabled={isSubmitting || isConfirming}
      className={`
        min-w-[140px] px-6 py-3 rounded-xl font-medium transition-all duration-200
        ${isSubmitting || isConfirming
          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
        }
      `}
    >
      {isSubmitting || isConfirming ? (
        <span className='flex items-center gap-2 text-white'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Submitting Job...
        </span>
      ) : (
        <span className='flex items-center gap-2 text-white'>
          <Send className='h-4 w-4 text-white' />
          Submit Job Post
        </span>
      )}
    </Button>
  );
};
