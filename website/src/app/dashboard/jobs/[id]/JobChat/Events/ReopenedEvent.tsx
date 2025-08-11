import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import { PiArrowCounterClockwise, PiArrowRight, PiUser } from 'react-icons/pi';

interface ReopenedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const ReopenedEvent: React.FC<ReopenedEventProps> = ({
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
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg'>
        <PiArrowCounterClockwise className='h-5 w-5 text-white' />
      </div>

      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                You
              </span>
            ) : (
              <Link
                href={`/dashboard/users/${creatorAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400'
              >
                {creatorName}
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              reopened the job
            </span>
          </div>

          {/* Reopened Notice */}
          <div className='mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-900/20'>
            <p className='text-xs text-blue-700 dark:text-blue-300'>
              This job is now open again and accepting new applications.
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

export default ReopenedEvent;
