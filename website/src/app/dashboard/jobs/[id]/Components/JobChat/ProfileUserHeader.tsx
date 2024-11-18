import React from 'react';

import { Job, JobEventType, JobEventWithDiffs, JobState, User } from '@effectiveacceleration/contracts';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import Image from 'next/image';

interface ResultAcceptedProps {
    users: Record<string, User>,
    selectedWorker: string,
    eventMessages: JobEventWithDiffs[],
    address: `0x${string}` | undefined,
    job: Job,
  }
  const ProfileUserHeader: React.FC<ResultAcceptedProps> = ({ selectedWorker, users, eventMessages, address, job }) => {
  const isWorker: boolean = address === selectedWorker;
  const isCreator: boolean = address === job.roles.creator;
  return (
    <>
      {selectedWorker && eventMessages.length > 0 && (isWorker || isCreator) ? (
        <div>
          <div className='min-h-[100px]'>
            <div className='border border-gray-100 p-4 justify-between align-center'>
              <div className='h-fit'>
                <div className='flex flex-row'>
                  <div className='flex self-center pr-4'>
                    <Image
                      className='max-h-10 max-w-10 rounded-lg'
                      src={isWorker ? users[job.roles.creator]?.avatar || '/profilePicture.webp' : users[selectedWorker]?.avatar || '/profilePicture.webp'}
                      height={100}
                      width={100}
                      alt={'Profile picture'}
                    />
                  </div>
                  <div className='self-center'>
                    <span className='font-extrabold block'>
                      {isWorker ? users[job.roles.creator]?.name || 'Unregistered Account' : users[selectedWorker]?.name || 'Unregistered Account'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
export default ProfileUserHeader;