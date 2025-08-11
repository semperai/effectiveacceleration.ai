import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  type Job,
  type JobArbitratedEvent,
  JobEventType,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/tokens';
import {
  PiScales,
  PiGavel,
  PiCheckCircle,
  PiCoin,
  PiFileText,
  PiLock,
  PiInfo,
  PiUser,
  PiUserCircle,
  PiBank,
  PiReceipt,
  PiSealCheck,
  PiArrowRight,
} from 'react-icons/pi';

interface ArbitratedStatusProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
}

const ArbitratedStatus: React.FC<ArbitratedStatusProps> = ({
  job,
  users,
  events,
  address,
}) => {
  const arbitratedEvent = events.filter(
    (event) => event.type_ === JobEventType.Arbitrated
  )[0]?.details as JobArbitratedEvent;

  const isCreator = address === job.roles.creator;
  const isWorker = address === job.roles.worker;
  const isArbitrator = address === job.roles.arbitrator;

  // Get user data for links
  const creatorData = users[job.roles.creator];
  const workerData = users[job.roles.worker];
  const arbitratorData = users[job.roles.arbitrator];

  // Calculate arbitrator fee (assuming it's the difference)
  const totalAmount = job.amount;
  const creatorAmount = arbitratedEvent?.creatorAmount || BigInt(0);
  const workerAmount = arbitratedEvent?.workerAmount || BigInt(0);
  const arbitratorFee = totalAmount - (creatorAmount + workerAmount);

  // Determine who received the majority of funds
  const workerFavored = workerAmount > creatorAmount;
  const splitDecision = workerAmount > BigInt(0) && creatorAmount > BigInt(0);

  return (
    <div className='my-4 w-full'>
      {/* Main Container with verdict theme */}
      <div className='relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-br from-slate-50 via-gray-50 to-slate-50 dark:border-slate-700 dark:from-slate-950/20 dark:via-gray-950/20 dark:to-slate-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/5 to-indigo-500/5 blur-3xl' />

        {/* Content */}
        <div className='relative p-6 lg:p-8'>
          {/* Verdict Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-4 shadow-lg shadow-blue-500/25'>
                <PiGavel className='h-10 w-10 text-white' />
              </div>
            </div>

            {/* Main Status Message */}
            <h3 className='mb-2 text-xl font-bold text-gray-900 lg:text-2xl dark:text-white'>
              Arbitration Complete
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              The arbitrator has made a final decision on this dispute
            </p>

            {/* Arbitrator Link */}
            {arbitratorData && (
              <Link
                href={`/dashboard/arbitrators/${job.roles.arbitrator}`}
                className='group mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                <span>Resolved by {arbitratorData.name || 'Arbitrator'}</span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
          </div>

          {/* Status Badge */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 px-5 py-2.5 dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/30'>
              <PiSealCheck className='h-5 w-5 text-green-600 dark:text-green-400' />
              <span className='text-sm font-medium text-green-800 dark:text-green-300'>
                Final Verdict Issued
              </span>
            </div>
          </div>

          {/* Arbitrator's Decision */}
          {arbitratedEvent?.reason && (
            <div className='mb-6 rounded-xl border border-gray-200 bg-white/70 p-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50'>
              <div className='flex items-start gap-4'>
                <div className='rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 p-3 dark:from-blue-900/30 dark:to-purple-900/30'>
                  <PiFileText className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
                <div className='flex-1'>
                  <h4 className='mb-2 text-sm font-semibold text-gray-900 dark:text-white'>
                    Arbitrator&apos;s Decision
                  </h4>
                  <blockquote className='border-l-4 border-blue-500 pl-4 text-sm italic text-gray-700 dark:text-gray-300'>
                    &quot;{arbitratedEvent?.reason || 'No reason provided'}
                    &quot;
                  </blockquote>
                </div>
              </div>
            </div>
          )}

          {/* Fund Distribution */}
          <div className='mb-6'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              <PiCoin className='h-4 w-4' />
              Fund Distribution
            </h4>

            <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
              {/* Creator's Portion */}
              <div
                className={`rounded-xl border p-4 ${
                  isCreator
                    ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-700 dark:from-blue-950/30 dark:to-indigo-950/30'
                    : 'border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-900/30'
                }`}
              >
                <div className='mb-2 flex items-center gap-2'>
                  <PiUserCircle className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Creator {isCreator && '(You)'}
                  </span>
                  {creatorData && !isCreator && (
                    <Link
                      href={`/dashboard/users/${job.roles.creator}`}
                      className='ml-auto'
                    >
                      <PiArrowRight className='h-3 w-3 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400' />
                    </Link>
                  )}
                </div>
                {creatorData && !isCreator && (
                  <Link
                    href={`/dashboard/users/${job.roles.creator}`}
                    className='text-xs text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    {creatorData.name}
                  </Link>
                )}
                <div className='mt-2 flex items-center gap-2'>
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(job.token, creatorAmount)}
                  </span>
                  <Image
                    src={tokenIcon(job.token)}
                    alt={`${job.token} icon`}
                    width={20}
                    height={20}
                    className='h-5 w-5'
                  />
                </div>
                {creatorAmount > BigInt(0) && (
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                    Refunded to creator
                  </p>
                )}
              </div>

              {/* Worker's Portion */}
              <div
                className={`rounded-xl border p-4 ${
                  isWorker
                    ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 dark:border-green-700 dark:from-green-950/30 dark:to-emerald-950/30'
                    : 'border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-900/30'
                }`}
              >
                <div className='mb-2 flex items-center gap-2'>
                  <PiUser className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Worker {isWorker && '(You)'}
                  </span>
                  {workerData && !isWorker && (
                    <Link
                      href={`/dashboard/users/${job.roles.worker}`}
                      className='ml-auto'
                    >
                      <PiArrowRight className='h-3 w-3 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400' />
                    </Link>
                  )}
                </div>
                {workerData && !isWorker && (
                  <Link
                    href={`/dashboard/users/${job.roles.worker}`}
                    className='text-xs text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    {workerData.name}
                  </Link>
                )}
                <div className='mt-2 flex items-center gap-2'>
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(job.token, workerAmount)}
                  </span>
                  <Image
                    src={tokenIcon(job.token)}
                    alt={`${job.token} icon`}
                    width={20}
                    height={20}
                    className='h-5 w-5'
                  />
                </div>
                {workerAmount > BigInt(0) && (
                  <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                    Paid to worker
                  </p>
                )}
              </div>

              {/* Arbitrator's Fee */}
              <div
                className={`rounded-xl border p-4 ${
                  isArbitrator
                    ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-violet-50 dark:border-purple-700 dark:from-purple-950/30 dark:to-violet-950/30'
                    : 'border-gray-200 bg-white/50 dark:border-gray-700 dark:bg-gray-900/30'
                }`}
              >
                <div className='mb-2 flex items-center gap-2'>
                  <PiScales className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Arbitrator Fee {isArbitrator && '(You)'}
                  </span>
                  {arbitratorData && !isArbitrator && (
                    <Link
                      href={`/dashboard/arbitrators/${job.roles.arbitrator}`}
                      className='ml-auto'
                    >
                      <PiArrowRight className='h-3 w-3 text-gray-400 transition-colors hover:text-blue-600 dark:hover:text-blue-400' />
                    </Link>
                  )}
                </div>
                {arbitratorData && !isArbitrator && (
                  <Link
                    href={`/dashboard/arbitrators/${job.roles.arbitrator}`}
                    className='text-xs text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    {arbitratorData.name}
                  </Link>
                )}
                <div className='mt-2 flex items-center gap-2'>
                  <span className='text-lg font-bold text-gray-900 dark:text-white'>
                    {formatTokenNameAndAmount(job.token, arbitratorFee)}
                  </span>
                  <Image
                    src={tokenIcon(job.token)}
                    alt={`${job.token} icon`}
                    width={20}
                    height={20}
                    className='h-5 w-5'
                  />
                </div>
                <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>
                  Service fee
                </p>
              </div>
            </div>
          </div>

          {/* Personal Receipt */}
          {(isCreator || isWorker || isArbitrator) && (
            <div className='mb-6 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-5 dark:border-indigo-800 dark:from-indigo-950/30 dark:to-purple-950/30'>
              <div className='flex items-start gap-3'>
                <PiReceipt className='mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600 dark:text-indigo-400' />
                <div className='flex-1'>
                  <h4 className='mb-2 text-sm font-semibold text-indigo-900 dark:text-indigo-300'>
                    Your Receipt
                  </h4>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-indigo-800 dark:text-indigo-400'>
                      {isCreator && 'Amount refunded to you:'}
                      {isWorker && 'Amount paid to you:'}
                      {isArbitrator && 'Arbitration fee earned:'}
                    </span>
                    <div className='flex items-center gap-2'>
                      <span className='text-lg font-bold text-indigo-900 dark:text-indigo-200'>
                        {isCreator &&
                          formatTokenNameAndAmount(job.token, creatorAmount)}
                        {isWorker &&
                          formatTokenNameAndAmount(job.token, workerAmount)}
                        {isArbitrator &&
                          formatTokenNameAndAmount(job.token, arbitratorFee)}
                      </span>
                      <Image
                        src={tokenIcon(job.token)}
                        alt={`${job.token} icon`}
                        width={20}
                        height={20}
                        className='h-5 w-5'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verdict Summary */}
          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50 p-5 dark:border-gray-700 dark:from-gray-900/30 dark:to-slate-900/30'>
            <div className='mb-3 flex items-center gap-3'>
              <PiInfo className='h-5 w-5 text-gray-600 dark:text-gray-400' />
              <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                Case Summary
              </h4>
            </div>
            <p className='mb-3 text-sm text-gray-700 dark:text-gray-300'>
              {splitDecision
                ? 'The arbitrator decided on a split resolution, distributing funds between both parties.'
                : workerFavored
                  ? 'The arbitrator ruled primarily in favor of the worker based on the evidence presented.'
                  : 'The arbitrator ruled primarily in favor of the creator based on the evidence presented.'}
            </p>
            <div className='flex items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700'>
              <PiLock className='h-4 w-4 text-red-500' />
              <span className='text-xs font-medium text-red-600 dark:text-red-400'>
                Chat is now closed • This decision is final and binding
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiCheckCircle className='h-3 w-3 text-green-500' />
              <span>Dispute resolved successfully</span>
              <span>•</span>
              <span>All funds have been distributed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArbitratedStatus;
