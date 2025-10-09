import type { JobEvent } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_JOB_EVENTS } from './queries';
import { useCacheInvalidation } from '@/contexts/CacheInvalidationContext';

export default function useJobEvents(jobId: string) {
  const { timestamp } = useCacheInvalidation();

  const [result] = useQuery({
    query: GET_JOB_EVENTS,
    variables: { jobId },
    requestPolicy: 'cache-and-network',
    context: useMemo(() => ({
      _invalidationTimestamp: timestamp,
    }), [timestamp]),
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.jobEvents as JobEvent[]) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [result]
  );
}
