'use client';
import { Logo } from '@/components/Logo';
import clsx from 'clsx';
import Link from 'next/link';
import type React from 'react';
import { type Dispatch, Fragment, type SetStateAction, useState } from 'react'
import {
  PiBriefcase,
  PiHouseSimple,
  PiJoystick,
  PiMegaphoneSimple,
  PiFinnTheHuman,
  PiPerson,
  PiPaperPlaneTilt,
  PiNetwork,
  PiListHeart,
  PiBooks,
} from 'react-icons/pi';
import { usePathname } from 'next/navigation';
import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import JobChatsList from './JobChatsList';
import type { Job, User } from '@effectiveacceleration/contracts';

type NavigationItem = {
  name: string;
  href: string;
  icon: JSX.Element;
};

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
  selectedWorker
}) => {
  return (
    <>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50 lg:hidden'
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter='transition-opacity ease-linear duration-150'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='transition-opacity ease-linear duration-150'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-gray-900/80' />
          </Transition.Child>

          <div className='fixed inset-0 flex'>
            <Transition.Child
              as={Fragment}
              enter='transition ease-in-out duration-150 transform'
              enterFrom='-translate-x-full'
              enterTo='translate-x-0'
              leave='transition ease-in-out duration-150 transform'
              leaveFrom='translate-x-0'
              leaveTo='-translate-x-full'
            >
              <Dialog.Panel className='relative mr-16 flex w-full max-w-xs flex-1'>
                <Transition.Child
                  as={Fragment}
                  enter='ease-in-out duration-100'
                  enterFrom='opacity-0'
                  enterTo='opacity-100'
                  leave='ease-in-out duration-100'
                  leaveFrom='opacity-100'
                  leaveTo='opacity-0'
                >
                  <div className='absolute left-full top-0 flex w-16 justify-center pt-5'>
                    <button
                      type='button'
                      className='-m-2.5 p-2.5'
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className='sr-only'>Close sidebar</span>
                      <XMarkIcon
                        className='h-6 w-6 text-white'
                        aria-hidden='true'
                      />
                    </button>
                  </div>
                </Transition.Child>

                <div className='flex grow flex-col pt-6 gap-y-5 overflow-y-auto bg-white px-6 pb-4 dark:bg-black'>
                  <JobChatsList 
                    users={users} 
                    job={job} 
                    setSelectedWorker={setSelectedWorker} 
                    setSidebarOpen={setSidebarOpen}
                  />
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
};

export default SideJobList;
