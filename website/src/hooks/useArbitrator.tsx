import useArbitratorsByAddresses from "@/hooks/useArbitratorsByAddresses";
import { Arbitrator } from "effectiveacceleration-contracts";
import { useMemo } from "react";

export default function useArbitrator(arbitratorAddress: `0x${string}`) {
  const { data, ...rest } = useArbitratorsByAddresses([arbitratorAddress]);

  return useMemo(() => ({ data: data[arbitratorAddress] as Arbitrator, rest }), [arbitratorAddress, data, rest]);
}
