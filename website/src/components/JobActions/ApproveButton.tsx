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
  PiSmiley
} from 'react-icons/pi';
import * as Sentry from '@sentry/nextjs';
import { Fragment, useState } from 'react';
import { Textarea } from '../Textarea';

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
      showWarning('If you decide to leave a review, you must also leave a rating.');
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
        className='
          relative w-full group
          px-4 py-3 rounded-xl
          bg-gradient-to-r from-green-500 to-emerald-500
          font-medium text-sm
          transition-all duration-300
          hover:from-green-600 hover:to-emerald-600
          hover:shadow-lg hover:shadow-green-500/25
          hover:-translate-y-0.5
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
        '
      >
        <div className='flex items-center justify-center gap-2 text-white'>
          <PiCheckCircle className='w-4 h-4 text-white' />
          <span className='text-white'>Accept Result</span>
        </div>
        {/* Subtle gradient overlay on hover */}
        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
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
                <Dialog.Panel className='
                  w-full max-w-lg transform overflow-hidden rounded-2xl 
                  bg-white dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-black
                  shadow-2xl transition-all
                  relative
                '>
                  {/* Enhanced gradient orbs */}
                  <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                  <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" />
                  
                  {/* Content */}
                  <div className="relative">
                    {/* Enhanced Header */}
                    <div className='relative overflow-hidden'>
                      {/* Header gradient background */}
                      <div className='absolute inset-0 bg-gradient-to-r from-green-500/5 via-emerald-500/5 to-green-500/5' />
                      
                      <div className='relative flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800'>
                        <div className='flex items-center gap-4'>
                          <div className='relative'>
                            <div className='absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl blur-xl opacity-50' />
                            <div className='relative p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500'>
                              <PiStar className='w-6 h-6 text-white' />
                            </div>
                          </div>
                          <div className='text-left'>
                            <Dialog.Title className='text-xl font-bold text-gray-900 dark:text-white'>
                              Rate Your Experience
                            </Dialog.Title>
                            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                              Help improve future services with your feedback
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={closeModal}
                          className='
                            p-2.5 rounded-xl text-gray-500 dark:text-gray-400 
                            hover:text-gray-700 dark:hover:text-white 
                            bg-gray-100 dark:bg-gray-800/50
                            hover:bg-gray-200 dark:hover:bg-gray-700/50 
                            transition-all duration-200
                          '
                        >
                          <XMarkIcon className='w-5 h-5' />
                        </button>
                      </div>
                    </div>

                    {/* Form Content */}
                    <div className='p-6 space-y-6'>
                      {/* Rating Section */}
                      <div className='text-center space-y-4'>
                        <div className='flex items-center justify-center gap-2'>
                          <PiHeart className='w-5 h-5 text-pink-500' />
                          <p className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                            How would you rate this service?
                          </p>
                        </div>
                        
                        {/* Rating Component with custom styling */}
                        <div className='flex flex-col items-center gap-3'>
                          <div className='p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border border-gray-200 dark:border-gray-700'>
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
                          <div className='flex items-center gap-2 min-h-[28px]'>
                            {rating > 0 && (
                              <>
                                <span className='text-2xl'>{getRatingEmoji(rating)}</span>
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
                          <PiChatCircle className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                          Share your thoughts (optional)
                        </label>
                        <Textarea
                          rows={4}
                          value={review}
                          onChange={(e) => setReview(e.target.value)}
                          placeholder='Tell us about your experience with this service. What went well? What could be improved?'
                          className='
                            w-full rounded-xl border border-gray-200 dark:border-gray-700
                            bg-white dark:bg-gray-800/50
                            px-4 py-3 text-sm text-gray-900 dark:text-white
                            placeholder:text-gray-400 dark:placeholder:text-gray-500
                            focus:border-green-500 dark:focus:border-green-400
                            focus:ring-2 focus:ring-green-500/20 dark:focus:ring-green-400/20
                            transition-all duration-200
                          '
                        />
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          Your feedback helps workers improve their services
                        </p>
                      </div>

                      {/* Info Box */}
                      <div className='p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'>
                        <div className='flex gap-3'>
                          <PiSparkle className='w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5' />
                          <div className='space-y-1'>
                            <p className='text-sm font-medium text-blue-900 dark:text-blue-300'>
                              Why leave a review?
                            </p>
                            <ul className='text-xs text-blue-700 dark:text-blue-400 space-y-1'>
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
                      
                      <div className='relative p-6 border-t border-gray-200 dark:border-gray-800 space-y-3'>
                        {/* Action Buttons */}
                        <button
                          onClick={() => handleApprove(false)}
                          disabled={isApproving || isConfirming || rating === 0}
                          className='
                            w-full px-6 py-3 rounded-xl
                            bg-gradient-to-r from-green-500 to-emerald-500
                            font-medium text-sm
                            transition-all duration-200
                            hover:from-green-600 hover:to-emerald-600
                            active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed
                            shadow-lg shadow-green-500/25
                            hover:shadow-xl hover:shadow-green-500/30
                            hover:-translate-y-0.5
                          '
                        >
                          {isApproving || isConfirming ? (
                            <span className='flex items-center justify-center gap-2 text-white'>
                              <svg className='animate-spin h-4 w-4' fill='none' viewBox='0 0 24 24'>
                                <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
                                <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z' />
                              </svg>
                              <span className='text-white'>Submitting...</span>
                            </span>
                          ) : (
                            <span className='flex items-center justify-center gap-2 text-white'>
                              <PiPaperPlaneTilt className='w-4 h-4 text-white' />
                              <span className='text-white'>Submit Review & Approve</span>
                            </span>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleApprove(true)}
                          disabled={isApproving || isConfirming}
                          className='
                            w-full px-6 py-2.5 rounded-xl
                            bg-gray-100 dark:bg-gray-800
                            border border-gray-200 dark:border-gray-700
                            text-sm font-medium text-gray-700 dark:text-gray-300
                            transition-all duration-200
                            hover:bg-gray-200 dark:hover:bg-gray-700
                            hover:border-gray-300 dark:hover:border-gray-600
                            active:scale-[0.98]
                          '
                        >
                          <span className='flex items-center justify-center gap-2'>
                            <PiSkipForward className='w-4 h-4' />
                            Skip Review & Approve
                          </span>
                        </button>
                        
                        <p className='text-xs text-center text-gray-500 dark:text-gray-400'>
                          By approving, you confirm the work meets your requirements
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
