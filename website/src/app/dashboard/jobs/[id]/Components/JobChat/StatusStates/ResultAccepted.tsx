import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Button } from '@/components/Button';
import {
  type Job,
  JobEventType,
  type JobEventWithDiffs,
  type User,
} from '@effectiveacceleration/contracts';
import { formatMarkdownContent } from '@/utils/utils';
import Markdown from 'react-markdown';
import { ethers } from 'ethers';
import { tokens } from '@/tokens';
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
  PiStar
} from 'react-icons/pi';

interface ResultAcceptedProps {
  job: Job;
  events: JobEventWithDiffs[];
  users: Record<string, User>;
  selectedWorker: string;
}

const ResultAccepted: React.FC<ResultAcceptedProps> = ({
  job,
  users,
  selectedWorker,
  events,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedComment, setFormattedComment] = useState<string>('');
  const [isFormatted, setIsFormatted] = useState(false);

  // Get current user's address from wagmi
  const { address: currentUserAddress } = useAccount();

  // Get the delivery event
  const deliveryEvent = events.filter(
    (event) => event.type_ === JobEventType.Delivered
  )[0];

  const rawComment = deliveryEvent?.job?.result || '';

  // Fix: Get the worker address from the job, not selectedWorker
  const workerAddress = job.roles.worker || deliveryEvent?.address_ || selectedWorker;
  const workerData = users[workerAddress];
  const workerName = workerData?.name || 'Worker';

  // Check if current user is the job creator
  const isJobCreator = currentUserAddress &&
    job.roles.creator?.toLowerCase() === currentUserAddress.toLowerCase();

  // Calculate the formatted amount for the URL parameter
  const getFormattedAmount = () => {
    // Find the token to get its decimals
    const token = tokens.find(t => t.id.toLowerCase() === job.token.toLowerCase());
    if (token && job.amount) {
      // Convert from wei/smallest unit to human readable format
      const formattedAmount = ethers.formatUnits(job.amount, token.decimals);
      return formattedAmount;
    }
    return '';
  };

  useEffect(() => {
    if (rawComment?.startsWith("#filename%3D")) {
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
  const displayContent = shouldTruncate && !isExpanded
    ? `${formattedComment.slice(0, 200)}...`
    : formattedComment;

  return (
    <div className='w-full'>
      {/* Success Container with celebration theme */}
      <div className='relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950/20 dark:via-emerald-950/20 dark:to-teal-950/20 border border-green-200 dark:border-green-800'>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse" />

        {/* Confetti animation overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 animate-bounce delay-100">
            <PiConfetti className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="absolute top-20 right-20 animate-bounce delay-200">
            <PiSparkle className="w-6 h-6 text-purple-500" />
          </div>
          <div className="absolute bottom-20 left-1/3 animate-bounce delay-300">
            <PiStar className="w-7 h-7 text-blue-500" />
          </div>
          <div className="absolute bottom-10 right-1/4 animate-bounce delay-400">
            <PiConfetti className="w-6 h-6 text-pink-500" />
          </div>
        </div>

        {/* Content */}
        <div className='relative p-8'>
          {/* Success Header */}
          <div className='flex flex-col items-center mb-6'>
            <div className='mb-4 relative'>
              <div className='absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full blur-xl opacity-50 animate-pulse' />
              <div className='relative p-4 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/25'>
                <PiCheckCircle className='w-10 h-10 text-white' />
              </div>
            </div>
            <h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
              Job Successfully Completed! 🎉
            </h3>
            <p className='text-sm text-gray-600 dark:text-gray-400'>
              The deliverable has been accepted and the job is now closed
            </p>
          </div>

          {/* Worker Info Badge */}
          <div className='flex justify-center mb-6'>
            <div className='inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white dark:bg-gray-800 border border-green-200 dark:border-green-700 shadow-sm'>
              <div className='flex items-center gap-2'>
                <PiHandshake className='w-5 h-5 text-green-600 dark:text-green-400' />
                <span className='text-sm font-medium text-gray-900 dark:text-white'>
                  Completed by
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center'>
                  <PiUser className='w-4 h-4 text-white' />
                </div>
                <span className='text-sm font-semibold text-gray-900 dark:text-white'>
                  {workerName}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery Comment Section */}
          {formattedComment && (
            <div className='mb-6'>
              <div className='rounded-xl bg-white/70 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6'>
                <div className='flex items-center gap-2 mb-4'>
                  <PiFileText className='w-4 h-4 text-gray-500 dark:text-gray-400' />
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
                    className='mt-3 flex items-center gap-1 text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors'
                  >
                    {isExpanded ? (
                      <>
                        <PiCaretUp className='w-4 h-4' />
                        Show less
                      </>
                    ) : (
                      <>
                        <PiCaretDown className='w-4 h-4' />
                        Show more
                      </>
                    )}
                  </button>
                )}

                {/* Download indicator for files */}
                {isFormatted && (
                  <div className='mt-4 flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800'>
                    <PiDownload className='w-4 h-4 text-green-600 dark:text-green-400' />
                    <span className='text-sm text-green-700 dark:text-green-300'>
                      Deliverable file received and available for download
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className='text-center mb-8'>
            <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-300 dark:border-green-700'>
              <PiCheckCircle className='w-5 h-5 text-green-600 dark:text-green-400' />
              <span className='text-sm font-medium text-green-800 dark:text-green-300'>
                Result Accepted Successfully
              </span>
            </div>
          </div>

          {/* Next Steps Section */}
          <div className='p-6 rounded-xl bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-800/30 dark:to-gray-900/30 backdrop-blur-sm border border-gray-200 dark:border-gray-700'>
            <h4 className='text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
              <PiArrowRight className='w-4 h-4' />
              What's Next?
            </h4>

            <div className='grid gap-3'>
              {/* Create Similar Job - Only show to job creator */}
              {isJobCreator && (
                <Link
                  href={{
                    pathname: '/dashboard/post-job',
                    query: {
                      title: job.title,
                      content: job.content,
                      token: job.token,
                      amount: getFormattedAmount(), // Add the formatted amount here
                      maxTime: job.maxTime,
                      deliveryMethod: job.deliveryMethod,
                      arbitrator: job.roles.arbitrator,
                      tags: job.tags,
                    },
                  }}
                  className='w-full'
                >
                  <button className='
                    w-full px-4 py-3 rounded-xl
                    bg-gradient-to-r from-blue-500 to-purple-500
                    font-medium text-sm
                    transition-all duration-300
                    hover:from-blue-600 hover:to-purple-600
                    hover:shadow-lg hover:shadow-blue-500/25
                    hover:-translate-y-0.5
                    group
                  '>
                    <span className='flex items-center justify-center gap-2 text-white'>
                      <PiPlus className='w-4 h-4 text-white' />
                      <span className='text-white'>Create Similar Job with {workerName}</span>
                      <PiArrowRight className='w-4 h-4 text-white group-hover:translate-x-1 transition-transform' />
                    </span>
                  </button>
                </Link>
              )}

              {/* Browse Jobs - Show to everyone */}
              <Link href='/dashboard/open-job-list' className='w-full'>
                <button className='
                  w-full px-4 py-2.5 rounded-xl
                  bg-white dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-sm font-medium text-gray-700 dark:text-gray-300
                  transition-all duration-200
                  hover:bg-gray-50 dark:hover:bg-gray-700
                  hover:border-gray-300 dark:hover:border-gray-600
                  group
                '>
                  <span className='flex items-center justify-center gap-2'>
                    Browse More Jobs
                    <PiArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                  </span>
                </button>
              </Link>
            </div>
          </div>

          {/* Celebration Footer */}
          <div className='mt-6 flex justify-center'>
            <div className='flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400'>
              <span className='flex items-center gap-1'>
                <PiSparkle className='w-3 h-3 text-yellow-500 animate-pulse' />
                Thank you for using our platform
              </span>
              <span>•</span>
              <span className='flex items-center gap-1'>
                {isJobCreator ? 'Payment has been released to' : 'Payment received from job creator'}
                {isJobCreator && ` ${workerName}`}
                <PiCheckCircle className='w-3 h-3 text-green-500' />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultAccepted;
