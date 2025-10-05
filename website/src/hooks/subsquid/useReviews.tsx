import type { Review as ContractReview } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
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
  const [result] = useQuery({
    query: GET_REVIEWS,
    variables: {
      targetAddress: targetAddress ?? '',
      offset,
      limit,
    },
    pause: !targetAddress,
  });

  return useMemo(() => {
    const reviews = result.data ? (result.data.reviews as ExtendedReview[]) : undefined;

    // Compute review statistics
    const stats = (() => {
      if (!reviews || reviews.length === 0) {
        return {
          totalReviews: 0,
          positiveReviews: 0,
          negativeReviews: 0,
          positiveReviewPercentage: 0,
          actualAverageRating: 0,
        };
      }

      type Acc = { total: number; positive: number; negative: number; sum: number };

      const acc = reviews.reduce(
        (acc: Acc, review) => {
          acc.total++;
          acc.sum += review.rating ?? 0;
          if ((review.rating ?? 0) >= 3) acc.positive++;
          else acc.negative++;
          return acc;
        },
        { total: 0, positive: 0, negative: 0, sum: 0 }
      );

      const avg = acc.total > 0 ? acc.sum / acc.total : 0;
      const percentage = acc.total > 0 ? Math.round((acc.positive / acc.total) * 100) : 0;

      return {
        totalReviews: acc.total,
        positiveReviews: acc.positive,
        negativeReviews: acc.negative,
        positiveReviewPercentage: percentage,
        actualAverageRating: avg,
      };
    })();

    return {
      data: reviews,
      loading: result.fetching,
      error: result.error,
      ...stats,
    };
  }, [targetAddress, offset, limit, result]);
}
