'use client';
import { Logo } from '@/components/Logo';
import clsx from 'clsx';
import Link from 'next/link';
import React, { Dispatch, Fragment, SetStateAction, useEffect, useState } from 'react';
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
import { Job, JobEventWithDiffs, User } from '@effectiveacceleration/contracts';
// import { JobSidebar } from '../page';
import JobSidebar from './JobSidebar';
import { JobSidebarProps } from './JobChat/OpenJobMobileMenu';

const SideJobInfo = ({
  job,
  address,
  eventMessages,
  addresses,
  sessionKeys,
  users,
  jobMeceTag,
  timePassed,
  adjustedProgressValue,
  whitelistedWorkers,
  tokenIcon,
  setSidebarOpen,
  setSelectedWorker,
  sidebarOpen
}: JobSidebarProps) => {

  useEffect(() => {
    if (!sidebarOpen) return;
    const handleButtonClick = (event: Event) => {
      console.log('handleButtonClick');
      if (setSidebarOpen) {
        setSidebarOpen(false);
      }

      // Find the corresponding button in jobButtonActionsDivOther
      const clickedButton = event.target as HTMLButtonElement;
      const buttonIndex = Array.from(clickedButton.parentElement!.children).indexOf(clickedButton);
      const jobButtonActionsDivs = document.getElementsByClassName('jobButtonActions');
      if (jobButtonActionsDivs.length > 1) {
        const jobButtonActionsDivOther = jobButtonActionsDivs[0];
        const otherButtons = jobButtonActionsDivOther.querySelectorAll('button');
        if (otherButtons[buttonIndex]) {
          otherButtons[buttonIndex].click();
        }
      }
    };

    const initializeEventListeners = () => {
      const jobButtonActionsDivs = document.getElementsByClassName('jobButtonActions');
      if (jobButtonActionsDivs.length > 1) {
        const jobButtonActionsDiv = jobButtonActionsDivs[1];
        const buttons = jobButtonActionsDiv.querySelectorAll('button');
        console.log('buttons', buttons);
        buttons.forEach(button => {
          button.addEventListener('click', handleButtonClick);
        });
      }
    };

    const timeoutId = setTimeout(initializeEventListeners, 200);
    return () => {
      clearTimeout(timeoutId);
      const jobButtonActionsDivs = document.getElementsByClassName('jobButtonActions');
      if (jobButtonActionsDivs.length > 1) {
        const jobButtonActionsDiv = jobButtonActionsDivs[1];
        const buttons = jobButtonActionsDiv.querySelectorAll('button');
        buttons.forEach(button => {
          button.removeEventListener('click', handleButtonClick);
        });
      }
    };
  }, [sidebarOpen]);
  
  return (
    <>
  <Transition.Root show={sidebarOpen} as={Fragment}>
    <Dialog as='div' className='relative z-50 lg:hidden' onClose={setSidebarOpen ?? (() => {})}>
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

      <div className='fixed inset-0 flex justify-end'>
        <Transition.Child
          as={Fragment}
          enter='transition ease-in-out duration-150 transform'
          enterFrom='translate-x-full'
          enterTo='translate-x-0'
          leave='transition ease-in-out duration-150 transform'
          leaveFrom='translate-x-0'
          leaveTo='translate-x-full'
        >
          <Dialog.Panel className='relative ml-16 flex w-full max-w-xs flex-1'>
            <Transition.Child
              as={Fragment}
              enter='ease-in-out duration-100'
              enterFrom='opacity-0'
              enterTo='opacity-100'
              leave='ease-in-out duration-100'
              leaveFrom='opacity-100'
              leaveTo='opacity-0'
            >
              <div className='absolute right-full top-0 flex w-16 justify-center pt-5'>
                <button
                  type='button'
                  className='-m-2.5 p-2.5'
                  onClick={() => (setSidebarOpen ? setSidebarOpen(false) : undefined)}
                >
                  <span className='sr-only'>Close sidebar</span>
                  <XMarkIcon className='h-6 w-6 text-white' aria-hidden='true' />
                </button>
              </div>
            </Transition.Child>

            <div className='flex grow flex-col gap-y-5 overflow-y-auto  bg-white pb-0 dark:bg-black'>
              <JobSidebar 
                job={job}
                address={address as `0x${string}`}
                events={eventMessages as JobEventWithDiffs[]}
                addresses={addresses}
                sessionKeys={sessionKeys}
                users={users ?? {}}
                jobMeceTag={jobMeceTag ?? ''}
                timePassed={timePassed}
                adjustedProgressValue={adjustedProgressValue}
                whitelistedWorkers={whitelistedWorkers}
                tokenIcon={tokenIcon}
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

export default SideJobInfo;
