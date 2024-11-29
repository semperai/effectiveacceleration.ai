import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import { useConfig } from '../useConfig';

export default function useArbitratorsLength() {
  const Config = useConfig();
  const [arbitratorsLength, setArbitratorsLength] = useState<bigint>(0n);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'arbitratorsLength',
    args: [],
  });

  const arbitratorsLengthData = result.data as bigint;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (arbitratorsLengthData !== null) {
      setArbitratorsLength(arbitratorsLengthData);
    }
  }, [arbitratorsLengthData]);

  return useMemo(
    () => ({ data: arbitratorsLength, ...rest }),
    [arbitratorsLength, rest]
  );
}
