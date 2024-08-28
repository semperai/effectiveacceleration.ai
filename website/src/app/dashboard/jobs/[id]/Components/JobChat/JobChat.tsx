import React from 'react';

import { Job, JobArbitratedEvent, JobEventType, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { formatTokenNameAndAmount } from '@/tokens';
import JobChatStatus from './JobChatStatus';
import { renderEvent } from '@/components/Events';

interface ResultAcceptedProps {
    job: Job;
    events: JobEventWithDiffs[],   
    users: Record<string, User>, 
    selectedWorker: string, 
    address: `0x${string}` | undefined,
  }
  const JobChatEvents: React.FC<ResultAcceptedProps> = ({ job, users, selectedWorker, events, address }) => {
  return (
    <div className='row-span-4 border border-gray-100 bg-softBlue pl-5 max-h-customHeader overflow-y-auto'>
        <div className="flow-root w-full">
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
    </div>
  );
};

export default JobChatEvents;