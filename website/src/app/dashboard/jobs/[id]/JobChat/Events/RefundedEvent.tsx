import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import { PiArrowBendUpLeft, PiArrowRight, PiUser, PiX } from 'react-icons/pi';

interface RefundedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const RefundedEvent: React.FC<RefundedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  // Get the previous worker from diffs
  const workerDiff = event.diffs.find((val) => val.field === 'roles.worker');
  const workerAddress = workerDiff?.oldValue as string;
  const worker = workerAddress ? users[workerAddress] : null;
  const workerName = worker?.name || 'Worker';

  // Check if current user is the worker
  const isCurrentUser = currentUser?.address_ === workerAddress;

  return (
    <>
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 shadow-lg'>
        <PiArrowBendUpLeft className='h-5 w-5 text-white' />
        <div className='absolute -bottom-1 -right-1 rounded-full bg-red-600 p-1'>
          <PiX className='h-3 w-3 text-white' />
        </div>
      </div>

      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-red-600 dark:text-red-400'>
                You
              </span>
            ) : worker ? (
              <Link
                href={`/dashboard/users/${workerAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-red-600 dark:text-gray-100 dark:hover:text-red-400'
              >
                {workerName}
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            ) : (
              <span className='font-semibold text-gray-900 dark:text-gray-100'>
                Worker
              </span>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              rejected the job
            </span>
          </div>

          {/* Refund Notice */}
          <div className='mt-2 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/20'>
            <p className='text-xs text-red-700 dark:text-red-300'>
              The worker has declined this job and the escrow has been refunded
              to the creator.
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

export default RefundedEvent;
