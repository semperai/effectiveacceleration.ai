import { User as ContractUser } from '@effectiveacceleration/contracts';
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
  const { data, ...rest } = useQuery(GET_USER_BY_ADDRESS, {
    variables: { userAddress: userAddress ?? '' },
    skip: !userAddress,
  });

  return useMemo(
    () => ({ data: data ? (data?.users[0] as ExtendedUser) : undefined, ...rest }),
    [userAddress, data, rest]
  );
}
