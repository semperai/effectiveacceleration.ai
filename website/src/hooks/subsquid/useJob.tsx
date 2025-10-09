import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_JOB_BY_ID } from './queries';
import { useCacheInvalidation } from '@/contexts/CacheInvalidationContext';

export default function useJob(id: string) {
  const { timestamp } = useCacheInvalidation();

  const [result] = useQuery({
    query: GET_JOB_BY_ID,
    variables: { jobId: id },
    requestPolicy: 'cache-and-network',
    context: useMemo(() => ({
      _invalidationTimestamp: timestamp,
    }), [timestamp]),
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.jobs[0] as Job) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [result]
  );
}
