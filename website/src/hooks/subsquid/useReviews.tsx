import { Review } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_REVIEWS } from './queries';

export default function useReviews(
  targetAddress: string,
  offset: number = 0,
  limit: number = 0
) {
  const { data, ...rest } = useQuery(GET_REVIEWS, {
    variables: {
      offset,
      limit: limit === 0 ? 1000 : limit,
      targetAddress,
    },
  });

  return useMemo(
    () => ({
      data: data ? (data?.reviews as Review[]) : undefined,
      ...rest,
    }),
    [offset, limit, data, rest]
  );
}
