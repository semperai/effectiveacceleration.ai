import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { GET_USER_NOTIFICATIONS } from './queries';
import useJobsByIds from './useJobsByIds';
import useJobEventsWithDiffs from './useJobEventsWithDiffs';
import {
  type Job,
  JobEventType,
  JobMessageEvent,
} from '@effectiveacceleration/contracts';
import { useCacheInvalidation } from '@/contexts/CacheInvalidationContext';

export interface NotificationWithJob {
  id: string;
  type: number;
  timestamp: number;
  jobId: string;
  read: boolean;
  address?: string;
  job?: Job;
  messageContent?: string;
}

// Hook to fetch events for a single job (use when viewing notifications)
function useJobEventsForNotification(jobId: string, enabled: boolean) {
  const { data: events } = useJobEventsWithDiffs(jobId);
  return enabled ? events : undefined;
}

export default function useUserNotifications(
  userAddress: string,
  minTimestamp?: number,
  offset?: number,
  limit?: number,
  fetchMessageContent: boolean = false // Optional flag to enable message fetching
) {
  const { timestamp } = useCacheInvalidation();

  const [result] = useQuery({
    query: GET_USER_NOTIFICATIONS,
    variables: {
      userAddress: userAddress ?? '',
      minTimestamp: minTimestamp ?? 0,
      offset: offset ?? 0,
      limit: limit ?? 10,
    },
    pause: !userAddress,
    requestPolicy: 'cache-and-network',
    context: useMemo(() => ({
      _invalidationTimestamp: timestamp,
    }), [timestamp]),
  });

  // Extract unique job IDs from notifications with proper typing
  const jobIds = useMemo(() => {
    if (!result.data?.notifications) return [];

    const ids = result.data.notifications
      .map((n: any) => n.jobId as string) // Explicitly cast to string
      .filter((id: string): id is string => !!id); // Type guard to ensure non-empty strings

    return [...new Set(ids)] as string[]; // Ensure the result is string[]
  }, [result.data]);

  // Fetch all jobs for the notifications
  const { data: jobs } = useJobsByIds(jobIds);

  const [notifications, setNotifications] = useState<
    NotificationWithJob[] | undefined
  >();

  // Helper function to process notifications with read status and job data
  const processNotifications = (rawNotifications: any[], jobsData?: Job[]) => {
    if (!rawNotifications?.length) {
      return undefined;
    }

    const readNotifications = JSON.parse(
      localStorage.getItem('ReadNotifications') || '[]'
    ) as string[];

    // Create a map of jobs for quick lookup
    const jobMap = new Map<string, Job>();
    jobsData?.forEach((job) => {
      if (job?.id) {
        jobMap.set(job.id, job);
      }
    });

    return rawNotifications.map((notification: any) => ({
      id: notification.id,
      type: notification.type,
      timestamp: notification.timestamp,
      jobId: notification.jobId,
      read: readNotifications.includes(notification.id),
      address: notification.address,
      job: jobMap.get(notification.jobId),
      // Message content will be fetched separately if needed
      messageContent: undefined,
    }));
  };

  // Process notifications when data changes
  useEffect(() => {
    if (result.data?.notifications) {
      const processed = processNotifications(result.data.notifications, jobs);
      setNotifications(processed);
    }
  }, [result.data, jobs]);

  // Listen for storage events to update read status
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === 'ReadNotifications' && result.data?.notifications) {
        const processed = processNotifications(result.data.notifications, jobs);
        setNotifications(processed);
      }
    };

    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [result.data, jobs]);

  return useMemo(
    () => ({
      data: notifications,
      loading: result.fetching || !jobs,
      error: result.error,
    }),
    [notifications, result.fetching, result.error, jobs]
  );
}
