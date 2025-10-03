import type { JobEvent } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_JOB_EVENTS } from './queries';

export default function useJobEvents(jobId: string) {
  const [result] = useQuery({
    query: GET_JOB_EVENTS,
    variables: { jobId },
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.jobEvents as JobEvent[]) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [jobId, result]
  );
}
