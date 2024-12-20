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
import { JobSidebarProps } from '../../page';
import InfoIcon from '@mui/icons-material/Info';

interface ResultAcceptedProps extends JobSidebarProps {
  users: Record<string, User>;
  selectedWorker: string;
  eventMessages: JobEventWithDiffs[];
  job: Job;
  setSelectedWorker: Dispatch<SetStateAction<string>>;
}
const ProfileUserHeader: React.FC<ResultAcceptedProps> = ({
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
  tokenIcon
}) => {
  const isWorker: boolean = address === selectedWorker;
  const isCreator: boolean = address === job.roles.creator;
  const [sideJobListOpen, setSideJobListOpen] = useState(false);
  const [sideJobInfoOpen, setSideJobInfoOpen] = useState(false);

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
                    <div className='self-center !text-md mr-1 block md:hidden'>
                      <ArrowBackIosNewIcon onClick={() => setSideJobListOpen(prevState => !prevState)} className='self-center !text-md mr-1 block md:hidden'></ArrowBackIosNewIcon>
                    </div>
                    <Image
                      className='max-h-10 max-w-10 rounded-lg'
                      src={
                        isWorker
                          ? users[job.roles.creator]?.avatar ||
                            '/profilePicture.webp'
                          : users[selectedWorker]?.avatar ||
                            '/profilePicture.webp'
                      }
                      height={100}
                      width={100}
                      alt={'Profile picture'}
                    />
                    <span className='block font-extrabold self-center pl-4'>
                      {isWorker
                        ? users[job.roles.creator]?.name ||
                          'Unregistered Account'
                        : users[selectedWorker]?.name || 'Unregistered Account'}
                    </span>
                  </div>
                  <div className='self-center !text-md mr-1 block md:hidden'>
                    <InfoIcon   onClick={() => setSideJobInfoOpen(prevState => !prevState)} className='self-center !text-md mr-1 block md:hidden'></InfoIcon>
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
            />
          <SideJobInfo 
              sidebarOpen={sideJobInfoOpen}
              setSidebarOpen={setSideJobInfoOpen}
              users={users}
              address={address as `0x${string}`}
              job={job}
              setSelectedWorker={setSelectedWorker} 
              eventMessages={eventMessages} 
              events={ events} 
              addresses={addresses} 
              sessionKeys={sessionKeys} 
              jobMeceTag={jobMeceTag ?? ''} 
              timePassed={timePassed} 
              adjustedProgressValue={adjustedProgressValue} 
              whitelistedWorkers={whitelistedWorkers} 
              tokenIcon={tokenIcon} 
            />
        </div>

      ) : (
        <></>
      )}
    </>
  );
};
export default ProfileUserHeader;
