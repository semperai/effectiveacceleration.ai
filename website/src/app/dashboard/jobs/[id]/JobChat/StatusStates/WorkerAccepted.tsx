import type React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { type Job, User } from '@effectiveacceleration/contracts';
import {
  PiRocket,
  PiUserCheck,
  PiSparkle,
  PiTimer,
  PiHandshake,
  PiBriefcase,
  PiCheckCircle,
  PiArrowRight,
  PiInfo,
  PiClock,
  PiCoin,
  PiLightning,
  PiWarningCircle,
  PiUser,
} from 'react-icons/pi';
import { formatTokenNameAndAmount, tokenIcon } from '@/lib/tokens';
import moment from 'moment';

interface WorkerAcceptedProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
}

const WorkerAccepted: React.FC<WorkerAcceptedProps> = ({
  job,
  address,
  users = {},
}) => {
  const isCreator = address === job.roles.creator;
  const isWorker = address === job.roles.worker;

  // Get user data
  const workerData = users[job.roles.worker];
  const creatorData = users[job.roles.creator];
  const workerName = workerData?.name || 'Worker';
  const creatorName = creatorData?.name || 'Creator';

  // Calculate time remaining if job is in progress
  const timeRemaining = job.maxTime
    ? moment.duration(job.maxTime, 'seconds').humanize()
    : null;

  return (
    <div className='w-full'>
      {/* Main Container with gradient background */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:border-blue-800 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 blur-3xl' />

        {/* Animated decorative icons */}
        <div className='absolute inset-0 opacity-20'>
          <div className='animate-float absolute left-10 top-10'>
            <PiSparkle className='h-6 w-6 text-blue-500' />
          </div>
          <div className='animate-float absolute right-20 top-20 delay-200'>
            <PiRocket className='h-5 w-5 text-purple-500' />
          </div>
          <div className='animate-float delay-400 absolute bottom-20 left-1/3'>
            <PiBriefcase className='h-6 w-6 text-indigo-500' />
          </div>
        </div>

        {/* Content */}
        <div className='relative p-8'>
          {/* Status Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-4 shadow-lg shadow-blue-500/25'>
                {isCreator ? (
                  <PiUserCheck className='h-10 w-10 text-white' />
                ) : (
                  <PiHandshake className='h-10 w-10 text-white' />
                )}
              </div>
            </div>

            {/* Main Status Message */}
            <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
              {isCreator ? (
                <>Job Started Successfully! 🚀</>
              ) : isWorker ? (
                <>You&apos;re Assigned to This Job! 💼</>
              ) : (
                <>Job In Progress 🔄</>
              )}
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              {isCreator
                ? 'The worker has been assigned and work has begun'
                : isWorker
                  ? 'You can now start working on this job'
                  : 'This job is currently being worked on'}
            </p>

            {/* Show worker/creator info */}
            {isCreator && workerData && (
              <Link
                href={`/dashboard/users/${job.roles.worker}`}
                className='group mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                <span>Assigned to {workerName}</span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
            {isWorker && creatorData && (
              <Link
                href={`/dashboard/users/${job.roles.creator}`}
                className='group mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
              >
                <span>Working for {creatorName}</span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
          </div>

          {/* Status Badge */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-blue-300 bg-gradient-to-r from-blue-100 to-purple-100 px-5 py-2.5 dark:border-blue-700 dark:from-blue-900/30 dark:to-purple-900/30'>
              <div className='h-2 w-2 animate-pulse rounded-full bg-blue-500' />
              <span className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                Job Active
              </span>
            </div>
          </div>

          {/* Job Details Card */}
          <div className='mb-6 rounded-xl border border-gray-200 bg-white/70 p-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              <PiInfo className='h-4 w-4' />
              Job Information
            </h4>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              {/* Job Title */}
              <div className='flex items-start gap-3'>
                <PiBriefcase className='mt-0.5 h-5 w-5 text-gray-400' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Title
                  </p>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {job.title}
                  </p>
                </div>
              </div>

              {/* Payment */}
              <div className='flex items-start gap-3'>
                <PiCoin className='mt-0.5 h-5 w-5 text-gray-400' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Payment
                  </p>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>
                      {formatTokenNameAndAmount(job.token, job.amount)}
                    </p>
                    <Image
                      src={tokenIcon(job.token)}
                      alt='Token icon'
                      width={16}
                      height={16}
                      className='h-4 w-4'
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Time */}
              <div className='flex items-start gap-3'>
                <PiClock className='mt-0.5 h-5 w-5 text-gray-400' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Max Delivery Time
                  </p>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {timeRemaining}
                  </p>
                </div>
              </div>

              {/* Status with Worker Link */}
              <div className='flex items-start gap-3'>
                <PiCheckCircle className='mt-0.5 h-5 w-5 text-gray-400' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Worker
                  </p>
                  {workerData ? (
                    <Link
                      href={`/dashboard/users/${job.roles.worker}`}
                      className='group inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
                    >
                      <div className='flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500'>
                        <PiUser className='h-2.5 w-2.5 text-white' />
                      </div>
                      <span>{workerName}</span>
                      <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
                    </Link>
                  ) : (
                    <p className='text-sm font-medium text-green-600 dark:text-green-400'>
                      Active & In Progress
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific Instructions */}
          <div className='rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-6 dark:border-amber-800 dark:from-amber-950/20 dark:to-orange-950/20'>
            <h4 className='mb-3 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-300'>
              <PiTimer className='h-4 w-4' />
              {isCreator
                ? 'What Happens Next'
                : isWorker
                  ? 'Your Next Steps'
                  : 'Current Status'}
            </h4>

            <ul className='space-y-2 text-sm text-amber-800 dark:text-amber-400'>
              {isCreator ? (
                <>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      1.
                    </span>
                    <span>
                      {workerData ? (
                        <>
                          <Link
                            href={`/dashboard/users/${job.roles.worker}`}
                            className='font-medium text-amber-700 hover:underline dark:text-amber-300'
                          >
                            {workerName}
                          </Link>{' '}
                          will complete the job within {timeRemaining}
                        </>
                      ) : (
                        <>
                          The worker will complete the job within{' '}
                          {timeRemaining}
                        </>
                      )}
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      2.
                    </span>
                    <span>
                      You&apos;ll receive a notification when work is submitted
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      3.
                    </span>
                    <span>
                      Review and approve the deliverable to release payment
                    </span>
                  </li>
                </>
              ) : isWorker ? (
                <>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      1.
                    </span>
                    <span>Complete the work according to job requirements</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      2.
                    </span>
                    <span>Submit your deliverable before the deadline</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      3.
                    </span>
                    <span>
                      Communicate with{' '}
                      {creatorData ? (
                        <Link
                          href={`/dashboard/users/${job.roles.creator}`}
                          className='font-medium text-amber-700 hover:underline dark:text-amber-300'
                        >
                          {creatorName}
                        </Link>
                      ) : (
                        'the client'
                      )}{' '}
                      if you have questions
                    </span>
                  </li>
                </>
              ) : (
                <>
                  <li className='flex items-start gap-2'>
                    <PiRocket className='mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-500' />
                    <span>
                      Job is currently being worked on by{' '}
                      {workerData ? (
                        <Link
                          href={`/dashboard/users/${job.roles.worker}`}
                          className='font-medium text-amber-700 hover:underline dark:text-amber-300'
                        >
                          {workerName}
                        </Link>
                      ) : (
                        'the assigned worker'
                      )}
                    </span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Worker Status Indicator - Replaces the fake button */}
          {isWorker && (
            <div className='mt-6'>
              {/* Status Card instead of button */}
              <div className='rounded-xl border border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 p-4 dark:border-green-800 dark:from-green-950/20 dark:to-emerald-950/20'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='rounded-lg bg-green-100 p-2 dark:bg-green-900/50'>
                      <PiLightning className='h-5 w-5 text-green-600 dark:text-green-400' />
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                        Ready to Work
                      </p>
                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                        You have {timeRemaining} to complete this job
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
                    <span className='text-xs font-medium text-green-600 dark:text-green-400'>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Reminder */}
              <div className='mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
                <div className='flex items-start gap-2'>
                  <PiWarningCircle className='mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <p className='text-xs text-blue-700 dark:text-blue-300'>
                    Remember to submit your work through the delivery system
                    before the deadline expires.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Status */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiSparkle className='h-3 w-3 animate-pulse text-purple-500' />
              <span>
                {isCreator
                  ? 'Your job is in good hands'
                  : isWorker
                    ? 'Good luck with your work!'
                    : 'Job progressing smoothly'}
              </span>
              <PiSparkle className='h-3 w-3 animate-pulse text-purple-500' />
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
      `}</style>
    </div>
  );
};

export default WorkerAccepted;
