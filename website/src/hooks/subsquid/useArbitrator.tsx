import { Arbitrator } from '@effectiveacceleration/contracts'
import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import { GET_ARBITRATOR_BY_ADDRESS } from './queries'

export default function useArbitrator(arbitratorAddress: string) {
  const { data, ...rest } = useQuery(GET_ARBITRATOR_BY_ADDRESS, {
    variables: { arbitratorAddress: arbitratorAddress ?? "" },
  });

  return useMemo(
    () => ({
      data: data ? (data?.arbitrators[0] as Arbitrator) : undefined,
      ...rest,
    }),
    [arbitratorAddress, data, rest],
  );
}
