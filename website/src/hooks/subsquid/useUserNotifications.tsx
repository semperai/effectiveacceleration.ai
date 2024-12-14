import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_NOTIFICATIONS } from './queries';
import { Notification } from '@/service/Interfaces';

export default function useUserJobNotifications(
  userAddress: string,
  minTimestamp?: number,
  offset?: number,
  limit?: number
) {
  const { data, ...rest } = useQuery(GET_USER_NOTIFICATIONS, {
    variables: {
      userAddress: userAddress ?? '',
      minTimestamp: minTimestamp ?? 0,
      offset: offset ?? 0,
      limit: limit ?? 10,
    },
    skip: !userAddress,
  });

  const [notifications, setNotifications] = useState<
    Notification[] | undefined
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
        const notifications = data.notifications.map(
          (notification: Notification) => {
            const copy = { ...notification };

            copy.read = readNotifications.includes(notification.id);
            return copy;
          }
        );
        setNotifications(notifications);
      }
    };
    window.addEventListener('storage', handler);
    handler({ key: 'ReadNotifications' } as StorageEvent);

    return () => {
      window.removeEventListener('storage', handler, true);
    };
  }, [data]);

  return useMemo(
    () => ({ data: notifications, ...rest }),
    [userAddress, notifications, rest]
  );
}
