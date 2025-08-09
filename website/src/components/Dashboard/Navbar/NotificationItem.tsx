// src/components/Dashboard/Navbar/NotificationItem.tsx
import Link from 'next/link';
import moment from 'moment';
import { Notification } from '@/service/Interfaces';
import { EventTextMap } from '@/lib/utils';
import { PiCheckCircle } from 'react-icons/pi';

interface NotificationItemProps {
  notification: Notification;
  onRead: (notification: Notification) => void;
  onClick: (notification: Notification) => void;
}

export const NotificationItem = ({
  notification,
  onRead,
  onClick,
}: NotificationItemProps) => {
  const formattedTime = moment(notification.timestamp * 1000).fromNow();
  const isUnread = !notification.read;

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRead(notification);
  };

  return (
    <div
      className={`group relative transition-colors ${
        isUnread
          ? 'bg-blue-50/50 hover:bg-blue-50 dark:bg-blue-950/20 dark:hover:bg-blue-950/30'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      }`}
    >
      <Link
        href={`/dashboard/jobs/${notification.jobId}?eventId=${notification.id}`}
        className='flex items-start gap-3 px-4 py-3'
        onClick={() => onClick(notification)}
      >
        {/* Read indicator */}
        <div className='mt-1.5 flex-shrink-0'>
          {isUnread ? (
            <div className='h-2 w-2 rounded-full bg-blue-500 ring-2 ring-blue-100 dark:ring-blue-900' />
          ) : (
            <div className='h-2 w-2 rounded-full bg-gray-300 dark:bg-gray-600' />
          )}
        </div>

        {/* Content */}
        <div className='min-w-0 flex-1'>
          <p className={`text-sm ${
            isUnread 
              ? 'font-medium text-gray-900 dark:text-gray-100' 
              : 'text-gray-700 dark:text-gray-300'
          }`}>
            {EventTextMap(notification.type, notification.jobId)}
          </p>
          <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
            {formattedTime}
          </p>
        </div>

        {/* Mark as read button */}
        {isUnread && (
          <button
            onClick={handleMarkAsRead}
            className='flex-shrink-0 rounded-lg p-1 opacity-0 transition-all hover:bg-white group-hover:opacity-100 dark:hover:bg-gray-700'
            title='Mark as read'
          >
            <PiCheckCircle className='h-4 w-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200' />
          </button>
        )}
      </Link>
    </div>
  );
};
