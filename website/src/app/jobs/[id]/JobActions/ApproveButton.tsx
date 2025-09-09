import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import type { Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Rating } from '@mui/material';
import {
  PiCheckCircle,
  PiStar,
  PiSparkle,
  PiChatCircle,
  PiWarning,
  PiSkipForward,
  PiPaperPlaneTilt,
  PiHeart,
  PiSmiley,
} from 'react-icons/pi';
import * as Sentry from '@sentry/nextjs';
import { Fragment, useState } from 'react';
import { Textarea } from '@/components/Textarea';

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
  const { showError, showWarning } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleApprove(skipReview?: boolean) {
    setIsApproving(true);

    if (!skipReview && rating === 0 && review.length) {
      showWarning(
        'If you decide to leave a review, you must also leave a rating.'
      );
      setIsApproving(false);
      return;
    } else if ((!skipReview && rating < 0) || rating > 5) {
      showWarning('Rating must be between 1 and 5.');
      setIsApproving(false);
      return;
    } else if (!skipReview && rating === 0) {
      showWarning('Please leave a rating to submit your review.');
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

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // Get rating emoji based on value
  const getRatingEmoji = (value: number) => {
    if (value === 0) return null;
    if (value <= 2) return '😕';
    if (value === 3) return '😐';
    if (value === 4) return '😊';
    return '🤩';
  };

  // Get rating text based on value
  const getRatingText = (value: number) => {
    if (value === 0) return 'Please rate your experience';
    if (value === 1) return 'Poor';
    if (value === 2) return 'Fair';
    if (value === 3) return 'Good';
    if (value === 4) return 'Very Good';
    return 'Excellent!';
  };

  return (
    <>
      {/* Enhanced trigger button */}
      <button
        disabled={isApproving || isConfirming}
        onClick={() => openModal()}
        className='group relative w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-600 hover:shadow-lg hover:shadow-green-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none'
      >
        <div className='flex items-center justify-center gap-2 text-white'>
          <PiCheckCircle className='h-4 w-4 text-white' />
          <span className='text-white'>Accept Result</span>
        </div>
        {/* Subtle gradient overlay on hover */}
        <div className='pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      </button>

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
            <div className='fixed inset-0 bg-black/70 backdrop-blur-md' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95 translate-y-4'
                enterTo='opacity-100 scale-100 translate-y-0'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100 translate-y-0'
                leaveTo='opacity-0 scale-95 translate-y-4'
              >
                <Dialog.Panel className='relative w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-black'>
                  {/* Enhanced gradient orbs */}
                  <div className='absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-3xl' />
                  <div className='absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl' />

                  {/* Content */}
                  <div className='relative'>
                    {/* Enhanced Header */}
                    <div className='relative overflow-hidden'>
                      {/* Header gradient background */}
                      <div className='absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5' />

                      <div className='relative flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
                        <div className='flex items-center gap-4'>
                          <div className='relative'>
                            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-50 blur-xl' />
                            <div className='relative rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3'>
                              <PiStar className='h-6 w-6 text-white' />
                            </div>
                          </div>
                          <div className='text-left'>
                            <Dialog.Title className='text-xl font-bold text-gray-900 dark:text-white'>
                              Rate Your Experience
                            </Dialog.Title>
                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                              Help improve future services with your feedback
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={closeModal}
                          className='rounded-xl bg-gray-100 p-2.5 text-gray-500 transition-all duration-200 hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800/50 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:hover:text-white'
                        >
                          <XMarkIcon className='h-5 w-5' />
                        </button>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className='space-y-6 p-6'>
                      {/* Rating Section */}
                      <div className='space-y-4 text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <PiHeart className='h-5 w-5 text-pink-500' />
                          <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                            How would you rate this service?
                          </p>
                        </div>

                        {/* Rating Component with custom styling */}
                        <div className='flex flex-col items-center gap-3'>
                          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800/50 dark:to-gray-900/50'>
                            <Rating
                              name='service-rating'
                              value={rating}
                              size='large'
                              onChange={(event, newValue) => {
                                setRating(newValue || 0);
                              }}
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: '#fbbf24',
                                },
                                '& .MuiRating-iconHover': {
                                  color: '#f59e0b',
                                },
                                '& .MuiRating-icon': {
                                  fontSize: '2rem',
                                },
                              }}
                            />
                          </div>

                          {/* Rating feedback */}
                          <div className='flex min-h-[28px] items-center gap-2'>
                            {rating > 0 && (
                              <>
                                <span className='text-2xl'>
                                  {getRatingEmoji(rating)}
                                </span>
                                <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                                  {getRatingText(rating)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Review Text Section */}
                      <div className='space-y-2'>
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          <PiChatCircle className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                          Share your thoughts (optional)
                        </label>
                        <Textarea
                          rows={4}
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder='Tell us about your experience with this service. What went well? What could be improved?'
                          className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-green-400 dark:focus:ring-green-400/20'
                        />
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Your feedback helps workers improve their services
                        </p>
                      </div>

                      {/* Info Box */}
                      <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
                        <div className='flex gap-3'>
                          <PiSparkle className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                          <div className='space-y-1'>
                            <p className='text-sm font-medium text-blue-900 dark:text-blue-300'>
                              Why leave a review?
                            </p>
                            <ul className='space-y-1 text-xs text-blue-700 dark:text-blue-400'>
                              <li>• Helps workers improve their services</li>
                              <li>• Builds trust in the marketplace</li>
                              <li>• Your feedback matters to the community</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Footer */}
                    <div className='relative overflow-hidden'>
                      {/* Footer gradient background */}
                      <div className='absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50' />

                      <div className='relative space-y-3 border-t border-gray-200 p-6 dark:border-gray-800'>
                        {/* Action Buttons */}
                        <button
                          onClick={() => handleApprove(false)}
                          disabled={isApproving || isConfirming || rating === 0}
                          className='w-full rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-3 text-sm font-medium shadow-lg shadow-green-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          {isApproving || isConfirming ? (
                            <span className='flex items-center justify-center gap-2 text-white'>
                              <svg
                                className='h-4 w-4 animate-spin'
                                fill='none'
                                viewBox='0 0 24 24'
                              >
                                <circle
                                  className='opacity-25'
                                  cx='12'
                                  cy='12'
                                  r='10'
                                  stroke='currentColor'
                                  strokeWidth='4'
                                />
                                <path
                                  className='opacity-75'
                                  fill='currentColor'
                                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                                />
                              </svg>
                              <span className='text-white'>Submitting...</span>
                            </span>
                          ) : (
                            <span className='flex items-center justify-center gap-2 text-white'>
                              <PiPaperPlaneTilt className='h-4 w-4 text-white' />
                              <span className='text-white'>
                                Submit Review & Approve
                              </span>
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => handleApprove(true)}
                          disabled={isApproving || isConfirming}
                          className='w-full rounded-xl border border-gray-200 bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-200 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'
                        >
                          <span className='flex items-center justify-center gap-2'>
                            <PiSkipForward className='h-4 w-4' />
                            Skip Review & Approve
                          </span>
                        </button>

                        <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
                          By approving, you confirm the work meets your
                          requirements
                        </p>
                      </div>
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
