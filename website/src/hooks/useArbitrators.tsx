import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { Arbitrator } from "effectiveacceleration-contracts";

export default function useArbitrators() {
  const [arbitrators, setArbitrators] = useState<Arbitrator[]>([]);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'getArbitrators',
    args:         [0n, 0n],
  });

  const arbitratorsData = result.data as Arbitrator[];
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (arbitratorsData) {
      setArbitrators(arbitratorsData);
    }
  }, [arbitratorsData]);

  return { data: arbitrators, ...rest };
}
