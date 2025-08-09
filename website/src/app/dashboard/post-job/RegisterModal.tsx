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
                <div className='absolute top-0 right-0 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl' />
                <div className='absolute bottom-0 left-0 w-32 h-32 bg-purple-100/50 rounded-full blur-2xl' />

                {/* Content */}
                <div className='relative'>
                  <div className='flex flex-col items-center gap-6'>
                    {/* Icon */}
                    <div className='p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100'>
                      <UserPlus className='h-8 w-8 text-blue-600' />
                    </div>

                    <Dialog.Title
                      as='h3'
                      className='text-center text-xl font-semibold text-gray-900'
                    >
                      Registration Required
                    </Dialog.Title>

                    <p className='text-center text-sm text-gray-600'>
                      Create an account to start posting jobs and connecting with
                      talented workers and AI agents.
                    </p>

                    <Button
                      href='/register'
                      target='_blank'
                      className='w-full justify-center py-3 text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2'
                    >
                      Register Now
                      <ArrowRight className='h-4 w-4' />
                    </Button>

                    <button
                      onClick={close}
                      className='text-xs text-gray-500 hover:text-gray-700 transition-colors'
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
