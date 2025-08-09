// src/components/Dashboard/Navbar/NotificationsDropdown.tsx
import { forwardRef, useState, useEffect, useRef } from 'react';
import { NotificationWithJob } from '@/hooks/subsquid/useUserNotifications';
import { NotificationItem } from './NotificationItem';
import { CheckCheck, Eye, EyeOff, X, BellOff } from 'lucide-react';
import { createPortal } from 'react-dom';
import { JobEventType } from '@effectiveacceleration/contracts';
import useNotificationWithEvent from '@/hooks/subsquid/useNotificationWithEvent';

interface NotificationsDropdownProps {
  notifications: NotificationWithJob[];
  onReadNotification: (notification: NotificationWithJob) => void;
  onReadAll: () => void;
  onClose: () => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const NOTIFICATION_VIEW_PREFERENCE_KEY = 'notificationViewPreference';

// Component to handle individual message fetching using the working hook
function MessageNotificationWrapper({
  notification,
  onRead,
  onClick
}: {
  notification: NotificationWithJob;
  onRead: (notification: NotificationWithJob) => void;
  onClick: (notification: NotificationWithJob) => void;
}) {
  const isMessage = notification.type === JobEventType.OwnerMessage || 
                   notification.type === JobEventType.WorkerMessage;
  
  // Use the working hook for message notifications
  const { messageContent, isLoading } = useNotificationWithEvent(
    isMessage ? notification : undefined,
    isMessage
  );

  // Debug log
  useEffect(() => {
    if (isMessage) {
      console.log('[MessageNotificationWrapper] State for notification:', {
        notificationId: notification.id,
        isLoading,
        hasContent: !!messageContent,
        contentPreview: messageContent?.substring(0, 50)
      });
    }
  }, [isMessage, notification.id, isLoading, messageContent]);

  return (
    <NotificationItem
      notification={notification}
      onRead={onRead}
      onClick={onClick}
      messageContent={messageContent}
      isLoadingMessage={isLoading}
    />
  );
}

export const NotificationsDropdown = forwardRef<
  HTMLDivElement,
  NotificationsDropdownProps
>(({ notifications, onReadNotification, onReadAll, onClose, onLoadMore, hasMore }, ref) => {
  // Initialize showAll from localStorage, defaulting to false (show unread only)
  const [showAll, setShowAll] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(NOTIFICATION_VIEW_PREFERENCE_KEY);
      return saved === 'true';
    }
    return false;
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const innerContentRef = useRef<HTMLDivElement>(null);

  const displayedNotifications = showAll
    ? notifications
    : notifications.filter((n) => !n.read);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Count message notifications for debugging
  const messageNotificationCount = displayedNotifications.filter(
    n => n.type === JobEventType.OwnerMessage || n.type === JobEventType.WorkerMessage
  ).length;

  console.log('[NotificationsDropdown] Render state:', {
    totalDisplayed: displayedNotifications.length,
    messageNotifications: messageNotificationCount,
    unreadCount,
    showAll
  });

  // Smooth height animation using ResizeObserver
  useEffect(() => {
    if (!scrollContainerRef.current || !innerContentRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const innerContent = innerContentRef.current;
    const maxHeight = isMobile ? window.innerHeight - 128 : 448;

    // Create ResizeObserver to watch for content size changes
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { height } = entry.contentRect;
        const targetHeight = Math.min(height, maxHeight);
        
        // Only update if height actually changed
        if (scrollContainer.style.height !== `${targetHeight}px`) {
          // Add transition class if not already present
          if (!scrollContainer.classList.contains('transition-[height]')) {
            scrollContainer.classList.add('transition-[height]', 'duration-300', 'ease-in-out');
          }
          
          // Update height
          scrollContainer.style.height = `${targetHeight}px`;
        }
      }
    });

    // Start observing
    resizeObserver.observe(innerContent);

    // Set initial height
    const initialHeight = Math.min(innerContent.scrollHeight, maxHeight);
    scrollContainer.style.height = `${initialHeight}px`;

    return () => {
      resizeObserver.disconnect();
    };
  }, [isMobile, displayedNotifications.length, showAll]);

  // Persist view preference when it changes
  const handleToggleView = () => {
    const newValue = !showAll;
    setShowAll(newValue);
    localStorage.setItem(NOTIFICATION_VIEW_PREFERENCE_KEY, String(newValue));
  };

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when mobile modal is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile]);

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

  const handleNotificationClick = (notification: NotificationWithJob) => {
    onReadNotification(notification);
    onClose();
  };

  const dropdownContent = (
    <>
      {/* Header */}
      <div className='flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700'>
        <div className='flex items-center gap-2'>
          <h3 className='text-sm font-semibold text-gray-900 dark:text-gray-100'>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className='rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'>
              {unreadCount} unread
            </span>
          )}
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={handleToggleView}
            className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
            title={showAll ? 'Show unread only' : 'Show all notifications'}
          >
            {showAll ? (
              <EyeOff className='h-4 w-4' />
            ) : (
              <Eye className='h-4 w-4' />
            )}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={onReadAll}
              className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
              title='Mark all as read'
            >
              <CheckCheck className='h-4 w-4' />
            </button>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className='rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 sm:hidden'
              title='Close notifications'
            >
              <X className='h-5 w-5' />
            </button>
          )}
        </div>
      </div>

      {/* Notifications list with smooth height transition */}
      <div
        ref={scrollContainerRef}
        className='relative overflow-y-auto transition-[height] duration-300 ease-in-out'
        style={{
          maxHeight: isMobile ? 'calc(100vh - 8rem)' : '28rem',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(203 213 225) transparent',
        }}
      >
        <div ref={innerContentRef}>
          {displayedNotifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 text-gray-500'>
              <BellOff className='mb-3 h-12 w-12 text-gray-300 dark:text-gray-600' />
              <p className='text-sm font-medium'>No notifications</p>
              <p className='text-xs text-gray-400 dark:text-gray-500'>
                {showAll ? 'You have no notifications' : 'All caught up!'}
              </p>
            </div>
          ) : (
            <>
              <div className='divide-y divide-gray-100 dark:divide-gray-800'>
                {displayedNotifications.map((notification) => {
                  const isMessage = notification.type === JobEventType.OwnerMessage || 
                                  notification.type === JobEventType.WorkerMessage;
                  
                  // Use the wrapper component for message notifications
                  // This uses the working useNotificationWithEvent hook
                  if (isMessage) {
                    return (
                      <MessageNotificationWrapper
                        key={notification.id}
                        notification={notification}
                        onRead={onReadNotification}
                        onClick={handleNotificationClick}
                      />
                    );
                  }
                  
                  // For non-message notifications, use the regular component
                  return (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={onReadNotification}
                      onClick={handleNotificationClick}
                      messageContent={undefined}
                      isLoadingMessage={false}
                    />
                  );
                })}
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
      </div>

      {/* Footer - only show on desktop */}
      {!isMobile && displayedNotifications.length > 0 && (
        <div className='border-t border-gray-200 px-4 py-2 dark:border-gray-700'>
          <button
            onClick={onClose}
            className='w-full rounded-lg py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
          >
            Close
          </button>
        </div>
      )}
    </>
  );

  // Mobile: Full-screen modal
  if (isMobile) {
    return createPortal(
      <div className='fixed inset-0 z-[10000] sm:hidden'>
        {/* Backdrop */}
        <div 
          className='absolute inset-0 bg-black/50 backdrop-blur-sm'
          onClick={onClose}
        />
        
        {/* Modal content - slides up from bottom */}
        <div 
          ref={ref}
          className='absolute inset-x-0 bottom-0 animate-in slide-in-from-bottom duration-300'
        >
          <div className='rounded-t-2xl bg-white shadow-xl dark:bg-gray-900'>
            {/* Drag handle indicator */}
            <div className='flex justify-center py-2'>
              <div className='h-1 w-12 rounded-full bg-gray-300 dark:bg-gray-700' />
            </div>
            {dropdownContent}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // Desktop: Dropdown
  return (
    <div
      ref={ref}
      className='absolute right-0 mt-2 hidden w-96 max-w-[calc(100vw-2rem)] origin-top-right animate-in fade-in slide-in-from-top-1 duration-200 sm:block'
      style={{ zIndex: 9999 }}
    >
      {/* Arrow pointing to button */}
      <div className='absolute -top-2 right-4 h-4 w-4'>
        <div className='h-4 w-4 rotate-45 transform bg-white border-l border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700' />
      </div>

      <div className='rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-900 dark:ring-gray-700'>
        {dropdownContent}
      </div>
    </div>
  );
});

NotificationsDropdown.displayName = 'NotificationsDropdown';
