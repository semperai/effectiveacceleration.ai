import { useEffect, useMemo, useState } from 'react';
import { useQuery } from 'urql';
import { GET_ARBITRATORS_BY_ADDRESSES } from './queries';

export default function useArbitratorsByAddresses(
  arbitratorAddresses: string[]
) {
  const [resultMap, setResultMap] = useState<Record<string, string>>({});

  const [result] = useQuery({
    query: GET_ARBITRATORS_BY_ADDRESSES,
    variables: { arbitratorAddresses: arbitratorAddresses ?? [] },
    pause: !arbitratorAddresses?.length,
  });

  useEffect(() => {
    if (result.data) {
      const results: Record<string, string> = {};
      for (const arbitrator of result.data.arbitrators) {
        resultMap[arbitrator.address_] = arbitrator.publicKey;
      }

      setResultMap((prev) => ({ ...prev, ...results }));
    }
  }, [result.data]);

  return useMemo(
    () => ({
      data: result.data ? resultMap : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [arbitratorAddresses, result, resultMap]
  );
}
