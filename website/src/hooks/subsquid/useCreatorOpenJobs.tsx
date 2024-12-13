import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CREATOR_OPEN_JOBS } from './queries';


export enum OrderByType {
  JobTimesOpenedAtAscNullsLast = "jobTimes_openedAt_ASC_NULLS_LAST",
  JobTimesCreatedAtDesc = "jobTimes_createdAt_DESC",
  // Add other possible values here
}

export default function useCreatorOpenJobs(creatorAddress: string, orderBy?: OrderByType) {
  const { data, ...rest } = useQuery(GET_CREATOR_OPEN_JOBS, {
    variables: { creatorAddress, orderBy: OrderByType.JobTimesCreatedAtDesc},
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [data, rest]
  );
}
