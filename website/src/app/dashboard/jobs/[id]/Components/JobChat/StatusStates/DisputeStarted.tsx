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
  PiScales,
  PiWarning,
  PiUserCirclePlus,
  PiChatCircleDots,
  PiInfo,
  PiClock,
  PiShieldCheck,
  PiHandshake,
  PiFileText,
  PiSparkle,
  PiGavel
} from 'react-icons/pi';

interface DisputeStartedProps {
  job: Job;
  address: string | undefined;
}

const DisputeStarted: React.FC<DisputeStartedProps> = ({ job, address }) => {
  const isCreator = address === job.roles.creator;
  const isWorker = address === job.roles.worker;
  const isArbitrator = address === job.roles.arbitrator;

  return (
    <div className='w-full my-4'>
      {/* Main Container with warning theme */}
      <div className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20 border border-amber-300 dark:border-amber-800'>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-3xl" />

        {/* Animated warning pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-stripes"></div>
        </div>

        {/* Content */}
        <div className='relative p-6 lg:p-8'>
          {/* Status Header */}
          <div className='flex flex-col items-center mb-6'>
            <div className='mb-4 relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full blur-xl opacity-50 animate-pulse' />
              <div className='relative p-4 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25'>
                <PiScales className='w-10 h-10 text-white' />
              </div>
            </div>

            {/* Main Status Message */}
            <h3 className='text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Dispute Resolution In Progress
            </h3>

            <p className='text-sm text-gray-600 dark:text-gray-400 text-center max-w-md'>
              An arbitrator has been assigned to review and resolve this dispute
            </p>
          </div>

          {/* Status Badges */}
          <div className='flex flex-wrap justify-center gap-3 mb-6'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700'>
              <PiWarning className='w-4 h-4 text-amber-600 dark:text-amber-400' />
              <span className='text-sm font-medium text-amber-800 dark:text-amber-300'>
                Dispute Active
              </span>
            </div>

            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'>
              <PiUserCirclePlus className='w-4 h-4 text-blue-600 dark:text-blue-400' />
              <span className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                Arbitrator Assigned
              </span>
            </div>
          </div>

          {/* Arbitrator Info Card */}
          <div className='mb-6 rounded-xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-5'>
            <div className='flex items-start gap-4'>
              <div className='p-3 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30'>
                <PiGavel className='w-6 h-6 text-blue-600 dark:text-blue-400' />
              </div>
              <div className='flex-1'>
                <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-1'>
                  Arbitrator Has Joined
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-3'>
                  The arbitrator has received all case information and is now part of the conversation
                </p>

                {/* Communication Notice */}
                <div className='flex items-center gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800'>
                  <PiChatCircleDots className='w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0' />
                  <span className='text-xs text-blue-700 dark:text-blue-300'>
                    All parties can now communicate directly with the arbitrator in the chat
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Process Information */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6'>
            {/* Review Phase */}
            <div className='p-4 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center gap-2 mb-2'>
                <PiFileText className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Step 1: Review
                </span>
              </div>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                Arbitrator reviews all submitted evidence and communications
              </p>
            </div>

            {/* Investigation Phase */}
            <div className='p-4 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center gap-2 mb-2'>
                <PiChatCircleDots className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Step 2: Discussion
                </span>
              </div>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                May request additional information from both parties
              </p>
            </div>

            {/* Resolution Phase */}
            <div className='p-4 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
              <div className='flex items-center gap-2 mb-2'>
                <PiShieldCheck className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Step 3: Resolution
                </span>
              </div>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                Final decision will be made based on evidence
              </p>
            </div>
          </div>

          {/* Important Notice */}
          <div className='p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200 dark:border-amber-800'>
            <div className='flex gap-3'>
              <PiInfo className='w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-300'>
                  Important Information
                </h4>
                <ul className='space-y-1 text-xs text-amber-800 dark:text-amber-400'>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>•</span>
                    <span>Respond promptly to any arbitrator requests for information</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>•</span>
                    <span>All communications are recorded and will be considered in the decision</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>•</span>
                    <span>The arbitrator's decision will be final and binding</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-amber-600 dark:text-amber-500 mt-0.5'>•</span>
                    <span>Maintain professional communication throughout the process</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Status */}
          <div className='mt-6 flex flex-col items-center gap-3'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiClock className='w-3 h-3' />
              <span>Resolution typically takes 24-48 hours</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30'>
                <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                <span className='text-xs font-medium text-green-700 dark:text-green-400'>
                  Arbitrator Online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add striped pattern styles */}
      <style jsx>{`
        .bg-stripes {
          background-image: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(251, 191, 36, 0.1) 10px,
            rgba(251, 191, 36, 0.1) 20px
          );
        }
      `}</style>
    </div>
  );
};

export default DisputeStarted;
