import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WORKER_COMPLETED_JOBS } from './queries';
import type { OrderByType } from '@/service/Interfaces';

export default function useCreatorTakenJobs(
  workerAddress: string,
  orderBy?: OrderByType
) {
  const { data, ...rest } = useQuery(GET_WORKER_COMPLETED_JOBS, {
    variables: { workerAddress, ...(orderBy && { orderBy }) },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [data, rest]
  );
}
