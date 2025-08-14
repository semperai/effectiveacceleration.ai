import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface LoadingModalProps {
  open: boolean;
  close: () => void;
  title?: string;
  timeoutDuration?: number; // in milliseconds
  timeoutMessage?: string;
}

const LoadingModal = ({
  open,
  close,
  title = 'Your job is being uploaded, please wait...',
  timeoutDuration = 60000, // Default 60 seconds
  timeoutMessage = 'This is taking longer than expected. You may close this window - the transaction will continue in the background.',
}: LoadingModalProps) => {
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let timeoutTimer: NodeJS.Timeout;
    let intervalTimer: NodeJS.Timeout;

    if (open) {
      // Reset state when modal opens
      setShowTimeoutMessage(false);
      setElapsedSeconds(0);

      // Start counting elapsed time
      intervalTimer = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);

      // Set timeout for showing message
      timeoutTimer = setTimeout(() => {
        setShowTimeoutMessage(true);
      }, timeoutDuration);
    }

    return () => {
      clearTimeout(timeoutTimer);
      clearInterval(intervalTimer);
      setElapsedSeconds(0);
      setShowTimeoutMessage(false);
    };
  }, [open, timeoutDuration]);

  // Auto-close after extended timeout (2x the initial timeout)
  useEffect(() => {
    let autoCloseTimer: NodeJS.Timeout;

    if (open && showTimeoutMessage) {
      autoCloseTimer = setTimeout(() => {
        close();
      }, timeoutDuration); // Close after another timeout period
    }

    return () => {
      clearTimeout(autoCloseTimer);
    };
  }, [showTimeoutMessage, open, close, timeoutDuration]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter='ease-out duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='ease-in duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/25 backdrop-blur-sm' />
        </Transition.Child>

        <div className='fixed inset-0 overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4'>
            <Transition.Child
              as={Fragment}
              enter='ease-out duration-300'
              enterFrom='opacity-0 scale-95'
              enterTo='opacity-100 scale-100'
              leave='ease-in duration-200'
              leaveFrom='opacity-100 scale-100'
              leaveTo='opacity-0 scale-95'
            >
              <Dialog.Panel className='relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl dark:bg-gray-800'>
                {/* Background gradient effects */}
                <div className='absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl dark:bg-blue-900/30' />
                <div className='absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-100/50 blur-2xl dark:bg-purple-900/30' />

                {/* Content */}
                <div className='relative'>
                  <div className='flex flex-col items-center gap-6'>
                    <Dialog.Title
                      as='h3'
                      className='text-center text-lg font-semibold text-gray-900 dark:text-gray-100'
                    >
                      {!showTimeoutMessage ? title : 'Almost there...'}
                    </Dialog.Title>

                    {/* Animated loader or timeout icon */}
                    <div className='relative'>
                      {!showTimeoutMessage ? (
                        <>
                          <div className='h-16 w-16 animate-pulse rounded-full border-4 border-gray-200 dark:border-gray-700' />
                          <div className='absolute inset-0 flex items-center justify-center'>
                            <Loader2 className='h-8 w-8 animate-spin text-blue-600 dark:text-blue-400' />
                          </div>
                        </>
                      ) : (
                        <div className='flex h-16 w-16 items-center justify-center rounded-full border-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20'>
                          <AlertCircle className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
                        </div>
                      )}
                    </div>

                    {!showTimeoutMessage ? (
                      <>
                        <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                          This may take a few moments...
                        </p>
                        {elapsedSeconds > 10 && (
                          <p className='text-center text-xs text-gray-500 dark:text-gray-500'>
                            Transaction pending for {elapsedSeconds} seconds
                          </p>
                        )}
                      </>
                    ) : (
                      <div className='space-y-4'>
                        <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                          {timeoutMessage}
                        </p>
                        <p className='text-center text-xs text-gray-500 dark:text-gray-500'>
                          If you switched to your wallet app, the transaction
                          may have completed. Check your transaction history.
                        </p>
                        <button
                          onClick={close}
                          className='w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
                        >
                          Close and Check Jobs
                        </button>
                      </div>
                    )}

                    {/* Progress indicator */}
                    {!showTimeoutMessage && (
                      <div className='h-1 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                        <div className='animate-shimmer h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400' />
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LoadingModal;
