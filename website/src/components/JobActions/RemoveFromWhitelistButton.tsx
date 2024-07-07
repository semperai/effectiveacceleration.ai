import { Button } from '@/components/Button'
import { CheckIcon } from "@heroicons/react/20/solid";
import { Job, JobEventWithDiffs, User } from "effectiveacceleration-contracts";
import { MARKETPLACE_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useEffect, useState } from "react";
import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Listbox, ListboxOption } from '../Listbox';
import useUsersByAddresses from '@/hooks/useUsersByAddresses';


export type RemoveFromWhitelistButtonProps = {
  address: `0x${string}` | undefined,
  job: Job,
  whitelist: string[]
}

export function RemoveFromWhitelistButton({address, job, whitelist, ...rest}: RemoveFromWhitelistButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const {data: users} = useUsersByAddresses(whitelist);
  const excludes = [address];
  const userList = Object.values(users).filter(user => !excludes.includes(user.address_));
  const [selectedUserAddress, setSelectedUserAddress] = useState<`0x${string}` | undefined>(undefined);
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
    setButtonDisabled(true);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'updateJobWhitelist',
      args: [
        job.id!,
        [],
        [selectedUserAddress!]
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
    <span className="ml-3">
      <Button disabled={buttonDisabled} onClick={() => openModal()}>
        <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
        Remove From Whitelist
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
                    Select User
                  </Dialog.Title>
                  <div className='mt-5 mb-3 flex flex-col gap-5'>
                    <Listbox
                      value={selectedUserAddress}
                      onChange={(e) => setSelectedUserAddress(e)}
                      className="border border-gray-300 rounded-md shadow-sm z-10"
                      placeholder="Select an option"
                    >
                      {userList.map((user, index) => (
                          <ListboxOption key={index} value={user.address_}>
                            {user.name}
                          </ListboxOption>
                      ))}
                    </Listbox>
                    <Button disabled={buttonDisabled} onClick={buttonClick}>
                      <CheckIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                      Confirm
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </span>
  </>
}