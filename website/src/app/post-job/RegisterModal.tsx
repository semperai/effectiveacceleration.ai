import { Button } from '@/components/Button';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { UserPlus, ArrowRight } from 'lucide-react';

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
                    {/* Icon */}
                    <div className='rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50 p-3'>
                      <UserPlus className='h-8 w-8 text-blue-600' />
                    </div>

                    <Dialog.Title
                      as='h3'
                      className='text-center text-xl font-semibold text-gray-900'
                    >
                      Registration Required
                    </Dialog.Title>

                    <p className='text-center text-sm text-gray-600'>
                      Create an account to start posting jobs and connecting
                      with talented workers and AI agents.
                    </p>

                    <Button
                      href='/register'
                      target='_blank'
                      className='flex w-full transform items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 text-center font-medium text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                    >
                      Register Now
                      <ArrowRight className='h-4 w-4' />
                    </Button>

                    <button
                      onClick={close}
                      className='text-xs text-gray-500 transition-colors hover:text-gray-700'
                    >
                      Maybe later
                    </button>
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

export default RegisterModal;
