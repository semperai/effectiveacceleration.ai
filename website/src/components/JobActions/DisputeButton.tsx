import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import {
  encryptBinaryData,
  encryptUtf8Data,
  Job,
} from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import * as Sentry from '@sentry/nextjs';
import { getBytes, hexlify } from 'ethers';
import { Fragment, useState } from 'react';
import { Textarea } from '../Textarea';

export type DisputeButtonProps = {
  address: string | undefined;
  sessionKeys: Record<string, string>;
  job: Job;
};

export function DisputeButton({
  address,
  job,
  sessionKeys,
  ...rest
}: DisputeButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [message, setMessage] = useState<string>('');
  const [isDisputing, setIsDisputing] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleDispute() {
    setIsDisputing(true);

    const arbitratorSessionKey =
      sessionKeys[`${address}-${job.roles.arbitrator}`];
    const ownerWorkerSessionKey =
      address === job.roles.creator
        ? sessionKeys[`${job.roles.creator}-${job.roles.worker}`]
        : sessionKeys[`${job.roles.worker}-${job.roles.creator}`];
    const encryptedContent = hexlify(
      encryptUtf8Data(message, ownerWorkerSessionKey)
    );
    const encryptedSessionKey = hexlify(
      encryptBinaryData(getBytes(ownerWorkerSessionKey), arbitratorSessionKey)
    );

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'dispute',
        args: [BigInt(job.id!), encryptedSessionKey, encryptedContent],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error disputing job: ${err.message}`);
    } finally {
      setIsDisputing(false);
    }
  }

  const buttonText = isDisputing ? 'Disputing...' : 'Dispute';

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
        disabled={isDisputing || isConfirming}
        onClick={() => openModal()}
        color={'borderlessGrayCancel'}
        className={'w-full'}
      >
        Raise a Dispute
      </Button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as='div' className='relative z-50' onClose={closeModal}>
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
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all'>
                  <div className='flex flex-col gap-7'>
                    <div>
                      <Dialog.Title
                        as='h3'
                        className='text-lg font-bold leading-6 text-gray-900'
                      >
                        Raise a dispute
                      </Dialog.Title>
                      <span className='text-sm'>
                        Please fill in the form below for the arbitrator to
                        review.
                      </span>
                    </div>
                    <div>
                      <span className='text-sm font-bold'>
                        Add your comments
                      </span>
                      <Textarea
                        rows={4}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder='Please thoroughly explain the issues you are facing with the job so the arbitrator can make an informed decision.'
                        className='mt-2'
                      />
                    </div>
                    <div className='flex flex-col gap-x-2 lg:flex-row'>
                      <Button
                        color='borderlessGray'
                        className={'w-full'}
                        disabled={isDisputing || isConfirming}
                        onClick={closeModal}
                      >
                        Cancel
                      </Button>
                      <Button
                        className={'w-full'}
                        disabled={isDisputing || isConfirming}
                        onClick={handleDispute}
                      >
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
  );
}
