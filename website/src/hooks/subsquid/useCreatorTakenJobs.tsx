import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CREATOR_TAKEN_JOBS } from './queries';
import { OrderByType } from '@/service/Interfaces';

export default function useCreatorTakenJobs(
  creatorAddress: string,
  orderBy?: OrderByType
) {
  const { data, ...rest } = useQuery(GET_CREATOR_TAKEN_JOBS, {
    variables: { creatorAddress, ...(orderBy && { orderBy }) },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [data, rest]
  );
}
