import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Job, type User } from '@effectiveacceleration/contracts';
import { AcceptButton } from '../../JobActions';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/utils';
import ProfileImage from '@/components/ProfileImage';
import {
  PiHandshake,
  PiUsers,
  PiSparkle,
  PiTimer,
  PiCoin,
  PiInfo,
  PiCheckCircle,
  PiClock,
  PiWarning,
  PiArrowRight,
  PiEnvelope,
  PiChat,
  PiStar,
} from 'react-icons/pi';
import moment from 'moment';

interface MultipleApplicantAvailableProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
  currentUser?: User | null;
  events?: any[];
}

const MultipleApplicantAvailable: React.FC<MultipleApplicantAvailableProps> = ({
  job,
  address,
  users = {},
  currentUser,
  events = [],
}) => {
  // Get creator info
  const creatorData = users[job.roles.creator];
  const creatorName = creatorData?.name || 'Job Creator';

  // Calculate time remaining if job has a deadline
  const timeRemaining = job.maxTime
    ? moment.duration(job.maxTime, 'seconds').humanize()
    : null;

  // Check if current user can apply to the job
  const canApply =
    currentUser &&
    address &&
    address !== job.roles.creator &&
    address !== job.roles.arbitrator;

  return (
    <div className='w-full py-4'>
      {/* Main Container with application theme */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:border-blue-800 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20'>
        {/* Animated background effects */}
        <div className='absolute right-0 top-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-indigo-500/10 to-blue-500/10 blur-3xl' />

        {/* Animated decorative icons */}
        <div className='absolute inset-0 opacity-20'>
          <div className='animate-float absolute left-10 top-10'>
            <PiHandshake className='h-8 w-8 text-blue-500' />
          </div>
          <div className='animate-float absolute right-20 top-20 delay-200'>
            <PiUsers className='h-6 w-6 text-indigo-500' />
          </div>
          <div className='animate-float delay-400 absolute bottom-20 left-1/3'>
            <PiChat className='h-7 w-7 text-purple-500' />
          </div>
          <div className='animate-float delay-600 absolute bottom-10 right-1/4'>
            <PiStar className='h-6 w-6 text-blue-500' />
          </div>
        </div>

        {/* Content */}
        <div className='relative p-8'>
          {/* Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-4 shadow-lg shadow-blue-500/25'>
                <PiHandshake className='h-10 w-10 animate-pulse text-white' />
              </div>
            </div>

            {/* Main Message */}
            <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
               Apply Now 
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              The creator is reviewing applications and will select the best fit for this job
            </p>

            {/* Creator info */}
            {creatorData && (
              <Link
                href={`/dashboard/users/${job.roles.creator}`}
                className='group mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                <span>Posted by {creatorName}</span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
          </div>

          {/* Application Process Badges */}
          <div className='mb-6 flex flex-wrap justify-center gap-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-blue-300 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 dark:border-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30'>
              <PiHandshake className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              <span className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                Application Required
              </span>
            </div>

            <div className='inline-flex items-center gap-2 rounded-full border border-purple-300 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 dark:border-purple-700 dark:from-purple-900/30 dark:to-indigo-900/30'>
              <PiUsers className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              <span className='text-sm font-medium text-purple-800 dark:text-purple-300'>
                Multiple Applicants
              </span>
            </div>

            <div className='inline-flex items-center gap-2 rounded-full border border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/30'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
              <span className='text-sm font-medium text-green-800 dark:text-green-300'>
                Accepting Applications
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
                <PiCoin className='mt-0.5 h-5 w-5 text-blue-500' />
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
                <PiClock className='mt-0.5 h-5 w-5 text-blue-500' />
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

          {/* How Application Process Works */}
          <div className='mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20'>
            <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-blue-900 dark:text-blue-300'>
              <PiEnvelope className='h-4 w-4' />
              How to Apply
            </h4>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800 dark:bg-blue-800 dark:text-blue-200'>
                  1
                </div>
                <div>
                  <p className='text-xs font-medium text-blue-900 dark:text-blue-300'>
                    Submit Application
                  </p>
                  <p className='text-xs text-blue-700 dark:text-blue-400'>
                    Click Accept & introduce yourself
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800 dark:bg-blue-800 dark:text-blue-200'>
                  2
                </div>
                <div>
                  <p className='text-xs font-medium text-blue-900 dark:text-blue-300'>
                    Chat with Creator
                  </p>
                  <p className='text-xs text-blue-700 dark:text-blue-400'>
                    Discuss requirements & timeline
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-bold text-blue-800 dark:bg-blue-800 dark:text-blue-200'>
                  3
                </div>
                <div>
                  <p className='text-xs font-medium text-blue-900 dark:text-blue-300'>
                    Get Selected
                  </p>
                  <p className='text-xs text-blue-700 dark:text-blue-400'>
                    Creator assigns job to you
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button or Message */}
          {canApply ? (
            <div className='space-y-4'>
              {/* Info */}
              <div className='rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
                <div className='flex items-start gap-2'>
                  <PiInfo className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <p className='text-xs text-blue-700 dark:text-blue-300'>
                    <strong>Stand out!</strong> Send a thoughtful message explaining 
                    why you&apos;re the right fit for this job. The creator will review 
                    all applications and select the best candidate.
                  </p>
                </div>
              </div>

              {/* Apply Button */}
              <div className='flex justify-center'>
                <div className='w-full max-w-md'>
                  <AcceptButton
                    address={address}
                    job={job}
                    events={events}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className='rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50'>
              <p className='text-center text-sm text-gray-600 dark:text-gray-400'>
                {!currentUser
                  ? 'Please accept to apply for this job'
                  : !address
                    ? 'Please connect your wallet to apply'
                    : address === job.roles.creator
                      ? 'You cannot apply to your own job'
                      : 'You cannot apply as an arbitrator'}
              </p>
            </div>
          )}

          {/* Competition Notice */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiUsers className='h-3 w-3 text-blue-500' />
              <span>Other qualified workers may also be applying</span>
              <PiUsers className='h-3 w-3 text-blue-500' />
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

export default MultipleApplicantAvailable;