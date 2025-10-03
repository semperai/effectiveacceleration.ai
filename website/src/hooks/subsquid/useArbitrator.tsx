import type { Arbitrator } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_ARBITRATOR_BY_ADDRESS } from './queries';

// Extend the Arbitrator type to include timestamp from the GraphQL schema
export type ArbitratorWithTimestamp = Arbitrator & {
  timestamp?: number;
};

export default function useArbitrator(arbitratorAddress: string) {
  const [result] = useQuery({
    query: GET_ARBITRATOR_BY_ADDRESS,
    variables: { arbitratorAddress: arbitratorAddress ?? '' },
    pause: !arbitratorAddress,
  });

  return useMemo(() => {
    // If no address provided, return null data with not loading
    if (!arbitratorAddress) {
      return {
        data: null,
        loading: false,
        error: undefined,
      };
    }

    // Return proper loading state
    return {
      data: result.data?.arbitrators?.[0] as
        | ArbitratorWithTimestamp
        | null
        | undefined,
      loading: result.fetching,
      error: result.error,
    };
  }, [arbitratorAddress, result]);
}
