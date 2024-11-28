import { User } from '@effectiveacceleration/contracts';
import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_USERS_BY_ADDRESSES } from './queries';

export default function useUsersByAddresses(userAddresses: string[]) {
  const [users, setUsers] = useState<Record<string, User>>({});

  const { data, ...rest } = useQuery(GET_USERS_BY_ADDRESSES, {
    variables: {
      userAddresses: userAddresses?.filter((address) => address) ?? [],
    },
  });

  useEffect(() => {
    if (data) {
      const results: Record<string, User> = {};
      for (const users of data.users) {
        results[users.address_] = users;
      }

      setUsers((prev) => ({ ...prev, ...results }));
    }
  }, [data]);

  return useMemo(
    () => ({ data: data ? users : undefined, ...rest }),
    [userAddresses, data, rest]
  );
}
