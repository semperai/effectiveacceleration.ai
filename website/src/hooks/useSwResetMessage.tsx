import { useEffect, useState } from 'react';
import type { JobEvent } from '@effectiveacceleration/contracts';
import { useClient } from 'urql';

type JobEventMessage = Omit<JobEvent, 'data_' | 'details'>;

// this hook will reset the graphql cache upon a sw notification about a job event or all events if jobId is undefined
export const useSwResetMessage = (jobId?: string) => {
  const urqlClient = useClient();
  const [resets, setResets] = useState(0);

  useEffect(() => {
    const channel = new BroadcastChannel('sw-messages');
    channel.onmessage = (event: {
      data: { body: string; data: JobEventMessage };
    }) => {
      if (
        jobId === undefined ||
        String(event.data?.data?.jobId ?? -1n) === jobId
      ) {
        // URQL doesn't need manual cache reset - it handles this automatically
        // The cache will be invalidated when new queries are made
        setResets((prev) => prev + 1);
      }
    };

    return () => {
      channel.close();
    };
  }, [setResets]);

  return { resets };
};
