import { Job } from "@/interfaces";
import { getFromIpfs } from "effectiveacceleration-contracts";
import { MARKETPLACE_DATA_VIEW_V1_ABI } from "effectiveacceleration-contracts/wagmi/MarketplaceDataViewV1";
import Config from "effectiveacceleration-contracts/scripts/config.json";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";

export default function useJob(id: bigint) {
  const [job, setJob] = useState<Job | null>(null);
  const { address } = useAccount();

  const result = useReadContract({
    account:      address,
    abi:          MARKETPLACE_DATA_VIEW_V1_ABI,
    address:      Config.marketplaceDataViewAddress as `0x${string}`,
    functionName: 'getJob',
    args:         [id],
  });

  const jobData = result.data as Job;
  const { data: _, ...rest } = result;

  useEffect(() => {
    (async () => {
      if (jobData) {
        const content = await getFromIpfs(jobData.contentHash);
        jobData.content = content;
        jobData.id = BigInt(id);
        jobData.isCreator = jobData.roles.creator === address;
        jobData.isWorker = jobData.roles.worker === address;
        jobData.isArbitrator = jobData.roles.arbitrator === address;
        setJob(jobData as any);
      }
    })();
  }, [jobData, address, id]);

  return { data: job, ...rest };
}