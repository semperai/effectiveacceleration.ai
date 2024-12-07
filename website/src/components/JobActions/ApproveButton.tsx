import { Button } from '@/components/Button';
import { Dialog, Transition } from '@headlessui/react';
import { Rating } from '@mui/material';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Fragment, useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Textarea } from '../Textarea';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { Loader2 } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

export type ApproveButtonProps = {
  address: string | undefined;
  job: Job;
};

export function ApproveButton({
  address,
  job,
  ...rest
}: ApproveButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [review, setReview] = useState<string>('');
  const [rating, setRating] = useState<number>(0);

  const [isApproving, setIsApproving] = useState(false);
  const { showError } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleApprove(skipReview?: boolean) {
    setIsApproving(true);

    if (!skipReview && rating === 0 && review.length) {
      alert('If you decide to leave a review, you must also leave a rating.');
      setIsApproving(false);
      return;
    } else if ((!skipReview && rating < 0) || rating > 5) {
      alert('Rating must be between 1 and 5.');
      setIsApproving(false);
      return;
    } else if (!skipReview && rating === 0) {
      alert('Please leave a rating.');
      setIsApproving(false);
      return;
    }

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'approveResult',
        args: [
          BigInt(job.id!),
          skipReview ? 0 : rating,
          skipReview ? '' : review,
        ],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error approving job: ${err.message}`);
    } finally {
      setIsApproving(false);
      setIsOpen(false);
    }
  }

  const buttonText = isApproving ? 'Approving...' : 'Approve';

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
        disabled={isApproving || isConfirming}
        onClick={() => openModal()}
        color={'purplePrimary'}
        className={'w-full'}
      >
        Accept result
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
                    className='text-lg font-bold leading-6 text-gray-900'
                  >
                    Leave a review
                  </Dialog.Title>
                  <span className='text-sm'>
                    Let me know how I can improve my service for the future.
                  </span>

                  <div className='mb-3 mt-5 flex flex-col gap-2'>
                    <span className='text-sm'>How did I do.</span>
                    <Rating
                      name='size-large'
                      value={rating}
                      onChange={(event, newValue = 0 as number | null) => {
                        setRating(newValue || 0);
                      }}
                    />
                    <span className='text-sm'>
                      Can you explain in more detail.
                    </span>
                    <Textarea
                      rows={4}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder='Text (optional)'
                      className=''
                    />
                    <Button
                      disabled={isApproving}
                      onClick={() => handleApprove(true)}
                      color='borderlessGray'
                    >
                      Skip for now
                    </Button>
                    <Button
                      disabled={isApproving}
                      onClick={() => handleApprove(false)}
                      color='purplePrimary'
                    >
                      Submit Review
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
