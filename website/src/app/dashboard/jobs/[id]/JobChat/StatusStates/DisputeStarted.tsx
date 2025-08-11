import type React from 'react';
import Link from 'next/link';
import { type Job, User } from '@effectiveacceleration/contracts';
import ProfileImage from '@/components/ProfileImage';
import {
  PiScales,
  PiWarning,
  PiUserCirclePlus,
  PiChatCircleDots,
  PiInfo,
  PiClock,
  PiShieldCheck,
  PiFileText,
  PiGavel,
  PiArrowRight,
} from 'react-icons/pi';

interface DisputeStartedProps {
  job: Job;
  address: string | undefined;
  users?: Record<string, User>;
}

const DisputeStarted: React.FC<DisputeStartedProps> = ({
  job,
  address,
  users = {},
}) => {
  // Get arbitrator data
  const arbitratorData = users[job.roles.arbitrator];
  const arbitratorName = arbitratorData?.name || 'Arbitrator';

  // Get initials for fallback avatar
  const arbitratorInitials =
    arbitratorName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'AR';

  return (
    <div className='my-4 w-full'>
      {/* Main Container with warning theme */}
      <div className='relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 dark:border-amber-800 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-amber-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/10 to-red-500/10 blur-3xl' />

        {/* Animated warning pattern */}
        <div className='absolute inset-0 opacity-10'>
          <div className='bg-stripes absolute inset-0'></div>
        </div>

        {/* Content */}
        <div className='relative p-6 lg:p-8'>
          {/* Status Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-amber-500 to-orange-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-amber-500 to-orange-500 p-4 shadow-lg shadow-amber-500/25'>
                <PiScales className='h-10 w-10 text-white' />
              </div>
            </div>

            {/* Main Status Message */}
            <h3 className='mb-2 text-xl font-bold text-gray-900 lg:text-2xl dark:text-white'>
              Dispute Resolution In Progress
            </h3>

            <p className='max-w-md text-center text-sm text-gray-600 dark:text-gray-400'>
              An arbitrator has been assigned to review and resolve this dispute
            </p>
          </div>

          {/* Status Badges */}
          <div className='mb-6 flex flex-wrap justify-center gap-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-100 px-4 py-2 dark:border-amber-700 dark:bg-amber-900/30'>
              <PiWarning className='h-4 w-4 text-amber-600 dark:text-amber-400' />
              <span className='text-sm font-medium text-amber-800 dark:text-amber-300'>
                Dispute Active
              </span>
            </div>

            <div className='inline-flex items-center gap-2 rounded-full border border-blue-300 bg-blue-100 px-4 py-2 dark:border-blue-700 dark:bg-blue-900/30'>
              <PiUserCirclePlus className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              <span className='text-sm font-medium text-blue-800 dark:text-blue-300'>
                Arbitrator Assigned
              </span>
            </div>
          </div>

          {/* Arbitrator Info Card */}
          <div className='mb-6 rounded-xl border border-gray-200 bg-white/70 p-5 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50'>
            <div className='flex items-start gap-4'>
              <Link
                href={`/dashboard/arbitrators/${job.roles.arbitrator}`}
                className='group'
              >
                <div className='rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 p-3 transition-transform group-hover:scale-110 dark:from-blue-900/30 dark:to-purple-900/30'>
                  <PiGavel className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                </div>
              </Link>
              <div className='flex-1'>
                <div className='mb-1 flex items-center gap-2'>
                  <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                    Arbitrator Has Joined
                  </h4>
                  <Link
                    href={`/dashboard/arbitrators/${job.roles.arbitrator}`}
                    className='group inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    <span>{arbitratorName}</span>
                    <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
                  </Link>
                </div>
                <p className='mb-3 text-sm text-gray-600 dark:text-gray-400'>
                  The arbitrator has received all case information and is now
                  part of the conversation
                </p>

                {/* Arbitrator Avatar and Name with ProfileImage */}
                {arbitratorData && (
                  <Link
                    href={`/dashboard/arbitrators/${job.roles.arbitrator}`}
                    className='inline-flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800'
                  >
                    {arbitratorData?.avatar ? (
                      <ProfileImage
                        user={arbitratorData}
                        className='h-10 w-10'
                      />
                    ) : (
                      <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500'>
                        <span className='text-sm font-bold text-white'>
                          {arbitratorInitials}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className='text-sm font-medium text-gray-900 dark:text-white'>
                        {arbitratorName}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400'>
                        View Arbitrator Profile
                      </p>
                    </div>
                    <PiArrowRight className='ml-auto h-4 w-4 text-gray-400' />
                  </Link>
                )}

                {/* Communication Notice */}
                <div className='mt-3 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/20'>
                  <PiChatCircleDots className='h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400' />
                  <span className='text-xs text-blue-700 dark:text-blue-300'>
                    All parties can now communicate directly with the arbitrator
                    in the chat
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Process Information */}
          <div className='mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3'>
            {/* Review Phase */}
            <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
              <div className='mb-2 flex items-center gap-2'>
                <PiFileText className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Step 1: Review
                </span>
              </div>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                Arbitrator reviews all submitted evidence and communications
              </p>
            </div>

            {/* Investigation Phase */}
            <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
              <div className='mb-2 flex items-center gap-2'>
                <PiChatCircleDots className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                <span className='text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Step 2: Discussion
                </span>
              </div>
              <p className='text-xs text-gray-600 dark:text-gray-400'>
                May request additional information from both parties
              </p>
            </div>

            {/* Resolution Phase */}
            <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-4 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
              <div className='mb-2 flex items-center gap-2'>
                <PiShieldCheck className='h-4 w-4 text-gray-500 dark:text-gray-400' />
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
          <div className='rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-5 dark:border-amber-800 dark:from-amber-950/30 dark:to-orange-950/30'>
            <div className='flex gap-3'>
              <PiInfo className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='space-y-2'>
                <h4 className='text-sm font-semibold text-amber-900 dark:text-amber-300'>
                  Important Information
                </h4>
                <ul className='space-y-1 text-xs text-amber-800 dark:text-amber-400'>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      •
                    </span>
                    <span>
                      Respond promptly to any arbitrator requests for
                      information
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      •
                    </span>
                    <span>
                      All communications are recorded and will be considered in
                      the decision
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      •
                    </span>
                    <span>
                      The arbitrator&apos;s decision will be final and binding
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='mt-0.5 text-amber-600 dark:text-amber-500'>
                      •
                    </span>
                    <span>
                      Maintain professional communication throughout the process
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Status */}
          <div className='mt-6 flex flex-col items-center gap-3'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiClock className='h-3 w-3' />
              <span>Resolution typically takes 24-48 hours</span>
            </div>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30'>
                <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
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
