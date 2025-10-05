import type { Arbitrator } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_ARBITRATORS } from './queries';

export default function useArbitrators(offset: number = 0, limit: number = 0) {
  const [result] = useQuery({
    query: GET_ARBITRATORS,
    variables: { offset, limit: limit === 0 ? 1000 : limit },
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.arbitrators as Arbitrator[]) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [offset, limit, result]
  );
}
