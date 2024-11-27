import { Job } from '@effectiveacceleration/contracts'
import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_CREATOR_TAKEN_JOBS } from './queries'

export default function useCreatorTakenJobs(creatorAddress: string) {
  const { data, ...rest } = useQuery(GET_CREATOR_TAKEN_JOBS, {
    variables: { creatorAddress},
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [data, rest],
  );
}
