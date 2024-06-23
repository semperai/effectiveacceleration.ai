import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { Arbitrator } from "effectiveacceleration-contracts";

export default function useArbitrator(arbitratorAddress: `0x${string}`) {
  const [arbitrator, setArbitrator] = useState<Arbitrator | null>(null);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'getArbitrator',
    args:         [arbitratorAddress],
  });

  const arbitratorData = result.data as Arbitrator;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (arbitratorData) {
      setArbitrator(arbitratorData);
    }
  }, [arbitratorData]);

  return { data: arbitrator, ...rest };
}