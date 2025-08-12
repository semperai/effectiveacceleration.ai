// src/components/Dashboard/Navbar/NotificationItem.tsx
import Link from 'next/link';
import moment from 'moment';
import { Check, ChevronRight } from 'lucide-react';
import type { NotificationWithJob } from '@/hooks/subsquid/useUserNotifications';
import { getNotificationContent } from '@/lib/notificationUtils';
import { useAccount } from 'wagmi';
import { JobEventType } from '@effectiveacceleration/contracts';

interface NotificationItemProps {
  notification: NotificationWithJob;
  onRead: (notification: NotificationWithJob) => void;
  onClick: (notification: NotificationWithJob) => void;
  messageContent?: string;
  isLoadingMessage?: boolean;
}

export const NotificationItem = ({
  notification,
  onRead,
  onClick,
  messageContent,
  isLoadingMessage = false,
}: NotificationItemProps) => {
  const { address } = useAccount();
  const formattedTime = moment(notification.timestamp * 1000).fromNow();
  const isUnread = !notification.read;

  // Check if this is a message notification
  const isMessage =
    notification.type === JobEventType.OwnerMessage ||
    notification.type === JobEventType.WorkerMessage;

  // Use the enhanced notification with message content
  const enhancedNotification = { ...notification, messageContent };
  const content = getNotificationContent(enhancedNotification, address);

  // Format job title with ID
  const jobTitle = notification.job?.title
    ? `#${notification.jobId} ${notification.job.title}`
    : `#${notification.jobId}`;

  // Truncate job title if too long
  const truncatedJobTitle =
    jobTitle.length > 30 ? `${jobTitle.substring(0, 30)}...` : jobTitle;

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRead(notification);
  };

  const getPriorityIndicator = () => {
    if (!isUnread) return null;

    switch (content.priority) {
      case 'high':
        return (
          <div className='absolute bottom-0 left-0 top-0 w-1 rounded-l bg-rose-500' />
        );
      case 'medium':
        return (
          <div className='absolute bottom-0 left-0 top-0 w-1 rounded-l bg-amber-500' />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`group relative transition-all duration-200 ${
        isUnread
          ? 'bg-blue-50/30 hover:bg-blue-50/50 dark:bg-blue-950/10 dark:hover:bg-blue-950/20'
          : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
      }`}
    >
      {getPriorityIndicator()}

      <Link
        href={`/dashboard/jobs/${notification.jobId}?eventId=${notification.id}`}
        className='flex items-start gap-3 px-4 py-3.5'
        onClick={() => onClick(notification)}
      >
        {/* Content - removed icon container */}
        <div className='min-w-0 flex-1 space-y-1'>
          <div className='flex items-start justify-between gap-2'>
            {/* Title with inline icon */}
            <div
              className={`flex items-center gap-1.5 text-sm leading-tight ${
                isUnread
                  ? 'font-semibold text-gray-900 dark:text-gray-100'
                  : 'font-medium text-gray-700 dark:text-gray-300'
              }`}
            >
              {content.icon && (
                <span
                  className={`flex-shrink-0 ${
                    isUnread
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {content.icon}
                </span>
              )}
              <span>{content.title}</span>
            </div>

            {/* Job Title Pill */}
            <span className='inline-flex flex-shrink-0 items-center rounded-md border border-gray-200 bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400'>
              {truncatedJobTitle}
            </span>
          </div>

          {/* Message content or description */}
          <div
            className={`text-sm leading-relaxed ${
              isUnread
                ? 'text-gray-600 dark:text-gray-300'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {isMessage && isLoadingMessage ? (
              // Loading skeleton for message content - stays until content is ready
              <div className='space-y-1'>
                <div className='h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                <div className='h-3 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              </div>
            ) : (
              <p className='line-clamp-2'>{content.description}</p>
            )}
          </div>

          <p className='text-xs text-gray-400 dark:text-gray-500'>
            {formattedTime}
          </p>
        </div>

        {/* Actions */}
        <div className='flex flex-shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
          {isUnread && (
            <button
              onClick={handleMarkAsRead}
              className='rounded-lg p-1.5 transition-colors hover:bg-white dark:hover:bg-gray-700'
              title='Mark as read'
            >
              <Check className='h-3.5 w-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200' />
            </button>
          )}
          <ChevronRight className='h-4 w-4 text-gray-400' />
        </div>
      </Link>
    </div>
  );
};
