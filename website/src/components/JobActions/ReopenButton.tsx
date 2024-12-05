import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Loader2 } from 'lucide-react';

export type ReopenButtonProps = {
  address: string | undefined;
  job: Job;
};

export function ReopenButton({
  address,
  job,
  ...rest
}: ReopenButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [isReopening, setIsReopening] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleReopen() {
    setIsReopening(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'reopenJob',
        args: [BigInt(job.id!)],
      });
    } catch (err: any) {
      showError(`Error Reopening job: ${err.message}`);
    } finally {
      setIsReopening(false);
    }
  }

  const buttonText = isReopening ? 'Reopening...' : 'Reopen';

  return (
    <>
      <Button
        disabled={isReopening || isConfirming}
        onClick={handleReopen}
        color={'borderlessGray'}
        className={'w-full'}
      >
        {(isReopening || isConfirming) && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        {buttonText}
      </Button>
    </>
  );
}
