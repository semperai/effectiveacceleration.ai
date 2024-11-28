import { User } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USER_BY_ADDRESS } from './queries';

export default function useUser(userAddress: string) {
  const { data, ...rest } = useQuery(GET_USER_BY_ADDRESS, {
    variables: { userAddress: userAddress ?? '' },
  });

  return useMemo(
    () => ({ data: data ? (data?.users[0] as User) : undefined, ...rest }),
    [userAddress, data, rest]
  );
}
