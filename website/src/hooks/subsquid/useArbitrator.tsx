import { Arbitrator } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ARBITRATOR_BY_ADDRESS } from './queries';

// Extend the Arbitrator type to include timestamp from the GraphQL schema
export type ArbitratorWithTimestamp = Arbitrator & {
  timestamp?: number;
};

export default function useArbitrator(arbitratorAddress: string) {
  const { data, ...rest } = useQuery(GET_ARBITRATOR_BY_ADDRESS, {
    variables: { arbitratorAddress: arbitratorAddress ?? '' },
    skip: !arbitratorAddress,
  });

  return useMemo(
    () => ({
      data: data ? (data?.arbitrators[0] as ArbitratorWithTimestamp) : undefined,
      ...rest,
    }),
    [arbitratorAddress, data, rest]
  );
}
