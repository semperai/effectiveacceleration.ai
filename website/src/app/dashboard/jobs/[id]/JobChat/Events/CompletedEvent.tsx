import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import {
  PiCheckCircleFill,
  PiArrowRight,
  PiCoins,
  PiUser,
  PiSparkle,
} from 'react-icons/pi';

interface CompletedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const CompletedEvent: React.FC<CompletedEventProps> = ({
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

  // Get worker info if available
  const workerAddress = job?.roles.worker;
  const worker = workerAddress ? users[workerAddress] : null;
  const workerName = worker?.name || 'Worker';

  return (
    <>
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg'>
        <PiCheckCircleFill className='h-5 w-5 text-white' />
        <div className='absolute -bottom-1 -right-1 rounded-full bg-green-600 p-1'>
          <PiSparkle className='h-3 w-3 text-white' />
        </div>
      </div>

      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-green-600 dark:text-green-400'>
                You
              </span>
            ) : (
              <Link
                href={`/dashboard/users/${creatorAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-green-600 dark:text-gray-100 dark:hover:text-green-400'
              >
                {creatorName}
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              approved the result and released the escrow
            </span>
          </div>

          {/* Completion Card */}
          <div className='mt-3 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <PiCoins className='h-5 w-5 text-green-600 dark:text-green-400' />
                <div>
                  <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                    Job Completed Successfully
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Payment has been released to the worker
                  </p>
                </div>
              </div>

              <span className='rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400'>
                ✓ Complete
              </span>
            </div>

            {/* Worker Info */}
            {worker && (
              <div className='mt-3 flex items-center justify-between border-t border-green-100 pt-3 dark:border-green-900'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    Completed by:
                  </span>
                  {worker.avatar ? (
                    <ProfileImage
                      user={worker}
                      className='h-5 w-5 rounded-full'
                    />
                  ) : (
                    <div className='flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500'>
                      <PiUser className='h-3 w-3 text-white' />
                    </div>
                  )}
                  <Link
                    href={`/dashboard/users/${workerAddress}`}
                    className='text-xs font-medium text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
                  >
                    {workerName}
                  </Link>
                </div>

                <span className='text-xs font-medium text-green-600 dark:text-green-400'>
                  Payment released
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
          {moment(event.timestamp_ * 1000).fromNow()}
        </div>
      </div>
    </>
  );
};

export default CompletedEvent;
