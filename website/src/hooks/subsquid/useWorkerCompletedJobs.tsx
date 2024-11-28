import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WORKER_COMPLETED_JOBS } from './queries';

export default function useCreatorTakenJobs(workerAddress: string) {
  const { data, ...rest } = useQuery(GET_WORKER_COMPLETED_JOBS, {
    variables: { workerAddress },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [data, rest]
  );
}
