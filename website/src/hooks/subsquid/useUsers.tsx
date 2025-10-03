import type { User as ContractUser } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from 'urql';
import { GET_USERS } from './queries';

// Extend the base User type with additional fields from GraphQL
export interface ExtendedUser extends ContractUser {
  numberOfReviews: number;
  averageRating: number;
  timestamp: number;
}

export default function useUsers(offset: number = 0, limit: number = 0) {
  const [result] = useQuery({
    query: GET_USERS,
    variables: { offset, limit: limit === 0 ? 1000 : limit },
  });

  return useMemo(
    () => ({
      data: result.data ? (result.data?.users as ExtendedUser[]) : undefined,
      loading: result.fetching,
      error: result.error
    }),
    [offset, limit, result]
  );
}
