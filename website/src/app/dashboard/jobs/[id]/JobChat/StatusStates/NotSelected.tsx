import type React from 'react';
import Link from 'next/link';
import {
  type Job,
  type User,
  JobState,
} from '@effectiveacceleration/contracts';
import ProfileImage from '@/components/ProfileImage';
import {
  PiXCircle,
  PiInfo,
  PiArrowRight,
  PiHandshake,
  PiBriefcase,
  PiMagnifyingGlass,
  PiHeart,
} from 'react-icons/pi';

interface NotSelectedProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
  selectedWorker?: string;
  currentUser?: User | null;
}

const NotSelected: React.FC<NotSelectedProps> = ({
  job,
  address,
  users = {},
  selectedWorker,
  currentUser,
}) => {
  // Get the selected worker data
  const selectedWorkerData = job.roles.worker ? users[job.roles.worker] : null;
  const selectedWorkerName = selectedWorkerData?.name || 'Another worker';

  // Get creator data
  const creatorData = users[job.roles.creator];
  const creatorName = creatorData?.name || 'Job Creator';

  return (
    <div className='my-4 w-full'>
      {/* Main Container with muted theme */}
      <div className='relative overflow-hidden rounded-2xl border border-gray-300 bg-gradient-to-br from-gray-50 via-slate-50 to-gray-50 dark:border-gray-700 dark:from-gray-950/20 dark:via-slate-950/20 dark:to-gray-950/20'>
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
                <PiXCircle className='h-10 w-10 text-white' />
              </div>
            </div>

            <h3 className='mb-2 text-xl font-bold text-gray-900 lg:text-2xl dark:text-white'>
              Application Not Selected
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              Thank you for your interest! The creator has selected another
              applicant for this job.
            </p>

            {/* Creator info */}
            {creatorData && (
              <Link
                href={`/dashboard/users/${job.roles.creator}`}
                className='group mt-2 inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              >
                <span>{creatorName} selected another applicant</span>
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
          </div>

          {/* Status Badge */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 dark:border-gray-600 dark:bg-gray-800'>
              <PiHandshake className='h-4 w-4 text-gray-500' />
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Position Filled
              </span>
            </div>
          </div>

          {/* Selected Worker Info (if job is taken) */}
          {job.state === JobState.Taken && selectedWorkerData && (
            <div className='mb-6 rounded-xl border border-gray-200 bg-white/50 p-5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/30'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <span className='text-sm text-gray-500 dark:text-gray-400'>
                    Job assigned to:
                  </span>
                  <Link
                    href={`/dashboard/users/${job.roles.worker}`}
                    className='group inline-flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                  >
                    {/* Profile Picture - larger and more prominent */}
                    {selectedWorkerData?.avatar ? (
                      <ProfileImage
                        user={selectedWorkerData}
                        className='h-10 w-10 rounded-full ring-2 ring-white transition-transform group-hover:scale-110 dark:ring-gray-800'
                      />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-white transition-transform group-hover:scale-110 dark:ring-gray-800'>
                        <span className='text-sm font-bold text-white'>
                          {selectedWorkerName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className='flex flex-col'>
                      <span className='text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                        {selectedWorkerName}
                      </span>
                      {selectedWorkerData?.bio && (
                        <span className='line-clamp-1 text-xs text-gray-500 dark:text-gray-400'>
                          {selectedWorkerData.bio}
                        </span>
                      )}
                    </div>
                    <PiArrowRight className='ml-auto h-4 w-4 transform text-gray-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:text-blue-600 group-hover:opacity-100 dark:group-hover:text-blue-400' />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Message */}
          <div className='mb-6 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 dark:border-blue-800 dark:from-blue-950/30 dark:to-indigo-950/30'>
            <div className='flex gap-3'>
              <PiHeart className='mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-blue-900 dark:text-blue-300'>
                  Thank You for Applying
                </h4>
                <p className='text-sm text-blue-800 dark:text-blue-400'>
                  We appreciate your interest in this job. While you
                  weren&apos;t selected this time, your conversation history
                  with the creator remains available above for your reference.
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
                  Why can&apos;t I see new messages?
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  For privacy reasons, conversations between the creator and the
                  selected worker are encrypted and only visible to those
                  parties. You can still view your previous messages with the
                  creator above.
                </p>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-6 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
              <PiBriefcase className='h-4 w-4' />
              What&apos;s Next?
            </h4>

            <div className='grid gap-3'>
              {/* Browse More Jobs */}
              <Link href='/dashboard/open-job-list' className='w-full'>
                <button className='group w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl hover:shadow-blue-500/30'>
                  <span className='flex items-center justify-center gap-2 text-white'>
                    <PiMagnifyingGlass className='h-4 w-4' />
                    Browse More Opportunities
                    <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </span>
                </button>
              </Link>

              {/* View Creator Profile */}
              {creatorData && (
                <Link
                  href={`/dashboard/users/${job.roles.creator}`}
                  className='w-full'
                >
                  <button className='group w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'>
                    <span className='flex items-center justify-center gap-2'>
                      View {creatorName}&apos;s Profile
                      <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </span>
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <span>Keep applying to find your perfect match!</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotSelected;
