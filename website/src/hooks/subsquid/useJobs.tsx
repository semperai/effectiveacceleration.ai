import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOBS } from './queries';

export default function useJobs(offset: number = 0, limit: number = 0) {
  const { data, ...rest } = useQuery(GET_JOBS, {
    variables: { offset, limit: limit === 0 ? 1000 : limit },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [offset, limit, data, rest]
  );
}
