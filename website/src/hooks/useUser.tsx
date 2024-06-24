import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { User } from "effectiveacceleration-contracts";

export default function useUser(userAddress: `0x${string}`) {
  const [user, setUser] = useState<User | null>(null);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'getUser',
    args:         [userAddress],
  });

  const userData = result.data as User;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  return { data: user, ...rest };
}