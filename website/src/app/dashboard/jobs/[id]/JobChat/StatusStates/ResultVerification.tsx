import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Markdown from 'react-markdown';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  JobState,
  type User,
} from '@effectiveacceleration/contracts';
import { ApproveButton } from '@/components/JobActions/ApproveButton';
import { DisputeButton } from '@/components/JobActions/DisputeButton';
import { zeroAddress, zeroHash } from 'viem';
import { formatMarkdownContent } from '@/utils/utils';
import {
  PiCheckCircle,
  PiPackage,
  PiFileText,
  PiUser,
  PiSparkle,
  PiWarning,
  PiCaretDown,
  PiCaretUp,
  PiDownload,
  PiChatCircle,
  PiInfo,
  PiArrowRight,
} from 'react-icons/pi';

interface ResultAcceptedProps {
  job: Job;
  users: Record<string, User>;
  selectedWorker: string;
  events: JobEventWithDiffs[];
  address: string;
  sessionKeys?: Record<string, string>;
  addresses?: string[];
}

const ResultVerification: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
  address,
  sessionKeys = {},
  addresses = [],
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedComment, setFormattedComment] = useState<string>('');
  const [isFormatted, setIsFormatted] = useState(false);

  // Get the delivery event
  const deliveryEvent = events.filter(
    (event: JobEventWithDiffs) => event.type_ === JobEventType.Delivered
  )[0];

  const rawComment: string = deliveryEvent?.job?.result || '';

  // Fix: Get the worker address from the job or delivery event, not selectedWorker
  const workerAddress =
    job.roles.worker || deliveryEvent?.address_ || selectedWorker;
  const workerData = users[workerAddress];
  const workerName = workerData?.name || 'Worker';

  useEffect(() => {
    if (rawComment?.startsWith('#filename%3D')) {
      formatMarkdownContent(rawComment, (formatted) => {
        setFormattedComment(formatted);
        setIsFormatted(true);
      });
    } else {
      setFormattedComment(rawComment);
    }
  }, [rawComment]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldTruncate = formattedComment.length > 200 && !isFormatted;
  const displayContent =
    shouldTruncate && !isExpanded
      ? `${formattedComment.slice(0, 200)}...`
      : formattedComment;

  // Check if dispute button should be shown
  const showDisputeButton =
    job?.state === JobState.Taken &&
    job.roles.arbitrator !== zeroAddress &&
    address === job.roles.creator &&
    !job.disputed &&
    Object.keys(sessionKeys).length > 0;

  return (
    <div className='w-full'>
      {/* Main Container with gradient background */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 dark:border-blue-800 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-blue-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-3xl' />

        {/* Content */}
        <div className='relative p-8'>
          {/* Header Section */}
          <div className='mb-6 flex items-center justify-center'>
            <div className='flex items-center gap-3'>
              <div className='rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 p-3 shadow-lg shadow-green-500/25'>
                <PiPackage className='h-6 w-6 text-white' />
              </div>
              <div className='text-left'>
                <h3 className='text-lg font-bold text-gray-900 dark:text-white'>
                  Work Delivered
                </h3>
                <p className='text-sm text-gray-600 dark:text-gray-400'>
                  Review the submitted deliverable
                </p>
              </div>
            </div>
          </div>

          {/* Worker Info Badge with Link */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800'>
              <Link
                href={`/dashboard/users/${workerAddress}`}
                className='group flex items-center gap-2'
              >
                <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 transition-transform group-hover:scale-110'>
                  <PiUser className='h-4 w-4 text-white' />
                </div>
                <span className='text-sm font-medium text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                  {workerName}
                </span>
                <PiArrowRight className='h-3 w-3 transform text-gray-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 group-hover:opacity-100 dark:group-hover:text-blue-400' />
              </Link>
              <span className='text-xs text-gray-500 dark:text-gray-400'>
                has completed the job
              </span>
            </div>
          </div>

          {/* Deliverable Content */}
          <div className='mb-6'>
            <div className='rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-900/50'>
              <div className='mb-4 flex items-center gap-2'>
                <PiFileText className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                  Delivery Message
                </h4>
              </div>

              {/* Message Content */}
              <div className='prose prose-sm dark:prose-invert max-w-none'>
                <Markdown className='text-gray-700 dark:text-gray-300'>
                  {displayContent || 'No message provided'}
                </Markdown>
              </div>

              {/* Read More/Less Toggle */}
              {shouldTruncate && (
                <button
                  onClick={toggleExpanded}
                  className='mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                >
                  {isExpanded ? (
                    <>
                      <PiCaretUp className='h-4 w-4' />
                      Show less
                    </>
                  ) : (
                    <>
                      <PiCaretDown className='h-4 w-4' />
                      Show more
                    </>
                  )}
                </button>
              )}

              {/* Download indicator for files */}
              {isFormatted && (
                <div className='mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30'>
                  <PiDownload className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  <span className='text-sm text-blue-700 dark:text-blue-300'>
                    File attachment available for download
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Instructions Section */}
          <div className='mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20'>
            <div className='flex gap-3'>
              <PiInfo className='mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400' />
              <div className='space-y-2'>
                <p className='text-sm font-semibold text-amber-900 dark:text-amber-300'>
                  Next Steps
                </p>
                <ul className='space-y-1 text-sm text-amber-800 dark:text-amber-400'>
                  <li className='flex items-start gap-2'>
                    <PiCheckCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                    <span>
                      Review the deliverable and approve if it meets
                      requirements
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <PiWarning className='mt-0.5 h-4 w-4 flex-shrink-0' />
                    <span>
                      Request a refund if the work doesn't meet expectations
                    </span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <PiChatCircle className='mt-0.5 h-4 w-4 flex-shrink-0' />
                    <span>
                      Send a message to{' '}
                      <Link
                        href={`/dashboard/users/${workerAddress}`}
                        className='font-medium text-amber-700 hover:underline dark:text-amber-300'
                      >
                        {workerName}
                      </Link>{' '}
                      to request changes
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-col justify-center gap-3 sm:flex-row'>
            {job.state === JobState.Taken &&
              job.resultHash !== zeroHash &&
              address === job.roles.creator && (
                <div className='flex-1 sm:max-w-xs'>
                  <ApproveButton address={address} job={job} />
                </div>
              )}

            {showDisputeButton && (
              <div className='flex-1 sm:max-w-xs'>
                <DisputeButton
                  address={address}
                  job={job}
                  sessionKeys={sessionKeys}
                />
              </div>
            )}
          </div>

          {/* Success Animation */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
              <PiSparkle className='h-3 w-3 animate-pulse text-purple-500' />
              <span>Deliverable ready for review</span>
              <PiSparkle className='h-3 w-3 animate-pulse text-purple-500' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultVerification;
