import { Job } from '@effectiveacceleration/contracts';
import { useMemo } from 'react';
import { useQuery } from '@apollo/client';
import { GET_JOBS } from './queries';
import { ZeroHash } from 'ethers';

interface UseJobsProps {
  offset?: number;
  limit?: number;
  fake?: boolean;
}

const DEFAULT: UseJobsProps = {
  offset: 0,
  limit: 0,
  fake: false,
};

export default function useJobs(props: UseJobsProps = {}) {
  const { fake, offset, limit } = { ...DEFAULT, ...props };
  if (fake) return { data: FAKE_JOBS_DATA };

  const { data, ...rest } = useQuery(GET_JOBS, {
    variables: { offset, limit: limit === 0 ? 1000 : limit },
  });

  return useMemo(
    () => ({ data: data ? (data?.jobs as Job[]) : undefined, ...rest }),
    [offset, limit, data, rest]
  );
}

const FAKE_JOB = {
  id: '8',
  allowedWorkers: [],
  amount: 10000n,
  collateralOwed: 0n,
  content: 'Fake data description, you have fake turned on',
  contentHash:
    '0xbcdd27a71fd0e848d615ecd55738fc8cc822b78ddfad1bf4816e4101812b4793',
  deliveryMethod: 'ipfs',
  disputed: false,
  escrowId: 0n,
  maxTime: 1,
  multipleApplicants: true,
  rating: 0,
  resultHash: ZeroHash,
  roles: {
    creator: '0x8115F3DBb2DF930cC07b8D910C3bb06b5b9bf573',
    worker: '0x0000000000000000000000000000000000000000',
    arbitrator: '0xF6094004F9a90aC739Bd31C05CB05FFc72e3E79d',
  },
  state: 0,
  tags: ['DT'],
  timestamp: 1732957853,
  title: 'Fake data title',
  token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
  whitelistWorkers: false,
};

const FAKE_JOBS_DATA = [FAKE_JOB];
for (let i = 0; i < 100; ++i) {
  FAKE_JOBS_DATA.push({
    ...FAKE_JOB,
    id: i.toString(),
  });
}
