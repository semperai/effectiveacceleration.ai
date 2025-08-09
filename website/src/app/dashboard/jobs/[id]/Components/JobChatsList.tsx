import EventProfileImage from '@/components/Events/Components/EventProfileImage';
import type { Job, User } from '@effectiveacceleration/contracts';
import type { Dispatch, SetStateAction } from 'react';
import {
  PiUsers,
  PiUserCircle,
  PiChatCircle,
  PiSparkle,
  PiCheckCircle,
  PiClock
} from 'react-icons/pi';

const JobChatsList = ({
  users,
  job,
  setSelectedWorker,
  setSidebarOpen,
  selectedWorker
}: {
  users: Record<string, User>;
  job: Job | undefined;
  setSelectedWorker: Dispatch<SetStateAction<string>>;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
  selectedWorker?: string;
}) => {
  const numberOfWorkers = Object.keys(users).length - 1; // -1 to exclude the creator

  return (
    <div className='h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden'>
      {/* Header with gradient */}
      <div className='relative bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-blue-500/10 border-b border-gray-200 dark:border-gray-800'>
        <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer' />
        <div className='relative p-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20'>
                <PiUsers className='w-5 h-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Applicants
                </h3>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  Select a conversation
                </p>
              </div>
            </div>

            {/* Applicant count badge */}
            {numberOfWorkers > 0 && (
              <div className='px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30'>
                <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                  {numberOfWorkers}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      {numberOfWorkers > 0 && (
        <div className='px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <PiCheckCircle className='w-4 h-4 text-green-500' />
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                {numberOfWorkers}/{numberOfWorkers} applicants reviewed
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Applicants list */}
      <div className='flex-1 overflow-y-auto'>
        {numberOfWorkers === 0 ? (
          <div className='flex flex-col items-center justify-center h-full p-8'>
            <div className='p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4'>
              <PiChatCircle className='w-8 h-8 text-gray-400 dark:text-gray-500' />
            </div>
            <p className='text-gray-600 dark:text-gray-400 font-medium'>
              No applicants yet
            </p>
            <p className='text-sm text-gray-500 dark:text-gray-500 mt-1'>
              Waiting for workers to apply
            </p>
          </div>
        ) : (
          <ul className='divide-y divide-gray-100 dark:divide-gray-800'>
            {Object.entries(users).map(([key, value]) =>
              job?.roles.creator !== key ? (
                <li
                  key={key}
                  className={`
                    relative group cursor-pointer
                    transition-all duration-200
                    ${selectedWorker === key
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }
                  `}
                  onClick={() => {
                    setSelectedWorker(key);
                    if (setSidebarOpen) setSidebarOpen(false);
                  }}
                >
                  {/* Active indicator */}
                  {selectedWorker === key && (
                    <div className='absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500' />
                  )}

                  <div className='flex items-center gap-3 p-4'>
                    {/* Profile image with online indicator */}
                    <div className='relative flex-shrink-0'>
                      <EventProfileImage user={value} />
                      <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full' />
                    </div>

                    {/* User info */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2'>
                        <span className='font-medium text-sm text-gray-900 dark:text-white truncate'>
                          {value.name}
                        </span>
                        {/* TODO
                        {value.rating && value.rating > 4.5 && (
                          <PiSparkle className='w-3 h-3 text-yellow-500' />
                        )}
                        */}
                      </div>
                      <p className='text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5'>
                        {value.bio || 'No bio available'}
                      </p>

                      {/* Stats */}
                      <div className='flex items-center gap-3 mt-2'>
                        {/* TODO
                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                          ⭐ {value.rating?.toFixed(1) || '0.0'}
                        </span>
                        */}
                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                          {value.reputationUp || 0} jobs
                        </span>
                      </div>
                    </div>

                    {/* Time/Status indicator */}
                    <div className='flex flex-col items-end gap-1'>
                      <PiClock className='w-3 h-3 text-gray-400' />
                      <span className='text-xs text-gray-400'>
                        2h ago
                      </span>
                    </div>
                  </div>

                  {/* Hover effect gradient */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
                </li>
              ) : null
            )}
          </ul>
        )}
      </div>

      {/* Footer with action hint */}
      {numberOfWorkers > 0 && (
        <div className='p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800'>
          <p className='text-xs text-center text-gray-500 dark:text-gray-400'>
            Click on an applicant to view their messages
          </p>
        </div>
      )}
    </div>
  );
};

export default JobChatsList;
