'use client';
import React, { Dispatch, Fragment, SetStateAction, useEffect } from 'react';
import { Transition, Dialog } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Job, type JobEventWithDiffs, User } from '@effectiveacceleration/contracts';
import JobSidebar from './JobSidebar';
import type { JobSidebarProps } from './JobChat/OpenJobMobileMenu';
import { PiX } from 'react-icons/pi';

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
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog 
        as='div' 
        className='relative z-50 lg:hidden' 
        onClose={setSidebarOpen ?? (() => {})}
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

        <div className='fixed inset-0 flex justify-end'>
          <Transition.Child
            as={Fragment}
            enter='transition ease-in-out duration-300 transform'
            enterFrom='translate-x-full'
            enterTo='translate-x-0'
            leave='transition ease-in-out duration-200 transform'
            leaveFrom='translate-x-0'
            leaveTo='translate-x-full'
          >
            <Dialog.Panel className='relative ml-16 flex w-full max-w-md flex-1'>
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
                    className='
                      -ml-14 p-2.5 rounded-xl
                      bg-white/10 backdrop-blur-sm
                      text-white hover:text-gray-200
                      hover:bg-white/20
                      transition-all duration-200
                    '
                    onClick={() => (setSidebarOpen ? setSidebarOpen(false) : undefined)}
                  >
                    <span className='sr-only'>Close sidebar</span>
                    <PiX className='h-5 w-5' />
                  </button>
                </div>
              </Transition.Child>

              <div className='flex grow flex-col overflow-y-auto bg-white dark:bg-gray-900 shadow-2xl'>
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
  );
};

export default SideJobInfo;
