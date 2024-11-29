import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useBlockNumber, useReadContract } from 'wagmi';
import { useConfig } from '../useConfig';

export default function useEventsLength(jobId: string) {
  const Config = useConfig();
  const [eventsLength, setEventsLength] = useState<bigint>(0n);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'eventsLength',
    args: [BigInt(jobId)],
  });

  const eventsLengthData = result.data as bigint;
  const { data: _, ...rest } = result;

  useEffect(() => {
    if (eventsLengthData !== null) {
      setEventsLength(eventsLengthData);
    }
  }, [eventsLengthData, address]);

  return useMemo(() => ({ data: eventsLength, ...rest }), [eventsLength, rest]);
}
