import ERC20Abi from '@/abis/ERC20.json';
import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { ZeroHash } from 'ethers';
import { Loader2 } from 'lucide-react';
import { useCallback, useState, useRef } from 'react';
import { type Address } from 'viem';
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
  amount: BigInt;
  deadline: BigInt;
  deliveryMethod: string;
  arbitrator: Address;
  //  whitelistedWorkers: Address[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// TODO support adding whitelistedWorkers
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
          showSuccess('Job post submitted');
          for (const event of parsedEvents) {
            if (event.eventName === 'JobEvent') {
              router.push(`/dashboard/jobs/${event.args.jobId}`);
              return;
            }
          }
          console.log('parsedEvents', parsedEvents);
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
      <Button disabled className='min-w-[120px]'>
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        Checking approval...
      </Button>
    );
  }

  // Show error state
  if (allowanceIsError) {
    return (
      <Button color='red' className='min-w-[120px]'>
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
      className='min-w-[120px]'
    >
      {isSubmitting || isConfirming ? (
        <>
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
          Submitting...
        </>
      ) : (
        'Submit Job'
      )}
    </Button>
  );
};
