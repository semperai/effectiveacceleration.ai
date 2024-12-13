import { Button } from '@/components/Button';
import useUsers from '@/hooks/subsquid/useUsers';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { formatTokenNameAndAmount } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import * as Sentry from '@sentry/nextjs';
import moment from 'moment';
import { Fragment, useState } from 'react';

export type AssignWorkerButtonProps = {
  address: string | undefined;
  job: Job;
  selectedWorker: string;
};

export function AssignWorkerButton({
  address,
  job,
  selectedWorker,
  ...rest
}: AssignWorkerButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const { data: users } = useUsers();
  const jobMeceTag = jobMeceTags.find((tag) => tag.id === job?.tags[0])?.name;

  const [isAssigning, setIsAssigning] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleAssign() {
    setIsAssigning(true);

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'payStartJob',
        args: [BigInt(job.id!), selectedWorker],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error assigning worker to job: ${err.message}`);
    } finally {
      setIsAssigning(false);
    }
  }

  const buttonText = isAssigning ? 'Assigning...' : 'Assign';

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
        disabled={isAssigning}
        onClick={() => openModal()}
        color={'purplePrimary'}
        className={'w-full'}
      >
        Start Job with WORKER
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
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='mb-6 text-xl font-semibold text-gray-900'
                  >
                    Review Job Details
                  </Dialog.Title>

                  <div className='space-y-4'>
                    {/* Job Details Grid */}
                    <div className='grid grid-cols-1 gap-4 text-sm'>
                      {[
                        { label: 'Title', value: job.title },
                        { label: 'Content', value: job.content },
                        { label: 'Delivery Method', value: job.deliveryMethod },
                        {
                          label: 'Max Time',
                          value: moment
                            .duration(job?.maxTime, 'seconds')
                            .humanize(),
                        },
                        {
                          label: 'Amount',
                          value: formatTokenNameAndAmount(
                            job.token,
                            job.amount
                          ),
                        },
                        { label: 'Worker', value: selectedWorker },
                        { label: 'Category', value: jobMeceTag },
                        {
                          label: 'Tags',
                          value: job?.tags.map((tag, index) => (
                            <span
                              key={index}
                              className='mr-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800'
                            >
                              {tag}
                            </span>
                          )),
                        },
                      ].map(({ label, value }) => (
                        <div key={label} className='flex flex-col'>
                          <dt className='mb-1 font-medium text-gray-500'>
                            {label}
                          </dt>
                          <dd className='text-gray-900'>{value}</dd>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='mt-8'>
                    <Button
                      disabled={isAssigning}
                      onClick={handleAssign}
                      className='w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700'
                    >
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
