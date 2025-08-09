import type { Arbitrator } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ARBITRATOR_BY_ADDRESS } from './queries';

// Extend the Arbitrator type to include timestamp from the GraphQL schema
export type ArbitratorWithTimestamp = Arbitrator & {
  timestamp?: number;
};

export default function useArbitrator(arbitratorAddress: string) {
  const { data, loading, error, ...rest } = useQuery(GET_ARBITRATOR_BY_ADDRESS, {
    variables: { arbitratorAddress: arbitratorAddress ?? '' },
    skip: !arbitratorAddress,
  });

  return useMemo(
    () => {
      // If no address provided, return null data with not loading
      if (!arbitratorAddress) {
        return {
          data: null,
          loading: false,  // Changed from isLoading to loading
          error: undefined,
          ...rest
        };
      }

      // Return proper loading state
      return {
        data: data?.arbitrators?.[0] as ArbitratorWithTimestamp | null | undefined,
        loading,  // Changed from isLoading to loading
        error,
        ...rest
      };
    },
    [arbitratorAddress, data, loading, error, rest]
  );
}
