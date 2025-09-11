import type React from 'react';
import Link from 'next/link';
import {
  type Job,
  type User,
  JobState,
} from '@effectiveacceleration/contracts';
import ProfileImage from '@/components/ProfileImage';
import {
  PiEye,
  PiLock,
  PiInfo,
  PiArrowRight,
  PiBriefcase,
  PiMagnifyingGlass,
  PiHandshake,
} from 'react-icons/pi';

interface JobObserverProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
  currentUser?: User | null;
}

const JobObserver: React.FC<JobObserverProps> = ({
  job,
  address,
  users = {},
  currentUser,
}) => {
  // Get the worker and creator data
  const workerData = job.roles.worker ? users[job.roles.worker] : null;
  const workerName = workerData?.name || 'A worker';

  const creatorData = users[job.roles.creator];
  const creatorName = creatorData?.name || 'Job Creator';

  const jobStatusText =
    job.state === JobState.Taken
      ? 'This job is currently in progress'
      : 'This job has been completed';

  return (
    <div className='my-4 w-full'>
      {/* Main Container with neutral theme */}
      <div className='relative overflow-hidden rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:border-gray-700 dark:from-gray-950/20 dark:via-gray-900/20 dark:to-gray-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-gray-500/5 to-slate-500/5 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-slate-500/5 to-gray-500/5 blur-3xl' />

        {/* Content */}
        <div className='relative p-6 lg:p-8'>
          {/* Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-gray-400 to-slate-500 opacity-30 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-gray-400 to-slate-500 p-4 shadow-lg'>
                <PiEye className='h-10 w-10 text-white' />
              </div>
            </div>

            <h3 className='mb-2 text-xl font-bold text-gray-900 lg:text-2xl dark:text-white'>
              Viewing as Observer
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              {jobStatusText}
            </p>
          </div>

          {/* Status Badge */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-800'>
              <PiHandshake className='h-4 w-4 text-gray-500' />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                {job.state === JobState.Taken ? 'In Progress' : 'Completed'}
              </span>
            </div>
          </div>

          {/* Participants Info */}
          <div className='mb-6 rounded-xl border border-gray-200 bg-white/50 p-5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/30'>
            <h4 className='mb-4 text-sm font-semibold text-gray-700 dark:text-gray-300'>
              Job Participants
            </h4>

            <div className='space-y-3'>
              {/* Creator */}
              {creatorData && (
                <Link
                  href={`/dashboard/users/${job.roles.creator}`}
                  className='group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                >
                  <div className='flex flex-1 items-center gap-3'>
                    {creatorData?.avatar ? (
                      <ProfileImage
                        user={creatorData}
                        className='h-10 w-10 rounded-full'
                      />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500'>
                        <span className='text-sm font-bold text-white'>
                          {creatorName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Creator
                      </p>
                      <p className='text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                        {creatorName}
                      </p>
                    </div>
                  </div>
                  <PiArrowRight className='h-4 w-4 transform text-gray-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100' />
                </Link>
              )}

              {/* Worker */}
              {workerData && (
                <Link
                  href={`/dashboard/users/${job.roles.worker}`}
                  className='group flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                >
                  <div className='flex flex-1 items-center gap-3'>
                    {workerData?.avatar ? (
                      <ProfileImage
                        user={workerData}
                        className='h-10 w-10 rounded-full'
                      />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-500'>
                        <span className='text-sm font-bold text-white'>
                          {workerName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        Worker
                      </p>
                      <p className='text-sm font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                        {workerName}
                      </p>
                    </div>
                  </div>
                  <PiArrowRight className='h-4 w-4 transform text-gray-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100' />
                </Link>
              )}
            </div>
          </div>

          {/* Privacy Notice */}
          <div className='mb-6 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30'>
            <div className='flex gap-3'>
              <PiLock className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-300'>
                  Private Conversation
                </h4>
                <p className='text-sm text-amber-800 dark:text-amber-400'>
                  Messages between the job creator and worker are encrypted and
                  only visible to those parties. As an observer, you can see the
                  job details but not the private communications.
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
                  About This View
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  You&apos;re viewing this job as an observer. You can see the
                  job details, participants, and status, but you cannot
                  participate in or view the private communications for this
                  job.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-6 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
              <PiBriefcase className='h-4 w-4' />
              Explore More
            </h4>

            <div className='grid gap-3'>
              {/* Browse Open Jobs */}
              <Link href='/dashboard/open-job-list' className='w-full'>
                <button className='group w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl hover:shadow-blue-500/30'>
                  <span className='flex items-center justify-center gap-2 text-white'>
                    <PiMagnifyingGlass className='h-4 w-4' />
                    Browse Open Jobs
                    <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </span>
                </button>
              </Link>

              {/* View Profiles */}
              <div className='grid grid-cols-2 gap-3'>
                {creatorData && (
                  <Link
                    href={`/dashboard/users/${job.roles.creator}`}
                    className='w-full'
                  >
                    <button className='group w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'>
                      <span className='flex items-center justify-center gap-2'>
                        View Creator
                        <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                      </span>
                    </button>
                  </Link>
                )}

                {workerData && (
                  <Link
                    href={`/dashboard/users/${job.roles.worker}`}
                    className='w-full'
                  >
                    <button className='group w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'>
                      <span className='flex items-center justify-center gap-2'>
                        View Worker
                        <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                      </span>
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <span>
                You can apply to open jobs to participate in the platform
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobObserver;
