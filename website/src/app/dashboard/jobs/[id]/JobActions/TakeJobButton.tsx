import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import type { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import * as Sentry from '@sentry/nextjs';
import { ethers } from 'ethers';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSignMessage } from 'wagmi';
import useJobEventsWithDiffs from '@/hooks/subsquid/useJobEventsWithDiffs';

export type TakeJobButtonProps = {
  address: string | undefined;
  job: Job;
  showTooltip?: boolean;
};

export function TakeJobButton({
  address,
  job,
  showTooltip = true,
  ...rest
}: TakeJobButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const { signMessageAsync } = useSignMessage();
  const Config = useConfig();
  const [isTaking, setIsTaking] = useState(false);
  const { showError, showSuccess } = useToast();
  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  // Get events to calculate the revision number
  const { data: events } = useJobEventsWithDiffs(job.id);

  async function handleTakeJob() {
    if (!events) {
      showError('Unable to fetch job events. Please try again.');
      return;
    }

    setIsTaking(true);

    try {
      // Calculate revision based on events length
      const revision = events.length;

      // Sign the message with revision and job ID
      const signature = await signMessageAsync({
        account: address,
        message: {
          raw: ethers.getBytes(
            ethers.keccak256(
              ethers.AbiCoder.defaultAbiCoder().encode(
                ['uint256', 'uint256'],
                [revision, job.id!]
              )
            )
          ),
        },
      });

      // Call takeJob on the contract
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'takeJob',
        args: [BigInt(job.id!), signature],
      });

      showSuccess('Successfully accepted the job! Work can begin immediately.');
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error taking job: ${err.message}`);
    } finally {
      setIsTaking(false);
    }
  }

  const buttonText = isTaking
    ? 'Accepting Job...'
    : isConfirming
      ? 'Confirming...'
      : 'Take Job';

  return (
    <div className='relative w-full'>
      {showTooltip && (
        <div className='mb-2 rounded-lg bg-blue-50 p-2 text-xs text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'>
          ⚡ First Come, First Served - Taking this job will immediately assign
          it to you
        </div>
      )}
      <Button
        disabled={isTaking || isConfirming}
        onClick={handleTakeJob}
        color={'primary'}
        className={'w-full'}
        {...rest}
      >
        {(isTaking || isConfirming) && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        {buttonText}
      </Button>
    </div>
  );
}
