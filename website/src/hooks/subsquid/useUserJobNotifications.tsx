import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_JOB_NOTIFICATIONS } from './queries';
import { Notification } from '@/service/Interfaces';

export default function useUserJobNotifications(
  userAddress: string,
  jobIds: string[],
  minTimestamp?: number,
  offset?: number,
  limit?: number
) {
  const { data, ...rest } = useQuery(GET_USER_JOB_NOTIFICATIONS, {
    variables: {
      userAddress: userAddress ?? '',
      minTimestamp: minTimestamp ?? 0,
      offset: offset ?? 0,
      limit: limit ?? 10,
    },
    skip: !userAddress || !jobIds.length,
  });

  const [notificationMap, setNotificationMap] = useState<
    Record<string, Notification[]> | undefined
  >();

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === 'ReadNotifications') {
        if (!data?.notifications.length) {
          return;
        }

        const readNotifications = JSON.parse(
          localStorage.getItem('ReadNotifications') || '[]'
        ) as string[];
        const notificationMap: Record<string, Notification[]> = {};
        data.notifications.map((notification: Notification) => {
          const copy = { ...notification };

          copy.read = readNotifications.includes(notification.id);

          if (!notificationMap[copy.jobId]) {
            notificationMap[copy.jobId] = [];
          }
          notificationMap[copy.jobId].push(copy);
        });
        setNotificationMap((prev) => ({ ...prev, ...notificationMap }));
      }
    };
    window.addEventListener('storage', handler);
    handler({ key: 'ReadNotifications' } as StorageEvent);

    return () => {
      window.removeEventListener('storage', handler, true);
    };
  }, [data]);

  return useMemo(
    () => ({ data: notificationMap, ...rest }),
    [userAddress, notificationMap, rest]
  );
}
