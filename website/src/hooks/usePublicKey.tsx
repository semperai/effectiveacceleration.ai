import { MARKETPLACE_DATA_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceDataV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";

export default function usePublicKey(targetAddress: `0x${string}`) {
  const [publicKey, setPublicKey] = useState<string | undefined>(undefined);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'publicKeys',
    args:         [targetAddress],
  });

  const publicKeyData = result.data as `0x${string}` | undefined;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (publicKeyData) {
      setPublicKey(publicKeyData);
    }
  }, [publicKeyData]);

  return { data: publicKey, ...rest };
}
