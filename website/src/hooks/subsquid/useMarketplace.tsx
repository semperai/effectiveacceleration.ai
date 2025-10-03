import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_MARKETPLACES } from './queries';

export default function useMarketplace() {
  const [result] = useQuery({
    query: GET_MARKETPLACES,
    variables: {},
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.marketplaces[0] as any) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [result]
  );
}
