import useUsersByAddresses from "@/hooks/useUsersByAddresses";
import { User } from "effectiveacceleration-contracts";
import { useMemo } from "react";

export default function useUser(userAddress: `0x${string}`) {
  const { data, ...rest } = useUsersByAddresses([userAddress]);

  return useMemo(() => ({ data: data[userAddress] as User, rest }), [userAddress, data, rest]);
}
