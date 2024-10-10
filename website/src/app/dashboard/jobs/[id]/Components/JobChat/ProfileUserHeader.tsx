import React from 'react';

import { Job, JobEventType, JobEventWithDiffs, JobState, User } from 'effectiveacceleration-contracts/dist/src/interfaces';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import Image from 'next/image';

interface ResultAcceptedProps {
    users: Record<string, User>,
    selectedWorker: string,
  }
  const ProfileUserHeader: React.FC<ResultAcceptedProps> = ({ selectedWorker, users }) => {
    console.log(typeof selectedWorker, 'selectedWorker')
  return (
    <>
      {selectedWorker ? (
        <div>
          <div className='min-h-[100px]'>
            <div className='border border-gray-100 p-4 justify-between align-center'>
              <div className='h-fit'>
                <div className='flex flex-row'>
                  <div className='flex self-center pr-4'>
                    <Image
                      className='max-h-10 max-w-10 rounded-lg'
                      src={users[selectedWorker]?.avatar || '/profilePicture.webp'}
                      height={100}
                      width={100}
                      alt={'Profile picture'}
                    />
                  </div>
                  <div className='self-center'>
                    <span className='font-extrabold block'>
                      {users[selectedWorker]?.name || 'Unregistered Account'}
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