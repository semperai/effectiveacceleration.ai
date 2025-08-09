import type { User as ContractUser } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
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
  const { data, loading, error, ...rest } = useQuery(GET_USER_BY_ADDRESS, {
    variables: { userAddress: userAddress ?? '' },
    skip: !userAddress,
  });

  return useMemo(
    () => {
      // If no address provided, return null data with not loading
      if (!userAddress) {
        return {
          data: null,
          isLoading: false,
          isError: false,
          error: undefined,
          ...rest
        };
      }

      // Return proper loading state
      return {
        data: data?.users?.[0] as ExtendedUser | null | undefined,
        isLoading: loading,
        isError: !!error,
        error,
        ...rest
      };
    },
    [userAddress, data, loading, error, rest]
  );
}
