import { getFromIpfs, Job } from '@effectiveacceleration/contracts';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useAccount, useReadContract, useWatchContractEvent } from 'wagmi';
import { LOCAL_JOBS_CACHE } from '@/utils/constants';
import { useConfig } from '../useConfig';

export default function useJob(id: bigint) {
  const Config = useConfig();
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [blockNumber, setBlockNumber] = useState<any>(undefined);
  const [lastJobEvent, setLastJobEvent] = useState<any>(null);
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'getJob',
    args: [id],
  });

  // Handle the error as needed, e.g., show a notification or set an error state
  const jobData = result.data as Job;
  const refetch = result.refetch;
  const { data: _, ...rest } = result;

  useWatchContractEvent({
    address: Config!.marketplaceDataAddress,
    abi: MARKETPLACE_DATA_V1_ABI,
    eventName: 'JobEvent',
    onLogs: async (jobEvent) => {
      await refetch();
      setLastJobEvent(jobEvent);
    },
  });

  useMemo(() => {
    if (jobData && lastJobEvent) {
      setLastJobEvent(null);
    }
  }, [jobData, lastJobEvent]);

  useEffect(() => {
    (async () => {
      if (jobData) {
        try {
          const content = await getFromIpfs(jobData.contentHash);
          jobData.content = content;
          jobData.id = String(id);
          setJob(jobData as any);
        } catch (e) {
          console.log(e, 'NOT FETCHED FROM IPFS');
        }
      }
    })();
  }, [jobData, address, id]);

  return { data: job, ...rest };
}
