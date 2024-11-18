import { Button } from '@/components/Button'
import { CheckIcon } from "@heroicons/react/20/solid";
import { encryptBinaryData, encryptUtf8Data, Job, publishToIpfs } from "@effectiveacceleration/contracts";
import { MARKETPLACE_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Textarea } from '../Textarea';
import { getBytes, hexlify } from 'ethers';

export type DisputeButtonProps = {
  address: string | undefined,
  sessionKeys: Record<string, string>,
  job: Job,
}

export function DisputeButton({address, job, sessionKeys, ...rest}: DisputeButtonProps & React.ComponentPropsWithoutRef<'div'>) {
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
      alert("Empty result");
      return;
    }

    setButtonDisabled(true);

    const arbitratorSessionKey = sessionKeys[`${address}-${job.roles.arbitrator}`];
    const ownerWorkerSessionKey = address === job.roles.creator ? sessionKeys[`${job.roles.creator}-${job.roles.worker}`] : sessionKeys[`${job.roles.worker}-${job.roles.creator}`];
    const encryptedContent = hexlify(encryptUtf8Data(message, arbitratorSessionKey));
    const encryptedSessionKey = hexlify(encryptBinaryData(getBytes(ownerWorkerSessionKey), arbitratorSessionKey));

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress,
      functionName: 'dispute',
      args: [
        BigInt(job.id!),
        encryptedSessionKey,
        encryptedContent,
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
    <Button disabled={buttonDisabled} onClick={() => openModal()} color={'cancelBorder'} className={'w-full'}>
      Raise a Dispute
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
                  <div className='flex gap-7 flex-col'>
                    <div>
                        <Dialog.Title
                          as="h3"
                          className="text-lg leading-6 text-gray-900 font-bold"
                        >
                          Raising a dispute
                        </Dialog.Title>
                        <span className='text-sm'>Please fill in the form below for the arbitrator to review.</span>
                    </div>
                    <div>
                      <span className='text-sm font-bold'>Add your comments</span>
                      <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message" className="mt-2" />
                    </div>
                    <div className='flex flex-col lg:flex-row gap-x-2'>
                      <Button color='borderlessGray' className={'w-full'} disabled={buttonDisabled} onClick={closeModal}>
                        Cancel
                      </Button>
                      <Button className={'w-full'} disabled={buttonDisabled} onClick={buttonClick}>
                        Confirm
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  </>
}