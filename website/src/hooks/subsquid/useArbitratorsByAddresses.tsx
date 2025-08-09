import type { Arbitrator } from '@effectiveacceleration/contracts';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ARBITRATORS_BY_ADDRESSES } from './queries';

export default function useArbitratorsByAddresses(
  arbitratorAddresses: string[]
) {
  const [arbitrators, setArbitrators] = useState<Record<string, Arbitrator>>(
    {}
  );

  const { data, ...rest } = useQuery(GET_ARBITRATORS_BY_ADDRESSES, {
    variables: { arbitratorAddresses: arbitratorAddresses ?? [] },
    skip: !arbitratorAddresses?.length,
  });

  useEffect(() => {
    if (data) {
      const results: Record<string, Arbitrator> = {};
      for (const arbitrator of data.arbitrators) {
        results[arbitrator.address_] = arbitrator;
      }

      setArbitrators((prev) => ({ ...prev, ...results }));
    }
  }, [data]);

  return useMemo(
    () => ({ data: data ? arbitrators : undefined, ...rest }),
    [arbitratorAddresses, data, rest]
  );
}
