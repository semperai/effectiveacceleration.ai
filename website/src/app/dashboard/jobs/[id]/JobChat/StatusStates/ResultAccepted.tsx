import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';
import { formatMarkdownContent } from '@/lib/utils';
import { tokens } from '@/lib/tokens';
import ProfileImage from '@/components/ProfileImage';
import Markdown from 'react-markdown';
import { ethers } from 'ethers';
import {
  PiCheckCircle,
  PiConfetti,
  PiSparkle,
  PiUser,
  PiFileText,
  PiCaretDown,
  PiCaretUp,
  PiDownload,
  PiPlus,
  PiArrowRight,
  PiHandshake,
  PiStar,
} from 'react-icons/pi';

interface ResultAcceptedProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
  currentUser?: User | null; // Add current user as optional prop
}

const ResultAccepted: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
  currentUser, // Accept current user directly
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedComment, setFormattedComment] = useState<string>('');
  const [isFormatted, setIsFormatted] = useState(false);

  // Get current user's address from props or currentUser
  const currentUserAddress = currentUser?.address_;

  // Get the delivery event
  const deliveryEvent = events.filter(
    (event) => event.type_ === JobEventType.Delivered
  )[0];

  const rawComment = deliveryEvent?.job?.result || '';

  // Fix: Get the worker address from the job, not selectedWorker
  const workerAddress =
    job.roles.worker || deliveryEvent?.address_ || selectedWorker;
  const workerData = users[workerAddress];
  const workerName = workerData?.name || 'Worker';

  // Get initials for fallback avatar
  const workerInitials =
    workerName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'W';

  // Check if current user is the job creator or worker
  const isJobCreator =
    currentUserAddress &&
    job.roles.creator?.toLowerCase() === currentUserAddress.toLowerCase();

  const isWorker =
    currentUserAddress &&
    workerAddress?.toLowerCase() === currentUserAddress.toLowerCase();

  // Calculate the formatted amount for the URL parameter
  const getFormattedAmount = () => {
    // Find the token to get its decimals
    const token = tokens.find(
      (t) => t.id.toLowerCase() === job.token.toLowerCase()
    );
    if (token && job.amount) {
      // Convert from wei/smallest unit to human readable format
      const formattedAmount = ethers.formatUnits(job.amount, token.decimals);
      return formattedAmount;
    }
    return '';
  };

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

  return (
    <div className='w-full'>
      {/* Success Container with celebration theme */}
      <div className='relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:border-green-800 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20'>
        {/* Decorative elements */}
        <div className='absolute right-0 top-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-3xl' />
        <div className='absolute bottom-0 left-0 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 blur-3xl' />

        {/* Confetti animation overlay */}
        <div className='absolute inset-0 opacity-30'>
          <div className='absolute left-10 top-10 animate-bounce delay-100'>
            <PiConfetti className='h-8 w-8 text-yellow-500' />
          </div>
          <div className='absolute right-20 top-20 animate-bounce delay-200'>
            <PiSparkle className='h-6 w-6 text-purple-500' />
          </div>
          <div className='absolute bottom-20 left-1/3 animate-bounce delay-300'>
            <PiStar className='h-7 w-7 text-blue-500' />
          </div>
          <div className='delay-400 absolute bottom-10 right-1/4 animate-bounce'>
            <PiConfetti className='h-6 w-6 text-pink-500' />
          </div>
        </div>

        {/* Content */}
        <div className='relative p-8'>
          {/* Success Header */}
          <div className='mb-6 flex flex-col items-center'>
            <div className='relative mb-4'>
              <div className='absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-50 blur-xl' />
              <div className='relative rounded-full bg-gradient-to-br from-green-500 to-emerald-500 p-4 shadow-lg shadow-green-500/25'>
                <PiCheckCircle className='h-10 w-10 text-white' />
              </div>
            </div>
            <h3 className='mb-2 text-2xl font-bold text-gray-900 dark:text-white'>
              Job Successfully Completed! 🎉
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              The deliverable has been accepted and the job is now closed
            </p>
          </div>

          {/* Worker Info Badge with Link */}
          <div className='mb-6 flex justify-center'>
            <div className='inline-flex items-center gap-3 rounded-full border border-green-200 bg-white px-5 py-3 shadow-sm dark:border-green-700 dark:bg-gray-800'>
              <div className='flex items-center gap-2'>
                <PiHandshake className='h-5 w-5 text-green-600 dark:text-green-400' />
                <span className='text-sm font-medium text-gray-900 dark:text-white'>
                  Completed by
                </span>
              </div>
              <Link
                href={`/dashboard/users/${workerAddress}`}
                className='group flex items-center gap-2'
              >
                {/* Use ProfileImage component or fallback to initials */}
                {workerData?.avatar ? (
                  <ProfileImage
                    user={workerData}
                    className='h-8 w-8 transition-transform group-hover:scale-110'
                  />
                ) : (
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 transition-transform group-hover:scale-110'>
                    <span className='text-xs font-bold text-white'>
                      {workerInitials}
                    </span>
                  </div>
                )}
                <span className='text-sm font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                  {workerName}
                </span>
                <PiArrowRight className='h-3 w-3 transform text-gray-400 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 group-hover:opacity-100 dark:group-hover:text-blue-400' />
              </Link>
            </div>
          </div>

          {/* Delivery Comment Section */}
          {formattedComment && (
            <div className='mb-6'>
              <div className='rounded-xl border border-gray-200 bg-white/70 p-6 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-900/50'>
                <div className='mb-4 flex items-center gap-2'>
                  <PiFileText className='h-4 w-4 text-gray-500 dark:text-gray-400' />
                  <h4 className='text-sm font-semibold text-gray-700 dark:text-gray-300'>
                    Delivery Details
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
                    className='mt-3 flex items-center gap-1 text-sm font-medium text-green-600 transition-colors hover:text-green-700 dark:text-green-400 dark:hover:text-green-300'
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
                  <div className='mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950/30'>
                    <PiDownload className='h-4 w-4 text-green-600 dark:text-green-400' />
                    <span className='text-sm text-green-700 dark:text-green-300'>
                      Deliverable file received and available for download
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className='mb-8 text-center'>
            <div className='inline-flex items-center gap-2 rounded-full border border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 dark:border-green-700 dark:from-green-900/30 dark:to-emerald-900/30'>
              <PiCheckCircle className='h-5 w-5 text-green-600 dark:text-green-400' />
              <span className='text-sm font-medium text-green-800 dark:text-green-300'>
                Result Accepted Successfully
              </span>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-white/50 to-gray-50/50 p-6 backdrop-blur-sm dark:border-gray-700 dark:from-gray-800/30 dark:to-gray-900/30'>
            <h4 className='mb-4 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white'>
              <PiArrowRight className='h-4 w-4' />
              What&apos;s Next?
            </h4>

            <div className='grid gap-3'>
              {/* Create Similar Job - Only show to job creator */}
              {isJobCreator && (
                <Link
                  href={{
                    pathname: '/post-job',
                    query: {
                      title: job.title,
                      content: job.content,
                      token: job.token,
                      amount: getFormattedAmount(),
                      maxTime: job.maxTime,
                      deliveryMethod: job.deliveryMethod,
                      arbitrator: job.roles.arbitrator,
                      tags: job.tags,
                    },
                  }}
                  className='w-full'
                >
                  <button className='group w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-sm font-medium shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-600 hover:to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]'>
                    <span className='flex items-center justify-center gap-2 text-white'>
                      <PiPlus className='h-4 w-4 text-white' />
                      <span className='text-white'>
                        Create Similar Job with {workerName}
                      </span>
                      <PiArrowRight className='h-4 w-4 text-white transition-transform group-hover:translate-x-1' />
                    </span>
                  </button>
                </Link>
              )}

              {/* View Worker Profile - Only show if viewer is not the worker */}
              {!isWorker && (
                <Link
                  href={`/dashboard/users/${workerAddress}`}
                  className='w-full'
                >
                  <button className='group w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'>
                    <span className='flex items-center justify-center gap-2'>
                      <PiUser className='h-4 w-4' />
                      View {workerName}&apos;s Profile
                      <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </span>
                  </button>
                </Link>
              )}

              {/* Browse Jobs */}
              <Link href='/dashboard/open-job-list' className='w-full'>
                <button className='group w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-700'>
                  <span className='flex items-center justify-center gap-2'>
                    Browse More Jobs
                    <PiArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Celebration Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
              <span className='flex items-center gap-1'>
                <PiSparkle className='h-3 w-3 animate-pulse text-yellow-500' />
                Thank you for using our platform
              </span>
              <span>•</span>
              <span className='flex items-center gap-1'>
                {isJobCreator
                  ? 'Payment has been released to'
                  : 'Payment received from job creator'}
                {isJobCreator && (
                  <Link
                    href={`/dashboard/users/${workerAddress}`}
                    className='text-blue-600 hover:text-blue-500 hover:underline dark:text-blue-400 dark:hover:text-blue-300'
                  >
                    {workerName}
                  </Link>
                )}
                <PiCheckCircle className='h-3 w-3 text-green-500' />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultAccepted;
