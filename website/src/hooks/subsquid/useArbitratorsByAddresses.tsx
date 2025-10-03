import type { Arbitrator } from '@effectiveacceleration/contracts';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { GET_ARBITRATORS_BY_ADDRESSES } from './queries';

export default function useArbitratorsByAddresses(
  arbitratorAddresses: string[]
) {
  const [arbitrators, setArbitrators] = useState<Record<string, Arbitrator>>(
    {}
  );

  const [result] = useQuery({
    query: GET_ARBITRATORS_BY_ADDRESSES,
    variables: { arbitratorAddresses: arbitratorAddresses ?? [] },
    pause: !arbitratorAddresses?.length,
  });

  useEffect(() => {
    if (result.data) {
      const results: Record<string, Arbitrator> = {};
      for (const arbitrator of result.data.arbitrators) {
        results[arbitrator.address_] = arbitrator;
      }

      setArbitrators((prev) => ({ ...prev, ...results }));
    }
  }, [result.data]);

  return useMemo(
    () => ({
      data: result.data ? arbitrators : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [arbitratorAddresses, result, arbitrators]
  );
}
