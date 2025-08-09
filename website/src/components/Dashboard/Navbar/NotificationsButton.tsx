// src/components/Dashboard/Navbar/NotificationsButton.tsx
import { useCallback, useEffect, useRef, useState } from 'react';
import { PiBellSimple } from 'react-icons/pi';
import { useAccount } from 'wagmi';
import useUserNotifications from '@/hooks/subsquid/useUserNotifications';
import type { NotificationWithJob } from '@/hooks/subsquid/useUserNotifications';
import { NotificationsDropdown } from './NotificationsDropdown';

export const NotificationsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address } = useAccount();
  
  const [limit, setLimit] = useState(20);
  const { data: notifications, refetch } = useUserNotifications(
    address ?? '',
    undefined,
    0,
    limit
  );

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const readNotification = useCallback((notification: NotificationWithJob) => {
    const readNotifications = new Set<string>(
      JSON.parse(localStorage.getItem('ReadNotifications') ?? '[]')
    );
    readNotifications.add(notification.id);
    localStorage.setItem(
      'ReadNotifications',
      JSON.stringify([...readNotifications])
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'ReadNotifications' })
    );
  }, []);

  const readAllNotifications = useCallback(() => {
    const readNotifications = new Set<string>(
      JSON.parse(localStorage.getItem('ReadNotifications') ?? '[]')
    );
    notifications?.forEach((n) => readNotifications.add(n.id));
    localStorage.setItem(
      'ReadNotifications',
      JSON.stringify([...readNotifications])
    );
    window.dispatchEvent(
      new StorageEvent('storage', { key: 'ReadNotifications' })
    );
  }, [notifications]);

  const loadMoreNotifications = useCallback(() => {
    setLimit(prev => prev + 20);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className='relative'>
      <button
        ref={buttonRef}
        className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700'
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`${unreadCount} unread notifications`}
        aria-expanded={isOpen}
        aria-haspopup='true'
      >
        <PiBellSimple className='h-5 w-5 text-gray-600 dark:text-gray-400' />
        {unreadCount > 0 && (
          <span className='absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white'>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationsDropdown
          ref={dropdownRef}
          notifications={notifications ?? []}
          onReadNotification={readNotification}
          onReadAll={readAllNotifications}
          onClose={() => setIsOpen(false)}
          onLoadMore={loadMoreNotifications}
          hasMore={notifications?.length === limit}
        />
      )}
    </div>
  );
};
