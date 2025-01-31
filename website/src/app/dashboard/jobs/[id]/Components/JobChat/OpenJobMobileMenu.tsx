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
  tokenIcon
}) => {
  const isWorker: boolean = address === selectedWorker;
  const isCreator: boolean = address === job.roles.creator;
  const isArbitrator: boolean = address === job.roles.arbitrator;
  const isGuest = !users[address];
  const [sideJobListOpen, setSideJobListOpen] = useState(false);
  const [sideJobInfoOpen, setSideJobInfoOpen] = useState(false);

  return (  
    <>
      {(isCreator && job.state === JobState.Open && !isWorker && !selectedWorker) || isGuest || isArbitrator ? (
        <div className='block md:hidden'>
          <div className='min-h-[74px]'>
            <div className='min-h-[74px] items-center align-center justify-between border border-gray-100 p-4 content-center'>
              <div className='h-fit'>
                <div className='flex flex-row justify-between'>
                  <div className='flex self-center pr-4'>
                    <div className='self-center !text-md mr-1 block md:hidden'>
                    {!isGuest && (
                        <ArrowBackIosNewIcon 
                          onClick={() => setSideJobListOpen(prevState => !prevState)} 
                          className='self-center !text-md mr-1 block md:hidden text-lightPurple'>
                        </ArrowBackIosNewIcon>
                      )}
                    </div>
                  </div>
                  <div className='self-center !text-md mr-1 block md:hidden text-lightPurple'>
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
              selectedWorker={selectedWorker}
            />
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
        </div>

      ) : (
        <></>
      )}
    </>
  );
};
export default ProfileUserHeader;
