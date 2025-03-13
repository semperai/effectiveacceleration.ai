import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { CheckIcon } from '@heroicons/react/20/solid';
import * as Sentry from '@sentry/nextjs';
import { Loader2 } from 'lucide-react';
import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';


export type RefuseArbitrationButtonProps = {
  job: Job;
};

export function RefuseArbitrationButton({
  job,
  ...rest
}: RefuseArbitrationButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [isRefusing, setIsRefusing] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleRefuse() {
    setIsRefusing(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'refuseArbitration',
        args: [BigInt(job.id!)],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error refusing job: ${err.message}`);
    } finally {
      setIsRefusing(false);
    }
  }
  let [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  const buttonText = isRefusing ? 'Refusing...' : 'Refuse';

  return (
    <>
      <Button
        disabled={isRefusing}
        onClick={openModal}
        color={'borderlessGray'}
        className={'w-full'}
      >
        {(isRefusing || isConfirming) && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        {buttonText}
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
                  <Dialog.Title
                    as='h3'
                    className='mb-2 text-lg font-medium leading-6 text-gray-900'
                  >
                    Refuse Arbitration
                  </Dialog.Title>
                  <div>
                  <span>
                    If you refuse this arbitration, the job will be unassigned and the funds will be returned to the client. <br/> 
                  </span>
                  <Button
                      disabled={isRefusing}
                      onClick={handleRefuse}
                      color={'borderlessGray'}
                      className={'w-full mt-4'}
                    >
                      {(isRefusing || isConfirming) && (
                        <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      )}
                      {buttonText}
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
