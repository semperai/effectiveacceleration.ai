import { UserRating } from '@effectiveacceleration/contracts';
import { useEffect, useMemo, useState } from 'react';
import useUsersByAddresses from './useUsersByAddresses';

export default function useUserRating(userAddresses: string[]) {
  const [userRatings, setUserRatings] = useState<Record<string, UserRating>>(
    {}
  );

  const { data, ...rest } = useUsersByAddresses(userAddresses);

  useEffect(() => {
    const results: Record<string, UserRating> = {};
    if (data) {
      for (const user of Object.values(data)) {
        results[user.address_] = {
          averageRating: (data as any).averageRating,
          numberOfReviews: (data as any).numberOfReviews,
        } as UserRating;
      }

      setUserRatings((prev) => ({ ...prev, ...results }));
    }
  }, [data]);

  return useMemo(
    () => ({ data: data ? userRatings : undefined, ...rest }),
    [userAddresses, data, rest]
  );
}
