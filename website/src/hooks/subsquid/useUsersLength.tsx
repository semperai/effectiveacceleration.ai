import { useMemo } from 'react';
import useMarketplace from './useMarketplace';

export default function useUsersLength() {
  const { data, ...rest } = useMarketplace();

  return useMemo(
    () => ({
      data: data ? ((data as any).userCount as number) : undefined,
      ...rest,
    }),
    [data, rest]
  );
}
