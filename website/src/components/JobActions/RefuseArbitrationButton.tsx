import { Button } from '@/components/Button';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Loader2 } from 'lucide-react';
import { CheckIcon } from '@heroicons/react/20/solid';
import * as Sentry from '@sentry/nextjs';

export type RefuseArbitrationButtonProps = {
  job: Job;
};

export function RefuseArbitrationButton({
  job,
  ...rest
}: RefuseArbitrationButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [isRefusing, setIsRefusing] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleRefuse() {
    setIsRefusing(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'refuseArbitration',
        args: [BigInt(job.id!)],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error refusing job: ${err.message}`);
    } finally {
      setIsRefusing(false);
    }
  }

  const buttonText = isRefusing ? 'Refusing...' : 'Refuse';

  return (
    <>
      <Button
        disabled={isRefusing}
        onClick={handleRefuse}
        color={'borderlessGray'}
        className={'w-full'}
      >
        {(isRefusing || isConfirming) && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        <CheckIcon className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
        {buttonText}
      </Button>
    </>
  );
}
