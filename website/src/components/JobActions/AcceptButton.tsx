import { Button } from '@/components/Button'
import { CheckIcon } from "@heroicons/react/20/solid";
import { Job, JobEventWithDiffs } from "@effectiveacceleration/contracts";
import { MARKETPLACE_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { useSignMessage, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export type AcceptButtonProps = {
  address: string | undefined,
  events: JobEventWithDiffs[],
  job: Job,
}

export function AcceptButton({address, job, events, ...rest}: AcceptButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const { signMessageAsync } = useSignMessage();
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
    setButtonDisabled(true);

    const revision = events.length;
    const signature = await signMessageAsync({
      account: address,
      message: {raw: ethers.getBytes(ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(["uint256", "uint256"], [revision, job.id!])))}
    });

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress,
      functionName: 'takeJob',
      args: [
        BigInt(job.id!),
        signature,
      ],
    });
  }

  return <>
    <Button disabled={buttonDisabled} onClick={buttonClick} color={'borderlessGray'} className={'w-full'}>
      <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
      Sign Job Scope
    </Button>
  </>
}