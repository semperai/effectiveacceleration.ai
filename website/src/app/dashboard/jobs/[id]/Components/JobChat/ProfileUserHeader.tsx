import React from 'react';

import {
  Job,
  JobEventWithDiffs,
  JobState,
  User
} from '@effectiveacceleration/contracts';
import Image from 'next/image';

interface ResultAcceptedProps {
  users: Record<string, User>;
  selectedWorker: string;
  eventMessages: JobEventWithDiffs[];
  address: string | undefined;
  job: Job;
}
const ProfileUserHeader: React.FC<ResultAcceptedProps> = ({
  selectedWorker,
  users,
  eventMessages,
  address,
  job,
}) => {
  const isWorker: boolean = address === selectedWorker;
  const isCreator: boolean = address === job.roles.creator;

  return (
    <>
      {selectedWorker !== ' ' && selectedWorker && eventMessages.length > 0 && (isWorker || isCreator) && job?.state !== JobState.Closed ? (
        <div>
          <div className='min-h-[100px]'>
            <div className='align-center justify-between border border-gray-100 p-4'>
              <div className='h-fit'>
                <div className='flex flex-row'>
                  <div className='flex self-center pr-4'>
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
                  </div>
                  <div className='self-center'>
                    <span className='block font-extrabold'>
                      {isWorker
                        ? users[job.roles.creator]?.name ||
                          'Unregistered Account'
                        : users[selectedWorker]?.name || 'Unregistered Account'}
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
