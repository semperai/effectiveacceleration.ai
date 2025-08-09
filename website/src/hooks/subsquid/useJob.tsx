import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOB_BY_ID } from './queries';

export default function useJob(id: string) {
  const { data, ...rest } = useQuery(GET_JOB_BY_ID, {
    variables: { jobId: id },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs[0] as Job) : undefined, ...rest }),
    [id, data, rest]
  );
}
