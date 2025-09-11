import type React from 'react';
import Link from 'next/link';
import {
  type Job,
  type User,
} from '@effectiveacceleration/contracts';
import {
  PiSignIn,
  PiLock,
  PiInfo,
  PiArrowRight,
  PiBriefcase,
  PiMagnifyingGlass,
  PiHandWaving,
} from 'react-icons/pi';

interface SignInToApplyProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
  currentUser?: User | null;
}

const SignInToApply: React.FC<SignInToApplyProps> = ({
  job,
  address,
  users = {},
  currentUser,
}) => {
  const creatorData = users[job.roles.creator];
  const creatorName = creatorData?.name || 'Job Creator';

  return (
    <div className='my-4 w-full'>
      {/* Main Container with blue theme for sign-in prompt */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-300 bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:border-blue-700 dark:from-blue-950/20 dark:via-blue-900/20 dark:to-blue-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 blur-3xl' />

        {/* Content */}
        <div className='relative p-6 lg:p-8'>
          {/* Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-30 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-4 shadow-lg'>
                <PiSignIn className='h-10 w-10 text-white' />
              </div>
            </div>

            <h3 className='mb-2 text-xl font-bold text-gray-900 lg:text-2xl dark:text-white'>
              Sign In to Apply
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              This job is open and accepting applications. Sign in to apply and start working!
            </p>
          </div>

          {/* Status Badge */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-green-300 bg-green-100 px-4 py-2 dark:border-green-600 dark:bg-green-800'>
              <PiHandWaving className='h-4 w-4 text-green-500' />
              <span className='text-sm font-medium text-green-700 dark:text-green-300'>
                Open for Applications
              </span>
            </div>
          </div>

          {/* Job Creator Info */}
          <div className='mb-6 rounded-xl border border-gray-200 bg-white/50 p-5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/30'>
            <h4 className='mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Job Creator
            </h4>

            <div className='space-y-3'>
              {creatorData && (
                <div className='flex items-center gap-3 rounded-lg p-2'>
                  <div className='flex flex-1 items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500'>
                      <span className='text-sm font-bold text-white'>
                        {creatorName.slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Creator
                      </p>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {creatorName}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sign In Notice */}
          <div className='mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30'>
            <div className='flex gap-3'>
              <PiLock className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-blue-900 dark:text-blue-300'>
                  Authentication Required
                </h4>
                <p className='text-sm text-blue-800 dark:text-blue-400'>
                  To apply for this job and communicate with the job creator, 
                  you need to sign in to your account. This ensures secure 
                  communication and helps build trust between participants.
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className='mb-6 rounded-xl border border-gray-200 bg-white/50 p-5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/30'>
            <div className='flex gap-3'>
              <PiInfo className='mt-0.5 h-5 w-5 flex-shrink-0 text-gray-500 dark:text-gray-400' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                  How It Works
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Once you sign in, you can apply for this job by sending a 
                  message to the job creator. If selected, you&apos;ll be able 
                  to start working and receive payment upon completion.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-6 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
              <PiBriefcase className='h-4 w-4' />
              Get Started
            </h4>

            <div className='grid gap-3'>
              {/* Sign In Button */}
              <Link href='/register' className='w-full'>
                <button className='group w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl hover:shadow-blue-500/30'>
                  <span className='flex items-center justify-center gap-2 text-white'>
                    <PiSignIn className='h-4 w-4' />
                    Sign In to Apply
                    <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </span>
                </button>
              </Link>

              {/* Browse Other Jobs */}
              <Link href='/dashboard/open-job-list' className='w-full'>
                <button className='group w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'>
                  <span className='flex items-center justify-center gap-2'>
                    <PiMagnifyingGlass className='h-4 w-4' />
                    Browse Other Open Jobs
                    <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <span>
                New to the platform? Sign up to start applying for jobs
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInToApply;