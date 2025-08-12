import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import * as Sentry from '@sentry/nextjs';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ActionButtonProps {
  functionName: string;
  args: any[];
  label: string;
  performingLabel: string;
}

export function ActionButton({
  functionName,
  args,
  label,
  performingLabel,
  ...rest
}: ActionButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [isPerforming, setIsPerforming] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handle() {
    setIsPerforming(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName,
        args,
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(err.message);
    } finally {
      setIsPerforming(false);
    }
  }

  const buttonText = isPerforming ? performingLabel : label;

  return (
    <Button
      disabled={isPerforming || isConfirming}
      onClick={handle}
      color={'borderlessGray'}
      className={'w-full'}
    >
      {(isPerforming || isConfirming) && (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      )}
      {buttonText}
    </Button>
  );
}
