import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { User } from "effectiveacceleration-contracts";

export default function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'getUsers',
    args:         [0n, 0n],
  });

  const usersData = result.data as User[];
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (usersData) {
      setUsers(usersData);
    }
  }, [usersData]);

  return { data: users, ...rest };
}
