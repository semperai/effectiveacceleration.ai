import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Loader2 } from 'lucide-react';
import { CheckIcon } from '@heroicons/react/20/solid';

export type WithdrawCollateralButtonProps = {
  address: string | undefined;
  job: Job;
};

export function WithdrawCollateralButton({
  address,
  job,
  ...rest
}: WithdrawCollateralButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [isWithrawing, setIsWithrawing] = useState(false);
  const { showError } = useToast();

  const {
    writeContractWithNotifications,
    isConfirming,
    isConfirmed,
    error
  } = useWriteContractWithNotifications();

  async function handleWithdraw() {
    setIsWithrawing(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'withdrawCollateral',
        args: [BigInt(job.id!)],
      });
    } catch (err: any) {
      showError(`Error Withrawing job: ${err.message}`);
    } finally {
      setIsWithrawing(false);
    }
  }

  const buttonText = isWithrawing ? 'Withrawing...' : 'Withraw';


  return (
    <>
      <Button
        disabled={isWithrawing}
        onClick={handleWithdraw}
        color={'borderlessGray'}
        className={'w-full'}
      >
        {(isWithrawing || isConfirming) && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        <CheckIcon className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
        {buttonText}
      </Button>
    </>
  );
}
