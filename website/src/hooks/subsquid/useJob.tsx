import type { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_JOB_BY_ID } from './queries';

export default function useJob(id: string) {
  const [result] = useQuery({
    query: GET_JOB_BY_ID,
    variables: { jobId: id },
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.jobs[0] as Job) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [id, result]
  );
}
