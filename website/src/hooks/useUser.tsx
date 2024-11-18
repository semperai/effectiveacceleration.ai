import useUsersByAddresses from "@/hooks/useUsersByAddresses";
import { User } from "@effectiveacceleration/contracts";
import { useMemo } from "react";
import { zeroAddress } from "viem";

export default function useUser(userAddress: string) {
  const { data, ...rest } = useUsersByAddresses([userAddress]);
  const isEmpty = data[userAddress]?.address_ === zeroAddress;

  return useMemo(() => ({ data: isEmpty ? undefined : data[userAddress] as User, rest }), [userAddress, isEmpty, data, rest]);
}
