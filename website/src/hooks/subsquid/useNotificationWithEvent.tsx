import { useEffect, useState } from 'react';
import useJobEventsWithDiffs from './useJobEventsWithDiffs';
import { JobEventType, JobMessageEvent } from '@effectiveacceleration/contracts';
import { NotificationWithJob } from './useUserNotifications';

/**
 * Hook to fetch the actual message content for a notification
 * Use this when displaying individual notifications that need message content
 */
export default function useNotificationWithEvent(
  notification: NotificationWithJob | undefined,
  shouldFetch: boolean = true
) {
  const [messageContent, setMessageContent] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  
  // Only fetch events for message notifications when enabled
  const shouldFetchEvents = shouldFetch && notification && (
    notification.type === JobEventType.OwnerMessage || 
    notification.type === JobEventType.WorkerMessage
  );
  
  const { data: events, loading } = useJobEventsWithDiffs(
    shouldFetchEvents ? notification.jobId : ''
  );

  useEffect(() => {
    if (!notification || !shouldFetchEvents) {
      setMessageContent(undefined);
      setIsLoading(false);
      return;
    }

    // Set loading state
    setIsLoading(loading);

    if (!events || loading) {
      return;
    }

    // Find the matching event by timestamp and type
    const matchingEvent = events.find(event => 
      event.timestamp_ === notification.timestamp &&
      event.type_ === notification.type
    );

    if (matchingEvent && matchingEvent.details) {
      const messageDetails = matchingEvent.details as JobMessageEvent;
      if (messageDetails.content) {
        setMessageContent(messageDetails.content);
      } else {
        // If no content found, set to undefined so we show fallback
        setMessageContent(undefined);
      }
    } else {
      setMessageContent(undefined);
    }
    
    setIsLoading(false);
  }, [notification, events, shouldFetchEvents, loading]);

  return {
    messageContent,
    isLoading
  };
}
