import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_JOBS_BY_IDS } from './queries';

export default function useJobsByIds(jobIds: string[]) {
  const [result] = useQuery({
    query: GET_JOBS_BY_IDS,
    variables: { jobIds: jobIds ?? [] },
    pause: !jobIds?.length,
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.jobs as Job[]) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [jobIds, result]
  );
}
