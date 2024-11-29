import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useBlockNumber, useReadContract } from 'wagmi';
import { useConfig } from '../useConfig';

export default function useUsersLength() {
  const Config = useConfig();
  const [usersLength, setUsersLength] = useState<bigint>(0n);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'usersLength',
    args: [],
  });

  const usersLengthData = result.data as bigint;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (usersLengthData !== null) {
      setUsersLength(usersLengthData);
    }
  }, [usersLengthData]);

  return useMemo(() => ({ data: usersLength, ...rest }), [usersLength, rest]);
}
