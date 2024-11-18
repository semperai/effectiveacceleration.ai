import { Button } from '@/components/Button'
import { CheckIcon, PencilIcon } from "@heroicons/react/20/solid";
import { Job, publishToIpfs } from "@effectiveacceleration/contracts";
import { MARKETPLACE_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Listbox, ListboxOption } from '../Listbox';
import { Textarea } from '../Textarea';
import { zeroAddress } from 'viem';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { PiPaperPlaneRight } from "react-icons/pi";


export type PostMessageButtonProps = {
  address: `0x${string}` | undefined,
  recipient: `0x${string}`,
  addresses: `0x${string}`[] | undefined,
  sessionKeys: Record<string, string>,
  job: Job,
}

export function PostMessageButton({address, recipient, addresses, job, sessionKeys, ...rest}: PostMessageButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const [message, setMessage] = useState<string>("");
  const excludes = [address];
  const userAddresses = [zeroAddress, ...(addresses?.filter(user => !excludes.includes(user)) ?? [])];
  const {data: users} = useUsersByAddresses(addresses?.filter(user => !excludes.includes(user) ?? []) as string[]);
  const [selectedUserAddress, setSelectedUserAddress] = useState<`0x${string}`>(zeroAddress);
  const selectedUserRecipient = recipient === address ? job.roles.creator : recipient

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
      setMessage("");
      if (error) {
        const revertReason = error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1];
        if (revertReason) {
          alert(error.message.match(`The contract function ".*" reverted with the following reason:\n(.*)\n.*`)?.[1])
        } else {
          console.log(error, error.message);
          alert("Unknown error occurred");
        }
      }
    }
  }, [isConfirmed, error]);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function buttonClick() {
    if (message.length === 0) {
      alert("Empty result");
      return;
    }

    const sessionKey = sessionKeys[`${address}-${selectedUserRecipient}`];
    const { hash: contentHash } = await publishToIpfs(message, sessionKey);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'postThreadMessage',
      args: [
        job.id!,
        contentHash as any,
        selectedUserRecipient,
      ],
    });

  }
  return <>
        <div className="w-full">
          <div className="flex  items-center justify-center text-center">
                <div className='flex flex-row w-full p-3 gap-x-5'>
                  <Textarea rows={1} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type new message" className="w-full !rounded" />
                    <Button disabled={buttonDisabled} onClick={buttonClick} color='lightBlue'>
                      <PiPaperPlaneRight className='text-white text-xl' />
                    </Button>
                </div>
          </div>
      </div>
  </>
}