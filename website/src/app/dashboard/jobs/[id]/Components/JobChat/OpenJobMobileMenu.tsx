import type React from 'react';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react'
import Link from 'next/link';
import {
  Job,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { PiChatCircleDots, PiInfo } from 'react-icons/pi';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';
import SideJobList from '../SideJobList';
import SideJobInfo from '../SideJobInfo';

export type JobSidebarProps = {
  job: any;
  address: `0x${string}`;
  events: any[];
  addresses: string[];
  sessionKeys: Record<string, string>;
  users: Record<string, User>;
  jobMeceTag: string;
  timePassed: boolean;
  adjustedProgressValue: number;
  whitelistedWorkers: string[];
  tokenIcon: (token: string) => string;
  sidebarOpen?: boolean;
  setSidebarOpen?: (value: boolean) => void;
  setSelectedWorker: Dispatch<SetStateAction<string>>;
  selectedWorker: string;
  eventMessages: JobEventWithDiffs[];
  user?: User;
};

const OpenJobMobileMenu: React.FC<JobSidebarProps> = ({
  selectedWorker,
  users,
  eventMessages,
  address,
  job,
  setSelectedWorker,
  events,
  addresses,
  sessionKeys,
  jobMeceTag,
  timePassed,
  adjustedProgressValue,
  whitelistedWorkers,
  tokenIcon,
  user
}) => {
  const isWorker: boolean = address === job.roles.worker;
  const isCreator: boolean = address === job.roles.creator;
  const isArbitrator: boolean = address === job.roles.arbitrator;
  const isGuest = !users[address];
  
  const [sideJobListOpen, setSideJobListOpen] = useState(false);
  const [sideJobInfoOpen, setSideJobInfoOpen] = useState(false);

  // Determine when to show the mobile menu
  const shouldShowMenu = true; // Always show on mobile for better UX

  // Show the applicant list button only for creators when job is open
  const showApplicantListButton = isCreator && job.state === JobState.Open;
  
  // Always show the info button on mobile
  const showInfoButton = true;

  // Don't render anything on desktop
  if (!shouldShowMenu) {
    return null;
  }

  return (  
    <>
      {/* Mobile Menu Header - Only visible on mobile */}
      <div className='block md:hidden bg-softBlue border-l border-r border-gray-100'>
        <div className='flex h-14 items-center justify-between px-3'>
          {/* Left Button - Applicant List (conditional) */}
          <div className='flex items-center'>
            {showApplicantListButton ? (
              <button
                onClick={() => setSideJobListOpen(true)}
                className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 transition-all duration-200 hover:bg-white active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700'
                aria-label='View messages'
              >
                <PiChatCircleDots className='h-5 w-5 text-gray-600 dark:text-gray-400' />
              </button>
            ) : (
              // Spacer to maintain layout when button is hidden
              <div className='w-10' />
            )}
          </div>

          {/* Center - Status/Title */}
          <div className='flex-1 flex justify-center items-center px-2'>
            {selectedWorker && users[selectedWorker] ? (
              // Beautiful clickable pill for selected user
              <Link href={`/dashboard/users/${selectedWorker}`}>
                <div className='relative group cursor-pointer'>
                  {/* Subtle gradient border effect */}
                  <div className='absolute -inset-px bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-full opacity-60 group-hover:opacity-80 transition duration-200'></div>
                  <div className='relative flex items-center gap-1.5 bg-white dark:bg-gray-900 px-2.5 py-1 rounded-full'>
                    {/* User avatar - text sized */}
                    <EventProfileImage
                      user={users[selectedWorker]}
                      className='h-3.5 w-3.5'
                    />
                    <span className='text-sm font-medium text-gray-800 dark:text-gray-200'>
                      {users[selectedWorker].name}
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              // Simple text for other states
              <span className='text-sm font-medium text-gray-600 dark:text-gray-400'>
                {(() => {
                  if (isCreator && job.state === JobState.Open) {
                    return 'Select Applicant';
                  }
                  if (isWorker) {
                    return 'Job Chat';
                  }
                  if (isArbitrator) {
                    return 'Arbitration';
                  }
                  if (isGuest) {
                    return 'Guest View';
                  }
                  return 'Job Details';
                })()}
              </span>
            )}
          </div>

          {/* Right Button - Job Info (always shown) */}
          <div className='flex items-center'>
            {showInfoButton && (
              <button
                onClick={() => setSideJobInfoOpen(true)}
                className='flex h-10 w-10 items-center justify-center rounded-lg bg-white/70 transition-all duration-200 hover:bg-white active:scale-95 dark:bg-gray-800 dark:hover:bg-gray-700'
                aria-label='View job information'
              >
                <PiInfo className='h-5 w-5 text-gray-600 dark:text-gray-400' />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Side panels - Applicant List */}
      <SideJobList 
        sidebarOpen={sideJobListOpen} 
        setSidebarOpen={setSideJobListOpen} 
        users={users} 
        address={address} 
        job={job} 
        setSelectedWorker={setSelectedWorker} 
        selectedWorker={selectedWorker}
      />
      
      {/* Side panels - Job Info */}
      <SideJobInfo 
        sidebarOpen={sideJobInfoOpen}
        setSidebarOpen={setSideJobInfoOpen}
        users={users}
        address={address as `0x${string}`}
        job={job}
        setSelectedWorker={setSelectedWorker}
        selectedWorker={selectedWorker}
        events={events}
        eventMessages={eventMessages}
        addresses={addresses}
        sessionKeys={sessionKeys}
        jobMeceTag={jobMeceTag ?? ''}
        timePassed={timePassed}
        adjustedProgressValue={adjustedProgressValue}
        whitelistedWorkers={whitelistedWorkers}
        tokenIcon={tokenIcon}
      />
    </>
  );
};

export default OpenJobMobileMenu;
