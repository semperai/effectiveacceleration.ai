import type { User as ContractUser } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_USER_BY_ADDRESS } from './queries';

// Extend the base User type with additional fields from GraphQL
export interface ExtendedUser extends ContractUser {
  numberOfReviews: number;
  averageRating: number;
  timestamp: number;
  myReviews?: Array<{
    id: string;
    jobId: string;
    rating: number;
    reviewer: string;
    text: string;
    timestamp: number;
    user: string;
  }>;
}

export default function useUser(userAddress: string) {
  const [result] = useQuery({
    query: GET_USER_BY_ADDRESS,
    variables: { userAddress: userAddress ?? '' },
    pause: !userAddress,
  });

  return useMemo(() => {
    // If no address provided, return null data with not loading
    if (!userAddress) {
      return {
        data: null,
        loading: false,
        error: undefined,
      };
    }

    // Return proper loading state
    return {
      data: result.data?.users?.[0] as ExtendedUser | null | undefined,
      loading: result.fetching,
      error: result.error,
    };
  }, [userAddress, result]);
}
