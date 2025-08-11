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
  PiArrowRight,
  PiCaretDown,
  PiCaretUp,
  PiFile,
  PiCrown,
  PiUser,
} from 'react-icons/pi';

interface OwnerMessageEventProps {
  event: JobEventWithDiffs;
  users: Record<string, User>;
  currentUser?: User | null;
  job?: Job;
}

const OwnerMessageEvent: React.FC<OwnerMessageEventProps> = ({
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
  const senderName = sender?.name || 'Job Creator';

  // Check if current user is the sender
  const isCurrentUser = currentUser?.address_ === senderAddress;

  // Get recipient info
  const recipientAddress = messageDetails?.recipientAddress;
  const recipient = recipientAddress ? users[recipientAddress] : null;
  const recipientName = recipient?.name || 'User';

  const rawMessage = messageDetails?.message || '';

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
      <div className='relative'>
        {sender?.avatar ? (
          <ProfileImage
            user={sender}
            className='h-10 w-10 rounded-full ring-4 ring-white dark:ring-gray-900'
          />
        ) : (
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 ring-4 ring-white dark:ring-gray-900'>
            <PiUser className='h-5 w-5 text-white' />
          </div>
        )}
        <div className='absolute -bottom-1 -right-1 rounded-full bg-purple-500 p-1'>
          <PiCrown className='h-3 w-3 text-white' />
        </div>
      </div>

      <div className='min-w-0 flex-1'>
        <div className='rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-sm dark:from-purple-950/20 dark:to-pink-950/20'>
          {/* Message Header */}
          <div className='mb-2 flex items-start justify-between'>
            <div>
              <div className='flex items-center gap-2'>
                {isCurrentUser ? (
                  <span className='font-semibold text-purple-600 dark:text-purple-400'>
                    You
                  </span>
                ) : (
                  <Link
                    href={`/dashboard/users/${senderAddress}`}
                    className='group inline-flex items-center gap-1 font-semibold text-gray-900 transition-colors hover:text-purple-600 dark:text-gray-100 dark:hover:text-purple-400'
                  >
                    {senderName}
                    <span className='ml-1 rounded bg-purple-100 px-1.5 py-0.5 text-xs text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'>
                      Creator
                    </span>
                    <PiArrowRight className='h-3 w-3 transform opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100' />
                  </Link>
                )}

                {recipient && (
                  <>
                    <span className='text-xs text-gray-400'>to</span>
                    <Link
                      href={`/dashboard/users/${recipientAddress}`}
                      className='text-sm font-medium text-gray-600 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:text-purple-400'
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
            <Markdown className='text-gray-700 dark:text-gray-300'>
              {displayContent || 'No message content'}
            </Markdown>
          </div>

          {/* File Indicator */}
          {isFormatted && (
            <div className='mt-3 inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 dark:border-purple-800 dark:bg-purple-950/20'>
              <PiFile className='h-4 w-4 text-purple-600 dark:text-purple-400' />
              <span className='text-xs text-purple-700 dark:text-purple-300'>
                File attachment
              </span>
            </div>
          )}

          {/* Read More/Less Toggle */}
          {shouldTruncate && (
            <button
              onClick={toggleExpanded}
              className='mt-2 flex items-center gap-1 text-xs font-medium text-purple-600 transition-colors hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300'
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

export default OwnerMessageEvent;
