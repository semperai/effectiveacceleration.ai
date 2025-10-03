import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { GET_USER_JOB_NOTIFICATIONS } from './queries';
import type { Notification } from '@/service/Interfaces';

export default function useUserJobNotifications(
  userAddress: string,
  jobIds: string[],
  minTimestamp?: number,
  offset?: number,
  limit?: number
) {
  const [result] = useQuery({
    query: GET_USER_JOB_NOTIFICATIONS,
    variables: {
      userAddress: userAddress ?? '',
      minTimestamp: minTimestamp ?? 0,
      offset: offset ?? 0,
      limit: limit ?? 10,
    },
    pause: !userAddress || !jobIds.length,
  });

  const [notificationMap, setNotificationMap] = useState<
    Record<string, Notification[]> | undefined
  >();

  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === 'ReadNotifications') {
        if (!result.data?.notifications.length) {
          return;
        }

        const readNotifications = JSON.parse(
          localStorage.getItem('ReadNotifications') || '[]'
        ) as string[];
        const notificationMap: Record<string, Notification[]> = {};
        result.data.notifications.map((notification: Notification) => {
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
  }, [result.data]);

  return useMemo(
    () => ({
      data: notificationMap,
      loading: result.fetching,
      error: result.error
    }),
    [userAddress, notificationMap, result]
  );
}
