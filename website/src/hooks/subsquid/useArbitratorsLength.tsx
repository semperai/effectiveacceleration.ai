import { useMemo } from 'react';
import useMarketplace from './useMarketplace';

export default function useArbitratorsLength() {
  const { data, ...rest } = useMarketplace();

  return useMemo(
    () => ({
      data: data ? ((data as any).arbitratorCount as number) : undefined,
      ...rest,
    }),
    [data, rest]
  );
}
