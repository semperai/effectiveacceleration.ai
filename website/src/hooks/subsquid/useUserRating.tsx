import type { UserRating } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import useUser from './useUser';

export default function useUserRating(userAddress: string) {
  const { data, ...rest } = useUser(userAddress);

  return useMemo(
    () => ({
      data: data
        ? ({
            averageRating: (data as any).averageRating,
            numberOfReviews: (data as any).numberOfReviews,
          } as UserRating)
        : undefined,
      ...rest,
    }),
    [userAddress, data, rest]
  );
}
