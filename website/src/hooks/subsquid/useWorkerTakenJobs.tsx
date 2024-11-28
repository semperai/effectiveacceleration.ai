import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WORKER_TAKEN_JOBS } from './queries';

export default function useCreatorTakenJobs(workerAddress: string) {
  const { data, ...rest } = useQuery(GET_WORKER_TAKEN_JOBS, {
    variables: { workerAddress },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [data, rest]
  );
}
