import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOBS_BY_IDS } from './queries';

export default function useJobsByIds(jobIds: string[]) {
  const { data, ...rest } = useQuery(GET_JOBS_BY_IDS, {
    variables: { jobIds: jobIds ?? [] },
    skip: !jobIds?.length,
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [jobIds, data, rest]
  );
}
