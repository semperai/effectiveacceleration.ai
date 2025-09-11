import type React from 'react';
import {
  type Job,
  type User,
} from '@effectiveacceleration/contracts';
import {
  PiGavel,
  PiWarning,
  PiInfo,
  PiBriefcase,
  PiShield,
} from 'react-icons/pi';
import { RefuseArbitrationButton } from '../../JobActions/RefuseArbitrationButton';

interface ArbitratorRefuseProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
  currentUser?: User | null;
}

const ArbitratorRefuse: React.FC<ArbitratorRefuseProps> = ({
  job,
  address,
  users = {},
  currentUser,
}) => {
  const creatorData = users[job.roles.creator];
  const creatorName = creatorData?.name || 'Job Creator';

  return (
    <div className='my-4 w-full'>
      {/* Main Container with orange/red theme for arbitration */}
      <div className='relative overflow-hidden rounded-2xl border border-orange-300 bg-gradient-to-br from-orange-50 via-white to-red-50 dark:border-orange-700 dark:from-orange-950/20 dark:via-red-900/20 dark:to-orange-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-red-500/10 to-orange-500/10 blur-3xl' />

        {/* Content */}
        <div className='relative p-6 lg:p-8'>
          {/* Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 to-red-500 opacity-30 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-orange-400 to-red-500 p-4 shadow-lg'>
                <PiGavel className='h-10 w-10 text-white' />
              </div>
            </div>

            <h3 className='mb-2 text-xl font-bold text-gray-900 lg:text-2xl dark:text-white'>
              Arbitration Assignment
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              You have been assigned as an arbitrator for this job. You can refuse if you are unavailable or have conflicts of interest.
            </p>
          </div>

          {/* Status Badge */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-orange-300 bg-orange-100 px-4 py-2 dark:border-orange-600 dark:bg-orange-800'>
              <PiShield className='h-4 w-4 text-orange-500' />
              <span className='text-sm font-medium text-orange-700 dark:text-orange-300'>
                Arbitrator Assignment Pending
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
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500'>
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

          {/* Arbitration Notice */}
          <div className='mb-6 rounded-xl border border-orange-200 bg-gradient-to-br from-orange-50 to-red-50 p-5 dark:border-orange-800 dark:from-orange-950/30 dark:to-red-950/30'>
            <div className='flex gap-3'>
              <PiWarning className='mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600 dark:text-orange-400' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-orange-900 dark:text-orange-300'>
                  Arbitrator Responsibilities
                </h4>
                <p className='text-sm text-orange-800 dark:text-orange-400'>
                  As an arbitrator, you will be responsible for resolving any 
                  disputes that may arise during this job. Refuse only if you 
                  are unavailable or have conflicts of interest.
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
                  Your Options
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  By default, you will accept the arbitrator role. Only refuse 
                  if you&apos;re unavailable or have concerns about the job requirements.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-6 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
              <PiBriefcase className='h-4 w-4' />
              Arbitration Decision
            </h4>

            <div className='grid gap-3'>
              {/* Refuse Button */}
              <RefuseArbitrationButton job={job} />
            </div>
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <span>
                You will automatically accept this arbitration role unless you refuse
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArbitratorRefuse;