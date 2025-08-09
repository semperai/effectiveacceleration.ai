import type React from 'react';
import Link from 'next/link';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
import {
  PiUserCheck,
  PiSparkle,
  PiHandshake,
  PiInfo,
  PiShieldCheck,
  PiArrowRight,
  PiCheckCircle,
  PiClock,
  PiRocket,
  PiStar,
  PiUser
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

  return (
    <div className='w-full'>
      {/* Main Container with gradient background */}
      <div className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20 border border-blue-200 dark:border-blue-800'>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse" />

        {/* Animated decorative icons */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 animate-bounce delay-100">
            <PiSparkle className="w-6 h-6 text-blue-500" />
          </div>
          <div className="absolute top-20 right-20 animate-bounce delay-200">
            <PiStar className="w-5 h-5 text-purple-500" />
          </div>
          <div className="absolute bottom-20 left-1/3 animate-bounce delay-300">
            <PiRocket className="w-6 h-6 text-indigo-500" />
          </div>
        </div>

        {/* Content */}
        <div className='relative px-6 py-8 lg:px-8 lg:py-10'>
          {/* Header Section */}
          <div className='flex flex-col items-center mb-6'>
            <div className='mb-4 relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse' />
              <div className='relative p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25'>
                <PiHandshake className='w-10 h-10 text-white' />
              </div>
            </div>

            <h3 className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Ready to Assign Worker
            </h3>

            <p className='text-sm text-gray-600 dark:text-gray-400 text-center max-w-md'>
              You're about to assign this job to your selected candidate
            </p>
          </div>

          {/* Selected Worker Card - WITH LINK ADDED */}
          {workerData && (
            <div className='mb-6 max-w-md mx-auto'>
              <div className='rounded-xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-5'>
                <div className='flex items-center gap-4'>
                  {/* Avatar - Clickable link to profile */}
                  <Link 
                    href={`/dashboard/users/${selectedWorker}`}
                    className='relative group'
                  >
                    <div className='w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center transition-transform group-hover:scale-110'>
                      <PiUser className='w-7 h-7 text-white' />
                    </div>
                    {workerRating >= 4.5 && (
                      <div className='absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center'>
                        <PiStar className='w-3 h-3 text-white' />
                      </div>
                    )}
                  </Link>
                  <div className='flex-1'>
                    {/* Name - Clickable link to profile with hover effect */}
                    <Link 
                      href={`/dashboard/users/${selectedWorker}`}
                      className='group inline-flex items-center gap-1'
                    >
                      <h4 className='text-base font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                        {workerName}
                      </h4>
                      <PiArrowRight className='w-3 h-3 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-0.5' />
                    </Link>
                    <div className='flex items-center gap-3 mt-1'>
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
          <div className='mb-6 max-w-2xl mx-auto'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              {/* Step 1 */}
              <div className='relative p-4 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center'>
                    <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>1</span>
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
              <div className='relative p-4 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-7 h-7 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center'>
                    <span className='text-xs font-bold text-purple-600 dark:text-purple-400'>2</span>
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
              <div className='relative p-4 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
                <div className='flex items-center gap-2 mb-2'>
                  <div className='w-7 h-7 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center'>
                    <span className='text-xs font-bold text-green-600 dark:text-green-400'>3</span>
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
          <div className='mb-8 max-w-xl mx-auto'>
            <div className='p-5 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800'>
              <div className='flex gap-3'>
                <PiInfo className='w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5' />
                <div className='space-y-2'>
                  <h4 className='text-sm font-semibold text-blue-900 dark:text-blue-300'>
                    What happens when you assign?
                  </h4>
                  <ul className='space-y-1.5 text-xs text-blue-800 dark:text-blue-400'>
                    <li className='flex items-start gap-2'>
                      <PiCheckCircle className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
                      <span>Job parameters will be reviewed before confirmation</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <PiShieldCheck className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
                      <span>Payment is secured in smart contract escrow</span>
                    </li>
                    <li className='flex items-start gap-2'>
                      <PiClock className='w-3.5 h-3.5 mt-0.5 flex-shrink-0' />
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
              <PiSparkle className='w-3 h-3 text-purple-500 animate-pulse' />
              <span>One click to start your project</span>
              <PiSparkle className='w-3 h-3 text-purple-500 animate-pulse' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignWorker;
