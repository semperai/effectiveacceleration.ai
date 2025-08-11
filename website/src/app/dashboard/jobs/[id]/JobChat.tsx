import React from 'react';
import { PostMessageButton } from '@/components/JobActions/PostMessageButton';
import {
  type Job,
  JobState,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';
import { zeroAddress } from 'viem';
import JobChatEvents from './JobChat/JobChat';
import { PiChatCircleDots, PiSparkle, PiLockKey } from 'react-icons/pi';

const JobChat = ({
  users,
  selectedWorker,
  eventMessages,
  job,
  address,
  addresses,
  sessionKeys,
  jobUsersData,
}: {
  users: Record<string, User>;
  selectedWorker: string;
  eventMessages: JobEventWithDiffs[];
  job: Job;
  address: string | undefined;
  sessionKeys: Record<string, string>;
  addresses: string[];
  jobUsersData?: Record<string, User>;
}) => {
  const isJobOpenForWorker =
    job.roles.worker === zeroAddress &&
    job.state === JobState.Open &&
    address !== job.roles.creator &&
    address !== job.roles.arbitrator;
  const isUserArbitrator = address === job.roles.arbitrator;
  const isUserWorker = address === job.roles.worker;
  const isUserCreator = address === job.roles.creator;
  const isJobTaken = job.state === JobState.Taken;

  // Show message input for:
  // 1. Creator when job is taken (in progress)
  // 2. Creator when they have selected a worker to chat with
  // 3. Worker when they are assigned to the job
  // 4. Worker when job is open and they can apply
  const isUserCreatorWithSelectedWorkerOrTaken =
    (isUserCreator && selectedWorker) || (isUserCreator && isJobTaken);

  const shouldShowPostMessageButton =
    job.state !== JobState.Closed &&
    addresses.length &&
    Object.keys(sessionKeys).length > 0;

  return (
    <div className='flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-lg dark:bg-gray-900'>
      {/* Enhanced header with gradient */}
      <div className='relative border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:border-gray-700 dark:from-gray-800 dark:via-gray-800 dark:to-gray-800'>
        <div className='px-6 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 dark:from-blue-500/20 dark:to-purple-500/20'>
                <PiChatCircleDots className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Job Discussion
                </h3>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {eventMessages.length} messages
                </p>
              </div>
            </div>

            {/* Connection status indicator */}
            <div className='flex items-center gap-2'>
              {Object.keys(sessionKeys).length > 0 ? (
                <div className='flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/30'>
                  <div className='h-2 w-2 animate-pulse rounded-full bg-green-500' />
                  <span className='text-xs font-medium text-green-700 dark:text-green-400'>
                    Encrypted
                  </span>
                </div>
              ) : (
                <div className='flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 dark:bg-gray-800'>
                  <PiLockKey className='h-3 w-3 text-gray-500 dark:text-gray-400' />
                  <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                    Not Connected
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat messages area with improved styling */}
      <div className='flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900/50'>
        <div className='h-full overflow-y-auto'>
          <JobChatEvents
            users={users}
            selectedWorker={selectedWorker}
            events={eventMessages as JobEventWithDiffs[]}
            job={job}
            address={address}
          />
        </div>
      </div>

      {/* Simplified message input area - no unnecessary wrappers */}
      {job &&
        (isJobOpenForWorker ||
          isUserWorker ||
          isUserCreatorWithSelectedWorkerOrTaken ||
          (isUserCreator && isJobTaken)) &&
        shouldShowPostMessageButton && (
          <div className='border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900'>
            <div className='p-1'>
              <PostMessageButton
                address={address}
                recipient={selectedWorker}
                addresses={addresses as any}
                sessionKeys={sessionKeys}
                job={job}
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default JobChat;
