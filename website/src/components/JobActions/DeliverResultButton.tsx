import { Button } from '@/components/Button';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Job, publishToIpfs } from '@effectiveacceleration/contracts';
import Config from '@effectiveacceleration/contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Fragment, useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Textarea } from '../Textarea';

export type DeliverResultButtonProps = {
  address: string | undefined;
  sessionKeys: Record<string, string>;
  job: Job;
};

export function DeliverResultButton({
  address,
  job,
  sessionKeys,
  ...rest
}: DeliverResultButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const [message, setMessage] = useState<string>('');
  const { data: hash, error, writeContract } = useWriteContract();

  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({
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
      closeModal();
    }
  }, [isConfirmed, error]);

  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);

  async function buttonClick() {
    setButtonDisabled(true);

    const sessionKey = sessionKeys[`${address}-${job.roles.creator}`];
    const { hash: contentHash } = await publishToIpfs(message, sessionKey);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress,
      functionName: 'deliverResult',
      args: [BigInt(job.id!), contentHash],
    });
  }

  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <Button
        disabled={buttonDisabled}
        onClick={() => openModal()}
        color={'borderlessGray'}
        className={'w-full'}
      >
        <CheckIcon className='-ml-0.5 mr-1.5 h-5 w-5' aria-hidden='true' />
        Deliver Result
      </Button>

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-10' onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Deliver Result
                  </Dialog.Title>
                  <div className='mb-3 mt-5 flex flex-col gap-5'>
                    <Textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder='Please write a message providing the deliverable for the job. Include links etc'
                      className='mt-5'
                    />
                    <Button
                      disabled={buttonDisabled || message === ''}
                      onClick={buttonClick}
                    >
                      <CheckIcon
                        className='-ml-0.5 mr-1.5 h-5 w-5'
                        aria-hidden='true'
                      />
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
  );
}
