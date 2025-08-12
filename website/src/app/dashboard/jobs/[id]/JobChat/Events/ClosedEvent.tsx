import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import { PiXCircleFill, PiUser } from 'react-icons/pi';

interface ClosedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const ClosedEvent: React.FC<ClosedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const creatorAddress = job?.roles.creator || event.address_;
  const creator = users[creatorAddress];
  const creatorName = creator?.name || 'Job Creator';

  // Check if current user is the creator
  const isCurrentUser = currentUser?.address_ === creatorAddress;

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg sm:h-10 sm:w-10'>
        <PiXCircleFill className='h-4 w-4 text-white sm:h-5 sm:w-5' />
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-gray-600 dark:text-gray-400'>
                You
              </span>
            ) : (
              <Link
                href={`/dashboard/users/${creatorAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400'
              >
                {creatorName}
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              closed the job
            </span>
          </div>

          {/* Closed Notice */}
          <div className='mt-2 rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-3 dark:border-gray-700 dark:bg-gray-800/50'>
            <p className='text-xs text-gray-600 dark:text-gray-400'>
              This job has been closed and is no longer accepting applications
              or work.
            </p>
          </div>
        </div>

        <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
          {moment(event.timestamp_ * 1000).fromNow()}
        </div>
      </div>
    </>
  );
};

export default ClosedEvent;
