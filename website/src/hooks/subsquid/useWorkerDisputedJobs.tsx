import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_WORKER_DISPUTED_JOBS } from './queries';
import type { OrderByType } from '@/service/Interfaces';

export default function useCreatorDisputedJobs(
  creatorAddress: string,
  orderBy?: OrderByType
) {
  const { data, ...rest } = useQuery(GET_WORKER_DISPUTED_JOBS, {
    variables: { creatorAddress, ...(orderBy && { orderBy }) },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [data, rest]
  );
}
