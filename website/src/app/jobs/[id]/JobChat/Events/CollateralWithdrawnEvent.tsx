import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/utils';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import { PiBank, PiCoins, PiUser } from 'react-icons/pi';

interface CollateralWithdrawnEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const CollateralWithdrawnEvent: React.FC<CollateralWithdrawnEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const creatorAddress = job?.roles.creator || event.address_;
  const creator = users[creatorAddress];
  const creatorName = creator?.name || 'Job Creator';

  // Get the withdrawn amount from diffs
  const collateralDiff = event.diffs.find(
    (val) => val.field === 'collateralOwed'
  );
  const amount = collateralDiff?.oldValue as bigint;
  const token = job?.token || '';

  // Check if current user is the creator
  const isCurrentUser = currentUser?.address_ === creatorAddress;

  return (
    <>
      <div className='relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 shadow-lg sm:h-10 sm:w-10'>
        <PiBank className='h-4 w-4 text-white sm:h-5 sm:w-5' />
      </div>

      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-indigo-600 dark:text-indigo-400'>
                You
              </span>
            ) : (
              <Link
                href={`/users/${creatorAddress}`}
                className='font-semibold text-gray-900 transition-colors hover:text-indigo-600 dark:text-gray-100 dark:hover:text-indigo-400'
              >
                {creatorName}
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              withdrew collateral
            </span>
          </div>

          {/* Withdrawal Card */}
          {amount && (
            <div className='mt-3 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 p-3 sm:p-4 dark:border-indigo-800 dark:from-indigo-950/20 dark:to-blue-950/20'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2 sm:gap-3'>
                  <PiCoins className='h-4 w-4 text-indigo-600 sm:h-5 sm:w-5 dark:text-indigo-400' />
                  <div>
                    <p className='text-xs font-semibold text-gray-900 sm:text-sm dark:text-white'>
                      Collateral Withdrawn
                    </p>
                    <div className='mt-1 flex items-center gap-2'>
                      <span className='text-base font-bold text-indigo-600 sm:text-lg dark:text-indigo-400'>
                        {formatTokenNameAndAmount(token, amount)}
                      </span>
                      <img
                        src={tokenIcon(token)}
                        alt=''
                        className='h-4 w-4 sm:h-5 sm:w-5'
                      />
                    </div>
                  </div>
                </div>
              </div>
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

export default CollateralWithdrawnEvent;
