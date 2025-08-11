import type { Review as ContractReview } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_REVIEWS } from './queries';

// Extend the base Review type with id field from GraphQL
export interface ExtendedReview extends ContractReview {
  id?: string;
  user: string; // Add this if it's missing from the base type
}

export default function useReviews(
  targetAddress: string,
  offset: number = 0,
  limit: number = 100
) {
  const { data, ...rest } = useQuery(GET_REVIEWS, {
    variables: {
      targetAddress: targetAddress ?? '',
      offset,
      limit,
    },
    skip: !targetAddress,
  });

  return useMemo(
    () => ({
      data: data ? (data?.reviews as ExtendedReview[]) : undefined,
      ...rest,
    }),
    [targetAddress, offset, limit, data, rest]
  );
}
