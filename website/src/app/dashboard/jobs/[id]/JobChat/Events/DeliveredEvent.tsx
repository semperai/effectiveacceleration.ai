import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import Markdown from 'react-markdown';
import ProfileImage from '@/components/ProfileImage';
import { formatMarkdownContent } from '@/lib/utils';
import {
  type JobEventWithDiffs,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import {
  PiPackage,
  PiArrowRight,
  PiCheckCircle,
  PiFile,
  PiCaretDown,
  PiCaretUp,
  PiUser,
  PiSparkle,
} from 'react-icons/pi';

interface DeliveredEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const DeliveredEvent: React.FC<DeliveredEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedResult, setFormattedResult] = useState<string>('');
  const [isFormatted, setIsFormatted] = useState(false);

  const workerAddress = event.address_;
  const worker = users[workerAddress];
  const workerName = worker?.name || 'Worker';

  // Check if current user is the worker
  const isCurrentUser = currentUser?.address_ === workerAddress;

  // Get the result from the event's job data
  const rawResult = event.job?.result || '';

  useEffect(() => {
    if (rawResult?.startsWith('#filename%3D')) {
      formatMarkdownContent(rawResult, (formatted) => {
        setFormattedResult(formatted);
        setIsFormatted(true);
      });
    } else {
      setFormattedResult(rawResult);
    }
  }, [rawResult]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldTruncate = formattedResult.length > 200 && !isFormatted;
  const displayContent =
    shouldTruncate && !isExpanded
      ? `${formattedResult.slice(0, 200)}...`
      : formattedResult;

  return (
    <>
      <div className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg'>
        <PiPackage className='h-5 w-5 text-white' />
        <div className='absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1'>
          <PiCheckCircle className='h-3 w-3 text-white' />
        </div>
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
                href={`/dashboard/users/${workerAddress}`}
                className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400'
              >
                {workerName}
                <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
              </Link>
            )}
            <span className='ml-1 text-gray-600 dark:text-gray-400'>
              delivered the work
            </span>
          </div>

          {/* Delivery Card */}
          <div className='mt-3 rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-4 dark:border-blue-800 dark:from-blue-950/20 dark:to-purple-950/20'>
            <div className='mb-3 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <PiSparkle className='h-5 w-5 text-blue-600 dark:text-blue-400' />
                <h4 className='text-sm font-semibold text-gray-900 dark:text-white'>
                  Work Submitted
                </h4>
              </div>
              <span className='rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-600 dark:bg-green-900/30 dark:text-green-400'>
                Ready for Review
              </span>
            </div>

            {/* Delivery Message/Result */}
            {formattedResult && (
              <div className='rounded-lg bg-white p-3 dark:bg-gray-800/50'>
                <div className='prose prose-sm dark:prose-invert max-w-none'>
                  <Markdown className='text-gray-700 dark:text-gray-300'>
                    {displayContent || 'Work has been delivered'}
                  </Markdown>
                </div>

                {/* File Indicator */}
                {isFormatted && (
                  <div className='mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 dark:border-blue-700 dark:bg-blue-900/20'>
                    <PiFile className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    <span className='text-xs text-blue-700 dark:text-blue-300'>
                      Deliverable file attached
                    </span>
                  </div>
                )}

                {/* Read More/Less Toggle */}
                {shouldTruncate && (
                  <button
                    onClick={toggleExpanded}
                    className='mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    {isExpanded ? (
                      <>
                        <PiCaretUp className='h-3 w-3' />
                        Show less
                      </>
                    ) : (
                      <>
                        <PiCaretDown className='h-3 w-3' />
                        Show more
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Worker Info */}
            <div className='mt-3 flex items-center justify-between border-t border-blue-100 pt-3 dark:border-blue-900'>
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500 dark:text-gray-400'>
                  Delivered by:
                </span>
                {worker?.avatar ? (
                  <ProfileImage
                    user={worker}
                    className='h-5 w-5 rounded-full'
                  />
                ) : (
                  <div className='flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500'>
                    <PiUser className='h-3 w-3 text-white' />
                  </div>
                )}
                <Link
                  href={`/dashboard/users/${workerAddress}`}
                  className='text-xs font-medium text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400'
                >
                  {workerName}
                </Link>
              </div>

              <span className='text-xs text-gray-500 dark:text-gray-400'>
                Awaiting approval
              </span>
            </div>
          </div>

          {/* Result Hash if available */}
          {event.job?.resultHash &&
            event.job.resultHash !==
              '0x0000000000000000000000000000000000000000000000000000000000000000' && (
              <div className='mt-2 flex items-center gap-2 text-xs'>
                <span className='text-gray-500 dark:text-gray-400'>
                  Result Hash:
                </span>
                <code className='rounded bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
                  {event.job.resultHash.slice(0, 10)}...
                  {event.job.resultHash.slice(-8)}
                </code>
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

export default DeliveredEvent;
