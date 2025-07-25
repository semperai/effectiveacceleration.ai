import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { AiOutlineLoading } from 'react-icons/ai';

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
          <div className='fixed inset-0 bg-black/40 backdrop-blur-sm' />
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
              <Dialog.Panel className='w-full max-w-md transform rounded-2xl bg-white p-8 shadow-xl transition-all'>
                <div className='flex flex-col items-center gap-6'>
                  <Dialog.Title
                    as='h3'
                    className='text-center text-lg font-semibold text-gray-900'
                  >
                    {title}
                  </Dialog.Title>

                  <div className='relative'>
                    <div className='h-12 w-12 animate-pulse rounded-full border-4 border-blue-100' />
                    <AiOutlineLoading
                      className='absolute left-0 top-0 h-12 w-12 animate-spin text-blue-600'
                      aria-hidden='true'
                    />
                  </div>

                  <p className='text-sm text-gray-500'>
                    This may take a few moments...
                  </p>
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
