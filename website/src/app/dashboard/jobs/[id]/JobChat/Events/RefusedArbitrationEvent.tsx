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
  PiProhibit,
  PiArrowRight,
  PiShieldWarning,
  PiUser,
} from 'react-icons/pi';

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
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 shadow-lg'>
        <PiProhibit className='h-5 w-5 text-white' />
        <div className='absolute -bottom-1 -right-1 rounded-full bg-orange-600 p-1'>
          <PiShieldWarning className='h-3 w-3 text-white' />
        </div>
      </div>

      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-orange-600 dark:text-orange-400'>
                You
              </span>
            ) : arbitrator ? (
              <Link
                href={`/dashboard/arbitrators/${arbitratorAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400'
              >
                {arbitratorName}
                <span className='ml-1 rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'>
                  Arbitrator
                </span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
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
          <div className='mt-2 rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-700 dark:bg-orange-900/20'>
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
