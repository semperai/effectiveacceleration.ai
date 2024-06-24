import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";

export default function useUsersLength() {
  const [usersLength, setUsersLength] = useState<bigint>(0n);
  const { address } = useAccount();
  const blockNumber = useBlockNumber();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'usersLength',
    args:         [],
  });

  const usersLengthData = result.data as bigint;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (usersLengthData !== null) {
      setUsersLength(usersLengthData);
    }
  }, [usersLengthData]);

  return useMemo(() => ({ data: usersLength, ...rest }), [blockNumber, usersLength]);
}
