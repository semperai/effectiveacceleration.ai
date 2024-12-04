import { Button } from '@/components/Button';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Loader2 } from 'lucide-react';



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

  const {
    writeContractWithNotifications,
    isConfirming,
    isConfirmed,
    error
  } = useWriteContractWithNotifications();


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
        {(isClosing|| isConfirming) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {buttonText}
      </Button>
    </>
  );
}
