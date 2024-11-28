import { useParams, usePathname } from 'next/navigation';
import { useAccount } from 'wagmi';
import useJob from './subsquid/useJob';
import { useMemo } from 'react';

export const useJobUserRole = () => {
  const paths = usePathname();
  const pathNames = paths.split('/').filter((path) => path);
  const isJobPage: boolean = pathNames.includes('jobs');
  const { address } = useAccount();
  const id = useParams().id as string;
  const jobId = id ?? '0';
  const { data: job, ...rest } = useJob(jobId);

  const role = useMemo(() => {
    if (!job) return 'guest';
    if (job.roles.creator === address) {
      return 'owner';
    } else if (job.roles.worker === address) {
      return 'worker';
    } else if (job.roles.arbitrator === address) {
      return 'arbitrator';
    } else {
      return 'guest';
    }
  }, [job, address]);

  return role;
};
