import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_CREATOR_CLOSED_JOBS } from './queries';
import type { OrderByType } from '@/service/Interfaces';

export default function useCreatorClosedJobs(
  creatorAddress: string,
  orderBy?: OrderByType
) {
  const [result] = useQuery({
    query: GET_CREATOR_CLOSED_JOBS,
    variables: { creatorAddress, ...(orderBy && { orderBy }) },
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
