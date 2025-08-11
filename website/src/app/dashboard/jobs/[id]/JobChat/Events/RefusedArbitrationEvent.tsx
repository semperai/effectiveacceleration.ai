import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import { PiProhibit, PiShieldWarning, PiUser } from 'react-icons/pi';

interface RefusedArbitrationEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const RefusedArbitrationEvent: React.FC<RefusedArbitrationEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  // Get the previous arbitrator from diffs
  const arbitratorDiff = event.diffs.find(
    (val) => val.field === 'roles.arbitrator'
  );
  const arbitratorAddress = arbitratorDiff?.oldValue as string;
  const arbitrator = arbitratorAddress ? users[arbitratorAddress] : null;
  const arbitratorName = arbitrator?.name || 'Arbitrator';

  // Check if current user is the arbitrator
  const isCurrentUser = currentUser?.address_ === arbitratorAddress;

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg sm:h-10 sm:w-10'>
        <PiProhibit className='h-4 w-4 text-white sm:h-5 sm:w-5' />
        <div className='absolute -bottom-1 -right-1 rounded-full bg-orange-600 p-0.5 sm:p-1'>
          <PiShieldWarning className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3' />
        </div>
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-orange-600 dark:text-orange-400'>
                You
              </span>
            ) : arbitrator ? (
              <Link
                href={`/dashboard/arbitrators/${arbitratorAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400'
              >
                {arbitratorName}
                <span className='ml-1 rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'>
                  Arbitrator
                </span>
              </Link>
            ) : (
              <span className='font-semibold text-gray-900 dark:text-gray-100'>
                Arbitrator
              </span>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              refused the arbitration
            </span>
          </div>

          {/* Refusal Notice */}
          <div className='mt-2 rounded-lg border border-orange-200 bg-orange-50 p-2 sm:p-3 dark:border-orange-700 dark:bg-orange-900/20'>
            <p className='text-xs text-orange-700 dark:text-orange-300'>
              The arbitrator has declined to handle this dispute. A new
              arbitrator may need to be assigned.
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

export default RefusedArbitrationEvent;
