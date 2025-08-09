import type { JobEvent } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOB_EVENTS } from './queries';

export default function useJobEvents(jobId: string) {
  const { data, ...rest } = useQuery(GET_JOB_EVENTS, {
    variables: { jobId },
  });

  return useMemo(
    () => ({
      data: data ? (data?.jobEvents as JobEvent[]) : undefined,
      ...rest,
    }),
    [jobId, data, rest]
  );
}
