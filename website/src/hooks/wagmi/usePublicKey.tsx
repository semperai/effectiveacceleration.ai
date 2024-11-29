import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useConfig } from '../useConfig';

export default function usePublicKey(targetAddress: string) {
  const Config = useConfig();
  const [publicKey, setPublicKey] = useState<string | undefined>(undefined);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'publicKeys',
    args: [targetAddress],
  });

  const publicKeyData = result.data;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (publicKeyData) {
      setPublicKey(publicKeyData);
    }
  }, [publicKeyData]);

  return { data: publicKey, ...rest };
}
