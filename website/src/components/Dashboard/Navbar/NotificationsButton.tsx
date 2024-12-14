import clsx from 'clsx';
import { useState, Fragment, useCallback } from 'react';
import { PiBellSimple, PiCheck } from 'react-icons/pi';
import { useAccount } from 'wagmi';
import useUserNotifications from '@/hooks/subsquid/useUserNotifications';
import { Dialog, Transition } from '@headlessui/react';
import { Notification } from '@/service/Interfaces';
import { JobEventType } from '@effectiveacceleration/contracts';
import Link from 'next/link';
import { EventTextMap } from '@/lib/utils';

export const NotificationsButton = () => {
  const [open, setOpen] = useState(false);
  const account = useAccount();
  const [limit, setLimit] = useState<number>(5);
  const { data: notifications } = useUserNotifications(account?.address ?? '');
  const notificationsCount =
    notifications?.filter((notification) => !notification.read).length ?? 0;

  const readAllNotifications = useCallback(() => {
    const readNotifications = new Set<string>(
      JSON.parse(localStorage.getItem('ReadNotifications') ?? '[]')
    );
    const countBefore = readNotifications.size;
    for (const notification of notifications ?? []) {
      readNotifications.add(notification.id);
    }
    if (countBefore === readNotifications.size) {
      return;
    }
    localStorage.setItem(
      'ReadNotifications',
      JSON.stringify([...readNotifications])
    );
    const event = new StorageEvent('storage', {
      key: 'ReadNotifications',
    });
    window.dispatchEvent(event);
  }, [notifications]);

  const readNotification = useCallback((notification: Notification) => {
    const readNotifications = new Set<string>(
      JSON.parse(localStorage.getItem('ReadNotifications') ?? '[]')
    );
    const countBefore = readNotifications.size;
    readNotifications.add(notification.id);
    if (countBefore === readNotifications.size) {
      return;
    }
    localStorage.setItem(
      'ReadNotifications',
      JSON.stringify([...readNotifications])
    );
    const event = new StorageEvent('storage', {
      key: 'ReadNotifications',
    });
    window.dispatchEvent(event);
  }, []);

  const notificationClick = useCallback(
    (notification: Notification) => {
      readNotification(notification);
      setOpen(false);
    },
    [readNotification]
  );

  return (
    <div className='relative'>
      <button
        className={clsx(
          'flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 transition-colors hover:bg-gray-200',
          {
            'text-gray-400': notificationsCount === 0,
            'text-gray-600': notificationsCount > 0,
          }
        )}
        aria-label={`${notificationsCount} notifications`}
        onClick={() => {
          if (notificationsCount > 0) setOpen(!open);
        }}
      >
        <PiBellSimple className='h-5 w-5' />

        {notificationsCount > 0 && (
          <span className='absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-medium text-white'>
            {notificationsCount.toString()}
          </span>
        )}
      </button>
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as='div'
          className='relative z-10'
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
            <div className='fixed inset-0 bg-black bg-opacity-25' />
          </Transition.Child>

          <div className='fixed inset-0 overflow-y-auto'>
            <div className='flex min-h-full items-center justify-center p-4 text-center'>
              <Transition.Child
                as={Fragment}
                enter='ease-out duration-300'
                enterFrom='opacity-0 scale-95'
                enterTo='opacity-100 scale-100'
                leave='ease-in duration-200'
                leaveFrom='opacity-100 scale-100'
                leaveTo='opacity-0 scale-95'
              >
                <Dialog.Panel className='w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all'>
                  <Dialog.Title
                    as='h3'
                    className='text-lg font-medium leading-6 text-gray-900'
                  >
                    Notifications
                  </Dialog.Title>
                  <div className='mb-3 mt-5 flex flex-col'>
                    <div className='flex flex-row justify-evenly'>
                      <button onClick={() => setLimit(limit + 5)}>
                        Load more
                      </button>
                      <button onClick={() => readAllNotifications()}>
                        Mark all as read
                      </button>
                    </div>
                    {notifications?.slice(0, limit).map((notification) => (
                      <div
                        key={notification.id}
                        className={clsx(
                          'flex px-1 py-2',
                          notification.read ? '' : 'bg-yellow-100'
                        )}
                      >
                        <Link
                          href={`/dashboard/jobs/${notification.jobId}?eventId=${notification.id}`}
                          className='flex w-full cursor-pointer'
                          onClick={() => notificationClick(notification)}
                        >
                          {EventTextMap(notification.type, notification.jobId)}
                        </Link>
                        <div className='flex-shrink cursor-pointer'>
                          <PiCheck
                            className='h-5 w-5'
                            onClick={() => readNotification(notification)}
                            title='Mark as read'
                          />
                        </div>
                      </div>
                    ))}
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
