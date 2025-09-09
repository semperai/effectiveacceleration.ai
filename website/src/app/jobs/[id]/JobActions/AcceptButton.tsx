import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import type { Job, JobEventWithDiffs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import * as Sentry from '@sentry/nextjs';
import { ethers } from 'ethers';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useSignMessage, useConfig as useWagmiConfig } from 'wagmi';
import { readContract } from '@wagmi/core';

export type AcceptButtonProps = {
  address: string | undefined;
  events: JobEventWithDiffs[];
  job: Job;
};

export function AcceptButton({
  address,
  job,
  events,
  ...rest
}: AcceptButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const { signMessageAsync } = useSignMessage();
  const Config = useConfig();
  const wagmiConfig = useWagmiConfig();
  const [isAccepting, setIsAccepting] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleAccept() {
    setIsAccepting(true);
    
    try {
      // Fetch current events length from blockchain to avoid race conditions
      const eventsLength = await readContract(wagmiConfig, {
        abi: MARKETPLACE_DATA_V1_ABI,
        address: Config!.marketplaceDataAddress as `0x${string}`,
        functionName: 'eventsLength',
        args: [BigInt(job.id!)],
      });
      
      const revision = Number(eventsLength);
      
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

      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'takeJob',
        args: [BigInt(job.id!), signature],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error accepting job: ${err.message}`);
    } finally {
      setIsAccepting(false);
    }
  }

  const buttonText = isAccepting ? 'Accepting...' : 'Accept';

  return (
    <Button
      disabled={isAccepting || isConfirming}
      onClick={handleAccept}
      color={'borderlessGray'}
      className={'w-full'}
    >
      {(isAccepting || isConfirming) && (
        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
      )}
      {buttonText}
    </Button>
  );
}
