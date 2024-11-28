import { User } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS } from './queries';

export default function useUsers(offset: number = 0, limit: number = 0) {
  const { data, ...rest } = useQuery(GET_USERS, {
    variables: { offset, limit: limit === 0 ? 1000 : limit },
  });

  return useMemo(
    () => ({
      data: data ? (data?.users as User[]) : undefined,
      ...rest,
    }),
    [offset, limit, data, rest]
  );
}
