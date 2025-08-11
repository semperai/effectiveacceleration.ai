import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/tokens';
import {
  type JobEventWithDiffs,
  type JobArbitratedEvent,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import {
  PiScales,
  PiArrowRight,
  PiGavel,
  PiCoins,
  PiShieldCheck,
} from 'react-icons/pi';

interface ArbitratedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const ArbitratedEvent: React.FC<ArbitratedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const arbitratorAddress = job?.roles.arbitrator || event.address_;
  const arbitrator = users[arbitratorAddress];
  const arbitratorName = arbitrator?.name || 'Arbitrator';

  const details = event.details as JobArbitratedEvent;

  // Check if current user is the arbitrator
  const isCurrentUser = currentUser?.address_ === arbitratorAddress;

  // Get creator and worker info
  const creatorAddress = job?.roles.creator;
  const creator = creatorAddress ? users[creatorAddress] : null;
  const workerAddress = job?.roles.worker;
  const worker = workerAddress ? users[workerAddress] : null;

  return (
    <>
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 shadow-lg'>
        <PiGavel className='h-5 w-5 text-white' />
        <div className='absolute -bottom-1 -right-1 rounded-full bg-purple-600 p-1'>
          <PiShieldCheck className='h-3 w-3 text-white' />
        </div>
      </div>

      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-purple-600 dark:text-purple-400'>
                You
              </span>
            ) : (
              <Link
                href={`/dashboard/arbitrators/${arbitratorAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-purple-600 dark:text-gray-100 dark:hover:text-purple-400'
              >
                {arbitratorName}
                <span className='ml-1 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                  Arbitrator
                </span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              resolved the dispute
            </span>
          </div>

          {/* Arbitration Card */}
          <div className='mt-3 rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 p-4 dark:border-purple-800 dark:from-purple-950/20 dark:to-indigo-950/20'>
            <div className='mb-3 flex items-center gap-2'>
              <PiScales className='h-5 w-5 text-purple-600 dark:text-purple-400' />
              <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                Arbitration Decision
              </h4>
            </div>

            {/* Decision Reason */}
            {details?.reason && (
              <div className='rounded-lg bg-white p-3 dark:bg-gray-800/50'>
                <p className='text-sm text-gray-700 dark:text-gray-300'>
                  {details.reason}
                </p>
              </div>
            )}

            {/* Distribution Details */}
            <div className='mt-3 space-y-2'>
              {/* Creator Share */}
              <div className='flex items-center justify-between rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20'>
                <div className='flex items-center gap-2'>
                  <PiCoins className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                    Creator ({creator?.name || 'Creator'})
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-sm font-semibold text-purple-600 dark:text-purple-400'>
                    {details.creatorShare / 100}%
                  </span>
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    (
                    {formatTokenNameAndAmount(
                      job?.token || '',
                      details.creatorAmount
                    )}
                    )
                  </span>
                  <img
                    src={tokenIcon(job?.token || '')}
                    alt=''
                    className='h-4 w-4'
                  />
                </div>
              </div>

              {/* Worker Share */}
              <div className='flex items-center justify-between rounded-lg bg-purple-50 p-2 dark:bg-purple-900/20'>
                <div className='flex items-center gap-2'>
                  <PiCoins className='h-4 w-4 text-purple-600 dark:text-purple-400' />
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                    Worker ({worker?.name || 'Worker'})
                  </span>
                </div>
                <div className='flex items-center gap-1'>
                  <span className='text-sm font-semibold text-purple-600 dark:text-purple-400'>
                    {details.workerShare / 100}%
                  </span>
                  <span className='text-xs text-gray-600 dark:text-gray-400'>
                    (
                    {formatTokenNameAndAmount(
                      job?.token || '',
                      details.workerAmount
                    )}
                    )
                  </span>
                  <img
                    src={tokenIcon(job?.token || '')}
                    alt=''
                    className='h-4 w-4'
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div className='mt-3 rounded-lg border border-purple-200 bg-purple-50 p-2 dark:border-purple-700 dark:bg-purple-900/20'>
              <p className='text-xs text-purple-700 dark:text-purple-300'>
                ✓ Dispute has been resolved and funds have been distributed
                according to the arbitrator&apos;s decision
              </p>
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

export default ArbitratedEvent;
