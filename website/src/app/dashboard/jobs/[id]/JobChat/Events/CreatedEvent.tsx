import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import { PiSparkle } from 'react-icons/pi';

interface CreatedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const CreatedEvent: React.FC<CreatedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  // Get the creator user from the users prop
  const creatorAddress = event.address_;
  const creator = users[creatorAddress];
  const creatorName = creator?.name || 'Unknown User';

  // Check if current user is the creator
  const isCurrentUser = currentUser?.address_ === creatorAddress;

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg sm:h-10 sm:w-10'>
        {creator?.avatar ? (
          <ProfileImage
            user={creator}
            className='h-8 w-8 rounded-full border-2 border-white sm:h-10 sm:w-10'
          />
        ) : (
          <PiSparkle className='h-4 w-4 text-white sm:h-5 sm:w-5' />
        )}
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                You
              </span>
            ) : (
              <Link
                href={`/dashboard/users/${creatorAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400'
              >
                {creatorName}
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              created the job
            </span>
          </div>

          {/* Job Title */}
          {job && (
            <div className='mt-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-2 sm:p-3 dark:from-blue-950/20 dark:to-purple-950/20'>
              <h4 className='text-xs font-semibold text-gray-900 sm:text-sm dark:text-white'>
                {job.title}
              </h4>
              {job.content && (
                <p className='mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400'>
                  {job.content}
                </p>
              )}
            </div>
          )}

          {/* Diffs - showing what changed */}
          {event.diffs && event.diffs.length > 0 && (
            <div className='mt-2 space-y-1'>
              {event.diffs.map((diff, index) => (
                <div
                  key={index}
                  className='flex flex-wrap items-center gap-2 text-xs'
                >
                  <span className='text-gray-500 dark:text-gray-400'>
                    {diff.field}:
                  </span>
                  <span className='rounded bg-red-100 px-1.5 py-0.5 text-red-600 line-through dark:bg-red-900/30 dark:text-red-400'>
                    {diff.oldValue || 'empty'}
                  </span>
                  <span className='text-gray-400'>→</span>
                  <span className='rounded bg-green-100 px-1.5 py-0.5 text-green-600 dark:bg-green-900/30 dark:text-green-400'>
                    {diff.newValue}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3 dark:text-gray-400'>
          <span>{moment(event.timestamp_ * 1000).fromNow()}</span>
          {job && job.tags && job.tags.length > 0 && (
            <>
              <span>•</span>
              <div className='flex items-center gap-1'>
                {job.tags.slice(0, 2).map((tag, i) => (
                  <span
                    key={i}
                    className='rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 2 && (
                  <span className='text-gray-400'>+{job.tags.length - 2}</span>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default CreatedEvent;
