import { Button } from '@/components/Button';
import { Job } from 'effectiveacceleration-contracts';
import Config from 'effectiveacceleration-contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1';
import { useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export type ReopenButtonProps = {
  address: `0x${string}` | undefined;
  job: Job;
};

export function ReopenButton({
  address,
  job,
  ...rest
}: ReopenButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const { data: hash, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirmed || error) {
      if (error) {
        const revertReason = error.message.match(
          `The contract function ".*" reverted with the following reason:\n(.*)\n.*`
        )?.[1];
        if (revertReason) {
          alert(
            error.message.match(
              `The contract function ".*" reverted with the following reason:\n(.*)\n.*`
            )?.[1]
          );
        } else {
          console.log(error, error.message);
          alert('Unknown error occurred');
        }
      }
      setButtonDisabled(false);
    }
  }, [isConfirmed, error]);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function buttonClick() {
    setButtonDisabled(true);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'reopenJob',
      args: [job.id!],
    });
  }

  return (
    <>
      <Button
        disabled={buttonDisabled}
        onClick={buttonClick}
        color={'borderlessGray'}
        className={'w-full'}
      >
        Restart Job
      </Button>
    </>
  );
}
