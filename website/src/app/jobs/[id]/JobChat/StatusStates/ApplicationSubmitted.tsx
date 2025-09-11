import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Job, type User } from '@effectiveacceleration/contracts';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/utils';
import {
  PiCheckCircle,
  PiClock,
  PiUsers,
  PiHandshake,
  PiTimer,
  PiCoin,
  PiInfo,
  PiArrowRight,
  PiEnvelope,
  PiChat,
  PiStar,
  PiHeart,
  PiSparkle,
} from 'react-icons/pi';
import moment from 'moment';

interface ApplicationSubmittedProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
  currentUser?: User | null;
}

const ApplicationSubmitted: React.FC<ApplicationSubmittedProps> = ({
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

  return (
    <div className='w-full py-4'>
      {/* Main Container with success/waiting theme */}
      <div className='relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:border-green-800 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20'>
        {/* Animated background effects */}
        <div className='absolute right-0 top-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl' />

        {/* Animated decorative icons */}
        <div className='absolute inset-0 opacity-20'>
          <div className='animate-float absolute left-10 top-10'>
            <PiCheckCircle className='h-8 w-8 text-green-500' />
          </div>
          <div className='animate-float absolute right-20 top-20 delay-200'>
            <PiHeart className='h-6 w-6 text-emerald-500' />
          </div>
          <div className='animate-float delay-400 absolute bottom-20 left-1/3'>
            <PiSparkle className='h-7 w-7 text-teal-500' />
          </div>
          <div className='animate-float delay-600 absolute bottom-10 right-1/4'>
            <PiStar className='h-6 w-6 text-green-500' />
          </div>
        </div>

        {/* Content */}
        <div className='relative p-8'>
          {/* Success Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-4 shadow-lg shadow-green-500/25'>
                <PiCheckCircle className='h-10 w-10 animate-pulse text-white' />
              </div>
            </div>

            {/* Main Message */}
            <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
               Application Submitted Successfully! 
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              Thank you for applying! The creator is reviewing applications and will contact you soon.
            </p>

            {/* Creator info */}
            {creatorData && (
              <Link
                href={`/dashboard/users/${job.roles.creator}`}
                className='group mt-2 inline-flex items-center gap-1 text-sm text-green-600 hover:text-green-500 dark:text-green-400 dark:hover:text-green-300'
              >
                <span>Waiting for response from {creatorName}</span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
          </div>

          {/* Status Badges */}
          <div className='mb-6 flex flex-wrap justify-center gap-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/30'>
              <PiCheckCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
              <span className='text-sm font-medium text-green-800 dark:text-green-300'>
                Application Received
              </span>
            </div>

            <div className='inline-flex items-center gap-2 rounded-full border border-blue-300 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 dark:border-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30'>
              <PiClock className='h-4 w-4 animate-pulse text-blue-600 dark:text-blue-400' />
              <span className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                Under Review
              </span>
            </div>

            <div className='inline-flex items-center gap-2 rounded-full border border-purple-300 bg-gradient-to-r from-purple-100 to-indigo-100 px-4 py-2 dark:border-purple-700 dark:from-purple-900/30 dark:to-indigo-900/30'>
              <PiUsers className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              <span className='text-sm font-medium text-purple-800 dark:text-purple-300'>
                Multiple Candidates
              </span>
            </div>
          </div>

          {/* Job Details Reminder */}
          <div className='mb-6 rounded-xl border border-gray-200 bg-white/70 p-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              <PiInfo className='h-4 w-4' />
              Job You Applied For
            </h4>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Payment */}
              <div className='flex items-start gap-3'>
                <PiCoin className='mt-0.5 h-5 w-5 text-green-500' />
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
                <PiTimer className='mt-0.5 h-5 w-5 text-green-500' />
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

          {/* What Happens Next */}
          <div className='mb-6 rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20'>
            <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-green-900 dark:text-green-300'>
              <PiClock className='h-4 w-4' />
              What Happens Next
            </h4>

            <div className='grid grid-cols-1 gap-3 md:grid-cols-3'>
              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-800 dark:bg-green-800 dark:text-green-200'>
                  1
                </div>
                <div>
                  <p className='text-xs font-medium text-green-900 dark:text-green-300'>
                    Creator Reviews
                  </p>
                  <p className='text-xs text-green-700 dark:text-green-400'>
                    All applications are reviewed
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-800 dark:bg-green-800 dark:text-green-200'>
                  2
                </div>
                <div>
                  <p className='text-xs font-medium text-green-900 dark:text-green-300'>
                    Selection Made
                  </p>
                  <p className='text-xs text-green-700 dark:text-green-400'>
                    Best candidate is chosen
                  </p>
                </div>
              </div>

              <div className='flex items-start gap-2'>
                <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-green-200 text-xs font-bold text-green-800 dark:bg-green-800 dark:text-green-200'>
                  3
                </div>
                <div>
                  <p className='text-xs font-medium text-green-900 dark:text-green-300'>
                    Notification Sent
                  </p>
                  <p className='text-xs text-green-700 dark:text-green-400'>
                    You&apos;ll be contacted if selected
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Encouragement Message */}
          <div className='rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20'>
            <div className='flex items-start gap-3'>
              <PiHeart className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
              <div>
                <p className='text-sm font-medium text-blue-900 dark:text-blue-300'>
                  Stay Patient & Positive!
                </p>
                <p className='mt-1 text-xs text-blue-700 dark:text-blue-400'>
                  The creator will review all applications carefully. You can continue 
                  browsing and applying to other jobs while you wait. Good luck! 🍀
                </p>
              </div>
            </div>
          </div>

          {/* Activity Notice */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiChat className='h-3 w-3 animate-pulse text-green-500' />
              <span>The creator may message you directly to discuss details</span>
              <PiChat className='h-3 w-3 animate-pulse text-green-500' />
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

export default ApplicationSubmitted;