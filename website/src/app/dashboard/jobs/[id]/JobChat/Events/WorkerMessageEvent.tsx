import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import Markdown from 'react-markdown';
import ProfileImage from '@/components/ProfileImage';
import { formatMarkdownContent } from '@/lib/utils';
import {
  type JobEventWithDiffs,
  type JobMessageEvent,
  type User,
  type Job,
} from '@effectiveacceleration/contracts';
import {
  PiChatCircle,
  PiCaretDown,
  PiCaretUp,
  PiFile,
  PiUser,
  PiShieldCheck,
} from 'react-icons/pi';

interface WorkerMessageEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const WorkerMessageEvent: React.FC<WorkerMessageEventProps> = ({
  event,
  users,
  currentUser,
  job,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [formattedMessage, setFormattedMessage] = useState<string>('');
  const [isFormatted, setIsFormatted] = useState(false);

  const messageDetails = event.details as JobMessageEvent;
  const senderAddress = event.address_;
  const sender = users[senderAddress];
  const senderName = sender?.name || 'Worker';

  // Check if sender is the arbitrator
  const isArbitrator = job?.roles.arbitrator === senderAddress;

  // Check if current user is the sender
  const isCurrentUser = currentUser?.address_ === senderAddress;

  // Get recipient info
  const recipientAddress = messageDetails?.recipientAddress;
  const recipient = recipientAddress ? users[recipientAddress] : null;
  const recipientName = recipient?.name || 'User';

  const rawMessage = messageDetails?.content || '';

  useEffect(() => {
    if (rawMessage?.startsWith('#filename%3D')) {
      formatMarkdownContent(rawMessage, (formatted) => {
        setFormattedMessage(formatted);
        setIsFormatted(true);
      });
    } else {
      setFormattedMessage(rawMessage);
    }
  }, [rawMessage]);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const shouldTruncate = formattedMessage.length > 200 && !isFormatted;
  const displayContent =
    shouldTruncate && !isExpanded
      ? `${formattedMessage.slice(0, 200)}...`
      : formattedMessage;

  return (
    <>
      {/* Icon with responsive sizing */}
      <div className='relative flex-shrink-0'>
        {sender?.avatar ? (
          <ProfileImage
            user={sender}
            className='h-8 w-8 rounded-full ring-2 ring-white sm:h-10 sm:w-10 sm:ring-4 dark:ring-gray-900'
          />
        ) : (
          <div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 ring-2 ring-white sm:h-10 sm:w-10 sm:ring-4 dark:ring-gray-900'>
            <PiUser className='h-4 w-4 text-white sm:h-5 sm:w-5' />
          </div>
        )}
        {isArbitrator && (
          <div className='absolute -bottom-1 -right-1 rounded-full bg-amber-500 p-0.5 sm:p-1'>
            <PiShieldCheck className='h-2.5 w-2.5 text-white sm:h-3 sm:w-3' />
          </div>
        )}
      </div>

      {/* Content with adjusted spacing */}
      <div className='ml-3 min-w-0 flex-1 sm:ml-4'>
        <div className='rounded-2xl bg-white p-3 shadow-sm sm:p-4 dark:bg-gray-800'>
          {/* Message Header */}
          <div className='mb-2 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between'>
            <div className='flex-1'>
              <div className='flex flex-wrap items-center gap-1 sm:gap-2'>
                {isCurrentUser ? (
                  <span className='font-semibold text-blue-600 dark:text-blue-400'>
                    You
                  </span>
                ) : (
                  <Link
                    href={`/dashboard/users/${senderAddress}`}
                    className='font-semibold text-gray-900 transition-colors hover:text-blue-600 dark:text-gray-100 dark:hover:text-blue-400'
                  >
                    {senderName}
                  </Link>
                )}

                {isArbitrator && (
                  <span className='rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'>
                    Arbitrator
                  </span>
                )}

                {recipient && (
                  <>
                    <span className='text-xs text-gray-400'>to</span>
                    <Link
                      href={`/dashboard/users/${recipientAddress}`}
                      className='text-sm font-medium text-gray-600 transition-colors hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                    >
                      {recipientName}
                    </Link>
                  </>
                )}
              </div>

              <div className='mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                <PiChatCircle className='h-3 w-3' />
                <span>{moment(event.timestamp_ * 1000).fromNow()}</span>
              </div>
            </div>
          </div>

          {/* Message Content */}
          <div className='prose prose-sm dark:prose-invert max-w-none'>
            <Markdown className='text-sm text-gray-700 sm:text-base dark:text-gray-300'>
              {displayContent || 'No message content'}
            </Markdown>
          </div>

          {/* File Indicator */}
          {isFormatted && (
            <div className='mt-3 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 sm:px-3 sm:py-1.5 dark:border-blue-800 dark:bg-blue-950/20'>
              <PiFile className='h-3.5 w-3.5 text-blue-600 sm:h-4 sm:w-4 dark:text-blue-400' />
              <span className='text-xs text-blue-700 dark:text-blue-300'>
                File attachment
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
      </div>
    </>
  );
};

export default WorkerMessageEvent;
