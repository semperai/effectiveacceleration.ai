import { Loader2 } from 'lucide-react';
import { Button } from '@/components/Button';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';

export type RefundButtonProps = {
  address: string | undefined;
  job: Job;
};

export function RefundButton({
  address,
  job,
  ...rest
}: RefundButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [isRefunding, setIsRefunding] = useState(false);
  const { showError } = useToast();

  const {
    writeContractWithNotifications,
    isConfirming,
    isConfirmed,
    error
  } = useWriteContractWithNotifications();

  async function handleRefund() {
    setIsRefunding(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'refund',
        args: [BigInt(job.id!)],
      });
    } catch (err: any) {
      showError(`Error refunding job: ${err.message}`);
    } finally {
      setIsRefunding(false);
    }
  }

  const buttonText = isRefunding ? 'Refunding...' : 'Refund';

  return (
    <>
      <Button
        disabled={isRefunding || isConfirming}
        onClick={handleRefund}
        color={'borderlessGray'}
        className={'w-full'}
      >
        {(isRefunding || isConfirming) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        <CheckIcon className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
        {buttonText}
      </Button>
    </>
  );
}
