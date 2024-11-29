'use client';
import { Layout } from '@/components/Dashboard/Layout';
import { MARKETPLACE_DATA_V1_ABI } from '@effectiveacceleration/contracts/wagmi/MarketplaceDataV1';
import { Suspense, useRef } from 'react';
import { useConfig, useWatchContractEvent } from 'wagmi';
import PostJob from './PostJobPage';

const PostJobPage = () => {
  const Config = useConfig();
  const postJobPageRef = useRef<{ jobIdCache: (jobId: string) => void }>(null);

  useWatchContractEvent({
    address: Config!.marketplaceDataAddress,
    abi: MARKETPLACE_DATA_V1_ABI,
    eventName: 'JobEvent',
    onLogs: async (jobEvent) => {
      try {
        if (postJobPageRef.current) {
          postJobPageRef.current.jobIdCache(String(jobEvent[0].args.jobId));
        }
      } catch (error) {
        console.error('Error processing job event:', error);
      }
    },
  });

  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <PostJob ref={postJobPageRef} />
      </Suspense>
    </Layout>
  );
};

export default PostJobPage;
