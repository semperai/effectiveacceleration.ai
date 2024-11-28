import { useMemo } from 'react';
import useJob from './useJob';

export default function useEventsLength(jobId: string) {
  const { data, ...rest } = useJob(jobId);

  return useMemo(
    () => ({ data: data ? (data as any).eventCount : undefined, ...rest }),
    [jobId, data, rest]
  );
}
