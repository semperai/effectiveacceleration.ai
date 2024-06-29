import { Button } from '@/components/Button'
import { CheckIcon } from "@heroicons/react/20/solid";
import { Job, JobEventWithDiffs, publishToIpfs } from "effectiveacceleration-contracts";
import { MARKETPLACE_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useEffect, useState } from "react";
import { zeroAddress } from "viem";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export type DeliverResultButtonProps = {
  address: `0x${string}` | undefined,
  events: JobEventWithDiffs[],
  sessionKeys: Record<string, string>,
  job: Job | undefined,
  message: string,
}

export function DeliverResultButton({address, job, events, message, sessionKeys, ...rest}: DeliverResultButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const {
    data: hash,
    error,
    writeContract,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash
  });

  useEffect(() => {
    if (isConfirmed || error) {
      if (error) {
        const revertReason = error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1];
        if (revertReason) {
          alert(error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1])
        } else {
          console.log(error, error.message);
          alert("Unknown error occurred");
        }
      }
      setButtonDisabled(false);
    }
  }, [isConfirmed, error]);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function buttonClick() {
    if (message.length === 0) {
      alert("Empty result");
      return;
    }

    setButtonDisabled(true);

    const sessionKey = sessionKeys[`${address}-${job?.roles.creator}`];
    const { hash: contentHash } = await publishToIpfs(message, sessionKey);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'deliverResult',
      args: [
        job?.id!,
        contentHash as `0x${string}`,
      ],
    });
  }

  return (job?.roles.worker === address) ? (<>
    <span className="ml-3">
      <Button disabled={buttonDisabled} onClick={buttonClick}>
        <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        Deliver Result
      </Button>
    </span>
  </>) : <></>
}