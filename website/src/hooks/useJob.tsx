import { getFromIpfs, Job } from "effectiveacceleration-contracts";
import { MARKETPLACE_DATA_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";


export default function useJob(id: bigint) {
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [blockNumber, setBlockNumber] = useState<any>(undefined);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress as `0x${string}`,
    functionName: 'getJob',
    args:         [id],
    query: {
      retry: false
    }
  });


    console.log('Error fetching job:', result.error);
    // Handle the error as needed, e.g., show a notification or set an error state
  

  const jobData = result.data as Job;
  const refetch = result.refetch;
  const { data: _, ...rest } = result;

  useWatchContractEvent({
    address: Config.marketplaceDataAddress as `0x${string}`,
    abi: MARKETPLACE_DATA_V1_ABI,
    eventName: 'JobEvent',
    onLogs: async (jobEvent) => {
        // Avoid a lot of refetches, only refetch if blockevent changes
        if (blockNumber === undefined) setBlockNumber(jobEvent[0].blockNumber);
        if (blockNumber !== jobEvent[0].blockNumber && blockNumber !== undefined) {
          setBlockNumber(jobEvent[0].blockNumber)
          refetch();
        }
    },
  });

  useEffect(() => {
    (async () => {
      if (jobData) {
        const content = await getFromIpfs(jobData.contentHash);
        jobData.content = content;
        jobData.id = BigInt(id);
        setJob(jobData as any);
      }
    })();
  }, [jobData, address, id]);

  return { data: job, ...rest };
}