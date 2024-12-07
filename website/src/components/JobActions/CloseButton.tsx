import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import * as Sentry from '@sentry/nextjs';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

export type CloseButtonProps = {
  address: string | undefined;
  job: Job;
};

export function CloseButton({
  address,
  job,
  ...rest
}: CloseButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [isClosing, setIsClosing] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleClose() {
    setIsClosing(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'closeJob',
        args: [BigInt(job.id!)],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error closing job: ${err.message}`);
    } finally {
      setIsClosing(false);
    }
  }

  const buttonText = isClosing ? 'Closing...' : 'Close';

  return (
    <>
      <Button
        disabled={isClosing || isConfirming}
        onClick={handleClose}
        color={'borderlessGray'}
        className={'w-full'}
      >
        {(isClosing || isConfirming) && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        {buttonText}
      </Button>
    </>
  );
}
