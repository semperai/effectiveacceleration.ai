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
  PiHandshake,
  PiArrowRight,
  PiCheckCircle,
  PiClock,
  PiUser,
} from 'react-icons/pi';

interface TakenEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const TakenEvent: React.FC<TakenEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const workerAddress = event.address_;
  const worker = users[workerAddress];
  const workerName = worker?.name || 'Worker';

  // Get creator info from job
  const creatorAddress = job?.roles.creator;
  const creator = creatorAddress ? users[creatorAddress] : null;
  const creatorName = creator?.name || 'Job Creator';

  // Check if current user is the worker
  const isCurrentUser = currentUser?.address_ === workerAddress;

  return (
    <>
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg'>
        <PiHandshake className='h-5 w-5 text-white' />
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
                href={`/dashboard/users/${workerAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-green-600 dark:text-gray-100 dark:hover:text-green-400'
              >
                {workerName}
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              accepted the job
            </span>
          </div>

          {/* Job Assignment Card */}
          <div className='mt-3 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <PiCheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
                <div>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    Job Started
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    Work is now in progress
                  </p>
                </div>
              </div>

              {job?.maxTime && (
                <div className='flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 dark:bg-gray-800'>
                  <PiClock className='h-4 w-4 text-gray-500' />
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                    {moment.duration(job.maxTime, 'seconds').humanize()}
                  </span>
                </div>
              )}
            </div>

            {/* Worker and Creator Info */}
            <div className='mt-3 flex items-center justify-between border-t border-green-100 pt-3 dark:border-green-900'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Worker:
                </span>
                {worker?.avatar ? (
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

              {creator && (
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    For:
                  </span>
                  <Link
                    href={`/dashboard/users/${creatorAddress}`}
                    className='text-xs font-medium text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400'
                  >
                    {creatorName}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Diffs - showing what changed */}
          {event.diffs && event.diffs.length > 0 && (
            <div className='mt-2 space-y-1'>
              {event.diffs.map((diff, index) => (
                <div key={index} className='flex items-center gap-2 text-xs'>
                  <span className='text-gray-500 dark:text-gray-400'>
                    {diff.field}:
                  </span>
                  <span className='text-gray-400'>
                    {diff.oldValue || 'none'}
                  </span>
                  <span className='text-gray-400'>→</span>
                  <span className='font-medium text-green-600 dark:text-green-400'>
                    {diff.newValue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
          {moment(event.timestamp_ * 1000).fromNow()}
        </div>
      </div>
    </>
  );
};

export default TakenEvent;
