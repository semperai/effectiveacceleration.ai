import Image from 'next/image';
import React from 'react';
import { Button } from '@/components/Button';

import { renderEvent } from '@/components/Events';
import logoDark from '@/images/logo-light.png';
import {
  Job,
  JobEventWithDiffs,
  User,
} from '@effectiveacceleration/contracts/dist/src/interfaces';
import JobChatStatus from './JobChatStatus';
import useUser from '@/hooks/subsquid/useUser';
import { useSearchParams } from 'next/navigation';
import clsx from 'clsx';

interface ResultAcceptedProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
}
const JobChatEvents: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
  address,
}) => {
  const { data: user } = useUser(address!);
  const numberOfWorkers = Object.keys(users).length - 1; // -1 to exclude the creator;
  const searchParams = useSearchParams();
  const highlightedEventId = searchParams.get('eventId');
  return (
    <div className='row-span-4 max-h-customHeader overflow-y-auto px-4 border border-gray-100 bg-softBlue'>
      {selectedWorker && events.length > 0 ? (
        <>
          <div className='flow-root w-full mt-4'>
            <ul role='list' className='-mb-8'>
              {events?.slice().map((event, index) => (
                <li key={index}>
                  <div className='relative pb-8'>
                    {index !== events?.length - 1 ? (
                      <span
                        className='absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200'
                        aria-hidden='true'
                      />
                    ) : null}
                    <div
                      className={clsx(
                        'relative flex items-start space-x-3',
                        event.id === highlightedEventId
                          ? 'border-r-2 border-dashed border-r-yellow-600'
                          : ''
                      )}
                    >
                      {renderEvent({ event })}
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
        <div className='flex h-full max-h-customHeader flex-col items-center justify-center gap-4'>
          <div>
            <Image
              className='max-h-[35px] max-w-[150px] text-center'
              src={logoDark}
              alt=''
              width={150}
              height={150}
            />
          </div>

          {job.roles.creator === address && (
            <div className='text-center'>
              A chat with the applying workers will appear here
            </div>
          )}
          {job.roles.creator !== address &&
            job.roles.worker !== address &&
            job.roles.arbitrator !== address && (
              <div className='text-center'>
                Apply to this job by chatting with the creator
              </div>
            )}
          {!user && address !== job.roles.arbitrator && (
            <div className='text-center'>
              <Button href='/register'>Sign in to chat with the creator</Button>
            </div>
          )}
          {address === job.roles.arbitrator && (
            <div className='text-center'>
              You are the arbitrator for this job, you will get a notification
              if there is a dispute
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobChatEvents;
