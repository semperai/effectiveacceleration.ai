import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_WORKER_TAKEN_JOBS } from './queries';
import type { OrderByType } from '@/service/Interfaces';

export default function useCreatorTakenJobs(
  workerAddress: string,
  orderBy?: OrderByType
) {
  const [result] = useQuery({
    query: GET_WORKER_TAKEN_JOBS,
    variables: { workerAddress, ...(orderBy && { orderBy }) },
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.jobs as Job[]) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [result]
  );
}
