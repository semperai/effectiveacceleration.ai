import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type JobRatedEvent,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import { PiStar, PiStarFill, PiUser, PiChatCircle } from 'react-icons/pi';

interface RatedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const RatedEvent: React.FC<RatedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const creatorAddress = job?.roles.creator || event.address_;
  const creator = users[creatorAddress];
  const creatorName = creator?.name || 'Job Creator';

  const details = event.details as JobRatedEvent;

  // Check if current user is the creator
  const isCurrentUser = currentUser?.address_ === creatorAddress;

  // Get worker info
  const workerAddress = job?.roles.worker;
  const worker = workerAddress ? users[workerAddress] : null;
  const workerName = worker?.name || 'Worker';

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className='flex items-center gap-0.5'>
        {[...Array(5)].map((_, i) =>
          i < rating ? (
            <PiStarFill
              key={i}
              className='h-3.5 w-3.5 text-yellow-500 sm:h-4 sm:w-4'
            />
          ) : (
            <PiStar
              key={i}
              className='h-3.5 w-3.5 text-gray-300 sm:h-4 sm:w-4 dark:text-gray-600'
            />
          )
        )}
      </div>
    );
  };

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-amber-500 shadow-lg sm:h-10 sm:w-10'>
        <PiStarFill className='h-4 w-4 text-white sm:h-5 sm:w-5' />
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-yellow-600 dark:text-yellow-400'>
                You
              </span>
            ) : (
              <Link
                href={`/dashboard/users/${creatorAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-yellow-600 dark:text-gray-100 dark:hover:text-yellow-400'
              >
                {creatorName}
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              rated{' '}
              {worker && (
                <Link
                  href={`/dashboard/users/${workerAddress}`}
                  className='font-medium text-gray-700 hover:text-yellow-600 dark:text-gray-300 dark:hover:text-yellow-400'
                >
                  {workerName}
                </Link>
              )}
            </span>
          </div>

          {/* Rating Card */}
          <div className='mt-3 rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50 p-3 sm:p-4 dark:border-yellow-800 dark:from-yellow-950/20 dark:to-amber-950/20'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
              {renderStars(details.rating)}
              <span className='text-xs font-semibold text-gray-900 sm:text-sm dark:text-white'>
                {details.rating}.0 / 5.0
              </span>
            </div>

            {/* Review Text */}
            {details.review && (
              <div className='mt-3 rounded-lg bg-white p-2 sm:p-3 dark:bg-gray-800/50'>
                <div className='mb-2 flex items-center gap-2'>
                  <PiChatCircle className='h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4 dark:text-gray-400' />
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                    Review
                  </span>
                </div>
                <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
                  {details.review}
                </p>
              </div>
            )}

            {/* Rated Worker */}
            {worker && (
              <div className='mt-3 flex items-center justify-between border-t border-yellow-100 pt-3 dark:border-yellow-900'>
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    Worker rated:
                  </span>
                  {worker.avatar ? (
                    <ProfileImage
                      user={worker}
                      className='h-4 w-4 rounded-full sm:h-5 sm:w-5'
                    />
                  ) : (
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 sm:h-5 sm:w-5'>
                      <PiUser className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3' />
                    </div>
                  )}
                  <Link
                    href={`/dashboard/users/${workerAddress}`}
                    className='text-xs font-medium text-gray-700 hover:text-yellow-600 dark:text-gray-300 dark:hover:text-yellow-400'
                  >
                    {workerName}
                  </Link>
                </div>
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

export default RatedEvent;
