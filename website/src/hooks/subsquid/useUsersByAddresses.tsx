import type { User as ContractUser } from '@effectiveacceleration/contracts';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS_BY_ADDRESSES } from './queries';

// Extend the base User type with additional fields from GraphQL
export interface ExtendedUser extends ContractUser {
  numberOfReviews: number;
  averageRating: number;
  timestamp: number;
}

export default function useUsersByAddresses(userAddresses: string[]) {
  const filtered =
    userAddresses
      ?.filter((address) => address)
      .filter((value, index, array) => array.indexOf(value) === index) ?? [];
  const [users, setUsers] = useState<Record<string, ExtendedUser>>({});

  const { data, ...rest } = useQuery(GET_USERS_BY_ADDRESSES, {
    variables: {
      userAddresses: filtered,
    },
    skip: !filtered.length,
  });

  useEffect(() => {
    if (data) {
      const results: Record<string, ExtendedUser> = {};
      for (const user of data.users) {
        results[user.address_] = user;
      }

      setUsers((prev) => ({ ...prev, ...results }));
    }
  }, [data]);

  return useMemo(
    () => ({ data: data ? users : undefined, ...rest }),
    [userAddresses, data, rest]
  );
}
