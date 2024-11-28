import { Button } from '@/components/Button';
import {
  Description,
  Field,
  FieldGroup,
  Fieldset,
} from '@/components/Fieldset';
import { Listbox, ListboxLabel, ListboxOption } from '@/components/Listbox';
import { Textarea } from '@/components/Textarea';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/20/solid';
import { Job } from '@effectiveacceleration/contracts';
import Config from '@effectiveacceleration/contracts/scripts/config.json';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Fragment, useEffect, useState } from 'react';
import { useWaitForTransactionReceipt, useWriteContract } from 'wagmi';

export type ReviewButtonProps = {
  address: string | undefined;
  job: Job;
};

export function ReviewButton({
  address,
  job,
  ...rest
}: ReviewButtonProps & React.ComponentPropsWithoutRef<'div'>) {
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

  async function buttonClick() {
    if (rating === 0 && review.length) {
      alert('If you decide to leave a review, you must also leave a rating.');
      return;
    } else if (rating < 0 || rating > 5) {
      alert('Rating must be between 1 and 5.');
      return;
    }

    setButtonDisabled(true);

    const w = writeContract({
      abi: MARKETPLACE_V1_ABI,
      address: Config.marketplaceAddress,
      functionName: 'review',
      args: [BigInt(job.id!), rating, review],
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
        Leave a Review
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
                    Leave A Review
                  </Dialog.Title>
                  <div className='mb-3 mt-5 flex flex-col gap-5'>
                    <Fieldset className='w-full'>
                      <FieldGroup>
                        <Field>
                          <Description>
                            Please leave a review and rating for the worker.
                            This will help others to understand the quality of
                            work.
                          </Description>
                          <Textarea
                            rows={4}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder='Review (optional)'
                            className='mt-5'
                          />
                        </Field>
                        <Field>
                          <Listbox
                            value={rating}
                            onChange={setRating}
                            className='mt-5'
                          >
                            <ListboxOption value={5}>
                              <ListboxLabel>5 stars - No issues</ListboxLabel>
                            </ListboxOption>
                            <ListboxOption value={4}>
                              <ListboxLabel>
                                4 stars - Minor issues
                              </ListboxLabel>
                            </ListboxOption>
                            <ListboxOption value={3}>
                              <ListboxLabel>
                                3 stars - Lot&apos;s of issues
                              </ListboxLabel>
                            </ListboxOption>
                            <ListboxOption value={2}>
                              <ListboxLabel>
                                2 stars - Severe problems
                              </ListboxLabel>
                            </ListboxOption>
                            <ListboxOption value={1}>
                              <ListboxLabel>
                                1 stars - Malicious or criminal
                              </ListboxLabel>
                            </ListboxOption>
                            <ListboxOption value={0}>
                              <ListboxLabel>Abstain from rating</ListboxLabel>
                            </ListboxOption>
                          </Listbox>
                        </Field>
                      </FieldGroup>
                      <Button
                        disabled={buttonDisabled}
                        onClick={buttonClick}
                        className='mt-5'
                      >
                        <CheckIcon
                          className='-ml-0.5 mr-1.5 h-5 w-5'
                          aria-hidden='true'
                        />
                        Confirm
                      </Button>
                    </Fieldset>
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
