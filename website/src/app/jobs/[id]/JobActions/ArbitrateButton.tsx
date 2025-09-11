import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/utils';
import { type Job, publishToIpfs } from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import {
  PiGavel,
  PiFileText,
  PiCoin,
  PiWarning,
  PiInfo,
  PiPen,
} from 'react-icons/pi';
import * as Sentry from '@sentry/nextjs';
import { ZeroHash } from 'ethers';
import { Fragment, useCallback, useRef, useState } from 'react';
import { Field, Label } from '@/components/Fieldset';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';

export type ArbitrateButtonProps = {
  address: string | undefined;
  sessionKeys: Record<string, string>;
  job: Job;
};

export function ArbitrateButton({
  address,
  job,
  sessionKeys,
  ...rest
}: ArbitrateButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [sharesSlider, setSharesSlider] = useState<number>(0.5);
  const [ownerShare, setOwnerShare] = useState<number>(5000);
  const [workerShare, setWorkerShare] = useState<number>(5000);
  const [message, setMessage] = useState<string>('');

  const [isArbitrating, setIsArbitrating] = useState(false);
  const { showError, showSuccess, showLoading, toast } = useToast();
  const loadingToastIdRef = useRef<string | number | null>(null);

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  async function handleArbitrate() {
    if (workerShare + ownerShare !== 10000) {
      alert('Shares must sum to 10000');
      return;
    }
    setIsArbitrating(true);
    let contentHash = ZeroHash;
    const sessionKey = sessionKeys[`${job.roles.creator}-${job.roles.worker}`];
    if (!sessionKey) {
      throw new Error('ArbitrateButton: No session key found');
    }

    if (message.length > 0) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading('Publishing job post to IPFS...');
      try {
        const { hash } = await publishToIpfs(message, sessionKey);
        contentHash = hash;
      } catch (err) {
        Sentry.captureException(err);
        dismissLoadingToast();
        showError('Failed to publish job post to IPFS');
        setIsArbitrating(false);
        return;
      }
      dismissLoadingToast();
      showSuccess('Job post published to IPFS');
    }

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'arbitrate',
        args: [BigInt(job.id!), ownerShare, workerShare, contentHash],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error arbitrating job: ${err.message}`);
    } finally {
      setIsArbitrating(false);
    }
  }

  const buttonText = isArbitrating ? 'Arbitrating...' : 'Arbitrate';

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
          ? 'border border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-purple-800 dark:from-purple-950/30 dark:to-blue-950/30'
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
        disabled={isArbitrating || isConfirming}
        onClick={() => openModal()}
        className='group relative w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-sm font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none'
      >
        <div className='flex items-center justify-center gap-2'>
          <PiGavel className='h-4 w-4' />
          <span className='text-white'>Arbitrate</span>
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
                  <div className='absolute -left-40 -top-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 blur-3xl' />
                  <div className='absolute -bottom-40 -right-40 h-96 w-96 animate-pulse rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-3xl' />

                  {/* Content */}
                  <div className='relative'>
                    {/* Enhanced Header */}
                    <div className='relative overflow-hidden'>
                      {/* Header gradient background */}
                      <div className='absolute inset-0 bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-purple-500/5' />

                      <div className='relative flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800'>
                        <div className='flex items-center gap-4'>
                          <div className='relative'>
                            <div className='absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 opacity-50 blur-xl' />
                            <div className='relative rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 p-3'>
                              <PiGavel className='h-6 w-6 text-white' />
                            </div>
                          </div>
                          <div className='text-left'>
                            <Dialog.Title className='text-xl font-bold text-gray-900 dark:text-white'>
                              Arbitrate Job
                            </Dialog.Title>
                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                              Resolve the dispute and distribute funds
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
                      <div className='mb-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 dark:border-purple-800 dark:from-purple-950/20 dark:to-indigo-950/20'>
                        <div className='mb-3 flex items-center gap-2'>
                          <PiFileText className='h-4 w-4 text-purple-600 dark:text-purple-400' />
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

                      {/* Payment Details */}
                      <InfoRow
                        icon={PiCoin}
                        label='Total Job Value'
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

                      {/* Shares Distribution Section */}
                      <div className='mt-6 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 dark:border-purple-800 dark:from-purple-950/20 dark:to-indigo-950/20'>
                        <div className='mb-4 flex items-center gap-2'>
                          {/* <PiScale className='h-4 w-4 text-purple-600 dark:text-purple-400' /> */}
                          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                            Fund Distribution
                          </h3>
                        </div>

                        <div className='space-y-4'>
                          <Field>
                            <Label>Shares owner / worker</Label>
                            <input
                              type='range'
                              value={sharesSlider}
                              min='0'
                              max='1'
                              step='0.00001'
                              className='range-lg h-3 w-full cursor-pointer appearance-none rounded-lg bg-gradient-to-r from-purple-200 to-indigo-200 dark:from-purple-800 dark:to-indigo-800'
                              onChange={(e) => {
                                const v = Number(e.target.value);
                                const ownerShare = Math.floor(v * 10000);

                                setOwnerShare(ownerShare);
                                setWorkerShare(10000 - ownerShare);

                                setSharesSlider(v);
                              }}
                            />
                            <div className='mt-2 flex justify-between text-xs text-gray-500 dark:text-gray-400'>
                              <span>Creator: {(ownerShare / 100).toFixed(2)}%</span>
                              <span>Worker: {(workerShare / 100).toFixed(2)}%</span>
                            </div>
                          </Field>

                          <div className='grid grid-cols-2 gap-4'>
                            <Field>
                              <Label>Creator share</Label>
                              <Input
                                value={ownerShare}
                                type='number'
                                min='0'
                                max='10000'
                                step='1'
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  const ownerShare = Math.floor(v);

                                  setOwnerShare(ownerShare);
                                  setWorkerShare(10000 - ownerShare);

                                  setSharesSlider(v / 10000);
                                }}
                                placeholder='Owner Share'
                              />
                            </Field>
                            <Field>
                              <Label>Worker share</Label>
                              <Input
                                value={workerShare}
                                type='number'
                                min='0'
                                max='10000'
                                step='1'
                                onChange={(e) => {
                                  const v = Number(e.target.value);
                                  const workerShare = Math.floor(v);
                                  const ownerShare = 10000 - workerShare;

                                  setWorkerShare(workerShare);
                                  setOwnerShare(ownerShare);

                                  setSharesSlider(ownerShare / 10000);
                                }}
                                placeholder='Worker Share'
                              />
                            </Field>
                          </div>
                        </div>
                      </div>

                      {/* Decision Reasoning Section */}
                      <div className='mt-6 rounded-xl border border-gray-200 bg-white/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/30'>
                        <div className='mb-4 flex items-center gap-2'>
                          <PiPen className='h-4 w-4 text-gray-600 dark:text-gray-400' />
                          <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>
                            Decision Reasoning
                          </h3>
                        </div>
                        <Textarea
                          rows={4}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder='Please write a message describing your reasoning for your decision'
                          className='w-full'
                        />
                      </div>

                      {/* Warning Notice */}
                      <div className='mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
                        <div className='flex gap-3'>
                          <PiWarning className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
                          <div className='space-y-1'>
                            <p className='text-sm font-medium text-amber-900 dark:text-amber-300'>
                              Important Notice
                            </p>
                            <p className='text-xs text-amber-700 dark:text-amber-400'>
                              This arbitration decision is final and will distribute
                              the locked funds according to your specified shares.
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
                              onClick={handleArbitrate}
                              disabled={isArbitrating || isConfirming || message === ''}
                              className='rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-purple-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-purple-600 hover:to-indigo-600 hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              {isArbitrating || isConfirming ? (
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
                                  Arbitrating...
                                </span>
                              ) : (
                                <span className='flex items-center gap-2 text-white'>
                                  <PiGavel className='h-4 w-4' />
                                  Confirm Arbitration
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
