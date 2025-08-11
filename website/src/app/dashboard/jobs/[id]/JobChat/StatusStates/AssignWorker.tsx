import type React from 'react';
import Link from 'next/link';
import {
  type Job,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import ProfileImage from '@/components/ProfileImage';
import {
  PiSparkle,
  PiHandshake,
  PiInfo,
  PiShieldCheck,
  PiArrowRight,
  PiCheckCircle,
  PiClock,
  PiRocket,
  PiStar,
} from 'react-icons/pi';

interface AssignWorkerProps {
  job: Job;
  events?: JobEventWithDiffs[];
  users?: Record<string, User>;
  selectedWorker: string;
  address: string | undefined;
}

const AssignWorker: React.FC<AssignWorkerProps> = ({
  job,
  address,
  selectedWorker,
  users,
}) => {
  // Get selected worker details if users data is available
  const workerData = users?.[selectedWorker];
  const workerName = workerData?.name || 'Selected Worker';
  const workerRating = 0; // workerData?.rating || 0;
  const workerJobs = workerData?.reputationUp || 0;

  // Get initials for fallback avatar
  const workerInitials =
    workerName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'SW';

  return (
    <div className='w-full'>
      {/* Main Container with gradient background */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:border-blue-800 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 blur-3xl' />

        {/* Animated decorative icons */}
        <div className='absolute inset-0 opacity-20'>
          <div className='absolute left-10 top-10 animate-bounce delay-100'>
            <PiSparkle className='h-6 w-6 text-blue-500' />
          </div>
          <div className='absolute right-20 top-20 animate-bounce delay-200'>
            <PiStar className='h-5 w-5 text-purple-500' />
          </div>
          <div className='absolute bottom-20 left-1/3 animate-bounce delay-300'>
            <PiRocket className='h-6 w-6 text-indigo-500' />
          </div>
        </div>

        {/* Content */}
        <div className='relative px-6 py-8 lg:px-8 lg:py-10'>
          {/* Header Section */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-500 to-purple-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-blue-500 to-purple-500 p-4 shadow-lg shadow-blue-500/25'>
                <PiHandshake className='h-10 w-10 text-white' />
              </div>
            </div>

            <h3 className='mb-2 text-xl font-bold text-gray-900 lg:text-2xl dark:text-white'>
              Ready to Assign Worker
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              You&apos;re about to assign this job to your selected candidate
            </p>
          </div>

          {/* Selected Worker Card - WITH PROFILE IMAGE */}
          {workerData && (
            <div className='mx-auto mb-6 max-w-md'>
              <div className='rounded-xl border border-gray-200 bg-white/70 p-5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50'>
                <div className='flex items-center gap-4'>
                  {/* Avatar - Using ProfileImage component */}
                  <Link
                    href={`/dashboard/users/${selectedWorker}`}
                    className='group relative'
                  >
                    {workerData?.avatar ? (
                      <ProfileImage
                        user={workerData}
                        className='h-14 w-14 transition-transform group-hover:scale-110'
                      />
                    ) : (
                      <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 transition-transform group-hover:scale-110'>
                        <span className='text-lg font-bold text-white'>
                          {workerInitials}
                        </span>
                      </div>
                    )}
                    {workerRating >= 4.5 && (
                      <div className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400'>
                        <PiStar className='h-3 w-3 text-white' />
                      </div>
                    )}
                  </Link>
                  <div className='flex-1'>
                    {/* Name - Clickable link to profile with hover effect */}
                    <Link
                      href={`/dashboard/users/${selectedWorker}`}
                      className='group inline-flex items-center gap-1'
                    >
                      <h4 className='text-base font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                        {workerName}
                      </h4>
                      <PiArrowRight className='h-3 w-3 transform text-gray-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 group-hover:opacity-100 dark:group-hover:text-blue-400' />
                    </Link>
                    <div className='mt-1 flex items-center gap-3'>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        ⭐ {workerRating.toFixed(1)}
                      </span>
                      <span className='text-xs text-gray-500 dark:text-gray-400'>
                        {workerJobs} completed jobs
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Process Information */}
          <div className='mx-auto mb-6 max-w-2xl'>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              {/* Step 1 */}
              <div className='relative rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
                <div className='mb-2 flex items-center gap-2'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30'>
                    <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                      1
                    </span>
                  </div>
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Review Details
                  </span>
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Confirm job parameters and worker selection
                </p>
              </div>

              {/* Step 2 */}
              <div className='relative rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
                <div className='mb-2 flex items-center gap-2'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30'>
                    <span className='text-xs font-bold text-purple-600 dark:text-purple-400'>
                      2
                    </span>
                  </div>
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Confirm Assignment
                  </span>
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Funds will be locked in escrow
                </p>
              </div>

              {/* Step 3 */}
              <div className='relative rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
                <div className='mb-2 flex items-center gap-2'>
                  <div className='flex h-7 w-7 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30'>
                    <span className='text-xs font-bold text-green-600 dark:text-green-400'>
                      3
                    </span>
                  </div>
                  <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                    Work Begins
                  </span>
                </div>
                <p className='text-xs text-gray-600 dark:text-gray-400'>
                  Worker starts the job immediately
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className='mx-auto mb-8 max-w-xl'>
            <div className='rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-5 dark:border-blue-800 dark:from-blue-950/30 dark:to-purple-950/30'>
              <div className='flex gap-3'>
                <PiInfo className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                <div className='space-y-2'>
                  <h4 className='text-sm font-semibold text-blue-900 dark:text-blue-300'>
                    What happens when you assign?
                  </h4>
                  <ul className='space-y-1.5 text-xs text-blue-800 dark:text-blue-400'>
                    <li className='flex items-start gap-2'>
                      <PiCheckCircle className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
                      <span>
                        Job parameters will be reviewed before confirmation
                      </span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <PiShieldCheck className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
                      <span>Payment is secured in smart contract escrow</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <PiClock className='mt-0.5 h-3.5 w-3.5 flex-shrink-0' />
                      <span>Delivery countdown begins immediately</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className='flex justify-center'>
            <div className='w-full max-w-sm'>
              <AssignWorkerButton
                address={address}
                job={job}
                selectedWorker={selectedWorker}
              />
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiSparkle className='h-3 w-3 animate-pulse text-purple-500' />
              <span>One click to start your project</span>
              <PiSparkle className='h-3 w-3 animate-pulse text-purple-500' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignWorker;
