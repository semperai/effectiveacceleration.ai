import { useAccount, useReadContract } from 'wagmi';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { useEffect, useState } from 'react';
import { Job, getFromIpfs } from '@effectiveacceleration/contracts';
import { useConfig } from '@/hooks/useConfig';

export default function useJobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const Config = useConfig();
  const { address } = useAccount();

  const result = useReadContract({
    account: address,
    abi: MARKETPLACE_DATA_V1_ABI,
    address: Config!.marketplaceDataAddress,
    functionName: 'getJobs',
    args: [0n, 0n],
  });

  const jobsData = result.data as Job[];
  const { data: _, ...rest } = result;

  useEffect(() => {
    (async () => {
      if (jobsData) {
        await Promise.allSettled(
          jobsData.map(async (job) => {
            const content = await getFromIpfs(job.contentHash);
            job.content = content;
          })
        );

        jobsData.forEach((job: Job, id) => {
          job.id = String(id);
        });
        setJobs(jobsData as any);
      }
    })();
  }, [jobsData, address]);

  return { data: jobs, ...rest };
}
