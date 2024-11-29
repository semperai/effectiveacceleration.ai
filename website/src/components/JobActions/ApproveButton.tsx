import { Button } from '@/components/Button';
import { Dialog, Transition } from '@headlessui/react';
import { Rating } from '@mui/material';
import { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Fragment, useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { Textarea } from '../Textarea';
import { useConfig } from '@/hooks/useConfig';

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

  const { data: hash, error, writeContract } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
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

  async function buttonClick(skipReview?: boolean) {
    if (!skipReview && rating === 0 && review.length) {
      alert('If you decide to leave a review, you must also leave a rating.');
      return;
    } else if ((!skipReview && rating < 0) || rating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    } else if (!skipReview && rating === 0) {
      alert('Please leave a rating.');
      return;
    }

    setButtonDisabled(true);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config!.marketplaceAddress,
      functionName: 'approveResult',
      args: [
        BigInt(job.id!),
        skipReview ? 0 : rating,
        skipReview ? '' : review,
      ],
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
                      disabled={buttonDisabled}
                      onClick={() => buttonClick(true)}
                      color='borderlessGray'
                    >
                      Skip for now
                    </Button>
                    <Button
                      disabled={buttonDisabled}
                      onClick={() => buttonClick(false)}
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
