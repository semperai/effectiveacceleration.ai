import useUsersByAddresses from '@/hooks/useUsersByAddresses';
import { User } from 'effectiveacceleration-contracts';
import { useMemo } from 'react';
import { zeroAddress } from 'viem';

export default function useUser(userAddress: `0x${string}` | undefined) {
  const { data, ...rest } = useUsersByAddresses(userAddress ? [userAddress] : []);
  const isEmpty = userAddress ? data[userAddress]?.address_ === zeroAddress : true;

  return useMemo(
    () => ({ data: isEmpty ? undefined : (userAddress ? data[userAddress] as User : undefined), rest }),
    [userAddress, isEmpty, data, rest]
  );
}
