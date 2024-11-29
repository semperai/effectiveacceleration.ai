import { Button } from '@/components/Button';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

const RegisterModal = ({
  close,
  open,
}: {
  close: () => void;
  open: boolean;
}) => {
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
                    To post a job, you need to be registered
                  </Dialog.Title>
                  <p className='text-center text-sm text-gray-500'>
                    Create an account to start posting jobs and connecting with
                    candidates.
                  </p>
                  <Button
                    href='/register'
                    target='_blank'
                    className='w-full justify-center py-2.5 text-center'
                  >
                    Register now
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default RegisterModal;
