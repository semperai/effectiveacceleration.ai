import { Arbitrator } from '@effectiveacceleration/contracts'
import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ARBITRATORS } from './queries'

export default function useArbitrators(offset: number = 0, limit: number = 0) {
  const { data, ...rest } = useQuery(GET_ARBITRATORS, {
    variables: { offset, limit: limit === 0 ? 1000 : limit },
  });

  return useMemo(
    () => ({
      data: data ? (data?.arbitrators as Arbitrator[]) : undefined,
      ...rest,
    }),
    [offset, limit, data, rest],
  );
}
