import { Button } from '@/components/Button';
import useUsers from '@/hooks/useUsers';
import { formatTokenNameAndAmount } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { Dialog, Transition } from '@headlessui/react';
import { Job } from 'effectiveacceleration-contracts';
import Config from 'effectiveacceleration-contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from 'effectiveacceleration-contracts/wagmi/MarketplaceV1';
import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export type AssignWorkerButtonProps = {
  address: `0x${string}` | undefined;
  job: Job;
  selectedWorker: string;
};

export function AssignWorkerButton({
  address,
  job,
  selectedWorker,
  ...rest
}: AssignWorkerButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const { data: users } = useUsers();
  const jobMeceTag = jobMeceTags.find((tag) => tag.id === job?.tags[0])?.name;
  const { data: hash, error, writeContract } = useWriteContract();

  const { isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
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
    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress as `0x${string}`,
      functionName: 'payStartJob',
      args: [job.id!, selectedWorker as `0x${string}`],
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
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='mb-4 text-lg font-medium leading-6'
                  >
                    Review job details
                  </Dialog.Title>
                  <div className='flex flex-col'>
                    <span>
                      <b>Title:</b> {job.title}
                    </span>
                    <span>
                      <b>Content:</b> {job.content}
                    </span>
                    <span>
                      <b>delivery Method:</b> {job.deliveryMethod}
                    </span>
                    <span>
                      <b>Max Time:</b>{' '}
                      {moment.duration(job?.maxTime, 'seconds').humanize()}{' '}
                    </span>
                    <span>
                      <b>Amount:</b>{' '}
                      {formatTokenNameAndAmount(job.token, job.amount)}
                    </span>
                    <span>
                      <b>Worker:</b> {selectedWorker}
                    </span>
                    <span>
                      <b>Category:</b> {jobMeceTag}
                    </span>
                    <span>
                      <b>Tags:</b>{' '}
                      {job?.tags
                        .map((value, index) => (
                          <span key={index}>{value}</span>
                        ))}
                    </span>
                  </div>
                  <div className='mb-3 mt-5 flex flex-col gap-5'>
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
  );
}