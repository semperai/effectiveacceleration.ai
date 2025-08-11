import Link from 'next/link';
import { Button } from '@/components/Button';
import useUsers from '@/hooks/subsquid/useUsers';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { jobMeceTags } from '@/utils/jobMeceTags';
import { formatTimeLeft, shortenText } from '@/utils/utils';
import type { Job, User } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  PiSparkle,
  PiFileText,
  PiTag,
  PiCoin,
  PiClock,
  PiUser,
  PiPackage,
  PiCheckCircle,
  PiWarning,
  PiRocket,
  PiUserCheck,
  PiInfo,
} from 'react-icons/pi';
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
  const selectedWorkerData = users?.find((u) => u.address_ === selectedWorker);

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

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // Enhanced info row component
  const InfoRow = ({
    icon: Icon,
    label,
    value,
    highlighted = false,
  }: {
    icon?: any;
    label: string;
    value: React.ReactNode;
    highlighted?: boolean;
  }) => (
    <div
      className={`flex flex-col space-y-1 rounded-lg p-3 transition-all duration-200 ${
        highlighted
          ? 'border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } `}
    >
      <dt className='flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400'>
        {Icon && <Icon className='h-3 w-3' />}
        {label}
      </dt>
      <dd className='text-sm font-medium text-gray-900 dark:text-white'>
        {value}
      </dd>
    </div>
  );

  return (
    <>
      {/* Enhanced trigger button */}
      <button
        disabled={isAssigning || isConfirming}
        onClick={() => openModal()}
        className='group relative w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none'
      >
        <div className='flex items-center justify-center gap-2'>
          <PiUserCheck className='h-4 w-4' />
          <span className='text-white'>Start Job with Worker</span>
        </div>
        {/* Subtle gradient overlay on hover */}
        <div className='absolute inset-0 rounded-xl bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
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
                  <div className='absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl' />
                  <div className='absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl' />

                  {/* Content */}
                  <div className='relative'>
                    {/* Enhanced Header */}
                    <div className='relative overflow-hidden'>
                      {/* Header gradient background */}
                      <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5' />

                      <div className='relative flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
                        <div className='flex items-center gap-4'>
                          <div className='relative'>
                            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 blur-xl' />
                            <div className='relative rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 p-3'>
                              <PiRocket className='h-6 w-6 text-white' />
                            </div>
                          </div>
                          <div className='text-left'>
                            <Dialog.Title className='text-xl font-bold text-gray-900 dark:text-white'>
                              Confirm Job Assignment
                            </Dialog.Title>
                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                              Review details before starting the job
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

                    {/* Enhanced Form Content */}
                    <div className='max-h-[60vh] overflow-y-auto p-6'>
                      {/* Job Overview Section */}
                      <div className='mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20'>
                        <div className='mb-3 flex items-center gap-2'>
                          <PiFileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                            Job Overview
                          </h3>
                        </div>
                        <h4 className='mb-2 text-lg font-bold text-gray-900 dark:text-white'>
                          {job.title}
                        </h4>
                        <p className='line-clamp-3 text-sm text-gray-600 dark:text-gray-400'>
                          {job.content}
                        </p>
                      </div>

                      {/* Grid Layout for Details */}
                      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                        {/* Payment Details */}
                        <InfoRow
                          icon={PiCoin}
                          label='Payment Amount'
                          highlighted
                          value={
                            <div className='flex items-center gap-2'>
                              <span className='font-semibold'>
                                {formatTokenNameAndAmount(
                                  job.token,
                                  job.amount
                                )}
                              </span>
                              <img
                                src={tokenIcon(job.token)}
                                alt=''
                                className='h-5 w-5'
                              />
                            </div>
                          }
                        />

                        {/* Delivery Time */}
                        <InfoRow
                          icon={PiClock}
                          label='Maximum Delivery Time'
                          value={
                            <span className='rounded-lg bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'>
                              {formatTimeLeft(job.maxTime)}
                            </span>
                          }
                        />

                        {/* Delivery Method */}
                        <InfoRow
                          icon={PiPackage}
                          label='Delivery Method'
                          value={
                            <span className='rounded-lg bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'>
                              {job.deliveryMethod}
                            </span>
                          }
                        />

                        {/* Category */}
                        <InfoRow
                          icon={PiTag}
                          label='Category'
                          value={
                            <span className='rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-2 py-0.5 text-xs font-medium text-white'>
                              {jobMeceTag}
                            </span>
                          }
                        />
                      </div>

                      {/* Selected Worker Section */}
                      <div className='mt-6 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20'>
                        <div className='mb-3 flex items-center gap-2'>
                          <PiUserCheck className='h-4 w-4 text-green-600 dark:text-green-400' />
                          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                            Selected Worker
                          </h3>
                        </div>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-gray-900 dark:text-white'>
                              <Link
                                href={`/dashboard/users/${selectedWorker}`}
                                className='hover:underline'
                              >
                                {selectedWorkerData?.name || 'Unknown Worker'}
                              </Link>
                            </p>
                            <p className='font-mono text-xs text-gray-500 dark:text-gray-400'>
                              {shortenText({
                                text: selectedWorker,
                                maxLength: 20,
                              })}
                            </p>
                          </div>
                          {selectedWorkerData && (
                            <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
                              {/* TODO
                              <span>⭐ {selectedWorkerData.rating?.toFixed(1) || '0.0'}</span>
                              <span>{selectedWorkerData.reputationUp || 0} jobs</span>
                              */}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {job?.tags && job.tags.length > 0 && (
                        <div className='mt-6'>
                          <h3 className='mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
                            <PiTag className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                            Tags
                          </h3>
                          <div className='flex flex-wrap gap-2'>
                            {job.tags.map((tag, index) => (
                              <span
                                key={index}
                                className='rounded-full border border-gray-200 bg-gradient-to-r from-gray-100 to-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-600 dark:from-gray-700 dark:to-gray-800 dark:text-gray-300'
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Warning Notice */}
                      <div className='mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
                        <div className='flex gap-3'>
                          <PiWarning className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
                          <div className='space-y-1'>
                            <p className='text-sm font-medium text-amber-900 dark:text-amber-300'>
                              Important Notice
                            </p>
                            <p className='text-xs text-amber-700 dark:text-amber-400'>
                              Once you assign this worker, the job will start
                              immediately and funds will be locked in escrow
                              until completion.
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
                              onClick={handleAssign}
                              disabled={isAssigning || isConfirming}
                              className='rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-green-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-green-600 hover:to-emerald-600 hover:shadow-xl hover:shadow-green-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              {isAssigning || isConfirming ? (
                                <span className='flex items-center gap-2'>
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
                                  Assigning...
                                </span>
                              ) : (
                                <span className='flex items-center gap-2 text-white'>
                                  <CheckIcon className='h-4 w-4' />
                                  Confirm Assignment
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
