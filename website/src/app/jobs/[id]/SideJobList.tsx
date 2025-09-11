'use client';
import type React from 'react';
import { type Dispatch, Fragment, type SetStateAction } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { PiX } from 'react-icons/pi';
import JobChatsList from './JobChatsList';
import type { Job, User } from '@effectiveacceleration/contracts';

interface SideJobListProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
  users: Record<string, User>;
  address: string | undefined;
  job: Job;
  setSelectedWorker: Dispatch<SetStateAction<string>>;
  selectedWorker: string;
}

const SideJobList: React.FC<SideJobListProps> = ({
  sidebarOpen,
  setSidebarOpen,
  users,
  job,
  setSelectedWorker,
  selectedWorker,
}) => {
  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog
        as='div'
        className='relative z-50 lg:hidden'
        onClose={setSidebarOpen}
      >
        <Transition.Child
          as={Fragment}
          enter='transition-opacity ease-linear duration-300'
          enterFrom='opacity-0'
          enterTo='opacity-100'
          leave='transition-opacity ease-linear duration-200'
          leaveFrom='opacity-100'
          leaveTo='opacity-0'
        >
          <div className='fixed inset-0 bg-black/70 backdrop-blur-sm' />
        </Transition.Child>

        <div className='fixed inset-0 flex'>
          <Transition.Child
            as={Fragment}
            enter='transition ease-in-out duration-300 transform'
            enterFrom='-translate-x-full'
            enterTo='translate-x-0'
            leave='transition ease-in-out duration-200 transform'
            leaveFrom='translate-x-0'
            leaveTo='-translate-x-full'
          >
            <Dialog.Panel className='relative mr-16 flex w-full max-w-md flex-1'>
              <Transition.Child
                as={Fragment}
                enter='ease-in-out duration-300'
                enterFrom='opacity-0'
                enterTo='opacity-100'
                leave='ease-in-out duration-200'
                leaveFrom='opacity-100'
                leaveTo='opacity-0'
              >
                <div className='absolute left-full top-0 flex w-16 justify-center pt-5'>
                  <button
                    type='button'
                    className='-m-2.5 rounded-xl bg-white/10 p-2.5 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white/20 hover:text-gray-200'
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className='sr-only'>Close sidebar</span>
                    <PiX className='h-5 w-5' />
                  </button>
                </div>
              </Transition.Child>

              <div className='flex grow flex-col overflow-y-auto bg-white shadow-2xl dark:bg-gray-900'>
                <JobChatsList
                  users={users}
                  job={job}
                  setSelectedWorker={setSelectedWorker}
                  setSidebarOpen={setSidebarOpen}
                  selectedWorker={selectedWorker}
                />
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SideJobList;
