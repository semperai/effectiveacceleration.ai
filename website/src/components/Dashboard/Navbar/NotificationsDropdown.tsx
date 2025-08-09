// src/components/Dashboard/Navbar/NotificationsDropdown.tsx
import { forwardRef, useState, useEffect, useRef } from 'react';
import { Notification } from '@/service/Interfaces';
import { NotificationItem } from './NotificationItem';
import { PiCheck, PiEye, PiEyeSlash } from 'react-icons/pi';

interface NotificationsDropdownProps {
  notifications: Notification[];
  onReadNotification: (notification: Notification) => void;
  onReadAll: () => void;
  onClose: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

export const NotificationsDropdown = forwardRef<
  HTMLDivElement,
  NotificationsDropdownProps
>(({ notifications, onReadNotification, onReadAll, onClose, onLoadMore, hasMore }, ref) => {
  const [showAll, setShowAll] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);

  const displayedNotifications = showAll
    ? notifications
    : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Infinite scroll implementation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreTriggerRef.current) {
      observer.observe(loadMoreTriggerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, onLoadMore]);

  const handleNotificationClick = (notification: Notification) => {
    onReadNotification(notification);
    onClose();
  };

  return (
    <div
      ref={ref}
      className='absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] origin-top-right animate-in fade-in slide-in-from-top-1 duration-200'
      style={{ zIndex: 9999 }}
    >
      {/* Arrow pointing to button */}
      <div className='absolute -top-2 right-4 h-4 w-4'>
        <div className='h-4 w-4 rotate-45 transform bg-white border-l border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700' />
      </div>

      <div className='rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-900 dark:ring-gray-700'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className='rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'>
                {unreadCount} new
              </span>
            )}
          </div>
          <div className='flex items-center gap-1'>
            <button
              onClick={() => setShowAll(!showAll)}
              className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              title={showAll ? 'Show unread only' : 'Show all notifications'}
            >
              {showAll ? (
                <PiEyeSlash className='h-4 w-4' />
              ) : (
                <PiEye className='h-4 w-4' />
              )}
            </button>
            {unreadCount > 0 && (
              <button
                onClick={onReadAll}
                className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                title='Mark all as read'
              >
                <PiCheck className='h-4 w-4' />
              </button>
            )}
          </div>
        </div>

        {/* Notifications list */}
        <div
          ref={scrollContainerRef}
          className='max-h-[28rem] overflow-y-auto overscroll-contain'
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgb(203 213 225) transparent',
          }}
        >
          {displayedNotifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
              <svg
                className='mb-3 h-12 w-12 text-gray-300 dark:text-gray-600'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                />
              </svg>
              <p className='text-sm font-medium'>No notifications</p>
              <p className='text-xs text-gray-400 dark:text-gray-500'>
                {showAll ? 'You have no notifications' : 'All caught up!'}
              </p>
            </div>
          ) : (
            <>
              <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                {displayedNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onRead={onReadNotification}
                    onClick={handleNotificationClick}
                  />
                ))}
              </div>
              {hasMore && (
                <div
                  ref={loadMoreTriggerRef}
                  className='flex items-center justify-center py-3'
                >
                  <div className='flex items-center gap-2 text-xs text-gray-500'>
                    <div className='h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-transparent' />
                    Loading more...
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer - optional */}
        {displayedNotifications.length > 0 && (
          <div className='border-t border-gray-200 px-4 py-2 dark:border-gray-700'>
            <button
              onClick={onClose}
              className='w-full rounded-lg py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
