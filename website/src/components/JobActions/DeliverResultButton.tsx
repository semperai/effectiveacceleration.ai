import { Button } from '@/components/Button';
import { useConfig } from '@/hooks/useConfig';
import { useToast } from '@/hooks/useToast';
import { useWriteContractWithNotifications } from '@/hooks/useWriteContractWithNotifications';
import {
  type Job,
  publishMediaToIpfs,
  publishToIpfs,
} from '@effectiveacceleration/contracts';
import { MARKETPLACE_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceV1';
import { Dialog, Transition } from '@headlessui/react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  PiPackage,
  PiFileText,
  PiUploadSimple,
  PiTrash,
  PiSparkle,
  PiWarning,
  PiCheckCircle,
  PiFilePlus,
  PiPaperPlaneTilt,
  PiInfo,
} from 'react-icons/pi';
import * as Sentry from '@sentry/nextjs';
import { ZeroHash } from 'ethers';
import { Fragment, useCallback, useRef, useState } from 'react';
import { Textarea } from '../Textarea';
import { Input } from '../Input';

export type DeliverResultButtonProps = {
  address: string | undefined;
  sessionKeys: Record<string, string>;
  job: Job;
};

export function DeliverResultButton({
  address,
  job,
  sessionKeys,
  ...rest
}: DeliverResultButtonProps & React.ComponentPropsWithoutRef<'div'>) {
  const Config = useConfig();
  const [message, setMessage] = useState<string>('');
  const [file, setFile] = useState<File>();
  const [isDelivering, setIsDelivering] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showError, showSuccess, showLoading, toast } = useToast();

  const { writeContractWithNotifications, isConfirming, isConfirmed, error } =
    useWriteContractWithNotifications();

  const loadingToastIdRef = useRef<string | number | null>(null);

  // Cleanup function for dismissing loading toasts
  const dismissLoadingToast = useCallback(() => {
    if (loadingToastIdRef.current !== null) {
      toast.dismiss(loadingToastIdRef.current);
      loadingToastIdRef.current = null;
    }
  }, [toast]);

  const handleDeliver = useCallback(async () => {
    setIsDelivering(true);

    let contentHash = ZeroHash;
    const sessionKey = sessionKeys[`${job.roles.creator}-${address}`];
    if (!sessionKey) {
      throw new Error('DeliverResultButton: No session key found');
    }

    if (message.length > 0 || file) {
      dismissLoadingToast();
      loadingToastIdRef.current = showLoading(
        'Publishing job results to IPFS...'
      );
      try {
        if (file) {
          const data = await file.arrayBuffer();
          const mimeType = file.type;
          const { hash } = await publishMediaToIpfs(
            file.name,
            mimeType,
            new Uint8Array(data),
            sessionKey
          );
          contentHash = hash;
        } else {
          const { hash } = await publishToIpfs(message, sessionKey);
          contentHash = hash;
        }
      } catch (err) {
        Sentry.captureException(err);
        dismissLoadingToast();
        showError('Failed to publish job results to IPFS');
        setIsDelivering(false);
        return;
      }
      dismissLoadingToast();
      showSuccess('Job results published to IPFS');
    }

    try {
      await writeContractWithNotifications({
        abi: MARKETPLACE_V1_ABI,
        address: Config!.marketplaceAddress,
        functionName: 'deliverResult',
        args: [BigInt(job.id!), contentHash],
      });
    } catch (err: any) {
      Sentry.captureException(err);
      showError(`Error delivering job: ${err.message}`);
    } finally {
      setIsDelivering(false);
    }
  }, [file, sessionKeys, address, job, message]);

  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / k ** i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <>
      {/* Enhanced trigger button - using blue/purple gradient to match theme */}
      <button
        disabled={isDelivering || isConfirming}
        onClick={() => openModal()}
        className='group relative w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none'
      >
        <div className='flex items-center justify-center gap-2 text-white'>
          <PiPackage className='h-4 w-4 text-white' />
          <span className='text-white'>Deliver Result</span>
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
                              <PiPackage className='h-6 w-6 text-white' />
                            </div>
                          </div>
                          <div className='text-left'>
                            <Dialog.Title className='text-xl font-bold text-gray-900 dark:text-white'>
                              Deliver Your Work
                            </Dialog.Title>
                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                              Submit your completed work for this job
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
                    <div className='space-y-6 p-6'>
                      {/* Message Input Section */}
                      <div
                        className={`space-y-2 ${file ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          <PiFileText className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                          Delivery Message
                        </label>
                        <Textarea
                          disabled={isDelivering || file !== undefined}
                          rows={6}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder='Describe your deliverable, include any relevant links, instructions, or additional information the client needs to know...'
                          className='w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 transition-all duration-200 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 dark:border-gray-700 dark:bg-gray-800/50 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-green-400 dark:focus:ring-green-400/20'
                        />
                      </div>

                      {/* Divider */}
                      <div className='relative'>
                        <div className='absolute inset-0 flex items-center'>
                          <div className='w-full border-t border-gray-200 dark:border-gray-700' />
                        </div>
                        <div className='relative flex justify-center text-sm'>
                          <span className='bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400'>
                            or
                          </span>
                        </div>
                      </div>

                      {/* File Upload Section */}
                      <div
                        className={`space-y-2 ${message ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <label className='flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                          <PiUploadSimple className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                          Upload Deliverable File
                        </label>

                        {!file ? (
                          <>
                            <input
                              ref={fileInputRef}
                              type='file'
                              className='hidden'
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  setFile(e.target.files[0]);
                                }
                              }}
                              disabled={isDelivering || message !== ''}
                            />
                            <div
                              className={`relative rounded-xl border-2 border-dashed p-8 transition-all duration-200 ${
                                dragActive
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-600'
                              } ${message ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} `}
                              onDragEnter={!message ? handleDrag : undefined}
                              onDragLeave={!message ? handleDrag : undefined}
                              onDragOver={!message ? handleDrag : undefined}
                              onDrop={!message ? handleDrop : undefined}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (
                                  !message &&
                                  !isDelivering &&
                                  fileInputRef.current
                                ) {
                                  fileInputRef.current.click();
                                }
                              }}
                            >
                              <div className='pointer-events-none flex flex-col items-center justify-center text-center'>
                                <div className='mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 p-3 dark:from-blue-900/30 dark:to-purple-900/30'>
                                  <PiFilePlus className='h-8 w-8 text-blue-600 dark:text-blue-400' />
                                </div>
                                <p className='mb-1 text-sm font-medium text-gray-900 dark:text-white'>
                                  Drop your file here or click to browse
                                </p>
                                <p className='text-xs text-gray-500 dark:text-gray-400'>
                                  Any file type up to 100MB
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className='rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20'>
                            <div className='flex items-center justify-between'>
                              <div className='flex items-center gap-3'>
                                <div className='rounded-lg bg-white p-2 dark:bg-gray-800'>
                                  <PiFileText className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                                </div>
                                <div>
                                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                    {file.name}
                                  </p>
                                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setFile(undefined);
                                  if (fileInputRef.current) {
                                    fileInputRef.current.value = '';
                                  }
                                }}
                                className='rounded-lg bg-red-100 p-2 text-red-600 transition-all duration-200 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                              >
                                <PiTrash className='h-4 w-4' />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info Notice */}
                      <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
                        <div className='flex gap-3'>
                          <PiInfo className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                          <div className='space-y-1'>
                            <p className='text-sm font-medium text-blue-900 dark:text-blue-300'>
                              Delivery Guidelines
                            </p>
                            <ul className='space-y-1 text-xs text-blue-700 dark:text-blue-400'>
                              <li>
                                • Ensure all deliverables meet the job
                                requirements
                              </li>
                              <li>
                                • Include clear documentation or instructions
                              </li>
                              <li>
                                • Your submission will be encrypted and stored
                                on IPFS
                              </li>
                            </ul>
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
                            <PiSparkle className='mr-1 inline h-4 w-4 text-purple-500' />
                            Encrypted delivery via IPFS
                          </p>
                          <div className='flex gap-3'>
                            <button
                              onClick={closeModal}
                              className='rounded-xl border border-gray-200 bg-gray-100 px-6 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-200 active:scale-[0.98] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleDeliver}
                              disabled={
                                isDelivering ||
                                isConfirming ||
                                (message === '' && file === undefined)
                              }
                              className='rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-2.5 text-sm font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
                            >
                              {isDelivering || isConfirming ? (
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
                                    Delivering...
                                  </span>
                                </span>
                              ) : (
                                <span className='flex items-center gap-2 text-white'>
                                  <PiPaperPlaneTilt className='h-4 w-4 text-white' />
                                  <span className='text-white'>
                                    Submit Delivery
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
