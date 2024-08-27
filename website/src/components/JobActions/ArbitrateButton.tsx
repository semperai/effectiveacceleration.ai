import { Button } from '@/components/Button'
import { CheckIcon } from "@heroicons/react/20/solid";
import { Job, publishToIpfs } from "effectiveacceleration-contracts";
import { MARKETPLACE_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Textarea } from '../Textarea';
import { Input } from '../Input';
import { Field, Label } from '../Fieldset';

export type ArbitrateButtonProps = {
  address: `0x${string}` | undefined,
  sessionKeys: Record<string, string>,
  job: Job,
}

export function ArbitrateButton({address, job, sessionKeys, ...rest}: ArbitrateButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const [ownerShare, setOwnerShare] = useState<number>(0);
  const [workerShare, setWorkerShare] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
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
      closeModal();
    }
  }, [isConfirmed, error]);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function buttonClick() {
    if (message.length === 0) {
      alert("Empty message");
      return;
    }
    if (workerShare + ownerShare !== 100) {
      alert("Shares must sum to 100");
      return;
    }

    setButtonDisabled(true);

    const sessionKey = sessionKeys[`${address}-${job.roles.creator}`];
    const { hash: contentHash } = await publishToIpfs(message, sessionKey);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'arbitrate',
      args: [
        job.id!,
        ownerShare * 100,
        workerShare * 100,
        contentHash as `0x${string}`,
      ],
    });
  }

  let [isOpen, setIsOpen] = useState(false)

  function closeModal() {
    setIsOpen(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  return <>
      <Button disabled={buttonDisabled} onClick={() => openModal()} color={'borderlessGray'} className={'w-full'}>
        Arbitrate
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Arbitrate
                  </Dialog.Title>
                  <div className='mt-5 mb-3 flex flex-col gap-5'>
                    <Field>
                      <Label>Creator share</Label>
                      <Input value={ownerShare} onChange={(e) => setOwnerShare(Number(e.target.value))} placeholder="Owner Share %" />
                    </Field>
                    <Field>
                      <Label>Worker share</Label>
                      <Input value={workerShare} onChange={(e) => setWorkerShare(Number(e.target.value))}placeholder="Worker Share %" />
                    </Field>
                    <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="mt-5" />
                    <Button disabled={buttonDisabled} onClick={buttonClick}>
                      Confirm
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  </>
}