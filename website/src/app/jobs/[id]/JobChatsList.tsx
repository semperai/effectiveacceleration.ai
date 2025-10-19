import ProfileImage from '@/components/ProfileImage';
import type { Job, User } from '@effectiveacceleration/contracts';
import type { Dispatch, SetStateAction } from 'react';
import useReviews from '@/hooks/subsquid/useReviews';
import {
  PiUsers,
  PiUserCircle,
  PiChatCircle,
  PiSparkle,
  PiCheckCircle,
  PiClock,
} from 'react-icons/pi';

// Applicant item component to fetch reviews for each worker
const ApplicantItem = ({
  workerAddress,
  user,
  isSelected,
  onClick,
}: {
  workerAddress: string;
  user: User;
  isSelected: boolean;
  onClick: () => void;
}) => {
  const { actualAverageRating = 0 } = useReviews(workerAddress);

  return (
    <li
      className={`group relative cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      } `}
      onClick={onClick}
    >
      {/* Active indicator */}
      {isSelected && (
        <div className='absolute bottom-0 left-0 top-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500' />
      )}

      <div className='flex items-center gap-3 p-4'>
        {/* Profile image with online indicator */}
        <div className='relative flex-shrink-0'>
          <ProfileImage user={user} />
          <div className='absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-gray-900' />
        </div>

        {/* User info */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2'>
            <span className='truncate text-sm font-medium text-gray-900 dark:text-white'>
              {user.name}
            </span>
            {actualAverageRating > 4.5 && (
              <PiSparkle className='w-3 h-3 text-yellow-500' />
            )}
          </div>
          <p className='mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400'>
            {user.bio || 'No bio available'}
          </p>

          {/* Stats */}
          <div className='mt-2 flex items-center gap-3'>
            <span className='text-xs text-gray-400 dark:text-gray-500'>
              ⭐ {actualAverageRating.toFixed(1)}
            </span>
            <span className='text-xs text-gray-400 dark:text-gray-500'>
              {user.reputationUp || 0} jobs
            </span>
          </div>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div
            className='flex flex-col items-end gap-1'
            aria-label='Selected applicant'
          >
            <div className='rounded-full bg-blue-500 p-1'>
              <PiCheckCircle className='h-3 w-3 text-white' />
            </div>
            <span className='text-xs font-medium text-blue-600 dark:text-blue-400'>
              Selected
            </span>
          </div>
        )}
      </div>

      {/* Hover effect gradient */}
      <div className='pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
    </li>
  );
};

const JobChatsList = ({
  users,
  job,
  setSelectedWorker,
  setSidebarOpen,
  selectedWorker,
}: {
  users: Record<string, User>;
  job: Job | undefined;
  setSelectedWorker: Dispatch<SetStateAction<string>>;
  setSidebarOpen?: Dispatch<SetStateAction<boolean>>;
  selectedWorker?: string;
}) => {
  const numberOfWorkers = Object.keys(users).length - 1; // -1 to exclude the creator

  return (
    <div className='flex h-full flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-gray-900'>
      {/* Header with gradient */}
      <div className='relative border-b border-gray-200 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 dark:border-gray-800 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-blue-500/10'>
        <div className='animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent' />
        <div className='relative p-5'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-2 dark:from-blue-500/20 dark:to-purple-500/20'>
                <PiUsers className='h-5 w-5 text-blue-600 dark:text-blue-400' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Applicants
                </h3>
                <p className='text-xs text-gray-500 dark:text-gray-400'>
                  {selectedWorker
                    ? 'Click to change selection'
                    : 'Select an applicant'}
                </p>
              </div>
            </div>

            {/* Applicant count badge */}
            {numberOfWorkers > 0 && (
              <div className='rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900/30'>
                <span className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                  {numberOfWorkers}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status bar */}
      {numberOfWorkers > 0 && selectedWorker && (
        <div className='border-b border-gray-200 bg-gray-50 px-5 py-3 dark:border-gray-800 dark:bg-gray-800/50'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <PiCheckCircle className='h-4 w-4 text-green-500' />
              <span className='text-sm text-gray-600 dark:text-gray-400'>
                Viewing:{' '}
                {users[selectedWorker]?.name ||
                  (selectedWorker
                    ? `${selectedWorker.slice(0, 6)}…${selectedWorker.slice(-4)}`
                    : 'Unknown')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Applicants list */}
      <div className='flex-1 overflow-y-auto notifications-scroll'>
        {numberOfWorkers === 0 ? (
          <div className='flex h-full flex-col items-center justify-center p-8'>
            <div className='mb-4 rounded-full bg-gray-100 p-4 dark:bg-gray-800'>
              <PiChatCircle className='h-8 w-8 text-gray-400 dark:text-gray-500' />
            </div>
            <p className='font-medium text-gray-600 dark:text-gray-400'>
              No applicants yet
            </p>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-500'>
              Waiting for workers to apply
            </p>
          </div>
        ) : (
          <ul className='divide-y divide-gray-100 dark:divide-gray-800'>
            {Object.entries(users).map(([key, value]) =>
              job?.roles.creator !== key ? (
                <ApplicantItem
                  key={key}
                  workerAddress={key}
                  user={value}
                  isSelected={selectedWorker === key}
                  onClick={() => {
                    setSelectedWorker(key);
                    if (setSidebarOpen) setSidebarOpen(false);
                  }}
                />
              ) : null
            )}
          </ul>
        )}
      </div>

      {/* Footer with action hint */}
      {numberOfWorkers > 0 && (
        <div className='border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/50'>
          <p className='text-center text-xs text-gray-500 dark:text-gray-400'>
            {selectedWorker
              ? 'Click on another applicant to switch'
              : 'Select an applicant to view their messages'}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobChatsList;
