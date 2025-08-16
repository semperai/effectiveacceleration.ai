import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
  JobEventType,
} from '@effectiveacceleration/contracts';
import {
  PiUserCheck,
  PiUserMinus,
  PiUser,
  PiShieldCheck,
} from 'react-icons/pi';

interface WhitelistedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const WhitelistedEvent: React.FC<WhitelistedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  // Determine if this is an add or remove event based on the event type
  const isAddition = event.type_ === JobEventType.WhitelistedWorkerAdded;

  const creatorAddress = job?.roles.creator;
  const creator = creatorAddress ? users[creatorAddress] : null;
  const creatorName = creator?.name || 'Job Creator';

  const targetAddress = event.address_;
  const targetUser = users[targetAddress];
  const targetName = targetUser?.name || 'User';

  // Check if current user is involved
  const isCurrentUserCreator = currentUser?.address_ === creatorAddress;
  const isCurrentUserTarget = currentUser?.address_ === targetAddress;

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 shadow-lg sm:h-10 sm:w-10'>
        {isAddition ? (
          <PiUserCheck className='h-4 w-4 text-white sm:h-5 sm:w-5' />
        ) : (
          <PiUserMinus className='h-4 w-4 text-white sm:h-5 sm:w-5' />
        )}
        <div className='absolute -bottom-1 -right-1 rounded-full bg-teal-600 p-0.5 sm:p-1'>
          <PiShieldCheck className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3' />
        </div>
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUserCreator ? (
              <span className='font-semibold text-teal-600 dark:text-teal-400'>
                You
              </span>
            ) : creator ? (
              <Link
                href={`/users/${creatorAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-teal-600 dark:text-gray-100 dark:hover:text-teal-400'
              >
                {creatorName}
              </Link>
            ) : (
              <span className='font-semibold text-gray-900 dark:text-gray-100'>
                Job Creator
              </span>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              {isAddition ? 'added' : 'removed'}{' '}
              {isCurrentUserTarget ? (
                <span className='font-medium text-teal-600 dark:text-teal-400'>
                  you
                </span>
              ) : (
                <Link
                  href={`/users/${targetAddress}`}
                  className='font-medium text-gray-700 hover:text-teal-600 dark:text-gray-300 dark:hover:text-teal-400'
                >
                  {targetName}
                </Link>
              )}{' '}
              {isAddition ? 'to' : 'from'} the whitelist
            </span>
          </div>

          {/* Whitelist Card */}
          <div
            className={`mt-3 rounded-xl border p-3 sm:p-4 ${
              isAddition
                ? 'border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 dark:border-teal-800 dark:from-teal-950/20 dark:to-cyan-950/20'
                : 'border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 dark:border-gray-700 dark:from-gray-800/20 dark:to-gray-900/20'
            }`}
          >
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2 sm:gap-3'>
                {targetUser?.avatar ? (
                  <ProfileImage
                    user={targetUser}
                    className='h-6 w-6 rounded-full sm:h-8 sm:w-8'
                  />
                ) : (
                  <div className='flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 sm:h-8 sm:w-8'>
                    <PiUser className='h-3.5 w-3.5 text-white sm:h-4 sm:w-4' />
                  </div>
                )}
                <div>
                  <p className='text-xs font-medium text-gray-900 sm:text-sm dark:text-white'>
                    {targetName}
                  </p>
                  <p className='text-xs text-gray-600 dark:text-gray-400'>
                    {isAddition
                      ? 'Can now apply for this job'
                      : 'No longer whitelisted for this job'}
                  </p>
                </div>
              </div>

              <span
                className={`rounded-full px-2 py-1 text-xs font-medium ${
                  isAddition
                    ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {isAddition ? '+ Added' : '- Removed'}
              </span>
            </div>
          </div>
        </div>

        <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
          {moment(event.timestamp_ * 1000).fromNow()}
        </div>
      </div>
    </>
  );
};

export default WhitelistedEvent;
