import { Button } from '@/components/Button';
import useUsers from '@/hooks/subsquid/useUsers';
import { formatTokenNameAndAmount } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { Dialog, Transition } from '@headlessui/react';
import { Job } from '@effectiveacceleration/contracts';
import Config from '@effectiveacceleration/contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import moment from 'moment';
import { Fragment, useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

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
      address: Config.marketplaceAddress,
      functionName: 'payStartJob',
      args: [BigInt(job.id!), selectedWorker],
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-gray-900 mb-6">
                    Review Job Details
                  </Dialog.Title>

                  <div className="space-y-4">
                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      {[
                        { label: "Title", value: job.title },
                        { label: "Content", value: job.content },
                        { label: "Delivery Method", value: job.deliveryMethod },
                        { label: "Max Time", value: moment.duration(job?.maxTime, 'seconds').humanize() },
                        { label: "Amount", value: formatTokenNameAndAmount(job.token, job.amount) },
                        { label: "Worker", value: selectedWorker },
                        { label: "Category", value: jobMeceTag },
                        {
                          label: "Tags",
                          value: job?.tags.map((tag, index) => (
                            <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                              {tag}
                            </span>
                          ))
                        }
                      ].map(({ label, value }) => (
                        <div key={label} className="flex flex-col">
                          <dt className="text-gray-500 font-medium mb-1">{label}</dt>
                          <dd className="text-gray-900">{value}</dd>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8">
                    <Button
                      disabled={buttonDisabled}
                      onClick={buttonClick}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
