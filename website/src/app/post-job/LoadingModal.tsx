import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingModalProps {
  open: boolean;
  close: () => void;
  title?: string;
}

const LoadingModal = ({
  open,
  close,
  title = 'Your job is being uploaded, please wait...',
}: LoadingModalProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as='div' className='relative z-50' onClose={close}>
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
              <Dialog.Panel className='relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-8 shadow-xl'>
                {/* Background gradient effects */}
                <div className='absolute right-0 top-0 h-32 w-32 rounded-full bg-blue-100/50 blur-2xl' />
                <div className='absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-100/50 blur-2xl' />

                {/* Content */}
                <div className='relative'>
                  <div className='flex flex-col items-center gap-6'>
                    <Dialog.Title
                      as='h3'
                      className='text-center text-lg font-semibold text-gray-900'
                    >
                      {title}
                    </Dialog.Title>

                    {/* Animated loader */}
                    <div className='relative'>
                      <div className='h-16 w-16 animate-pulse rounded-full border-4 border-gray-200' />
                      <div className='absolute inset-0 flex items-center justify-center'>
                        <Loader2 className='h-8 w-8 animate-spin text-blue-600' />
                      </div>
                    </div>

                    <p className='text-center text-sm text-gray-600'>
                      This may take a few moments...
                    </p>

                    {/* Progress indicator */}
                    <div className='h-1 w-full overflow-hidden rounded-full bg-gray-200'>
                      <div className='animate-shimmer h-full rounded-full bg-gradient-to-r from-blue-600 to-purple-600' />
                    </div>
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
