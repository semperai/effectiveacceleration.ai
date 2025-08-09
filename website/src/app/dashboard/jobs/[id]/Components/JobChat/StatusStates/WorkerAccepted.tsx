import type React from 'react';
import {
  type Job,
  JobEventType,
  JobEventWithDiffs,
  JobState,
  User,
} from '@effectiveacceleration/contracts';
import { AssignWorkerButton } from '@/components/JobActions/AssignWorkerButton';
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
  PiWarningCircle
} from 'react-icons/pi';
import { formatTokenNameAndAmount, tokenIcon } from '@/tokens';
import { formatTimeLeft } from '@/utils/utils';
import moment from 'moment';

interface WorkerAcceptedProps {
  job: Job;
  address: string | undefined;
}

const WorkerAccepted: React.FC<WorkerAcceptedProps> = ({ job, address }) => {
  const isCreator = address === job.roles.creator;
  const isWorker = address === job.roles.worker;
  
  // Calculate time remaining if job is in progress
  const timeRemaining = job.maxTime ? moment.duration(job.maxTime, 'seconds').humanize() : null;

  return (
    <div className='w-full'>
      {/* Main Container with gradient background */}
      <div className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 border border-blue-200 dark:border-blue-800'>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        
        {/* Animated decorative icons */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 animate-float">
            <PiSparkle className="w-6 h-6 text-blue-500" />
          </div>
          <div className="absolute top-20 right-20 animate-float delay-200">
            <PiRocket className="w-5 h-5 text-purple-500" />
          </div>
          <div className="absolute bottom-20 left-1/3 animate-float delay-400">
            <PiBriefcase className="w-6 h-6 text-indigo-500" />
          </div>
        </div>
        
        {/* Content */}
        <div className='relative p-8'>
          {/* Status Header */}
          <div className='flex flex-col items-center mb-6'>
            <div className='mb-4 relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-xl opacity-50 animate-pulse' />
              <div className='relative p-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg shadow-blue-500/25'>
                {isCreator ? (
                  <PiUserCheck className='w-10 h-10 text-white' />
                ) : (
                  <PiHandshake className='w-10 h-10 text-white' />
                )}
              </div>
            </div>
            
            {/* Main Status Message */}
            <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              {isCreator ? (
                <>Job Started Successfully! 🚀</>
              ) : isWorker ? (
                <>You're Assigned to This Job! 💼</>
              ) : (
                <>Job In Progress 🔄</>
              )}
            </h3>
            
            <p className='text-sm text-gray-600 dark:text-gray-400 text-center max-w-md'>
              {isCreator ? (
                'The worker has been assigned and work has begun'
              ) : isWorker ? (
                'You can now start working on this job'
              ) : (
                'This job is currently being worked on'
              )}
            </p>
          </div>

          {/* Status Badge */}
          <div className='flex justify-center mb-6'>
            <div className='inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-300 dark:border-blue-700'>
              <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
              <span className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                Job Active
              </span>
            </div>
          </div>

          {/* Job Details Card */}
          <div className='mb-6 rounded-xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6'>
            <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2'>
              <PiInfo className='w-4 h-4' />
              Job Information
            </h4>
            
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {/* Job Title */}
              <div className='flex items-start gap-3'>
                <PiBriefcase className='w-5 h-5 text-gray-400 mt-0.5' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Title</p>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {job.title}
                  </p>
                </div>
              </div>
              
              {/* Payment */}
              <div className='flex items-start gap-3'>
                <PiCoin className='w-5 h-5 text-gray-400 mt-0.5' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Payment</p>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-medium text-gray-900 dark:text-white'>
                      {formatTokenNameAndAmount(job.token, job.amount)}
                    </p>
                    <img src={tokenIcon(job.token)} alt='' className='h-4 w-4' />
                  </div>
                </div>
              </div>
              
              {/* Delivery Time */}
              <div className='flex items-start gap-3'>
                <PiClock className='w-5 h-5 text-gray-400 mt-0.5' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Max Delivery Time</p>
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {timeRemaining}
                  </p>
                </div>
              </div>
              
              {/* Status */}
              <div className='flex items-start gap-3'>
                <PiCheckCircle className='w-5 h-5 text-gray-400 mt-0.5' />
                <div>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>Status</p>
                  <p className='text-sm font-medium text-green-600 dark:text-green-400'>
                    Active & In Progress
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific Instructions */}
          <div className='p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-800'>
            <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2'>
              <PiTimer className='w-4 h-4' />
              {isCreator ? 'What Happens Next' : isWorker ? 'Your Next Steps' : 'Current Status'}
            </h4>
            
            <ul className='space-y-2 text-sm text-amber-800 dark:text-amber-400'>
              {isCreator ? (
                <>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>1.</span>
                    <span>The worker will complete the job within {timeRemaining}</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>2.</span>
                    <span>You'll receive a notification when work is submitted</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>3.</span>
                    <span>Review and approve the deliverable to release payment</span>
                  </li>
                </>
              ) : isWorker ? (
                <>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>1.</span>
                    <span>Complete the work according to job requirements</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>2.</span>
                    <span>Submit your deliverable before the deadline</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>3.</span>
                    <span>Communicate with the client if you have questions</span>
                  </li>
                </>
              ) : (
                <>
                  <li className='flex items-start gap-2'>
                    <PiRocket className='w-4 h-4 text-amber-600 dark:text-amber-500 mt-0.5' />
                    <span>Job is currently being worked on by the assigned worker</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Worker Status Indicator - Replaces the fake button */}
          {isWorker && (
            <div className='mt-6'>
              {/* Status Card instead of button */}
              <div className='rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-800 p-4'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3'>
                    <div className='p-2 rounded-lg bg-green-100 dark:bg-green-900/50'>
                      <PiLightning className='w-5 h-5 text-green-600 dark:text-green-400' />
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
                    <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                    <span className='text-xs font-medium text-green-600 dark:text-green-400'>
                      Active
                    </span>
                  </div>
                </div>
              </div>

              {/* Important Reminder */}
              <div className='mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-3'>
                <div className='flex items-start gap-2'>
                  <PiWarningCircle className='w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0' />
                  <p className='text-xs text-blue-700 dark:text-blue-300'>
                    Remember to submit your work through the delivery system before the deadline expires.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Status */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiSparkle className='w-3 h-3 text-purple-500 animate-pulse' />
              <span>
                {isCreator ? (
                  'Your job is in good hands'
                ) : isWorker ? (
                  'Good luck with your work!'
                ) : (
                  'Job progressing smoothly'
                )}
              </span>
              <PiSparkle className='w-3 h-3 text-purple-500 animate-pulse' />
            </div>
          </div>
        </div>
      </div>

      {/* Add floating animation styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
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
