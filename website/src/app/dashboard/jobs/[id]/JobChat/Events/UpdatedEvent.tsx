import React from 'react';
import Link from 'next/link';
import moment from 'moment';
import ProfileImage from '@/components/ProfileImage';
import { Badge } from '@/components/Badge';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import {
  PiPencil,
  PiArrowRight,
  PiUser,
  PiCaretDown,
  PiCaretUp,
} from 'react-icons/pi';

interface UpdatedEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const UpdatedEvent: React.FC<UpdatedEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const creatorAddress = job?.roles.creator || event.address_;
  const creator = users[creatorAddress];
  const creatorName = creator?.name || 'Job Creator';

  // Check if current user is the creator
  const isCurrentUser = currentUser?.address_ === creatorAddress;

  // Show only first 3 diffs when collapsed
  const displayedDiffs = isExpanded ? event.diffs : event.diffs.slice(0, 3);
  const hasMoreDiffs = event.diffs.length > 3;

  return (
    <>
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg'>
        <PiPencil className='h-5 w-5 text-white' />
      </div>

      <div className='min-w-0 flex-1'>
        <div>
          <div className='text-sm text-gray-900 dark:text-gray-100'>
            {isCurrentUser ? (
              <span className='font-semibold text-blue-600 dark:text-blue-400'>
                You
              </span>
            ) : (
              <Link
                href={`/dashboard/users/${creatorAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400'
              >
                {creatorName}
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              updated the job
            </span>
          </div>

          {/* Changes Card */}
          {event.diffs.length > 0 && (
            <div className='mt-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:border-blue-800 dark:from-blue-950/20 dark:to-indigo-950/20'>
              <div className='mb-2 text-xs font-medium text-gray-700 dark:text-gray-300'>
                Changes made:
              </div>

              <div className='space-y-2'>
                {displayedDiffs.map((diff, index) => (
                  <div key={index} className='flex flex-col gap-1'>
                    <span className='text-xs font-medium text-gray-600 dark:text-gray-400'>
                      {diff.field}:
                    </span>
                    <div className='flex items-center gap-2'>
                      {diff.oldValue && (
                        <>
                          <Badge color='red' className='text-xs'>
                            {diff.oldValue.toString()}
                          </Badge>
                          <span className='text-gray-400'>→</span>
                        </>
                      )}
                      <Badge color='lime' className='text-xs'>
                        {diff.newValue?.toString()}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {/* Show More/Less Toggle */}
              {hasMoreDiffs && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className='mt-3 flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  {isExpanded ? (
                    <>
                      <PiCaretUp className='h-3 w-3' />
                      Show less
                    </>
                  ) : (
                    <>
                      <PiCaretDown className='h-3 w-3' />
                      Show {event.diffs.length - 3} more changes
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>

        <div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
          {moment(event.timestamp_ * 1000).fromNow()}
        </div>
      </div>
    </>
  );
};

export default UpdatedEvent;
