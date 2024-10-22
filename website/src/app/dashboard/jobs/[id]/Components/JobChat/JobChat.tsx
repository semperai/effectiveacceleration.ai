import React from 'react';
import Image from 'next/image';

import { Job, JobArbitratedEvent, JobEventType, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { formatTokenNameAndAmount } from '@/tokens';
import JobChatStatus from './JobChatStatus';
import { renderEvent } from '@/components/Events';
import logoDark from '@/images/logo-light.png'
import { zeroAddress } from 'viem';

interface ResultAcceptedProps {
    job: Job;
    events: JobEventWithDiffs[],   
    users: Record<string, User>, 
    selectedWorker: string, 
    address: `0x${string}` | undefined,
  }
  const JobChatEvents: React.FC<ResultAcceptedProps> = ({ job, users, selectedWorker, events, address }) => {
  const numberOfWorkers = (Object.keys(users).length) - 1  // -1 to exclude the creator;
  return (
    <div className='row-span-4 border border-gray-100 bg-softBlue  max-h-customHeader overflow-y-auto'>
        {selectedWorker && events.length > 0 ? (
            <>
                <div className="flow-root w-full pl-5">
                    <ul role="list" className="-mb-8">
                        {events?.slice().map((event, index) => (
                        <li key={index}>
                            <div className="relative pb-8">
                            {index !== events?.length - 1 ? (
                                <span className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex items-start space-x-3">
                                {renderEvent({event})}
                            </div>
                            </div>
                        </li>
                        ))}
                    </ul>
                </div>
                <JobChatStatus
                    events={events}
                    users={users}
                    selectedWorker={selectedWorker}
                    job={job}
                    address={address}
                />
            </>
        ) : (
            <div className='flex h-full items-center justify-center max-h-customHeader'>
            {numberOfWorkers === 0 ? 
                (
                    <span className='text-center'>A chat with the applying workers will appear here</span>
                ) 
                : 
                (
                    <Image className='text-center max-h-[35px] max-w-[150px]' src={logoDark} alt="Worker" width={150} height={150} />
                )
            }
            </div>
        )}
    </div>

  );
};

export default JobChatEvents;