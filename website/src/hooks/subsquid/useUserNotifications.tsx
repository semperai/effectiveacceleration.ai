// src/hooks/subsquid/useUserNotifications.tsx
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_NOTIFICATIONS } from './queries';
import useJobsByIds from './useJobsByIds';
import useJobEventsWithDiffs from './useJobEventsWithDiffs';
import { Job, JobEventType, JobMessageEvent } from '@effectiveacceleration/contracts';

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
  const { data, loading, error, ...rest } = useQuery(GET_USER_NOTIFICATIONS, {
    variables: {
      userAddress: userAddress ?? '',
      minTimestamp: minTimestamp ?? 0,
      offset: offset ?? 0,
      limit: limit ?? 10,
    },
    skip: !userAddress,
  });

  // Extract unique job IDs from notifications
  const jobIds = useMemo(() => {
    if (!data?.notifications) return [];
    const ids = data.notifications
      .map((n: any) => n.jobId)
      .filter((id: string) => id);
    return [...new Set(ids)];
  }, [data]);

  // Fetch all jobs for the notifications
  const { data: jobs } = useJobsByIds(jobIds);

  const [notifications, setNotifications] = useState<NotificationWithJob[] | undefined>();

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
    jobsData?.forEach(job => {
      jobMap.set(job.id, job);
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
    if (data?.notifications) {
      const processed = processNotifications(data.notifications, jobs);
      setNotifications(processed);
    }
  }, [data, jobs]);

  // Listen for storage events to update read status
  useEffect(() => {
    const handler = (event: StorageEvent) => {
      if (event.key === 'ReadNotifications' && data?.notifications) {
        const processed = processNotifications(data.notifications, jobs);
        setNotifications(processed);
      }
    };

    window.addEventListener('storage', handler);
    
    return () => {
      window.removeEventListener('storage', handler);
    };
  }, [data, jobs]);

  return useMemo(
    () => ({ 
      data: notifications, 
      loading: loading || !jobs,
      error,
      ...rest 
    }),
    [notifications, loading, error, jobs, rest]
  );
}
