import useUserNotifications from '@/hooks/subsquid/useUserNotifications';
import { EventTextMap } from '@/lib/utils';
import { Notification } from '@/service/Interfaces';
import { Dialog, Transition } from '@headlessui/react';
import Link from 'next/link';
import { Fragment, useCallback, useState } from 'react';
import { PiBellSimple, PiCheck, PiEye, PiEyeSlash } from 'react-icons/pi';
import { useAccount } from 'wagmi';
import { Button } from '@/components/Button';
import moment from 'moment';

const NotificationItem = ({
  notification,
  onRead,
  onSelect,
}: {
  notification: Notification;
  onRead: (notification: Notification) => void;
  onSelect: (notification: Notification) => void;
}) => {
  const formattedTime = moment(notification.timestamp * 1000).fromNow();

  return (
    <div
      className={`flex flex-col rounded-lg p-3 ${notification.read ? 'bg-white' : 'bg-primary bg-opacity-10'} transition-colors hover:bg-gray-50`}
    >
      <div className='flex items-center justify-between'>
        <Link
          href={`/dashboard/jobs/${notification.jobId}?eventId=${notification.id}`}
          className='flex-1 text-sm text-gray-700 hover:text-gray-900'
          onClick={() => onSelect(notification)}
        >
          {EventTextMap(notification.type, notification.jobId)}
        </Link>
        {!notification.read && (
          <Button
            onClick={() => onRead(notification)}
            outline
            title='Mark as read'
          >
            <PiCheck className='h-5 w-5' />
          </Button>
        )}
      </div>
      <span className='mt-1 text-xs text-gray-500'>{formattedTime}</span>
    </div>
  );
};

const NotificationsList = ({
  notifications,
  onRead,
  onSelect,
  limit,
}: {
  notifications: Notification[];
  onRead: (notification: Notification) => void;
  onSelect: (notification: Notification) => void;
  limit: number;
}) => {
  if (notifications.length === 0) {
    return (
      <p className='py-4 text-center text-gray-500'>
        No notifications to display
      </p>
    );
  }

  return (
    <div className='space-y-2'>
      {notifications.slice(0, limit).map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRead={onRead}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export const NotificationsButton = () => {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [limit, setLimit] = useState(5);
  const account = useAccount();
  const { data: notifications } = useUserNotifications(account?.address ?? '');

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;
  const displayedNotifications = showAll
    ? notifications?.slice(0, limit)
    : notifications?.filter((n) => !n.read).slice(0, limit);

  const readNotification = useCallback((notification: Notification) => {
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

  const handleNotificationSelect = useCallback(
    (notification: Notification) => {
      readNotification(notification);
      setOpen(false);
    },
    [readNotification]
  );

  return (
    <div className='relative'>
      <button
        className='relative flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-all duration-200 hover:bg-gray-200'
        onClick={() => setOpen(true)}
        aria-label={`${unreadCount} unread notifications`}
      >
        <PiBellSimple className='h-5 w-5 text-gray-600' />
        {unreadCount > 0 && (
          <span className='absolute -right-1 -top-1 flex h-5 w-5 animate-pulse items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white'>
            {unreadCount}
          </span>
        )}
      </button>

      <Transition appear show={open} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-50'
          onClose={() => setOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter='ease-out duration-300'
            enterFrom='opacity-0'
            enterTo='opacity-100'
            leave='ease-in duration-200'
            leaveFrom='opacity-100'
            leaveTo='opacity-0'
          >
            <div className='fixed inset-0 bg-black/25 backdrop-blur-sm' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all'>
                  <div className='border-b border-gray-200 bg-gray-50 px-8 py-4'>
                    <div className='flex items-center justify-between'>
                      <Dialog.Title className='text-lg font-medium text-gray-900'>
                        Notifications
                      </Dialog.Title>
                      <div className='flex gap-2'>
                        <Button
                          onClick={() => setShowAll(!showAll)}
                          outline
                          title={
                            showAll
                              ? 'Show unread only'
                              : 'Show all notifications'
                          }
                        >
                          {showAll ? (
                            <PiEyeSlash className='h-5 w-5' />
                          ) : (
                            <PiEye className='h-5 w-5' />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className='px-8 py-4'>
                    <div className='mb-4 flex justify-between'>
                      <Button onClick={() => setLimit(limit + 5)} outline>
                        Load more
                      </Button>
                      <Button onClick={readAllNotifications} outline>
                        Mark all as read
                      </Button>
                    </div>

                    <NotificationsList
                      notifications={displayedNotifications ?? []}
                      onRead={readNotification}
                      onSelect={handleNotificationSelect}
                      limit={limit}
                    />
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};
