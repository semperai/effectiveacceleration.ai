import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_MARKETPLACES } from './queries';

export default function useMarketplace() {
  const { data, ...rest } = useQuery(GET_MARKETPLACES, {
    variables: {},
  });

  return useMemo(
    () => ({
      data: data ? (data?.marketplaces[0] as any) : undefined,
      ...rest,
    }),
    [data, rest]
  );
}
