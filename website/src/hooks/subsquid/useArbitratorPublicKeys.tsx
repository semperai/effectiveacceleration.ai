import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ARBITRATORS_BY_ADDRESSES } from './queries';

export default function useArbitratorsByAddresses(
  arbitratorAddresses: string[]
) {
  const [resultMap, setResultMap] = useState<Record<string, string>>({});

  const { data, ...rest } = useQuery(GET_ARBITRATORS_BY_ADDRESSES, {
    variables: { arbitratorAddresses: arbitratorAddresses ?? [] },
  });

  useEffect(() => {
    if (data) {
      const results: Record<string, string> = {};
      for (const arbitrator of data.arbitrators) {
        resultMap[arbitrator.address_] = arbitrator.publicKey;
      }

      setResultMap((prev) => ({ ...prev, ...results }));
    }
  }, [data]);

  return useMemo(
    () => ({ data: data ? resultMap : undefined, ...rest }),
    [arbitratorAddresses, data, rest]
  );
}
