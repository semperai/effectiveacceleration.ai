import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import { Badge } from '@/components/Badge';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
  JobEventType,
} from '@effectiveacceleration/contracts';
import { PiInfo, PiUser } from 'react-icons/pi';

interface DefaultEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const DefaultEvent: React.FC<DefaultEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const userAddress = event.address_;
  const user = users[userAddress];
  const userName = user?.name || 'User';

  // Check if current user
  const isCurrentUser = currentUser?.address_ === userAddress;

  // Get event type name
  const eventTypeName = JobEventType[event.type_] || `Event ${event.type_}`;

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg sm:h-10 sm:w-10'>
        <PiInfo className='h-4 w-4 text-white sm:h-5 sm:w-5' />
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-gray-600 dark:text-gray-400'>
                You
              </span>
            ) : user ? (
              <Link
                href={`/users/${userAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-gray-600 dark:text-gray-100 dark:hover:text-gray-400'
              >
                {userName}
              </Link>
            ) : (
              <span className='font-semibold text-gray-900 dark:text-gray-100'>
                Unknown User
              </span>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              triggered {eventTypeName}
            </span>
          </div>

          {/* Show diffs if available */}
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
                  {diff.oldValue && (
                    <>
                      <Badge color='red' className='text-xs'>
                        {diff.oldValue.toString()}
                      </Badge>
                      <span className='text-gray-400'>→</span>
                    </>
                  )}
                  <Badge color='lime' className='text-xs'>
                    {diff.newValue?.toString()}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Show event details if available */}
          {event.details && (
            <div className='mt-2 rounded-lg bg-gray-50 p-2 dark:bg-gray-800'>
              <pre className='overflow-x-auto text-xs text-gray-600 dark:text-gray-400'>
                {JSON.stringify(event.details, null, 2)}
              </pre>
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

export default DefaultEvent;
