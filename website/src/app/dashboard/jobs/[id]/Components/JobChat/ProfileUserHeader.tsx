import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import {
  Job,
  JobEventWithDiffs,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Image from 'next/image';
import SideJobList from '../SideJobList';
import SideJobInfo from '../SideJobInfo';
import InfoIcon from '@mui/icons-material/Info';
import { JobSidebarProps } from './OpenJobMobileMenu';
import EventProfileImage from '@/components/Events/Components/EventProfileImage';

const ProfileUserHeader: React.FC<JobSidebarProps> = ({
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
  const isWorker: boolean = address === selectedWorker;
  const isCreator: boolean = address === job.roles.creator;
  const [sideJobListOpen, setSideJobListOpen] = useState(false);
  const [sideJobInfoOpen, setSideJobInfoOpen] = useState(false);
  const userAccount = users[selectedWorker];
  const isApplicantUser = user?.address_ === users[selectedWorker]?.address_;
  return (
    <>
      {selectedWorker !== ' ' &&
      selectedWorker &&
      eventMessages.length > 0 &&
      (isWorker || isCreator) &&
      job?.state !== JobState.Closed ? (
        <div>
          <div className='min-h-[80px]'>
            <div className='align-center justify-between border border-gray-100 p-4'>
              <div className='h-fit'>
                <div className='flex flex-row justify-between'>
                  <div className='flex self-center pr-4'>
                    {job?.state === JobState.Open && (
                      <div className='self-center !text-md mr-1 block md:hidden'>
                        <ArrowBackIosNewIcon 
                          onClick={() => setSideJobListOpen(prevState => !prevState)} 
                          className='self-center !text-md mr-1 block md:hidden text-lightPurple'>
                        </ArrowBackIosNewIcon>
                      </div>
                    )}
                    <EventProfileImage user={isApplicantUser ? users[job.roles.creator] :  userAccount}></EventProfileImage>
                    <span className='block font-extrabold self-center pl-4'>
                      {isWorker
                        ? users[job.roles.creator]?.name ||
                          'Unregistered Account'
                        : users[selectedWorker]?.name || 'Unregistered Account'}
                    </span>
                  </div>
                  <div className='self-center !text-md mr-1 block md:hidden'>
                    <InfoIcon onClick={() => setSideJobInfoOpen(prevState => !prevState)} className='self-center !text-md mr-1 block md:hidden text-lightPurple'></InfoIcon>
                  </div>
                </div>
              </div>
            </div>
          </div>
           <SideJobList 
              sidebarOpen={sideJobListOpen} 
              setSidebarOpen={setSideJobListOpen} 
              users={users} 
              address={address} 
              job={job} 
              setSelectedWorker={setSelectedWorker} 
              selectedWorker={selectedWorker}
            />
          <SideJobInfo 
              sidebarOpen={sideJobInfoOpen}
              setSidebarOpen={setSideJobInfoOpen}
              users={users}
              address={address as `0x${string}`}
              job={job}
              setSelectedWorker={setSelectedWorker} 
              eventMessages={eventMessages}
              addresses={addresses}
              sessionKeys={sessionKeys}
              jobMeceTag={jobMeceTag ?? ''}
              timePassed={timePassed}
              adjustedProgressValue={adjustedProgressValue}
              whitelistedWorkers={whitelistedWorkers}
              tokenIcon={tokenIcon}
              events={events}
              selectedWorker={selectedWorker}
            />
        </div>

      ) : (
        <></>
      )}
    </>
  );
};
export default ProfileUserHeader;
