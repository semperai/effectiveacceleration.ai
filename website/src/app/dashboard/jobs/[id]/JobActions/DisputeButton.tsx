import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import {
  encryptBinaryData,
  encryptUtf8Data,
  type Job,
} from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  PiWarning,
  PiScales,
  PiShieldCheck,
  PiFileText,
  PiInfo,
  PiLock,
  PiChatCircleDots,
  PiExclamationMark,
  PiGavel,
  PiSparkle,
} from 'react-icons/pi';
import * as Sentry from '@sentry/nextjs';
import { getBytes, hexlify } from 'ethers';
import { Fragment, useState } from 'react';
import { Textarea } from '@/components/Textarea';

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
  const { showError, showWarning } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleDispute() {
    if (!message.trim()) {
      showWarning('Please provide a detailed explanation for the dispute');
      return;
    }

    if (message.length < 50) {
      showWarning(
        'Please provide more details (at least 50 characters) to help the arbitrator understand the issue'
      );
      return;
    }

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
      closeModal();
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error disputing job: ${err.message}`);
    } finally {
      setIsDisputing(false);
    }
  }

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
    setMessage(''); // Clear message on close
  }

  function openModal() {
    setIsOpen(true);
  }

  const characterCount = message.length;
  const minCharacters = 50;

  return (
    <>
      {/* Fixed trigger button - removed horizontal padding, reduced vertical padding */}
      <button
        disabled={isDisputing || isConfirming}
        onClick={() => openModal()}
        className='group relative w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none'
      >
        <div className='flex items-center justify-center gap-2 text-white'>
          <PiWarning className='h-4 w-4 text-white' />
          <span className='text-white'>Raise a Dispute</span>
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
                <Dialog.Panel className='relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-900 dark:to-black'>
                  {/* Enhanced gradient orbs */}
                  <div className='absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-3xl' />
                  <div className='absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 blur-3xl' />

                  {/* Content */}
                  <div className='relative'>
                    {/* Enhanced Header */}
                    <div className='relative overflow-hidden'>
                      {/* Header gradient background */}
                      <div className='absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-amber-500/5' />

                      <div className='relative flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
                        <div className='flex items-center gap-4'>
                          <div className='relative'>
                            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 opacity-50 blur-xl' />
                            <div className='relative rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-3'>
                              <PiScales className='h-6 w-6 text-white' />
                            </div>
                          </div>
                          <div className='text-left'>
                            <Dialog.Title className='text-xl font-bold text-gray-900 dark:text-white'>
                              Raise a Dispute
                            </Dialog.Title>
                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                              Request arbitrator intervention for this job
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
                      {/* Important Notice */}
                      <div className='rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
                        <div className='flex gap-3'>
                          <PiExclamationMark className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
                          <div className='space-y-1'>
                            <p className='text-sm font-semibold text-amber-900 dark:text-amber-300'>
                              Before You Proceed
                            </p>
                            <p className='text-xs text-amber-800 dark:text-amber-400'>
                              Disputes should only be raised when direct
                              communication has failed to resolve the issue. The
                              arbitrator&apos;s decision will be final and
                              binding.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Dispute Reason Input */}
                      <div className='space-y-2'>
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          <PiFileText className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                          Describe the Issue
                        </label>
                        <Textarea
                          rows={6}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder='Please provide a detailed explanation of the issue you are facing. Include:
• What was expected vs what happened
• Any attempts to resolve the issue directly
• Supporting evidence or timeline of events
• Your desired resolution

The more detail you provide, the better the arbitrator can understand and resolve the dispute fairly.'
                          className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-amber-400 dark:focus:ring-amber-400/20'
                        />
                        <div className='flex justify-between text-xs'>
                          <span
                            className={` ${
                              characterCount < minCharacters
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-gray-500 dark:text-gray-400'
                            } `}
                          >
                            {characterCount < minCharacters
                              ? `${minCharacters - characterCount} more characters needed`
                              : `${characterCount} characters`}
                          </span>
                          <span className='text-gray-500 dark:text-gray-400'>
                            Minimum {minCharacters} characters
                          </span>
                        </div>
                      </div>

                      {/* What Happens Next */}
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                        <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
                          <div className='mb-2 flex items-center gap-2'>
                            <PiGavel className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                            <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                              Review
                            </span>
                          </div>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>
                            Arbitrator reviews the case details
                          </p>
                        </div>

                        <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
                          <div className='mb-2 flex items-center gap-2'>
                            <PiChatCircleDots className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                            <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                              Discussion
                            </span>
                          </div>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>
                            All parties can communicate
                          </p>
                        </div>

                        <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
                          <div className='mb-2 flex items-center gap-2'>
                            <PiShieldCheck className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                            <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                              Resolution
                            </span>
                          </div>
                          <p className='text-xs text-gray-600 dark:text-gray-400'>
                            Final binding decision made
                          </p>
                        </div>
                      </div>

                      {/* Security Notice */}
                      <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
                        <div className='flex gap-3'>
                          <PiLock className='h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                          <div className='space-y-1'>
                            <p className='text-sm font-medium text-blue-900 dark:text-blue-300'>
                              Your Information is Secure
                            </p>
                            <p className='text-xs text-blue-800 dark:text-blue-400'>
                              All dispute details are encrypted and only visible
                              to the arbitrator and involved parties.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Footer */}
                    <div className='relative overflow-hidden'>
                      {/* Footer gradient background */}
                      <div className='absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900/50 dark:to-gray-800/50' />

                      <div className='relative border-t border-gray-200 p-6 dark:border-gray-800'>
                        <div className='flex items-center justify-between'>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            <PiInfo className='mr-1 inline h-4 w-4' />
                            This action cannot be undone
                          </p>
                          <div className='flex gap-3'>
                            <button
                              onClick={closeModal}
                              className='rounded-xl border border-gray-200 bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-200 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDispute}
                              disabled={
                                isDisputing ||
                                isConfirming ||
                                characterCount < minCharacters
                              }
                              className='rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-medium shadow-lg shadow-amber-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl hover:shadow-amber-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              {isDisputing || isConfirming ? (
                                <span className='flex items-center gap-2 text-white'>
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
                                  <span className='text-white'>
                                    Submitting...
                                  </span>
                                </span>
                              ) : (
                                <span className='flex items-center gap-2 text-white'>
                                  <PiWarning className='h-4 w-4 text-white' />
                                  <span className='text-white'>
                                    Submit Dispute
                                  </span>
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
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
