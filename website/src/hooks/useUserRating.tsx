import { UserRating } from "@effectiveacceleration/contracts";
import { useMemo } from "react";
import useUserRatings from "./useUserRatings";

export default function useUserRating(userAddress: `0x${string}`) {
  const { data, ...rest } = useUserRatings([userAddress]);

  return useMemo(() => ({ data: data[userAddress] as UserRating, rest }), [userAddress, data, rest]);
}
