import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type JobDisputedEvent,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import {
  PiWarning,
  PiScales,
  PiUser,
  PiFileText,
  PiShieldCheck,
} from 'react-icons/pi';

interface DisputedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const DisputedEvent: React.FC<DisputedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const disputeDetails = event.details as JobDisputedEvent;
  const disputerAddress = event.address_;
  const disputer = users[disputerAddress];
  const disputerName = disputer?.name || 'User';

  // Check if current user is the disputer
  const isCurrentUser = currentUser?.address_ === disputerAddress;

  // Get arbitrator info if available
  const arbitratorAddress = job?.roles.arbitrator;
  const arbitrator = arbitratorAddress ? users[arbitratorAddress] : null;
  const arbitratorName = arbitrator?.name || 'Arbitrator';

  // Determine if disputer is creator or worker
  const isCreator = disputerAddress === job?.roles.creator;
  const disputerRole = isCreator ? 'Creator' : 'Worker';

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg sm:h-10 sm:w-10'>
        <PiWarning className='h-4 w-4 text-white sm:h-5 sm:w-5' />
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-amber-600 dark:text-amber-400'>
                You
              </span>
            ) : (
              <Link
                href={`/users/${disputerAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-amber-600 dark:text-gray-100 dark:hover:text-amber-400'
              >
                {disputerName}
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              raised a dispute
            </span>
          </div>

          {/* Dispute Card */}
          <div className='mt-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-4 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20'>
            <div className='mb-3 flex items-start justify-between'>
              <div className='flex items-center gap-2'>
                <PiScales className='h-4 w-4 text-amber-600 sm:h-5 sm:w-5 dark:text-amber-400' />
                <h4 className='text-xs font-semibold text-gray-900 sm:text-sm dark:text-white'>
                  Dispute Initiated
                </h4>
              </div>
              <span className='rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'>
                {disputerRole}
              </span>
            </div>

            {/* Dispute Reason */}
            {disputeDetails?.content && (
              <div className='rounded-lg bg-white p-2 sm:p-3 dark:bg-gray-800/50'>
                <div className='mb-2 flex items-center gap-2'>
                  <PiFileText className='h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4 dark:text-gray-400' />
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                    Reason for Dispute:
                  </span>
                </div>
                <p className='text-xs text-gray-700 sm:text-sm dark:text-gray-300'>
                  {disputeDetails.content}
                </p>
              </div>
            )}

            {/* Parties Involved */}
            <div className='mt-3 grid grid-cols-1 gap-3 border-t border-amber-100 pt-3 sm:grid-cols-2 dark:border-amber-900'>
              {/* Disputer Info */}
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Raised by:
                </span>
                <div className='flex items-center gap-1'>
                  {disputer?.avatar ? (
                    <ProfileImage
                      user={disputer}
                      className='h-4 w-4 rounded-full sm:h-5 sm:w-5'
                    />
                  ) : (
                    <div className='flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-500 sm:h-5 sm:w-5'>
                      <PiUser className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3' />
                    </div>
                  )}
                  <Link
                    href={`/users/${disputerAddress}`}
                    className='text-xs font-medium text-gray-700 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400'
                  >
                    {disputerName}
                  </Link>
                </div>
              </div>

              {/* Arbitrator Info */}
              {arbitrator && (
                <div className='flex items-center gap-2'>
                  <span className='text-xs text-gray-500 dark:text-gray-400'>
                    Arbitrator:
                  </span>
                  <div className='flex items-center gap-1'>
                    <PiShieldCheck className='h-3.5 w-3.5 text-amber-600 sm:h-4 sm:w-4 dark:text-amber-400' />
                    <Link
                      href={`/dashboard/arbitrators/${arbitratorAddress}`}
                      className='text-xs font-medium text-gray-700 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400'
                    >
                      {arbitratorName}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Status Notice */}
            <div className='mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2 dark:border-amber-700 dark:bg-amber-900/20'>
              <p className='text-xs text-amber-700 dark:text-amber-300'>
                ⚠️ The arbitrator will review this dispute and make a binding
                decision
              </p>
            </div>
          </div>

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
                  <span className='text-gray-400'>{diff.oldValue}</span>
                  <span className='text-gray-400'>→</span>
                  <span className='font-medium text-amber-600 dark:text-amber-400'>
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

export default DisputedEvent;
