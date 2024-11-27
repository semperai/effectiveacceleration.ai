import { getFromIpfs, Job } from "@effectiveacceleration/contracts";
import { MARKETPLACE_DATA_V1_ABI } from "@effectiveacceleration/contracts/wagmi/MarketplaceDataV1";
import Config from "@effectiveacceleration/contracts/scripts/config.json";
import { useParams } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { useAccount, useReadContract, useWatchContractEvent } from "wagmi";
import { LOCAL_JOBS_CACHE } from "@/utils/constants";

const updateLocalJobStorage = ({id, jobEvent, jobData, address}: {id: bigint, jobEvent: any, jobData: Job, address: string | undefined}) => {
  const userJobCache = `${address}${LOCAL_JOBS_CACHE}`
  console.log(jobEvent, 'JOB EVENT')
  // Update local storage job with new job state and event.
  const storedJobs = localStorage.getItem(userJobCache);
  if (storedJobs) {
    const parsedJobs = JSON.parse(storedJobs as string);
    const jobIndex = parsedJobs.findIndex((job: Job) => job.id as unknown as string === id.toString());
    if (jobIndex !== -1) {
      const selectedJobIndex = parsedJobs[jobIndex];
      console.log(selectedJobIndex, jobData, 'SELECTED JOB INDEX INIT')
      selectedJobIndex.lastJobEvent = jobEvent[0].args.eventData;
      selectedJobIndex.state = jobData.state;
      selectedJobIndex.lastJobEvent.id = selectedJobIndex.lastJobEvent.id?.toString();
      if (selectedJobIndex.lastJobEvent.details?.amount) {
        selectedJobIndex.lastJobEvent.details.amount = selectedJobIndex.lastJobEvent.details.amount.toString();
      } 
      console.log(selectedJobIndex, 'SELECTED JOB INDEX END')
      // Convert BigInt values to strings
      console.log(parsedJobs, 'PARSED JOBS')
      localStorage.setItem(userJobCache, JSON.stringify(parsedJobs));
    }
  }
}

export default function useJob(id: bigint) {
  const [job, setJob] = useState<Job | undefined>(undefined);
  const [blockNumber, setBlockNumber] = useState<any>(undefined);
  const [lastJobEvent, setLastJobEvent] = useState<any>(null);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_V1_ABI,
    address:      Config.marketplaceDataAddress,
    functionName: 'getJob',
    args:         [id],
    query: {
      retry: false
    }
  });

  // Handle the error as needed, e.g., show a notification or set an error state
  const jobData = result.data as Job;
  const refetch = result.refetch;
  const { data: _, ...rest } = result;

  useWatchContractEvent({
    address: Config.marketplaceDataAddress,
    abi: MARKETPLACE_DATA_V1_ABI,
    eventName: 'JobEvent',
    onLogs: async (jobEvent) => {
      await refetch()
      setLastJobEvent(jobEvent);
    },
  });

  useMemo(() => {
    if (jobData && lastJobEvent) {
      updateLocalJobStorage({ id, jobEvent: lastJobEvent, jobData, address });
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
          console.log(e, 'NOT FETCHED FROM IPFS')
        }

      }
    })();
  }, [jobData, address, id]);

  return { data: job, ...rest };
}