import { useEffect, useState } from 'react';
import type { JobEvent } from '@effectiveacceleration/contracts';
import { useClient } from 'urql';
import { useCacheInvalidation } from '@/contexts/CacheInvalidationContext';

type JobEventMessage = Omit<JobEvent, 'data_' | 'details'>;

// this hook will reset the graphql cache upon a sw notification about a job event or all events if jobId is undefined
export const useSwResetMessage = (jobId?: string) => {
  const urqlClient = useClient();
  const { invalidate } = useCacheInvalidation();
  const [resets, setResets] = useState(0);

  useEffect(() => {
    if (!('BroadcastChannel' in window)) {
      console.error('BroadcastChannel API not supported in this browser');
      return;
    }

    const channel = new BroadcastChannel('sw-messages');
    channel.onmessage = (event: {
      data: { body: string; data: JobEventMessage };
    }) => {
      if (
        jobId === undefined ||
        String(event.data?.data?.jobId ?? -1n) === jobId
      ) {
        // Trigger cache invalidation to force all URQL queries to refetch
        invalidate();
        setResets((prev) => prev + 1);
      }
    };

    return () => {
      channel.close();
    };
  }, [invalidate, jobId]);

  return { resets };
};
