import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Job, type User } from '@effectiveacceleration/contracts';
import { TakeJobButton } from '../../JobActions';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/utils';
import ProfileImage from '@/components/ProfileImage';
import {
  PiLightning,
  PiRocket,
  PiSparkle,
  PiTimer,
  PiCoin,
  PiHandshake,
  PiInfo,
  PiCheckCircle,
  PiClock,
  PiWarning,
  PiArrowRight,
  PiFlame,
  PiTrendUp,
} from 'react-icons/pi';
import moment from 'moment';

interface FCFSAvailableProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
  currentUser?: User | null;
}

const FCFSAvailable: React.FC<FCFSAvailableProps> = ({
  job,
  address,
  users = {},
  currentUser,
}) => {
  // Get creator info
  const creatorData = users[job.roles.creator];
  const creatorName = creatorData?.name || 'Job Creator';

  // Calculate time remaining if job has a deadline
  const timeRemaining = job.maxTime
    ? moment.duration(job.maxTime, 'seconds').humanize()
    : null;

  // Check if current user can take the job
  const canTakeJob =
    address &&
    address !== job.roles.creator &&
    address !== job.roles.arbitrator;

  return (
    <div className='w-full'>
      {/* Main Container with urgent/FCFS theme */}
      <div className='relative overflow-hidden rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:border-orange-800 dark:from-orange-950/20 dark:via-amber-950/20 dark:to-yellow-950/20'>
        {/* Animated background effects */}
        <div className='absolute right-0 top-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-yellow-500/10 to-amber-500/10 blur-3xl' />

        {/* Animated decorative icons */}
        <div className='absolute inset-0 opacity-20'>
          <div className='animate-float absolute left-10 top-10'>
            <PiFlame className='h-8 w-8 text-orange-500' />
          </div>
          <div className='animate-float absolute right-20 top-20 delay-200'>
            <PiLightning className='h-6 w-6 text-yellow-500' />
          </div>
          <div className='animate-float delay-400 absolute bottom-20 left-1/3'>
            <PiTrendUp className='h-7 w-7 text-amber-500' />
          </div>
          <div className='animate-float delay-600 absolute bottom-10 right-1/4'>
            <PiRocket className='h-6 w-6 text-orange-500' />
          </div>
        </div>

        {/* Content */}
        <div className='relative p-8'>
          {/* Urgent Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-orange-500 to-red-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-orange-500 to-red-500 p-4 shadow-lg shadow-orange-500/25'>
                <PiLightning className='h-10 w-10 animate-pulse text-white' />
              </div>
            </div>

            {/* Main Message */}
            <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
              🔥 Available Now - First Come, First Served! 🔥
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              This job is immediately available to the first qualified worker
              who takes it
            </p>

            {/* Creator info */}
            {creatorData && (
              <Link
                href={`/dashboard/users/${job.roles.creator}`}
                className='group mt-2 inline-flex items-center gap-1 text-sm text-orange-600 hover:text-orange-500 dark:text-orange-400 dark:hover:text-orange-300'
              >
                <span>Posted by {creatorName}</span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
          </div>

          {/* Urgency Badges */}
          <div className='mb-6 flex flex-wrap justify-center gap-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-red-300 bg-gradient-to-r from-red-100 to-orange-100 px-4 py-2 dark:border-red-700 dark:from-red-900/30 dark:to-orange-900/30'>
              <PiFlame className='h-4 w-4 animate-pulse text-red-600 dark:text-red-400' />
              <span className='text-sm font-medium text-red-800 dark:text-red-300'>
                Urgent
              </span>
            </div>

            <div className='inline-flex items-center gap-2 rounded-full border border-yellow-300 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-2 dark:border-yellow-700 dark:from-yellow-900/30 dark:to-amber-900/30'>
              <PiLightning className='h-4 w-4 text-yellow-600 dark:text-yellow-400' />
              <span className='text-sm font-medium text-yellow-800 dark:text-yellow-300'>
                No Application Needed
              </span>
            </div>

            <div className='inline-flex items-center gap-2 rounded-full border border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/30'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
              <span className='text-sm font-medium text-green-800 dark:text-green-300'>
                Available Now
              </span>
            </div>
          </div>

          {/* Job Quick Details */}
          <div className='mb-6 rounded-xl border border-gray-200 bg-white/70 p-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              <PiInfo className='h-4 w-4' />
              Quick Job Details
            </h4>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Payment */}
              <div className='flex items-start gap-3'>
                <PiCoin className='mt-0.5 h-5 w-5 text-orange-500' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Payment
                  </p>
                  <div className='flex items-center gap-2'>
                    <p className='text-lg font-bold text-gray-900 dark:text-white'>
                      {formatTokenNameAndAmount(job.token, job.amount)}
                    </p>
                    <Image
                      src={tokenIcon(job.token)}
                      alt='Token icon'
                      width={20}
                      height={20}
                      className='h-5 w-5'
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className='flex items-start gap-3'>
                <PiClock className='mt-0.5 h-5 w-5 text-orange-500' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Delivery Time
                  </p>
                  <p className='text-lg font-bold text-gray-900 dark:text-white'>
                    {timeRemaining}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* How it Works */}
          <div className='mb-6 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20'>
            <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300'>
              <PiRocket className='h-4 w-4' />
              How FCFS Works
            </h4>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200'>
                  1
                </div>
                <div>
                  <p className='text-xs font-medium text-amber-900 dark:text-amber-300'>
                    Click Take Job
                  </p>
                  <p className='text-xs text-amber-700 dark:text-amber-400'>
                    Be the first to claim it
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200'>
                  2
                </div>
                <div>
                  <p className='text-xs font-medium text-amber-900 dark:text-amber-300'>
                    Start Immediately
                  </p>
                  <p className='text-xs text-amber-700 dark:text-amber-400'>
                    Job is yours instantly
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-amber-200 text-xs font-bold text-amber-800 dark:bg-amber-800 dark:text-amber-200'>
                  3
                </div>
                <div>
                  <p className='text-xs font-medium text-amber-900 dark:text-amber-300'>
                    Get Paid
                  </p>
                  <p className='text-xs text-amber-700 dark:text-amber-400'>
                    Funds secured in escrow
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button or Message */}
          {canTakeJob ? (
            <div className='space-y-4'>
              {/* Warning */}
              <div className='rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950/20'>
                <div className='flex items-start gap-2'>
                  <PiWarning className='mt-0.5 h-4 w-4 flex-shrink-0 text-orange-600 dark:text-orange-400' />
                  <p className='text-xs text-orange-700 dark:text-orange-300'>
                    <strong>Act fast!</strong> Once you take this job,
                    you&apos;ll need to complete it within {timeRemaining}. The
                    job will be assigned to you immediately and funds will be
                    locked in escrow.
                  </p>
                </div>
              </div>

              {/* Take Job Button */}
              <div className='flex justify-center'>
                <div className='w-full max-w-md'>
                  <TakeJobButton
                    address={address}
                    job={job}
                    showTooltip={false}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
              <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                {!address
                  ? 'Please connect your wallet to take this job'
                  : address === job.roles.creator
                    ? 'You cannot take your own job'
                    : 'You cannot take this job as an arbitrator'}
              </p>
            </div>
          )}

          {/* Competition Notice */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiLightning className='h-3 w-3 animate-pulse text-orange-500' />
              <span>Other workers may be viewing this job right now</span>
              <PiLightning className='h-3 w-3 animate-pulse text-orange-500' />
            </div>
          </div>
        </div>
      </div>

      {/* Add floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .delay-200 {
          animation-delay: 200ms;
        }
        .delay-400 {
          animation-delay: 400ms;
        }
        .delay-600 {
          animation-delay: 600ms;
        }
      `}</style>
    </div>
  );
};

export default FCFSAvailable;
